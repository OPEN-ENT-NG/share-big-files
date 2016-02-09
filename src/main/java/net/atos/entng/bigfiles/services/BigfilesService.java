package net.atos.entng.bigfiles.services;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import fr.wseduc.webutils.Either;

/**
 * Generic REST service for Bigfiles.
 */
public interface BigfilesService {

	//CRUD
	public void createBigfiles(UserInfos user, JsonObject data, Handler<Either<String, JsonObject>> handler);
	public void getBigfiles(String id, Handler<Either<String, JsonObject>> handler);
	public void listBigfiles(UserInfos user, Handler<Either<String, JsonArray>> handler);
	public void updateBigfiles(String id, JsonObject data, Handler<Either<String, JsonObject>> handler);
	public void deleteBigfiles(String id, Handler<Either<String, JsonObject>> handler);

	//TRASHBIN
	public void trashBigfiles(String id, Handler<Either<String, JsonObject>> handler);
	public void recoverBigfiles(String id, Handler<Either<String, JsonObject>> handler);

}
