package fr.openent.sharebigfiles.services;

import com.mongodb.QueryBuilder;
import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Container;

import java.text.ParseException;
import static org.entcore.common.http.response.DefaultResponseHandler.leftToResponse;
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * MongoDB implementation of the REST service.
 * Methods are usually self-explanatory.
 */
public class ShareBigFilesServiceImpl extends MongoDbControllerHelper implements ShareBigFilesService {
	/**
	 * Log
	 */
	private final Logger log;

	/**
	 * Mongo CRUD service
	 */
	private final CrudService shareBigFileCrudService;

	/**
	 * Mongo instance
	 */
	private final MongoDb mongo = MongoDb.getInstance();

	/**
	 * Swift client
	 */
	private final Storage swiftStorage;

	public ShareBigFilesServiceImpl(Vertx vertx, final Container container, final String collection) {
		super(collection);
		log = container.logger();
		this.shareBigFileCrudService = new MongoDbCrudService(collection);
		this.swiftStorage = new StorageFactory(vertx, container.config()).getStorage();
	}


	@Override
	public void create(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					swiftStorage.writeUploadFile(request, new Handler<JsonObject>() {
						@Override
						public void handle(JsonObject event) {
							if ("ok".equals(event.getString("status"))) {
								final JsonObject object = new JsonObject();
								object.putString("fileId", event.getString("_id"));
								//get Attributes from the dataform
								object.putString("fileNameLabel", request.formAttributes().get("fileNameLabel"));
								//TODO what is the date format from frontend :
								//TODO uncomment
								/*try {
									object.putObject("expiryDate", new JsonObject().putValue("$date", MongoDb.parseDate(request.formAttributes().get("expiryDate")).getTime()));
								} catch (ParseException e) {
									log.error(e.getMessage(), e);
								}*/
								object.putArray("downloadLogs", new JsonArray());
								object.putObject("fileMetadata", event.getObject("metadata"));
								shareBigFileCrudService.create(object, user, notEmptyResponseHandler(request));
							} else {
								log.error("upload file fails");
								Renders.renderError(request, event);
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

	@Override
	public void download(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final String id = request.params().get("id");
					shareBigFileCrudService.retrieve(id, user, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight() && event.right().getValue() != null) {
								final JsonObject object = event.right().getValue();

								swiftStorage.sendFile(object.getString("fileId"), object.getString("fileNameLabel"), request, false, object.getObject("fileMetadata"), new Handler<AsyncResult<Void>>() {
									@Override
									public void handle(AsyncResult<Void> event) {
										final QueryBuilder query = QueryBuilder.start("_id").is(id);

										final String userDisplayName = user.getFirstName() + " " + user.getLastName();
										final JsonObject logElem = new JsonObject().putString("userDisplayName", userDisplayName).putObject("downloadDate", MongoDb.now());
										final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
										modifier.addToSet("downloadLogs", logElem);
										mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query),
												modifier.build());
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

	@Override
	public void delete(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			@Override
			public void handle(final UserInfos user) {
				if (user != null) {
					final String id = request.params().get("id");
					shareBigFileCrudService.retrieve(id, user, new Handler<Either<String, JsonObject>>() {
						@Override
						public void handle(Either<String, JsonObject> event) {
							if (event.isRight() && event.right().getValue() != null) {
								final JsonObject object = event.right().getValue();
								swiftStorage.removeFile(object.getString("fileId"), new Handler<JsonObject>() {
									@Override
									public void handle(JsonObject event) {
										if ("ok".equals(event.getString("status"))) {
											shareBigFileCrudService.delete(id, user, notEmptyResponseHandler(request));
										} else {
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
}