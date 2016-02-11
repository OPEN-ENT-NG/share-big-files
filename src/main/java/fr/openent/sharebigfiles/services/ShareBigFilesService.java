package fr.openent.sharebigfiles.services;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;

/**
 * Generic REST service for Generic_app.
 */
public interface ShareBigFilesService {
	public void create(final HttpServerRequest request);

	public void download(final HttpServerRequest request);

	/*TODO nettoyage
	//CRUD
	public void createGeneric_app(UserInfos user, JsonObject data, Handler<Either<String, JsonObject>> handler);
	public void getGeneric_app(String id, Handler<Either<String, JsonObject>> handler);
	public void listGeneric_app(UserInfos user, Handler<Either<String, JsonArray>> handler);
	public void updateGeneric_app(String id, JsonObject data, Handler<Either<String, JsonObject>> handler);
	public void deleteGeneric_app(String id, Handler<Either<String, JsonObject>> handler);

	//TRASHBIN
	public void trashGeneric_app(String id, Handler<Either<String, JsonObject>> handler);
	public void recoverGeneric_app(String id, Handler<Either<String, JsonObject>> handler);
    */
}
