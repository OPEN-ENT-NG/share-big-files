package fr.openent.sharebigfiles.services;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;

/**
 * Created by dbreyton on 09/02/2016.
 */
public class DeleteOldFile implements Handler<Long> {

    private final MongoDb mongo = MongoDb.getInstance();
    private final Storage swiftStorage;
    private final Integer purgeMaxDelayAlive;

    public DeleteOldFile(final Vertx vertx, final JsonObject config, final Integer purgeMaxDelayAlive) {
       this.swiftStorage = new StorageFactory(vertx, config).getStorage();
        this.purgeMaxDelayAlive = purgeMaxDelayAlive;
    }

    @Override
    public void handle(Long event) {
        //TODO check files purge (testing)
        // Check the expiry date of file (Mongo) and removal if necessary (mongo + swift file)
        final Date date = DateUtils.add(new Date(), Calendar.DAY_OF_MONTH, -this.purgeMaxDelayAlive);
        final Date now = new Date();

        final JsonObject query = new JsonObject()
                .putObject("created", new JsonObject()
                        .putObject("$lte", new JsonObject()
                                .putNumber("$date", date.getTime())));
        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                final JsonArray res = event.body().getArray("results");

                if ("ok".equals(event.body().getString("status")) && res != null && res.size() > 0) {
                    final JsonArray ids = new JsonArray();
                    for (Object object: res) {
                        if (!(object instanceof JsonObject)) continue;
                        final JsonObject jsonObject = (JsonObject) object;
                        final String created = jsonObject.getString("created");
                        final Integer delay = jsonObject.getInteger("delay");

                        try {
                            final Date date = DateUtils.add(DateUtils.dateFromISO8601(created), Calendar.DAY_OF_MONTH, +delay);
                            if (DateUtils.lessOrEquals(date, now)) {
                                ids.add(jsonObject.getString("file_id"));
                            }
                        } catch (ParseException e) {
                           //TODO question RAFIK
                        }
                    }
                    swiftStorage.removeFiles(ids, new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject event) {
                            final JsonObject query = new JsonObject()
                                    .putObject("file_id", new JsonObject()
                                            .putArray("$in",ids));

                            mongo.delete(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query);
                        }
                    });
                }
            }
        });
    }
}
