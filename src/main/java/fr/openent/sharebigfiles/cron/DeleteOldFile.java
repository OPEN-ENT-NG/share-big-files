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

package fr.openent.sharebigfiles.cron;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.openent.sharebigfiles.utils.DateUtils;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.I18n;
import org.entcore.common.http.request.JsonHttpServerRequest;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.storage.Storage;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.*;

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
        // Check the expiry date of file (Mongo) and removal if necessary (only swift file)
        final JsonArray cond = new JsonArray().add(new JsonObject().put("expiryDate", new JsonObject()
                .put("$lt", MongoDb.now()))).add(new JsonObject().put("outdated", new JsonObject()
                .put("$exists", false)));
        final JsonObject query = new JsonObject().put("$and", cond);
        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, new Handler<Message<JsonObject>>() {
            @Override
            public void handle(Message<JsonObject> event) {
                final JsonArray res = event.body().getJsonArray("results");

                if ("ok".equals(event.body().getString("status")) && res != null && res.size() > 0) {
                    final JsonArray ids = new JsonArray();

                    for (Object object : res) {
                        if (!(object instanceof JsonObject)) continue;
                        final JsonObject elem = (JsonObject) object;
                        ids.add(elem.getString("fileId"));

                        final String fileName = elem.getString("fileNameLabel");
                        final String createdDate = DateUtils.format(MongoDb.parseIsoDate(elem.getJsonObject("created")));
                        final String expiryFileDate = DateUtils.format(MongoDb.parseIsoDate(elem.getJsonObject("expiryDate")));
                        final String locale = elem.getString("locale", "fr");

                        final List<String> recipients = new ArrayList<String>();
                        recipients.add(elem.getJsonObject("owner").getString("userId"));
                        final JsonObject params = new JsonObject()
                                .put("resourceName", fileName)
                                .put("body", i18n.translate("sharebigfiles.cron.notify.body",
                                        I18n.DEFAULT_DOMAIN, locale, createdDate, expiryFileDate));

                        timelineHelper.notifyTimeline(new JsonHttpServerRequest(new JsonObject()
                                        .put("headers", new JsonObject().put("Accept-Language", locale))),
                                "sharebigfiles.delete", null, recipients, null, params);
                    }
                    storage.removeFiles(ids, new Handler<JsonObject>() {
                        @Override
                        public void handle(JsonObject event) {
                            if ("ok".equals(event.getString("status"))) {
                                final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
                                //one adding out-of-date flag
                                modifier.set("outdated", true);
                                //two deleting share
                                modifier.unset("shared");
                                mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, modifier.build(), false, true, null, new Handler<Message<JsonObject>>() {
                                    @Override
                                    public void handle(Message<JsonObject> event) {
                                        if (!"ok".equals(event.body().getString("status"))) {
                                            log.error(event.body().getString("message"));
                                        }
                                    }
                                });
                            } else {
                                final JsonArray errors = event.getJsonArray("errors");
                                Set<String> filesNotFound = new HashSet<String>();
                                Set<String> globalErrors = new HashSet<String>();
                                for (int i = 0; i < errors.size(); i++) {
                                    final JsonObject jo = errors.getJsonObject(i);
                                    final String errorMessage = jo.getString("message");
                                    final String fileId = jo.getString("id");
                                    log.error("Can't delete swift file id : " + fileId + ", error : " + errorMessage);
                                    final CharSequence FILE_NOT_FOUND_ERROR_MESSAGE = "NoSuchFileException";
                                    if (errorMessage.contains(FILE_NOT_FOUND_ERROR_MESSAGE)) {
                                        filesNotFound.add(fileId);
                                    }
                                    globalErrors.add(fileId);
                                }

                                Set<String> filesToUpdate = new HashSet<String>();
                                filesToUpdate.addAll(filesNotFound);

                                final List<Objects> idList = ids.getList();
                                for (Object identifier : idList) {
                                    final String id = (String) identifier;
                                    if (!globalErrors.contains(id)) {
                                        filesToUpdate.add(id);
                                    }
                                }

                                JsonArray idsToUpdate = new JsonArray(filesToUpdate.toString());
                                final JsonObject queryInIdFile = new JsonObject().put("fileId", new JsonObject().put("$in", idsToUpdate));

                                final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
                                modifier.set("outdated", true);
                                modifier.unset("shared");
                                mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, queryInIdFile, modifier.build(), false, true, null, new Handler<Message<JsonObject>>() {
                                    @Override
                                    public void handle(Message<JsonObject> event) {
                                        if (!"ok".equals(event.body().getString("status"))) {
                                            log.error(event.body().getString("message"));
                                        }
                                    }
                                });


                            }
                        }
                    });
                }
            }
        });
    }
}