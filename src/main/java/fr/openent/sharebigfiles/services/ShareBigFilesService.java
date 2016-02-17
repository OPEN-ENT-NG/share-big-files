package fr.openent.sharebigfiles.services;

import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonObject;

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
}
