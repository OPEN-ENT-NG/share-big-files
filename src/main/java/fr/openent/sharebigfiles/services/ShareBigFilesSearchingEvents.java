package fr.openent.sharebigfiles.services;

import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.Either.Right;
import fr.wseduc.webutils.I18n;
import org.entcore.common.search.SearchingEvents;
import org.entcore.common.service.SearchService;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.core.logging.impl.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class ShareBigFilesSearchingEvents implements SearchingEvents {

	private static final Logger log = LoggerFactory.getLogger(ShareBigFilesSearchingEvents.class);
	private SearchService searchService;
	private static final I18n i18n = I18n.getInstance();

	public ShareBigFilesSearchingEvents(SearchService searchService) {
		this.searchService = searchService;
	}

	@Override
	public void searchResource(List<String> appFilters, String userId, JsonArray groupIds, JsonArray searchWords, Integer page, Integer limit,
							   final JsonArray columnsHeader, final String locale, final Handler<Either<String, JsonArray>> handler) {
		final List<String> returnFields = new ArrayList<String>();
		returnFields.add("fileNameLabel");
		returnFields.add("description");
		returnFields.add("modified");
		returnFields.add("owner.userId");
		returnFields.add("owner.displayName");

		final List<String> searchFields = new ArrayList<String>();
		searchFields.add("fileNameLabel");
		searchFields.add("description");

		if (appFilters.contains(ShareBigFilesSearchingEvents.class.getSimpleName())) {
			searchService.search(userId, groupIds.toList(), returnFields, searchWords.toList(), searchFields, page, limit, new Handler<Either<String, JsonArray>>() {
				@Override
				public void handle(Either<String, JsonArray> event) {
					if (event.isRight()) {
						final JsonArray res = formatSearchResult(event.right().getValue(), columnsHeader, locale);
						handler.handle(new Right<String, JsonArray>(res));
					} else {
						handler.handle(new Either.Left<String, JsonArray>(event.left().getValue()));
					}
					if (log.isDebugEnabled()) {
						log.debug("[ShareBigFilesSearchingEvents][searchResource] The resources searched by user are finded");
					}
				}
			});
		} else {
			handler.handle(new Right<String, JsonArray>(new JsonArray()));
		}
	}

	private JsonArray formatSearchResult(final JsonArray results, final JsonArray columnsHeader, final String locale) {
		final List<String> aHeader = columnsHeader.toList();
		final JsonArray traity = new JsonArray();

		for (int i=0;i<results.size();i++) {
			final JsonObject j = results.get(i);
			final JsonObject jr = new JsonObject();
			if (j != null) {
				jr.putString(aHeader.get(0), j.getString("fileNameLabel"));
				final String description = j.getString("description", "");
				final String toolTipDownload = i18n.translate("sharebigfiles.tooltip.download", locale);
				jr.putString(aHeader.get(1), "<a href='" + "/sharebigfiles/download/" + j.getString("_id") + "'"
						+ " tooltip='" + toolTipDownload + "'>" + (description.isEmpty() ?
						toolTipDownload : description) + "</a>");
				jr.putObject(aHeader.get(2), j.getObject("modified"));
				jr.putString(aHeader.get(3), j.getObject("owner").getString("displayName"));
				jr.putString(aHeader.get(4), j.getObject("owner").getString("userId"));
				jr.putString(aHeader.get(5), "/sharebigfiles#/view/" + j.getString("_id"));
				traity.add(jr);
			}
		}
		return traity;
	}
}
