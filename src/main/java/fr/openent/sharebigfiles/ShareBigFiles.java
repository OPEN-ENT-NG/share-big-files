package fr.openent.sharebigfiles;

import fr.openent.sharebigfiles.controllers.ShareBigFilesController;
import fr.wseduc.cron.CronTrigger;
import fr.openent.sharebigfiles.services.DeleteOldFile;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import java.text.ParseException;
import org.vertx.java.core.json.JsonObject;

public class ShareBigFiles extends BaseServer {

	public final static String SHARE_BIG_FILE_COLLECTION = "bigfile";

	@Override
	public void start() {
		super.start();
		addController(new ShareBigFilesController(vertx, SHARE_BIG_FILE_COLLECTION, container));
		MongoDbConf.getInstance().setCollection(SHARE_BIG_FILE_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());

		final JsonObject config = container.config();
		final String purgeFilesCron = config.getString("purgeFilesCron");
		final Integer purgeMaxDelayAlive = config.getInteger("purgeMaxDelayAlive", 30);
		if (purgeFilesCron != null) {
			try {
				new CronTrigger(vertx, purgeFilesCron).schedule(
						new DeleteOldFile(vertx, config, purgeMaxDelayAlive)
						);
			} catch (ParseException e) {
				log.error("Invalid cron expression.", e);
			}
		}
	}
}
