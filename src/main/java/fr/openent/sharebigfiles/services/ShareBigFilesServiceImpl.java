package fr.openent.sharebigfiles.services;

import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

//TODO si on garde
import static org.entcore.common.http.response.DefaultResponseHandler.notEmptyResponseHandler;

/**
 * MongoDB implementation of the REST service.
 * Methods are usually self-explanatory.
 */
public class ShareBigFilesServiceImpl extends MongoDbControllerHelper implements ShareBigFilesService {
	/**
	 * Mongo CRUD service
	 */
	private final CrudService shareBigFileCrudService;
	/**
	 * Swift client
	 */
	private final Storage swiftStorage;

	public ShareBigFilesServiceImpl(final Vertx vertx, final JsonObject config, final String collection) {
		super(collection);
		this.shareBigFileCrudService = new MongoDbCrudService(collection);
		this.swiftStorage = new StorageFactory(vertx, config).getStorage();
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
							final String status = event.getString("ok");
							if ("ok".equals(status)) {
								final String idFile = event.getString("_id");
								final JsonObject metadata = event.getObject("metadata");
								if (idFile != null && !idFile.isEmpty()) {
									RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
										@Override
										public void handle(JsonObject object) {
											object.putString("file_id", idFile);
											shareBigFileCrudService.create(object, user, notEmptyResponseHandler(request));
										}
									});
								}
							} else {
								log.debug("uploadfile fails");
								Renders.renderError(request);
							}
						}
					});
				} else {
					log.debug("User not found in session.");
					Renders.unauthorized(request);
				}
			}
		});
	}

	@Override
	public void download(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, new Handler<JsonObject>() {
			@Override
			public void handle(JsonObject object) {
				swiftStorage.sendFile(object.getString("_idFile"),object.getString("fileName"),request,true,null);
			}
		});
	}



	/*TODO NETTOYAGE

	public void createGeneric_app(UserInfos user, JsonObject data, Handler<Either<String, JsonObject>> handler) {
		data.putNumber("trashed", 0);
		data.putString("name", data.getString("title"));

		super.create(data, user, handler);
	}

	public void listGeneric_app(UserInfos user, Handler<Either<String, JsonArray>> handler) {
		List<DBObject> groups = new ArrayList<DBObject>();
		groups.add(QueryBuilder.start("userId").is(user.getUserId()).get());
		for (String gpId : user.getGroupsIds()) {
			groups.add(QueryBuilder.start("groupId").is(gpId).get());
		}

		QueryBuilder query = new QueryBuilder().or(
				QueryBuilder.start("owner.userId").is(user.getUserId()).get(),
				QueryBuilder.start("shared").elemMatch(new QueryBuilder().or(groups.toArray(new DBObject[groups.size()])).get()).get());

		JsonObject projection = new JsonObject();

		mongo.find(collection, MongoQueryBuilder.build(query), new JsonObject(), projection, MongoDbResult.validResultsHandler(handler));
	}

	public void getGeneric_app(String id, Handler<Either<String, JsonObject>> handler) {
		mongo.findOne(collection, MongoQueryBuilder.build(QueryBuilder.start("_id").is(id)), MongoDbResult.validResultHandler(handler));
	}

	public void updateGeneric_app(String id, JsonObject data, Handler<Either<String, JsonObject>> handler) {
		String thumbnail = data.getString("thumbnail");
		data.putString("thumbnail", thumbnail == null ? "" : thumbnail);
		if(data.containsField("title"))
			data.putString("name", data.getString("title"));
		super.update(id, data, handler);
	}

	public void trashGeneric_app(String id, Handler<Either<String, JsonObject>> handler) {
		JsonObject data = new JsonObject();
		data.putNumber("trashed", 1);

		super.update(id, data, handler);
	}

	public void recoverGeneric_app(String id, Handler<Either<String, JsonObject>> handler) {
		JsonObject data = new JsonObject();
		data.putNumber("trashed", 0);

		super.update(id, data, handler);
	}

	public void deleteGeneric_app(String id, Handler<Either<String, JsonObject>> handler) {
		super.delete(id, handler);
	}
	*/

}
