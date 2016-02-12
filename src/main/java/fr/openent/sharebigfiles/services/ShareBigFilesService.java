package fr.openent.sharebigfiles.services;

import org.vertx.java.core.http.HttpServerRequest;

/**
 * Generic REST service for Generic_app.
 */
public interface ShareBigFilesService {
	public void create(final HttpServerRequest request);

	public void download(final HttpServerRequest request);

	public void delete(final HttpServerRequest request);

	public void list(final HttpServerRequest request);

}
