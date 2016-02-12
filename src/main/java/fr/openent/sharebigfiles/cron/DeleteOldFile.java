package fr.openent.sharebigfiles.cron;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.Calendar;
import java.util.Date;

/**
 * Created by dbreyton on 09/02/2016.
 */
public class DeleteOldFile implements Handler<Long> {

    private final MongoDb mongo = MongoDb.getInstance();
    private final Storage swiftStorage;
    private final Integer purgeMinDelayAlive;

    public DeleteOldFile(final Vertx vertx, final JsonObject config) {
       this.swiftStorage = new StorageFactory(vertx, config).getStorage();
       this.purgeMinDelayAlive = config.getInteger("purgeMinDelayAlive", 1);;
    }

    @Override
    public void handle(Long event) {
        //TODO check files purge (testing) see with Damien http://docs.openstack.org/developer/swift/overview_expiring_objects.html
        //TODO How to send message to owner : create an another cron for prevent ?
        //Can't update X-Delete-After ?
        // Check the expiry date of file (Mongo) and removal if necessary (mongo + swift file)
        Calendar c = Calendar.getInstance();
        c.setTime(new Date());
        c.add(Calendar.DAY_OF_MONTH, -this.purgeMinDelayAlive);

        final JsonObject query = new JsonObject()
                .putObject("expiryDate", new JsonObject()
                        .putObject("$lt", new JsonObject()
                                .putNumber("$date", c.getTime().getTime())));
        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                final JsonArray res = event.body().getArray("results");

                if ("ok".equals(event.body().getString("status")) && res != null && res.size() > 0) {
                    final JsonArray ids = new JsonArray();
                    for (Object object: res) {
                        if (!(object instanceof JsonObject)) continue;
                        ids.add(((JsonObject)object).getString("fileId"));
                    }
                    swiftStorage.removeFiles(ids, new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject event) {
                            mongo.delete(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query);
                        }
                    });
                }
            }
        });
    }
}