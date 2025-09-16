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

package fr.openent.sharebigfiles;

import fr.openent.sharebigfiles.controllers.ShareBigFilesController;
import fr.openent.sharebigfiles.services.ShareBigFileStorage;
import fr.openent.sharebigfiles.services.ShareBigFilesSearchingEvents;
import fr.openent.sharebigfiles.services.ShareBigFilesService;
import fr.openent.sharebigfiles.services.ShareBigFilesServiceImpl;
import fr.wseduc.cron.CronTrigger;
import fr.openent.sharebigfiles.cron.DeleteOldFile;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.service.impl.MongoDbSearchService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import io.vertx.core.json.JsonArray;

import java.text.ParseException;
import java.util.Arrays;

public class ShareBigFiles extends BaseServer {

	public static final String SHARE_BIG_FILE_COLLECTION = "bigfile";

	@Override
	public void start(final Promise<Void> startPromise) throws Exception {
    final Promise<Void> promise = Promise.promise();
    super.start(promise);
    promise.future()
      .compose(e -> this.initShareBigFiles())
      .onComplete(startPromise);
  }

  public Future<Void> initShareBigFiles() {
		MongoDbConf.getInstance().setCollection(SHARE_BIG_FILE_COLLECTION);

		if (config.getJsonObject("swift") == null && config.getJsonObject("s3") == null && config.getJsonObject("file-system") == null) {
			log.fatal("[Share Big File] Error : Module property 'swift', 's3' or 'file-system' must be defined");
		}

		final Long maxQuota = config.getLong("maxQuota", 1073741824L);
		final Long maxRepositoryQuota = config.getLong("maxRepositoryQuota", 1099511627776L);
        final JsonArray expirationDateList = config.getJsonArray("expirationDateList",
				new JsonArray(Arrays.asList(1, 5, 10, 30)));

		final CrudService shareBigFileCrudService = new MongoDbCrudService(SHARE_BIG_FILE_COLLECTION);
    return StorageFactory.build(vertx, config, new ShareBigFileStorage()).compose(storageFactory -> {
      final Storage storage = storageFactory.getStorage();
      final ShareBigFilesService shareBigFilesService = new ShareBigFilesServiceImpl(maxQuota, storage);
      addController(new ShareBigFilesController(storage, shareBigFileCrudService, shareBigFilesService, log, maxQuota,
        maxRepositoryQuota, expirationDateList));

      setDefaultResourceFilter(new ShareAndOwner());
      // Subscribe to events published for searching
      if (config.getBoolean("searching-event", true)) {
        setSearchingEvents(new ShareBigFilesSearchingEvents(new MongoDbSearchService(SHARE_BIG_FILE_COLLECTION)));
      }

      final String purgeFilesCron = config.getString("purgeFilesCron", "0 0 23 * * ?");
      final TimelineHelper timelineHelper = new TimelineHelper(vertx, vertx.eventBus(), config);

      try {
        new CronTrigger(vertx, purgeFilesCron).schedule(
          new DeleteOldFile(timelineHelper, storage, shareBigFilesService, config)
        );
      } catch (ParseException e) {
        log.fatal("[Share Big File] Invalid cron expression.", e);
      }
      return Future.succeededFuture();
    });
	}
}
