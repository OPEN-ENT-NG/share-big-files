package fr.openent.sharebigfiles;

import fr.openent.sharebigfiles.controllers.ShareBigFilesController;
import fr.openent.sharebigfiles.services.ShareBigFilesService;
import fr.openent.sharebigfiles.services.ShareBigFilesServiceImpl;
import fr.wseduc.cron.CronTrigger;
import fr.openent.sharebigfiles.cron.DeleteOldFile;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.notification.TimelineHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import org.vertx.java.core.json.JsonArray;

import java.text.ParseException;

public class ShareBigFiles extends BaseServer {

	public static final String SHARE_BIG_FILE_COLLECTION = "bigfile";
	public static final String SHARE_BIG_FILE = "shareBigFiles";

	@Override
	public void start() {
		super.start();
		MongoDbConf.getInstance().setCollection(SHARE_BIG_FILE_COLLECTION);

		if (config.getObject("swift") == null) {
			log.fatal("[Share Big File] Error : Module property 'swift' must be defined");
			vertx.stop();
		}

		final Long maxQuota = config.getLong("maxQuota", 1073741824L);
		final Long maxRepositoryQuota = config.getLong("maxRepositoryQuota", 1099511627776L);
		final JsonArray expirationDateList = config.getArray("expirationDateList",
				new JsonArray(new String[]{"1", "5", "10", "30"}));

		final CrudService shareBigFileCrudService = new MongoDbCrudService(SHARE_BIG_FILE_COLLECTION);
		final ShareBigFilesService shareBigFilesService = new ShareBigFilesServiceImpl(maxQuota, maxRepositoryQuota);
		final Storage storage = new StorageFactory(vertx, container.config()).getStorage();
		addController(new ShareBigFilesController(storage, shareBigFileCrudService, shareBigFilesService, log, maxQuota,
				maxRepositoryQuota, expirationDateList));

		setDefaultResourceFilter(new ShareAndOwner());

		final String purgeFilesCron = container.config().getString("purgeFilesCron", "0 0 23 * * ?");
		final TimelineHelper timelineHelper = new TimelineHelper(vertx, vertx.eventBus(), container);

		try {
			new CronTrigger(vertx, purgeFilesCron).schedule(
					new DeleteOldFile(timelineHelper, storage)
			);
		} catch (ParseException e) {
			log.fatal("[Share Big File] Invalid cron expression.", e);
			vertx.stop();
		}
	}
}
