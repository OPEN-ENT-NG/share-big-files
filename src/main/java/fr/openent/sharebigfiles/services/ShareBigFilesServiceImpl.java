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
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

/**
 * MongoDB implementation of the REST service.
 * Methods are usually self-explanatory.
 */
public class ShareBigFilesServiceImpl implements ShareBigFilesService {

	private static final Logger log = LoggerFactory.getLogger(ShareBigFilesServiceImpl.class);

	private final MongoDb mongo = MongoDb.getInstance();

	private final Long maxQuota;

	private final Long maxRepositoryQuota;

	public ShareBigFilesServiceImpl(final Long maxQuota, final Long maxRepositoryQuota) {
		this.maxQuota = maxQuota;
		this.maxRepositoryQuota = maxRepositoryQuota;
	}

	@Override
	public void updateDownloadLogs(final String id, final UserInfos user, final Handler<JsonObject> handler) {
		final QueryBuilder query = QueryBuilder.start("_id").is(id);

		final JsonObject logElem = new JsonObject().putString("userDisplayName", user.getUsername()).putObject("downloadDate", MongoDb.now());
		final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
		modifier.addToSet("downloadLogs", logElem);
		mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query),
				modifier.build(), new Handler<Message<JsonObject>>() {
					@Override
					public void handle(Message<JsonObject> event) {
						if ("ok".equals(event.body().getString("status"))) {
							handler.handle(new JsonObject().putString("status", "ok"));
						} else {
							handler.handle(new JsonObject().putString("status", "error")
									.putString("message", event.body().getString("message")));
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
				final JsonArray res = event.body().getArray("results");
				final String status = event.body().getString("status");
				final JsonObject j = new JsonObject();

				if ("ok".equals(status) && res != null) {
					Long totalUser = 0L;
					for (Object object : res) {
						if (!(object instanceof JsonObject)) continue;
						totalUser += ((JsonObject) object).getObject("fileMetadata").getLong("size");
					}
					final Long residualUser = ShareBigFilesServiceImpl.this.maxQuota - totalUser;
					final Long residualUserSize = (residualUser < 0) ? 0L : residualUser;

					getQuotaRepository(new Handler<Long>() {
						@Override
						public void handle(Long event) {
							handler.handle(j.putNumber("residualQuota", residualUserSize).putNumber("residualRepositoryQuota",
									event).putString("status", "ok"));
						}
					});
				} else {
					handler.handle(j.putString("status", status));
				}
			}
		});
	}

	private void getQuotaRepository(final Handler<Long> handler) {
		final QueryBuilder query = QueryBuilder.start("_id").is(ShareBigFiles.ID_REPOSITORY_CONSUMED);
		mongo.findOne(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query), new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> event) {
				JsonObject res = event.body().getObject("result");
				Long totalRepositoryConsumed = 0L;
				if ("ok".equals(event.body().getString("status"))) {
					if (res != null) {
						totalRepositoryConsumed = Long.parseLong(res.getNumber("sizeConsumed", 0).toString());
					}
				} else {
					log.error(event.body().getString("message"));
				}
				final Long residualRepository = ShareBigFilesServiceImpl.this.maxRepositoryQuota - totalRepositoryConsumed;
				final Long residualRepositorySize = (residualRepository < 0) ? 0L : residualRepository;
				handler.handle(residualRepositorySize);
			}
		});
	}
}