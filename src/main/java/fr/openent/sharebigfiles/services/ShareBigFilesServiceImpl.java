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
import fr.openent.sharebigfiles.to.BigFile;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.webutils.Either;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.storage.Storage;
import org.entcore.common.user.UserInfos;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

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
    private final Storage storage;

    public ShareBigFilesServiceImpl(final Long maxQuota, final Storage storage) {
        this.storage = storage;
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

    @Override
    public Future<List<BigFile>> cleanOutdated(boolean checkOnly) {
        if (checkOnly) {
            log.info("[clean][check] starting...");
            return this.findOutdatedFile(FindFilter.NotDeleted).compose(outdated -> {
                log.info("[clean][check] before check. numberOfFilesToCheck="+outdated.size());
                return this.checkFileExistence(outdated);
            }).compose(checked -> {
                final List<BigFile> toDelete = checked.stream().filter(t -> t.getStatus().equals(BigFile.Status.ToDelete)).collect(Collectors.toList());
                final List<BigFile> deleted = checked.stream().filter(t -> t.getStatus().equals(BigFile.Status.Deleted)).collect(Collectors.toList());
                log.info(String.format("[clean][check] after check. numberOfFilesToDelete=%s numberOfFileDeleted=%s",toDelete.size(), deleted.size()));
                return CompositeFuture.all(this.saveFileStatus(toDelete,BigFile.Status.ToDelete), this.saveFileStatus(deleted, BigFile.Status.Deleted)).map(e -> {
                    log.info(String.format("[clean][check] finished. numberOfFilesToDelete=%s numberOfFileDeleted=%s",toDelete.size(), deleted.size()));
                    return checked;
                });
            });
        } else {
            log.info("[clean][force] starting...");
            return this.findOutdatedFile(FindFilter.ToDelete).compose(outdated -> {
                log.info("[clean][force] numberOfFilesToDelete="+outdated.size());
                return this.deleteFileFromDisk(outdated);
            }).compose(afterDelete -> {
                final List<BigFile> toDelete = afterDelete.stream().filter(t -> t.getStatus().equals(BigFile.Status.ToDelete)).collect(Collectors.toList());
                final List<BigFile> deleted = afterDelete.stream().filter(t -> t.getStatus().equals(BigFile.Status.Deleted)).collect(Collectors.toList());
                log.info(String.format("[clean][force] after delete. numberOfFilesToDelete=%s numberOfFileDeleted=%s",toDelete.size(), deleted.size()));
                return this.saveFileStatus(deleted, BigFile.Status.Deleted).map(e -> {
                    log.info(String.format("[clean][force] finished. numberOfFilesToDelete=%s numberOfFileDeleted=%s",toDelete.size(), deleted.size()));
                    return afterDelete;
                });
            });
        }
    }

    private Future<List<BigFile>> findOutdatedFile(final FindFilter filter) {
        final Promise<List<BigFile>> promise = Promise.promise();
        // fetch files that has expired AND outdated is true AND checkOnDisk is not Deleted
        final JsonArray cond = new JsonArray()
                .add(new JsonObject().put("expiryDate", new JsonObject().put("$lt", MongoDb.now())))
                .add(new JsonObject().put("outdated", new JsonObject().put("$eq", true)));
        switch (filter) {
            case ToDelete: {
                cond.add(new JsonObject().put("checkOnDisk", new JsonObject().put("$eq", BigFile.Status.ToDelete.name())));
                break;
            }
            case NotDeleted: {
                cond.add(new JsonObject().put("checkOnDisk", new JsonObject().put("$ne", BigFile.Status.Deleted.name())));
                break;
            }
        }
        ;
        final JsonObject query = new JsonObject().put("$and", cond);
        mongo.find(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, query, findResult -> {
            if ("ok".equals(findResult.body().getString("status")) && findResult != null) {
                final List<BigFile> files = new ArrayList<>();
                final JsonArray res = findResult.body().getJsonArray("results");
                if (res.size() > 0) {
                    // get ids from result
                    for (Object object : res) {
                        if (!(object instanceof JsonObject)) continue;
                        // extract fileId
                        final JsonObject elem = (JsonObject) object;
                        files.add(BigFile.fromJSON(elem));
                    }
                    promise.complete(files);
                } else {
                    // no result
                    promise.complete(files);
                }
            } else {
                promise.fail(findResult.body().getString("message", "find failed"));
            }
        });
        return promise.future();
    }

    private Future<List<BigFile>> checkFileExistence(final List<BigFile> files) {
        final List<Future> futures = new ArrayList<>();
        for (final BigFile file : files) {
            final Promise<BigFile> promise = Promise.promise();
            futures.add(promise.future());
            this.storage.fileStats(file.getFileId(), (res) -> {
                if (res.succeeded()) {
                    promise.complete(new BigFile(file, BigFile.Status.ToDelete));
                } else {
                    promise.complete(new BigFile(file, BigFile.Status.Deleted));
                }
            });
        }
        return CompositeFuture.all(futures).map(e -> e.list());
    }

    private Future<List<BigFile>> deleteFileFromDisk(final List<BigFile> files) {
        final List<Future> futures = new ArrayList<>();
        for (final BigFile file : files) {
            final Promise<BigFile> promise = Promise.promise();
            futures.add(promise.future());
            this.storage.removeFile(file.getFileId(), (resDelete) -> {
                if ("ok".equals(resDelete.getString("status"))) {
                    promise.complete(new BigFile(file, BigFile.Status.Deleted));
                } else {
                    // check if file exists
                    this.storage.fileStats(file.getFileId(), (resStats) -> {
                        if (resStats.succeeded()) {
                            promise.complete(new BigFile(file, BigFile.Status.ToDelete));
                            log.error(String.format("[clean][force] could not delete file. id=%s fileId=%s",file.getId(), file.getId()), resDelete.getString("message"));
                        } else {
                            promise.complete(new BigFile(file, BigFile.Status.Deleted));
                        }
                    });
                }
            });
        }
        return CompositeFuture.all(futures).map(e -> e.list());
    }

    private Future<List<BigFile>> saveFileStatus(final List<BigFile> files, final BigFile.Status status) {
        if(files.isEmpty()){
            return Future.succeededFuture(new ArrayList<>());
        }
        final Promise<List<BigFile>> promise = Promise.promise();
        final List<String> ids = files.stream().map(file -> file.getId()).collect(Collectors.toList());
        // SET outdated true AND remove shared AND deleteCheck true
        final MongoUpdateBuilder modifier = new MongoUpdateBuilder();
        modifier.set("checkOnDisk", status.name());
        // update all files WHERE fileIds=ids
        final JsonArray idsToUpdate = new JsonArray(ids);
        final JsonObject queryInIdFile = new JsonObject().put("_id", new JsonObject().put("$in", idsToUpdate));
        mongo.update(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, queryInIdFile, modifier.build(), false, true, null, event -> {
            if ("ok".equals(event.body().getString("status"))) {
                promise.complete(files);
            } else {
                promise.fail(event.body().getString("message"));
            }
        });
        return promise.future();
    }

    enum FindFilter {
        NotDeleted, ToDelete
    }
}