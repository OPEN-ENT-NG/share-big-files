package fr.openent.sharebigfiles.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;

import fr.openent.sharebigfiles.services.ShareBigFilesService;
import fr.openent.sharebigfiles.services.ShareBigFilesServiceImpl;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonArray;
import org.vertx.java.core.json.JsonObject;

/**
 * Vert.x backend controller for the application using Mongodb.
 */
public class ShareBigFilesController extends MongoDbControllerHelper {

	//Computation service
	private final ShareBigFilesService shareBigFilesService;

	//Permissions
	private static final String
		read_only 			= "sharebigfile.view",
		modify 				= "sharebigfile.create",
		manage_ressource	= "sharebigfile.manager",
		contrib_ressource	= "sharebigfile.contrib",
		view_ressource		= "sharebigfile.read";

	/**
	 * Creates a new controller.
	 * @param collection Name of the collection stored in the mongoDB database.
	 */
	public ShareBigFilesController(String collection) {
		super(collection);
		final JsonObject config = container.config();
		shareBigFilesService = new ShareBigFilesServiceImpl(vertx, config, collection);


	}

	/**
	 * Creates.
	 * @param request Client request.
	 */
	@Post("")
	@SecuredAction(modify)
	public void create(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, pathPrefix + "create", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				shareBigFilesService.create(request);
			}
		});
	}

	@Get("/download")
	@SecuredAction(value = view_ressource, type = ActionType.RESOURCE)
	public void download(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, pathPrefix + "getFile", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				shareBigFilesService.download(request);
			}
		});
	}

	//TODO
	/**
	 * Displays the home view.
	 * @param request Client request
	 */
	@Get("")
	@SecuredAction(read_only)
	public void view(HttpServerRequest request) {
		renderView(request);
	}

	//////////////
	//// CRUD ////
	//////////////
	/**
	 * Returns the associated data.
	 * @param request Client request containing the id.
	 */
	@Get("/get/:id")
	@SecuredAction(value = view_ressource, type = ActionType.RESOURCE)
	public void getGeneric_app(final HttpServerRequest request) {
		//shareBigFilesService.getGeneric_app(request.params().get("id"), defaultResponseHandler(request));
	}

	/**
	 * Lists every object associated with the user.
	 * @param request Client request.
	 */
	@Get("/list")
	@SecuredAction(value = read_only, type = ActionType.AUTHENTICATED)
	public void listGeneric_app(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			public void handle(final UserInfos user) {
				if (user != null) {
					Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);
					//shareBigFilesService.listGeneric_app(user, handler);
				}
			}
		});
	}

	/**
	 * Updates a single generic_app.
	 * @param request Client request.
	 */
	@Put("/:id")
	@SecuredAction(value = contrib_ressource, type = ActionType.RESOURCE)
	public void updateGeneric_app(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, pathPrefix + "update", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				//shareBigFilesService.updateGeneric_app(request.params().get("id"), data, defaultResponseHandler(request));
			}
		});
	}

	/**
	 * Deletes a single generic_app.
	 * @param request Client request.
	 */
	@Delete("/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void deleteGeneric_app(final HttpServerRequest request) {
		//shareBigFilesService.deleteGeneric_app(request.params().get("id"), defaultResponseHandler(request));
	}

	///////////////////
	//// TRASH BIN ////
	///////////////////

	/**
	 * Puts a generic_app into the trash bin.
	 * @param request Client request containing the id.
	 */
	@Put("/:id/trash")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void trashGeneric_app(final HttpServerRequest request) {
		final String id = request.params().get("id");
		//shareBigFilesService.trashGeneric_app(id, defaultResponseHandler(request));
	}

	/**
	 * Recovers a generic_app from the trash bin.
	 * @param request Client request containing the id.
	 */
	@Put("/:id/recover")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void recoverGeneric_app(final HttpServerRequest request) {
		final String id = request.params().get("id");
		//shareBigFilesService.recoverGeneric_app(id, defaultResponseHandler(request));
	}

	/////////////////
	//// SHARING ////
	/////////////////

	/**
	 * Lists sharing rights.
	 * @param request Client request containing the id.
	 */
	@Get("/share/json/:id")
	@SecuredAction(value = view_ressource, type = ActionType.RESOURCE)
	public void listRights(final HttpServerRequest request) {
		super.shareJson(request, false);
	}

	/**
	 * Adds sharing rights.
	 * @param request Client request containing the id.
	 */
	@Put("/share/json/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void addRights(final HttpServerRequest request) {
		super.shareJsonSubmit(request, "notify-share.html", false);
	}

	/**
	 * Drops sharing rights.
	 * @param request Client request containing the id.
	 */
	@Put("/share/remove/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void dropRights(final HttpServerRequest request) {
		super.removeShare(request, false);
	}

}
