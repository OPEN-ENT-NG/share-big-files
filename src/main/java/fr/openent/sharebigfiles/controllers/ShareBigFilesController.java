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
import org.entcore.common.events.EventHelper;
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
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.utils.DateUtils;
import org.vertx.java.core.http.RouteMatcher;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;


import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static fr.wseduc.mongodb.MongoDb.toMongoDate;
import static org.entcore.common.http.response.DefaultResponseHandler.*;

/**
 * Vert.x backend controller.
 */
public class ShareBigFilesController extends MongoDbControllerHelper {
	static final String RESOURCE_NAME = "document";
	/**
	 * Log
	 */
	private final Logger log;
	private final EventHelper eventHelper;

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

	private static final List<String> DATES_TO_ADAPT = new ArrayList<>();
	static {
		DATES_TO_ADAPT.add("expiryDate");
		DATES_TO_ADAPT.add("created");
		DATES_TO_ADAPT.add("modified");
	}

	//Permissions
	private static final String
			read_only 			= "sharebigfile.view",
			modify 				= "sharebigfile.create",
			manage_ressource	= "sharebigfile.manager",
			contrib_ressource	= "sharebigfile.contrib",
			view_ressource		= "sharebigfile.read";

	@Override
	public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
					 Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, config, rm, securedActions);
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
		final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(ShareBigFiles.class.getSimpleName());
		this.eventHelper = new EventHelper(eventStore);
	}

	@Get("")
	@ApiDoc("Allows to display the main view")
	@SecuredAction(read_only)
	public void view(HttpServerRequest request) {
		renderView(request);

		// Create event "access to application ShareBigFile" and store it, for module "statistics"
		eventHelper.onAccess(request);
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
								final JsonObject metadata = event.getJsonObject("metadata");
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
		object.put("fileId", idFile);
		object.put("fileNameLabel", fileNameLabel);
		//for the cron task knows the locale of user
		object.put("locale", I18n.acceptLanguage(request));
		object.put("description", description);
		if (expiryDate.equals(0L)) {
			object.put("expiryDate", MongoDb.now());
		} else {
			object.put("expiryDate", new JsonObject().put("$date", DateUtils.formatUtcDateTime(new Date(expiryDate))));
		}

		object.put("downloadLogs", new JsonArray());
		object.put("fileMetadata", metadata);
		final Handler<Either<String, JsonObject>> handler = notEmptyResponseHandler(request);
		shareBigFileCrudService.create(object, user, eventHelper.onCreateResource(request, RESOURCE_NAME, handler));
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

								storage.sendFile(object.getString("fileId"), object.getString("fileNameLabel"), request, false, object.getJsonObject("fileMetadata"), new Handler<AsyncResult<Void>>() {
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
		renderJson(request, new JsonObject().put("expirationDateList", expirationDateList));
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
										result.remove("status");
										result.put("maxFileQuota", ShareBigFilesController.this.maxQuota);
										result.put("maxRepositoryQuota", ShareBigFilesController.this.maxRepositoryQuota);
										result.put("residualRepositoryQuota",
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
		storage.stats(new Handler<AsyncResult<BucketStats>>() {
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
							Renders.renderJson(request, adaptResults(event.right().getValue()));
						} else {
							leftToResponse(request, event.left());
						}
					}

				});
			}
		});
	}

	/**
	 * Wrap dates as they were in Vertx3.
	 * @param files Returned results
	 * @return shared big files
	 */
	private JsonArray adaptResults(final JsonArray files) {
		for (Object file : files) {
			if(file instanceof JsonObject) {
				final JsonObject jsonFile = (JsonObject) file;
				for (String dateFieldName : DATES_TO_ADAPT) {
					final Object value = jsonFile.getValue(dateFieldName);
					if (value instanceof Number) {
						jsonFile.put(dateFieldName, new JsonObject().put("$date", value));
					} else if (value instanceof JsonObject) {
						final JsonObject structuredDate = ((JsonObject) value);
						Object date = structuredDate.getValue("$date");
						if (date instanceof String) {
							structuredDate.put("$date", DateUtils.parseIsoDate(structuredDate).getTime());
						}
					}
				}
			}
		}
		return files;
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
							final Long expiryDate = data.getLong("expiryDate");
							data.remove("expiryDate");
							data.put("expiryDate", toMongoDate(new Date(expiryDate)));
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
							final List<String> ids = data.getJsonArray("ids").getList();

							final JsonObject projection = new JsonObject();
							projection.put("fileId", 1);
							projection.put("outdated", 1);
							projection.put("_id", 0);
							//TODO add on extendedCRUD service in entcore : retrieve with List<Long> and deletes with list<Long>

							shareBigFilesService.retrieves(ids, projection, user, new Handler<Either<String, JsonArray>>() {
								@Override
								public void handle(Either<String, JsonArray> event) {
									if (event.isRight() && event.right().getValue() != null) {
										final JsonArray ja = event.right().getValue();
										final List<Object> fileIds = new ArrayList<Object>();
										for (int i=0; i<ja.size(); i++) {
											final JsonObject jo = (JsonObject)ja.getJsonObject(i);
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
															JsonArray errors = event.getJsonArray("errors");
															List<String> errorIds = new ArrayList<String>();
															for (int i = 0; i < errors.size(); ++i) {
																JsonObject error = errors.getJsonObject(i);
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
					params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
					params.put("username", user.getUsername());
					params.put("shareBigFileAccessUri", "/sharebigfiles#/view/" + id);
					params.put("resourceUri", params.getString("shareBigFileAccessUri"));
					params.put("pushNotif", new JsonObject().put("title", "sharebigfile.notification.shared")
							.put("body", I18n.getInstance()
									.translate(
											"sharebigfile.push-notif.shared.body",
											getHost(request),
											I18n.acceptLanguage(request),
											user.getUsername()
									)));
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

	@Put("/share/resource/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void shareResource(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final String id = request.params().get("id");
					if(id == null || id.trim().isEmpty()) {
						badRequest(request, "invalid.id");
						return;
					}

					JsonObject params = new JsonObject();
					params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
					params.put("username", user.getUsername());
					params.put("shareBigFileAccessUri", "/sharebigfiles#/view/" + id);
					params.put("resourceUri", params.getString("shareBigFileAccessUri"));
                    params.put("pushNotif", new JsonObject().put("title", "sharebigfile.notification.shared")
                            .put("body", I18n.getInstance()
                                    .translate(
                                            "sharebigfile.push-notif.shared.body",
                                            getHost(request),
                                            I18n.acceptLanguage(request),
                                            user.getUsername()
                                    )));

					shareResource(request, "sharebigfiles.share", false, params, "fileNameLabel");
				}
			}
		});
	}


}
