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
import fr.openent.sharebigfiles.services.ShareBigFilesService;
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
    private final boolean enableCheck;
    private final boolean enableClean;
    private final TimelineHelper timelineHelper;
    private static final I18n i18n = I18n.getInstance();
    private final ShareBigFilesService shareBigFilesService;
    private static final Logger log = LoggerFactory.getLogger(DeleteOldFile.class);

    public DeleteOldFile(final TimelineHelper timelineHelper, final Storage storage, final ShareBigFilesService shareBigFilesService, final JsonObject config) {
        this.storage = storage;
        this.timelineHelper = timelineHelper;
        this.shareBigFilesService = shareBigFilesService;
        this.enableCheck = config.getBoolean("enableCheckFileCron", true);
        this.enableClean = config.getBoolean("enableCleanFileCron", false);
    }

    @Override
    public void handle(Long event) {
        this.removeExpiredFiles();
        if (this.enableCheck) {
            log.info("[cron][purge] starting check of outdated...");
            this.shareBigFilesService.cleanOutdated(true).onComplete(e -> {
                if (this.enableClean) {
                    log.info("[cron][purge] starting clean of outdated...");
                    this.shareBigFilesService.cleanOutdated(false);
                } else {
                    log.info("[cron][purge] clean of outdated is disabled...");
                }
            });
        } else {
            log.info("[cron][purge] check of outdated is disabled...");
        }
    }

    private void removeExpiredFiles() {
        log.info("[cron][purge] starting...");
        // Check the expiry date of file (Mongo) and removal if necessary (only swift file)
        // fetch files that has expired AND outdated is not true
        final JsonArray cond = new JsonArray()
                .add(new JsonObject().put("expiryDate", new JsonObject().put("$lt", MongoDb.now())))
                .add(new JsonObject().put("outdated", new JsonObject().put("$ne", true)));
        final JsonObject query = new JsonObject().put("$and", cond);
        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, findResult -> {
            final JsonArray res = findResult.body().getJsonArray("results");

            if ("ok".equals(findResult.body().getString("status")) && res != null) {
                if (res.size() > 0) {
                    final List<String> ids = new ArrayList<>();
                    // iterate over results and send notification
                    for (Object object : res) {
                        if (!(object instanceof JsonObject)) continue;
                        // extract fileId
                        final JsonObject elem = (JsonObject) object;
                        ids.add(elem.getString("fileId"));
                        // send notification
                        this.sendNotification(elem);
                    }
                    // remove files
                    this.removeFiles(ids);
                } else {
                    log.info("[cron][purge] finished. Nothing to delete");
                }
            }
        });
    }

    private void sendNotification(final JsonObject elem) {
        // extract filename, dates... from data
        final String fileName = elem.getString("fileNameLabel");
        final String createdDate = DateUtils.format(MongoDb.parseIsoDate(elem.getJsonObject("created")));
        final String expiryFileDate = DateUtils.format(MongoDb.parseIsoDate(elem.getJsonObject("expiryDate")));
        final String locale = elem.getString("locale", "fr");
        // the owner receive the notification
        final List<String> recipients = new ArrayList<String>();
        recipients.add(elem.getJsonObject("owner").getString("userId"));
        // set notification params
        final JsonObject params = new JsonObject()
                .put("resourceName", fileName)
                .put("body", i18n.translate("sharebigfiles.cron.notify.body",
                        I18n.DEFAULT_DOMAIN, locale, createdDate, expiryFileDate));
        // send notification
        timelineHelper.notifyTimeline(new JsonHttpServerRequest(new JsonObject()
                        .put("headers", new JsonObject().put("Accept-Language", locale))),
                "sharebigfiles.delete", null, recipients, null, params);
    }

    private void removeFiles(final List<String> ids) {
        // remove files from disk
        log.info("[cron][purge] Deleting... numberOfFiles=" + ids.size());
        storage.removeFiles(new JsonArray(ids), removeFileRes -> {
            if ("ok".equals(removeFileRes.getString("status"))) {
                log.info("[cron][purge] Deleted successfully. numberOfFiles=" + ids.size());
                this.onDeleteSuccess(ids);
            } else {
                log.warn("[cron][purge] Delete failed. numberOfFiles=" + ids.size());
                this.onDeleteFailed(ids, removeFileRes.getJsonArray("errors", new JsonArray()));
            }
        });
    }

    private void onDeleteSuccess(final List<String> ids) {
        log.info("[cron][purge] Updating status after removeDisk succeed. numberOfFiles=" + ids.size());
        // SET outdated true AND remove shared
        final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
        modifier.set("outdated", true);
        modifier.unset("shared");
        // update all files WHERE fileIds=ids
        final JsonArray idsToUpdate = new JsonArray(ids);
        final JsonObject queryInIdFile = new JsonObject().put("fileId", new JsonObject().put("$in", idsToUpdate));
        mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, queryInIdFile, modifier.build(), false, true, null, event -> {
            if ("ok".equals(event.body().getString("status"))) {
                log.info("[cron][purge] Finished successfully. deletedFail=0 deletedSuccess=" + ids.size());
            } else {
                log.error("[cron][purge] Finish with error. deletedFail=0 deletedSuccess=" + ids.size() + " error=" + event.body().getString("message"));

            }
        });
    }

    private void onDeleteFailed(final List<String> ids, final JsonArray errors) {
        log.warn("[cron][purge] Updating status after removeDisk failed. numberOfFiles=" + ids.size());
        // iterate over errors to detect file not found
        final Set<String> filesNotFound = new HashSet<String>();
        final Set<String> globalErrors = new HashSet<String>();
        for (int i = 0; i < errors.size(); i++) {
            final JsonObject jo = errors.getJsonObject(i);
            final String errorMessage = jo.getString("message");
            final String fileId = jo.getString("id");
            log.error("[cron][purge] Can't delete file id : " + fileId + ", error : " + errorMessage);
            final CharSequence FILE_NOT_FOUND_ERROR_MESSAGE = "NoSuchFileException";
            if (errorMessage.contains(FILE_NOT_FOUND_ERROR_MESSAGE)) {
                filesNotFound.add(fileId);
            }
            globalErrors.add(fileId);
        }
        // list of fileIds to update
        final Set<String> deletedFileIds = new HashSet<String>();
        deletedFileIds.addAll(filesNotFound);
        for (String id : ids) {
            if (!globalErrors.contains(id)) {
                deletedFileIds.add(id);
            }
        }
        // update files WHERE fileId in ids
        final JsonArray idsToUpdate = new JsonArray(new ArrayList<>(deletedFileIds));
        final JsonObject queryInIdFile = new JsonObject().put("fileId", new JsonObject().put("$in", idsToUpdate));
        // SET outdated true AND remove shared
        final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
        modifier.set("outdated", true);
        modifier.unset("shared");
        mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, queryInIdFile, modifier.build(), false, true, null, event -> {
            if ("ok".equals(event.body().getString("status"))) {
                final int failed = ids.size() - deletedFileIds.size();
                log.info("[cron][purge] Finished successfully. deletedSuccess=" + deletedFileIds.size() + " deletedFail=" + failed);
            } else {
                log.error("[cron][purge] Finish with error. deletedSuccess=0 deletedFail=" + ids.size() + " error=" + event.body().getString("message"));
            }
        });
    }
}