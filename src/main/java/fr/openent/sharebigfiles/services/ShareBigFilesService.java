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

	void deletesRemanent(final List<String> ids, final Handler<Either<String, JsonObject>> handler);
}
