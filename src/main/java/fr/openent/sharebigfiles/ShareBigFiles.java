package fr.openent.sharebigfiles;

import fr.openent.sharebigfiles.controllers.ShareBigFilesController;
import fr.wseduc.cron.CronTrigger;
import fr.openent.sharebigfiles.cron.DeleteOldFile;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import java.text.ParseException;

public class ShareBigFiles extends BaseServer {

	public final static String SHARE_BIG_FILE_COLLECTION = "bigfile";

	@Override
	public void start() {
		super.start();

		addController(new ShareBigFilesController(vertx, container));
		MongoDbConf.getInstance().setCollection(SHARE_BIG_FILE_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());

		final String purgeFilesCron = container.config().getString("purgeFilesCron");

		if (purgeFilesCron != null) {
			try {
				new CronTrigger(vertx, purgeFilesCron).schedule(
						new DeleteOldFile(vertx, container.config())
						);
			} catch (ParseException e) {
				log.error("Invalid cron expression.", e);
			}
		}
	}
}
