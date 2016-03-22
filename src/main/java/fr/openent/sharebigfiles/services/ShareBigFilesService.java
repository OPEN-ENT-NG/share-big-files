package fr.openent.sharebigfiles.services;

import fr.wseduc.webutils.Either;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.List;

/**
 * MongoDB service.
 */
public interface ShareBigFilesService {
	/**
	 * updateDownloadLogs
	 * @param id id
	 * @param user user info
	 * @param handler callback
     */
	void updateDownloadLogs(final String id, final UserInfos user, final Handler<JsonObject> handler);

	/**
	 * getQuotaData
	 * @param userId user id
	 * @param handler handler
     */
	void getQuotaData(final String userId, final Handler<JsonObject> handler);

	void retrieves(final List<String> ids, final JsonObject projection, final UserInfos user,
						  final Handler<Either<String, JsonArray>> handler);

	void deletes(final List<String> ids, final Handler<Either<String, JsonObject>> handler);
}
