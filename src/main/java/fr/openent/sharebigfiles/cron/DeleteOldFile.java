package fr.openent.sharebigfiles.cron;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.I18n;
import org.entcore.common.storage.Storage;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

import java.util.Locale;

/**
 * Created by dbreyton on 09/02/2016.
 */
public class DeleteOldFile implements Handler<Long> {

    private final MongoDb mongo = MongoDb.getInstance();
    private final Storage storage;
    private final Vertx vertx;
    private static final I18n i18n = I18n.getInstance();

    public DeleteOldFile(final Vertx vertx, final Storage storage) {
       this.storage = storage;
       this.vertx = vertx;
    }

    @Override
    public void handle(Long event) {
        //fixme  see with Damien http://docs.openstack.org/developer/swift/overview_expiring_objects.html
        //fixme with swift system Can't update X-Delete-After ?

        // Check the expiry date of file (Mongo) and removal if necessary (mongo + swift file)
        final JsonObject query = new JsonObject()
                .putObject("expiryDate", new JsonObject()
                        .putObject("$lt", MongoDb.now()));
        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                final JsonArray res = event.body().getArray("results");

                if ("ok".equals(event.body().getString("status")) && res != null && res.size() > 0) {
                    final JsonArray ids = new JsonArray();
                    final String now =  MongoDb.formatDate(MongoDb.parseIsoDate(MongoDb.now()));
                    for (Object object: res) {
                        if (!(object instanceof JsonObject)) continue;
                        final JsonObject elem = (JsonObject)object;
                        ids.add(elem.getString("fileId"));

                        final String fileName= elem.getObject("fileMetadata").getString("filename");
                        final String createdDate = MongoDb.formatDate(MongoDb.parseIsoDate(elem.getObject("created")));
                        final String expiryFileDate = MongoDb.formatDate(MongoDb.parseIsoDate(elem.getObject("expiryDate")));

                        //fixme Damien howto get locale without request and Accept-Language header
                        final JsonObject messageObject = new JsonObject()
                                .putString("subject", i18n.translate("sharebigfiles.cron.message.subject",
                                        Locale.FRENCH, fileName,expiryFileDate))
                                .putString("body", i18n.translate("sharebigfiles.cron.message.body",
                                        Locale.FRENCH, fileName, createdDate, expiryFileDate, now))
                                .putString("to", elem.getObject("owner").getString("userId"));

                        //fixme Damien there is there a system user like a userId and username
                        final JsonObject message =  new JsonObject().putString("action", "send").
                                putString("userId",elem.getObject("owner").getString("userId")).putString("username",
                                elem.getObject("owner").getString("displayName")).putObject("message", messageObject);

                        vertx.eventBus().send("org.entcore.conversation", message);
                    }
                    storage.removeFiles(ids, new Handler<JsonObject>() {
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