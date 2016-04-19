package fr.openent.sharebigfiles.cron;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.openent.sharebigfiles.utils.DateUtils;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.I18n;
import org.entcore.common.http.request.JsonHttpServerRequest;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.storage.Storage;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by dbreyton on 09/02/2016.
 */
public class DeleteOldFile implements Handler<Long> {

    private final MongoDb mongo = MongoDb.getInstance();
    private final Storage storage;
    private final TimelineHelper timelineHelper;
    private static final I18n i18n = I18n.getInstance();
    private static final Logger log = LoggerFactory.getLogger(DeleteOldFile.class);

    public DeleteOldFile(final TimelineHelper timelineHelper, final Storage storage) {
        this.storage = storage;
        this.timelineHelper = timelineHelper;
    }

    @Override
    public void handle(Long event) {
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

                    for (Object object: res) {
                        if (!(object instanceof JsonObject)) continue;
                        final JsonObject elem = (JsonObject)object;
                        ids.add(elem.getString("fileId"));

                        final String fileName = elem.getObject("fileMetadata").getString("filename");
                        final String createdDate = DateUtils.format(MongoDb.parseIsoDate(elem.getObject("created")));
                        final String expiryFileDate = DateUtils.format(MongoDb.parseIsoDate(elem.getObject("expiryDate")));
                        final String locale = elem.getString("locale", "fr");

                        final List<String> recipients = new ArrayList<String>();
                        recipients.add(elem.getObject("owner").getString("userId"));
                        final JsonObject params = new JsonObject()
                                .putString("resourceName", fileName)
                                .putString("body",  i18n.translate("sharebigfiles.cron.notify.body",
                                        locale, createdDate, expiryFileDate));

                        timelineHelper.notifyTimeline(new JsonHttpServerRequest(new JsonObject()
                        			.putObject("headers", new JsonObject().putString("Accept-Language", locale))),
                        		"sharebigfiles.delete", null, recipients, null, params);
                    }
                    storage.removeFiles(ids, new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject event) {
                            mongo.delete(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, new Handler<Message<JsonObject>>() {
                                @Override
                                public void handle(Message<JsonObject> event) {
                                    if (!"ok".equals(event.body().getString("status"))) {
                                        log.error(event.body().getString("message"));
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    }
}