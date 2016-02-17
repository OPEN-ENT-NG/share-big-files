package fr.openent.sharebigfiles;

import fr.openent.sharebigfiles.controllers.ShareBigFilesController;
import fr.openent.sharebigfiles.services.ShareBigFilesService;
import fr.openent.sharebigfiles.services.ShareBigFilesServiceImpl;
import fr.wseduc.cron.CronTrigger;
import fr.openent.sharebigfiles.cron.DeleteOldFile;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;
import java.text.ParseException;

public class ShareBigFiles extends BaseServer {

	public final static String SHARE_BIG_FILE_COLLECTION = "bigfile";

	@Override
	public void start() {
		super.start();
		MongoDbConf.getInstance().setCollection(SHARE_BIG_FILE_COLLECTION);

		Boolean confIsOk = true;
		if (config.getObject("swift") == null) {
			log.fatal("[Share Big File] Error : Module property 'swift' must be defined");
			confIsOk = false;
		}

		final Long maxQuota = config.getLong("maxQuota");
		if (maxQuota == null) {
			log.fatal("[Share Big File] Error : Module property 'maxQuota' must be defined");
			confIsOk = false;
		}

		if (!confIsOk) {
			vertx.stop();
		}

		final CrudService shareBigFileCrudService = new MongoDbCrudService(SHARE_BIG_FILE_COLLECTION);
		final ShareBigFilesService shareBigFilesService = new ShareBigFilesServiceImpl(maxQuota);
		final Storage storage = new StorageFactory(vertx, container.config()).getStorage();
		addController(new ShareBigFilesController(storage, shareBigFileCrudService, shareBigFilesService, log, maxQuota));

		setDefaultResourceFilter(new ShareAndOwner());

		final String purgeFilesCron = container.config().getString("purgeFilesCron");

		if (purgeFilesCron != null && !purgeFilesCron.isEmpty()) {
			try {
				new CronTrigger(vertx, purgeFilesCron).schedule(
						new DeleteOldFile(vertx, storage)
						);
			} catch (ParseException e) {
				log.fatal("[Share Big File] Invalid cron expression.", e);
				vertx.stop();
			}
		} else {
			log.fatal("[Share Big File] Error : Module property 'purgeFilesCron' must be defined");
			vertx.stop();
		}
	}
}
