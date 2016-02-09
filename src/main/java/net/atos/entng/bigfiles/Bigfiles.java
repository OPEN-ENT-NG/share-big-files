package net.atos.entng.bigfiles;

import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;

import net.atos.entng.bigfiles.controllers.BigfilesController;

public class Bigfiles extends BaseServer {

	public final static String BIGFILES_COLLECTION = "bigfiles";

	@Override
	public void start() {
		super.start();
		addController(new BigfilesController(BIGFILES_COLLECTION));
		MongoDbConf.getInstance().setCollection(BIGFILES_COLLECTION);
		setDefaultResourceFilter(new ShareAndOwner());
	}

}
