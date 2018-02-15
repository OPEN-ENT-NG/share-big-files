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

import com.mongodb.QueryBuilder;
import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.HashSet;
import java.util.List;

import static org.entcore.common.mongodb.MongoDbResult.validActionResultHandler;
import static org.entcore.common.mongodb.MongoDbResult.validResultsHandler;

/**
 * MongoDB implementation of the REST service.
 * Methods are usually self-explanatory.
 */
public class ShareBigFilesServiceImpl implements ShareBigFilesService {

	private static final Logger log = LoggerFactory.getLogger(ShareBigFilesServiceImpl.class);

	private final MongoDb mongo = MongoDb.getInstance();

	private final Long maxQuota;

	public ShareBigFilesServiceImpl(final Long maxQuota) {
		this.maxQuota = maxQuota;
	}

	@Override
	public void updateDownloadLogs(final String id, final UserInfos user, final Handler<JsonObject> handler) {
		final QueryBuilder query = QueryBuilder.start("_id").is(id);

		final JsonObject logElem = new JsonObject().put("userDisplayName", user.getUsername()).put("downloadDate", MongoDb.now());
		final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.addToSet("downloadLogs", logElem);
		mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query),
				modifier.build(), new Handler<Message<JsonObject>>() {
					@Override
					public void handle(Message<JsonObject> event) {
						if ("ok".equals(event.body().getString("status"))) {
							handler.handle(new JsonObject().put("status", "ok"));
						} else {
							handler.handle(new JsonObject().put("status", "error")
									.put("message", event.body().getString("message")));
						}
					}
				});
	}

	@Override
	public void getQuotaData(final String userId, final Handler<JsonObject> handler) {
		final QueryBuilder query = QueryBuilder.start("owner.userId").is(userId).put("fileMetadata.size").exists(true);

		mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query), new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> event) {
				final JsonArray res = event.body().getJsonArray("results");
				final String status = event.body().getString("status");
				final JsonObject j = new JsonObject();

				if ("ok".equals(status) && res != null) {
					Long totalUser = 0L;
					for (Object object : res) {
						if (!(object instanceof JsonObject)) continue;
						totalUser += ((JsonObject) object).getJsonObject("fileMetadata").getLong("size");
					}
					final Long residualUser = ShareBigFilesServiceImpl.this.maxQuota - totalUser;
					final Long residualUserSize = (residualUser < 0) ? 0L : residualUser;

					handler.handle(j.put("residualQuota", residualUserSize).put("status", "ok"));
				} else {
					handler.handle(j.put("status", status));
				}
			}
		});
	}

	public void retrieves(List<String> ids, final JsonObject projection, UserInfos user, Handler<Either<String, JsonArray>> handler) {
		QueryBuilder builder = QueryBuilder.start("_id").in(new HashSet<String>(ids));
		if (user == null) {
			builder.put("visibility").is(VisibilityFilter.PUBLIC.name());
		}
		mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(builder),
				null, projection, validResultsHandler(handler));
	}

	public void deletes(List<String> ids, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder q = QueryBuilder.start("_id").in(new HashSet<String>(ids));
		mongo.delete(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(q), validActionResultHandler(handler));
	}

	public void deletesRemanent(List<String> ids, Handler<Either<String, JsonObject>> handler) {
		QueryBuilder q = QueryBuilder.start("fileId").in(new HashSet<String>(ids));
		mongo.delete(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(q), validActionResultHandler(handler));
	}

}