package fr.openent.sharebigfiles.services;

import com.mongodb.QueryBuilder;
import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import org.entcore.common.user.UserInfos;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

/**
 * MongoDB implementation of the REST service.
 * Methods are usually self-explanatory.
 */
public class ShareBigFilesServiceImpl implements ShareBigFilesService {

	private final MongoDb mongo = MongoDb.getInstance();

	private final Long maxQuota;

	public ShareBigFilesServiceImpl(final Long maxQuota) {
		this.maxQuota = maxQuota;
	}

	@Override
	public void updateDownloadLogs(final String id, final UserInfos user) {
		final QueryBuilder query = QueryBuilder.start("_id").is(id);

		final String userDisplayName = user.getFirstName() + " " + user.getLastName();
		final JsonObject logElem = new JsonObject().putString("userDisplayName", userDisplayName).putObject("downloadDate", MongoDb.now());
		final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.addToSet("downloadLogs", logElem);
		mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query),
				modifier.build());
	}

	@Override
	public void getQuotaData(final String userId, final Handler<JsonObject> handler) {
		final QueryBuilder query = QueryBuilder.start("owner.userId").is(userId).put("fileMetadata.size").exists(true);

		mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query), new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> event) {
				final JsonArray res = event.body().getArray("results");
				final String status = event.body().getString("status");
				final JsonObject j = new JsonObject();

				if ("ok".equals(status) && res != null) {
					Long total = 0L;
					for (Object object : res) {
						if (!(object instanceof JsonObject)) continue;
						total += ((JsonObject) object).getObject("fileMetadata").getLong("size");
					}
					final Long residual = ShareBigFilesServiceImpl.this.maxQuota - total;
					final Long residualMaxSize = (residual < 0) ? 0L : residual;

					handler.handle(j.putNumber("residualQuota", residualMaxSize)
							.putString("status", "ok"));

				} else {
					handler.handle(j.putString("status", status));
				}
			}
		});
	}
}