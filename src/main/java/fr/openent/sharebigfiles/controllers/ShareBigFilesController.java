package fr.openent.sharebigfiles.controllers;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.openent.sharebigfiles.services.ShareBigFilesService;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Container;

import java.text.ParseException;
import java.util.Date;
import java.util.Map;

import static fr.wseduc.mongodb.MongoDb.parseDate;
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
								   ShareBigFilesService shareBigFilesService, final Logger log, final Long maxQuota) {
		super(ShareBigFiles.SHARE_BIG_FILE_COLLECTION);
		this.log = log;
		this.maxQuota = maxQuota;
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
					storage.writeUploadFile(request,  ShareBigFilesController.this.maxQuota, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject event) {
							if ("ok".equals(event.getString("status"))) {
								final String idFile = event.getString("_id");
								final JsonObject metadata = event.getObject("metadata");
								shareBigFilesService.getQuotaData(user.getUserId(), new Handler<JsonObject>() {
									@Override
									public void handle(JsonObject event) {
										if ("ok".equals(event.getString("status"))) {
											Long residualQuota = event.getLong("residualQuota");
											residualQuota = residualQuota - metadata.getLong("size");
											residualQuota = (residualQuota < 0) ? -1L : residualQuota;

											if (residualQuota.equals(-1L)) {
												storage.removeFile(idFile, new Handler<JsonObject>() {
													@Override
													public void handle(JsonObject event) {
														if ("error".equals(event.getString("status"))) {
															log.error("swift orphaned file width id " + idFile);
														}

														Renders.badRequest(request,
																i18n.translate("sharebigfiles.exceeded.quota", I18n.acceptLanguage(request),
																		metadata.getString("filename")));
													}
												});
											} else {
												final String date = request.formAttributes().get("expiryDate");
												final String fileNameLabel = request.formAttributes().get("fileNameLabel");
												ShareBigFilesController.this.create(date, fileNameLabel, idFile, metadata, user, request);
											}
										} else {
											Renders.renderError(request);
										}
									}
								});
							} else {
								Renders.badRequest(request, event.getString("message"));
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

	private void create(String date, String fileNameLabel, String idFile, JsonObject metadata, UserInfos user, HttpServerRequest request) {
		final JsonObject object = new JsonObject();
		object.putString("fileId", idFile);
		object.putString("fileNameLabel", fileNameLabel);
		//for the cron task knows the locale of user
		object.putString("locale", I18n.acceptLanguage(request));

		Date expiryDate = new Date();
		try {
            if (date != null && !date.isEmpty()) {
                expiryDate = parseDate(date);
            }
        } catch (ParseException e) {
            log.error(e.getMessage(), e);
        }

		object.putObject("expiryDate", new JsonObject().putValue("$date", expiryDate.getTime()));
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
										//TODO add call back
										shareBigFilesService.updateDownloadLogs(sbfId, user);
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

	/**
	 * Returns the associated data.
	 * @param request Client request containing the id.
	 */
	@Get("/quota")
	@SecuredAction(value = contrib_ressource, type = ActionType.RESOURCE)
	public void getQuota(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					shareBigFilesService.getQuotaData(user.getUserId(), new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject event) {
							if ("ok".equals(event.getString("status"))) {
								event.removeField("status");
								event.putNumber("maxFileQuota", ShareBigFilesController.this.maxQuota);
								Renders.renderJson(request, event);
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

	/**
	 * Deletes a single generic_app.
	 * @param request Client request.
	 */
	@Delete("/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void delete(final HttpServerRequest request) {
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
								storage.removeFile(object.getString("fileId"), new Handler<JsonObject>() {
									@Override
									public void handle(JsonObject event) {
										if ("ok".equals(event.getString("status"))) {
											shareBigFileCrudService.delete(sbfId, user, notEmptyResponseHandler(request));
										} else {
											log.error("mongo orphaned objet without real storage file width id " + sbfId);
											Renders.renderError(request, event);
										}
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
					//TODO check the front
					JsonObject params = new JsonObject();
					params.putString("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
					params.putString("username", user.getUsername());
					params.putString("shareBigFileUri", "/sharebigfile#/view/" + id);
					shareJsonSubmit(request, "notify-sharebigfile-shared.html", false, params, "name");
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