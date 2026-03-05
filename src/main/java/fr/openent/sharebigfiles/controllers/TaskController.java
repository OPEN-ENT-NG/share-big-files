package fr.openent.sharebigfiles.controllers;

import fr.openent.sharebigfiles.cron.DeleteOldFile;
import fr.wseduc.rs.Post;
import fr.wseduc.webutils.http.BaseController;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;

public class TaskController extends BaseController {
	protected static final Logger log = LoggerFactory.getLogger(TaskController.class);

	private final DeleteOldFile deleteOldFileTask;

	public TaskController(DeleteOldFile deleteOldFileTask) {
		this.deleteOldFileTask = deleteOldFileTask;
	}

	@Post("api/internal/delete-old-file")
	public void deleteOldFile(HttpServerRequest request) {
		log.info("Triggered delete old file task");
		deleteOldFileTask.handle(0L);
		render(request, null, 202);
	}
}
