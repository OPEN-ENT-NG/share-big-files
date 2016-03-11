package fr.openent.sharebigfiles.cron;

import com.mongodb.QueryBuilder;
import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

/**
 * Created by dbreyton on 09/02/2016.
 */
public class CalculateSizeRepositoryConsumed implements Handler<Long> {

    private final MongoDb mongo = MongoDb.getInstance();

    private static final Logger log = LoggerFactory.getLogger(CalculateSizeRepositoryConsumed.class);

    public CalculateSizeRepositoryConsumed() {

    }

    @Override
    public void handle(Long event) {
        // Find all size of uploaded files
        final JsonObject query = new JsonObject();

        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                final JsonArray res = event.body().getArray("results");

                if ("ok".equals(event.body().getString("status")) && res != null && res.size() > 0) {
                    final JsonArray ids = new JsonArray();
                    Long totalSizeConsumed = 0L;
                    Boolean isEntryRepository = false;
                    for (Object object: res) {
                        if (!(object instanceof JsonObject)) continue;
                        final JsonObject jo = (JsonObject)object;
                        if (jo.getObject("fileMetadata") != null) {
                            totalSizeConsumed += jo.getObject("fileMetadata").getLong("size");
                        } else if (ShareBigFiles.ID_REPOSITORY_CONSUMED.equals(jo.getString("_id"))) {
                            isEntryRepository = true;
                        }
                    }

                    if (isEntryRepository) {
                        QueryBuilder query = QueryBuilder.start("_id").is(ShareBigFiles.ID_REPOSITORY_CONSUMED);
                        MongoUpdateBuilder modifier = new MongoUpdateBuilder().set("sizeConsumed", totalSizeConsumed);
                        modifier.set("modified", MongoDb.now());
                        mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, MongoQueryBuilder.build(query),
                                modifier.build(), new Handler<Message<JsonObject>>() {
                                    @Override
                                    public void handle(Message<JsonObject> event) {
                                        if (!"ok".equals(event.body().getString("status"))) {
                                            log.error(event.body().getString("message"));
                                        }
                                    }
                                });
                    } else {
                        JsonObject now = MongoDb.now();
                        JsonObject data = new JsonObject().putString("_id", ShareBigFiles.ID_REPOSITORY_CONSUMED)
                                .putObject("created", now).putObject("modified", now)
                                .putNumber("sizeConsumed", totalSizeConsumed);
                        mongo.save(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, data, new Handler<Message<JsonObject>>() {
                            @Override
                            public void handle(Message<JsonObject> event) {
                                if (!"ok".equals(event.body().getString("status"))) {
                                    log.error(event.body().getString("message"));
                                }
                            }
                        });
                    }
                }
            }
        });
    }
}