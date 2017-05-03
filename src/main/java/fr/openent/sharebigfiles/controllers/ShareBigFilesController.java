/*
 * Copyright © Conseil Régional Nord Pas de Calais - Picardie, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.sharebigfiles.controllers;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.openent.sharebigfiles.filters.MassJsonShareAndOwner;
import fr.openent.sharebigfiles.services.ShareBigFilesService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.storage.BucketStats;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.AsyncResultHandler;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Container;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.entcore.common.http.response.DefaultResponseHandler.*;

/**
 * Vert.x backend controller.
 */
public class ShareBigFilesController extends MongoDbControllerHelper {
	/**
	 * Log
	 */
	private final Logger log;
	private EventStore eventStore;
	private enum ShareBigFilesEvent { ACCESS }

	/**
	 * Mongo CRUD service
	 */
	private final CrudService shareBigFileCrudService;

	/**
	 * Mongo service
	 */
	private final ShareBigFilesService shareBigFilesService;

	private final Long maxQuota;

	private final Long maxRepositoryQuota;

	private final JsonArray expirationDateList;

	private static final I18n i18n = I18n.getInstance();

	/**
	 * Storage client
	 */
	private final Storage storage;

	//Permissions
	private static final String
			read_only 			= "sharebigfile.view",
			modify 				= "sharebigfile.create",
			manage_ressource	= "sharebigfile.manager",
			contrib_ressource	= "sharebigfile.contrib",
			view_ressource		= "sharebigfile.read";

	@Override
	public void init(Vertx vertx, Container container, RouteMatcher rm,
					 Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, container, rm, securedActions);
		eventStore = EventStoreFactory.getFactory().getEventStore(ShareBigFiles.class.getSimpleName());
	}

	/**
	 * Creates a new controller.
	 */
	public ShareBigFilesController(final Storage storage, CrudService crudService,
								   ShareBigFilesService shareBigFilesService, final Logger log, final Long maxQuota,
								   final Long maxRepositoryQuota, final JsonArray expirationDateList) {
		super(ShareBigFiles.SHARE_BIG_FILE_COLLECTION);
		this.log = log;
		this.maxQuota = maxQuota;
		this.maxRepositoryQuota = maxRepositoryQuota;
		this.expirationDateList = expirationDateList;
		this.storage = storage;
		this.shareBigFileCrudService = crudService;
		this.shareBigFilesService = shareBigFilesService;
	}

	@Get("")
	@ApiDoc("Allows to display the main view")
	@SecuredAction(read_only)
	public void view(HttpServerRequest request) {
		renderView(request);

		// Create event "access to application ShareBigFile" and store it, for module "statistics"
		eventStore.createAndStoreEvent(ShareBigFilesEvent.ACCESS.name(), request);
	}

	/**
	 * Creates.
	 * @param request Client request.
	 */
	@Post("")
	@SecuredAction(modify)
	public void create(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					storage.writeUploadFile(request, ShareBigFilesController.this.maxQuota, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject event) {
							if ("ok".equals(event.getString("status"))) {
								final String idFile = event.getString("_id");
								final JsonObject metadata = event.getObject("metadata");
								shareBigFilesService.getQuotaData(user.getUserId(), new Handler<JsonObject>() {
									@Override
									public void handle(JsonObject event) {
										if ("ok".equals(event.getString("status"))) {
											final Long residualQuota = event.getLong("residualQuota") - metadata.getLong("size");

											getResidualRepositorySize(new Handler<Long>() {
												@Override
												public void handle(Long residualRepositorySize) {
													final Long residualRepositoryQuota = residualRepositorySize - metadata.getLong("size");
													final Boolean isErrorQuotaUser = residualQuota < 0;

													if (isErrorQuotaUser || residualRepositoryQuota < 0) {
														storage.removeFile(idFile, new Handler<JsonObject>() {
															@Override
															public void handle(JsonObject event) {
																if ("error".equals(event.getString("status"))) {
																	log.error("swift orphaned file width id " + idFile);
																}

																Renders.badRequest(request,
																		i18n.translate((isErrorQuotaUser) ?
																						"sharebigfiles.exceeded.quota" :
																						"sharebigfiles.exceeded.repository.quota",
																				I18n.acceptLanguage(request),
																				metadata.getString("filename")));
															}
														});
													} else {
														final String date = request.formAttributes().get("expiryDate");
														final Long expiryDate;
														if (date != null && !date.isEmpty()) {
															expiryDate = Long.parseLong(date);
														} else {
															expiryDate = 0L;
														}
														final String fileNameLabel = request.formAttributes().get("fileNameLabel");
														final String description = request.formAttributes().get("description");

														ShareBigFilesController.this.create(description, expiryDate, fileNameLabel,
																idFile, metadata, user, request);
													}
												}
											});
										} else {
											Renders.renderError(request);
										}
									}
								});
							} else {
								if ("file.too.large".equals(event.getString("message"))) {
									final String size = request.formAttributes().get("size");
									final Boolean isRepositoryError;

									if (size != null && !size.isEmpty() && ShareBigFilesController.this.maxRepositoryQuota.equals(Long.parseLong(size))) {
										isRepositoryError = true;
									} else {
										isRepositoryError = false;
									}
									Renders.badRequest(request, i18n.translate((isRepositoryError) ?
													"sharebigfiles.exceeded.repository.quota" :
													"sharebigfiles.exceeded.quota",
											I18n.acceptLanguage(request),
											request.formAttributes().get("fileNameLabel")));
								} else {
									Renders.badRequest(request, event.getString("message"));
								}
							}
						}
					});
				} else {
					if (log.isDebugEnabled()) {
						log.debug("User not found in session.");
					}
					Renders.unauthorized(request);
				}
			}
		});
	}

	private void create(String description, Long expiryDate, String fileNameLabel, String idFile, JsonObject metadata,
						UserInfos user, HttpServerRequest request) {
		final JsonObject object = new JsonObject();
		object.putString("fileId", idFile);
		object.putString("fileNameLabel", fileNameLabel);
		//for the cron task knows the locale of user
		object.putString("locale", I18n.acceptLanguage(request));
		object.putString("description", description);
		if (expiryDate.equals(0L)) {
			object.putObject("expiryDate", MongoDb.now());
		} else {
			object.putObject("expiryDate", new JsonObject().putValue("$date", expiryDate));
		}

		object.putArray("downloadLogs", new JsonArray());
		object.putObject("fileMetadata", metadata);
		shareBigFileCrudService.create(object, user, notEmptyResponseHandler(request));
	}

	@Get("/download/:id")
	@SecuredAction(value = view_ressource, type = ActionType.RESOURCE)
	public void download(final HttpServerRequest request) {
		final String sbfId = request.params().get("id");
		if (sbfId == null || sbfId.trim().isEmpty()) {
			badRequest(request);
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					shareBigFileCrudService.retrieve(sbfId, user, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight() && event.right().getValue() != null) {
								final JsonObject object = event.right().getValue();

								storage.sendFile(object.getString("fileId"), object.getString("fileNameLabel"), request, false, object.getObject("fileMetadata"), new Handler<AsyncResult<Void>>() {
									@Override
									public void handle(AsyncResult<Void> event) {
										shareBigFilesService.updateDownloadLogs(sbfId, user, new Handler<JsonObject>() {
											@Override
											public void handle(JsonObject event) {
												if ("error".equals(event.getString("status"))) {
													log.error("Error updated user download log in collection " + ShareBigFiles.SHARE_BIG_FILE_COLLECTION +
															" : " + event.getString("message"));
												}
											}
										});
									}
								});
							} else {
								leftToResponse(request, event.left());
							}
						}
					});
				} else {
					if (log.isDebugEnabled()) {
						log.debug("User not found in session.");
					}
					Renders.unauthorized(request);
				}
			}
		});
	}

	@Get("/expirationDateList")
	@SecuredAction(value = read_only, type = ActionType.AUTHENTICATED)
	public void getExpirationList(final  HttpServerRequest request) {
		renderJson(request, new JsonObject().putArray("expirationDateList", expirationDateList));
	}

	/**
	 * Returns the associated data.
	 * @param request Client request containing the id.
	 */
	@Get("/quota")
	@SecuredAction(value = read_only, type = ActionType.AUTHENTICATED)
	public void getQuota(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					shareBigFilesService.getQuotaData(user.getUserId(), new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject event) {
							if ("ok".equals(event.getString("status"))) {
								final JsonObject result = event;
								getResidualRepositorySize(new Handler<Long>() {
									@Override
									public void handle(Long residualRepositorySize) {
										result.removeField("status");
										result.putNumber("maxFileQuota", ShareBigFilesController.this.maxQuota);
										result.putNumber("maxRepositoryQuota", ShareBigFilesController.this.maxRepositoryQuota);
										result.putNumber("residualRepositoryQuota",
												residualRepositorySize);
										Renders.renderJson(request, result);
									}
								});
							} else {
								Renders.renderError(request);
							}
						}
					});
				} else {
					if (log.isDebugEnabled()) {
						log.debug("User not found in session.");
					}
					Renders.unauthorized(request);
				}
			}
		});
	}

	private void getResidualRepositorySize(final Handler<Long> handler) {
		storage.stats(new AsyncResultHandler<BucketStats>() {
			@Override
			public void handle(AsyncResult<BucketStats> event) {
				Long residualRepositorySize = 0L;
				if (event.succeeded()) {
					final Long sizeUsed = event.result().getStorageSize();
					final Long residualRepository = ShareBigFilesController.this.maxRepositoryQuota - sizeUsed;
					residualRepositorySize = (residualRepository < 0) ? 0L : residualRepository;
				} else {
					log.error("Can't get the repository stats : ", event.cause());
				}
				handler.handle(residualRepositorySize);
			}
		});
	}

	/**
	 * Lists every object associated with the user.
	 * @param request Client request.
	 */
	@Get("/list")
	@SecuredAction(value = read_only, type = ActionType.AUTHENTICATED)
	public void list(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				String filter = request.params().get("filter");
				VisibilityFilter v = VisibilityFilter.ALL;
				if (filter != null) {
					try {
						v = VisibilityFilter.valueOf(filter.toUpperCase());
					} catch (IllegalArgumentException | NullPointerException e) {
						v = VisibilityFilter.ALL;
						if (log.isDebugEnabled()) {
							log.debug("Invalid filter " + filter);
						}
					}
				}

				shareBigFileCrudService.list(v, user, new Handler<Either<String, JsonArray>>() {
					@Override
					public void handle(Either<String, JsonArray> event) {
						if (event.isRight()) {
							Renders.renderJson(request, event.right().getValue());
						} else {
							leftToResponse(request, event.left());
						}
					}

				});
			}
		});
	}

	/**
	 * Updates a single generic_app.
	 * @param request Client request.
	 */
	@Put("/:id")
	@SecuredAction(value = contrib_ressource, type = ActionType.RESOURCE)
	public void update(final HttpServerRequest request) {
		final String sbfId = request.params().get("id");
		if (sbfId == null || sbfId.trim().isEmpty()) {
			badRequest(request);
			return;
		}

		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "update", new Handler<JsonObject>() {
						public void handle(JsonObject data) {
							final Long expiryDate = data.getNumber("expiryDate").longValue();
							data.removeField("expiryDate");
							data.putObject("expiryDate", new JsonObject().putValue("$date", expiryDate));
							shareBigFileCrudService.update(sbfId, data, defaultResponseHandler(request));
						}
					});
				} else {
					if (log.isDebugEnabled()) {
						log.debug("User not found in session.");
					}
					Renders.unauthorized(request);
				}
			}
		});
	}

	@Post("/deletes")
	@ResourceFilter(MassJsonShareAndOwner.class)
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void deletes(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "deletes", new Handler<JsonObject>() {
						public void handle(JsonObject data) {
							final List<String> ids = data.getArray("ids").toList();

							final JsonObject projection = new JsonObject();
							projection.putNumber("fileId", 1);
							projection.putNumber("outdated", 1);
							projection.putNumber("_id", 0);
							//TODO add on extendedCRUD service in entcore : retrieve with List<Long> and deletes with list<Long>

							shareBigFilesService.retrieves(ids, projection, user, new Handler<Either<String, JsonArray>>() {
								@Override
								public void handle(Either<String, JsonArray> event) {
									if (event.isRight() && event.right().getValue() != null) {
										final JsonArray ja = event.right().getValue();
										final List<Object> fileIds = new ArrayList<Object>();
										for (int i=0; i<ja.size(); i++) {
											final JsonObject jo = (JsonObject)ja.get(i);
											//only delete the collection entry if the swift file is already destroy
											if (!jo.getBoolean("outdated", false)) {
												fileIds.add(jo.getString("fileId"));
											}
										}
										if (!fileIds.isEmpty()) {
											storage.removeFiles(new JsonArray(fileIds), new Handler<JsonObject>() {
												@Override
												public void handle(JsonObject event) {
													if ("ok".equals(event.getString("status"))) {
														//destroyed all the ids passed
														shareBigFilesService.deletes(ids, notEmptyResponseHandler(request));
													} else {
														// test if the error is because file not found. If so, we should remove the mongo record anyway.
														if( "error".equals(event.getString("status"))) {
															JsonArray errors = event.getArray("errors");
															List<String> errorIds = new ArrayList<String>();
															for (int i = 0; i < errors.size(); ++i) {
																JsonObject error = errors.get(i);
																String message = error.getString("message");
																//if( "Not Found".equals(message)){
																if( error.getString("id") != null && !"".equals(error.getString("id"))) {
																		errorIds.add(error.getString("id"));
																}
															}
															shareBigFilesService.deletesRemanent(errorIds, notEmptyResponseHandler(request));
														}
														log.error("mongo orphaned objet without real storage file width id " + ids.toString());
													}
												}
											});
										} else {
											//all swift file are already destroyed by cron process, just outdated mongo entries
											shareBigFilesService.deletes(ids, notEmptyResponseHandler(request));
										}
									} else {
										leftToResponse(request, event.left());
									}
								}
							});
						}
					});
				} else {
					if (log.isDebugEnabled()) {
						log.debug("User not found in session.");
					}
					Renders.unauthorized(request);
				}
			}
		});
	}

	/////////////////
	//// SHARING ////
	/////////////////

	/**
	 * Lists sharing rights.
	 * @param request Client request containing the id.
	 */
	@Get("/share/json/:id")
	@SecuredAction(value = view_ressource, type = ActionType.RESOURCE)
	public void listRights(final HttpServerRequest request) {
		super.shareJson(request, false);
	}

	/**
	 * Adds sharing rights.
	 * @param request Client request containing the id.
	 */
	@Put("/share/json/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void addRights(final HttpServerRequest request) {
		final String id = request.params().get("id");
		if (id == null || id.trim().isEmpty()) {
			badRequest(request);
			return;
		}
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final JsonObject params = new JsonObject();
					params.putString("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
					params.putString("username", user.getUsername());
					params.putString("shareBigFileAccessUri", "/sharebigfiles#/view/" + id);
					params.putString("resourceUri", params.getString("shareBigFileAccessUri"));

					shareJsonSubmit(request, "sharebigfiles.share", false, params, "fileNameLabel");
				}
			}
		});
	}

	/**
	 * Drops sharing rights.
	 * @param request Client request containing the id.
	 */
	@Put("/share/remove/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void dropRights(final HttpServerRequest request) {
		super.removeShare(request, false);
	}
}
