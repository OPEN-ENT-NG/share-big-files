package fr.openent.sharebigfiles.services;

import fr.openent.sharebigfiles.ShareBigFiles;
import fr.wseduc.webutils.DefaultAsyncResult;
import io.vertx.core.AsyncResult;
import org.entcore.common.storage.FileInfos;
import org.entcore.common.storage.StorageException;
import org.entcore.common.storage.impl.MongoDBApplicationStorage;
import io.vertx.core.Handler;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonObject;

public class ShareBigFileStorage extends MongoDBApplicationStorage {

	public ShareBigFileStorage() {
		super(ShareBigFiles.SHARE_BIG_FILE_COLLECTION, ShareBigFiles.class.getSimpleName(), new JsonObject()
				.put("file", "fileId")
				.put("name", "fileMetadata.filename")
				.put("size", "fileMetadata.size")
				.put("contentType", "fileMetadata.content-type")
				.put("owner", "owner.userId")
				.put("title", "fileNameLabel")
		);
	}

	@Override
	public void getInfo(final String fileId, final Handler<AsyncResult<FileInfos>> handler) {
		final JsonObject query = new JsonObject().put(mapping.getString("file", "file"), fileId);
		mongo.findOne(collection, query, keys, new Handler<Message<JsonObject>>() {
			@Override
			public void handle(Message<JsonObject> event) {
				if ("ok".equals(event.body().getString("status"))) {
					JsonObject res = event.body().getJsonObject("result");
					if (res != null) {
						final FileInfos fi = new FileInfos();
						fi.setApplication(application);
						fi.setId(fileId);
						fi.setName(res.getString(mapping.getString("title", "title")));
						fi.setOwner(res.getJsonObject("owner", new JsonObject()).getString("userId"));
						handler.handle(new DefaultAsyncResult<>(fi));
					} else {
						handler.handle(new DefaultAsyncResult<>((FileInfos) null));
					}
				} else {
					handler.handle(new DefaultAsyncResult<FileInfos>(
							new StorageException(event.body().getString("message"))));
				}
			}
		});
	}

}
