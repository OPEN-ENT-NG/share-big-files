package net.atos.entng.bigfiles.controllers;

import static org.entcore.common.http.response.DefaultResponseHandler.arrayResponseHandler;
import static org.entcore.common.http.response.DefaultResponseHandler.defaultResponseHandler;
import net.atos.entng.bigfiles.services.BigfilesService;
import net.atos.entng.bigfiles.services.BigfilesServiceMongoImpl;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.request.RequestUtils;

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
public class BigfilesController extends MongoDbControllerHelper {

	//Computation service
	private final BigfilesService bigfilesService;

	//Permissions
	private static final String
		read_only 			= "bigfiles.view",
		modify 				= "bigfiles.create",
		manage_ressource	= "bigfiles.manager",
		contrib_ressource	= "bigfiles.contrib",
		view_ressource		= "bigfiles.read";

	/**
	 * Creates a new controller.
	 * @param collection Name of the collection stored in the mongoDB database.
	 */
	public BigfilesController(String collection) {
		super(collection);
		bigfilesService = new BigfilesServiceMongoImpl(collection);
	}

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
	 * Creates a new bigfiles.
	 * @param request Client request.
	 */
	@Post("")
	@SecuredAction(modify)
	public void createBigfiles(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			public void handle(final UserInfos user) {
				if (user != null) {
					RequestUtils.bodyToJson(request, pathPrefix + "create", new Handler<JsonObject>() {
						public void handle(JsonObject data) {
							bigfilesService.createBigfiles(user, data, defaultResponseHandler(request));
						}
					});
				}
			}
		});
	}

	/**
	 * Returns the associated data.
	 * @param request Client request containing the id.
	 */
	@Get("/get/:id")
	@SecuredAction(value = view_ressource, type = ActionType.RESOURCE)
	public void getBigfiles(final HttpServerRequest request) {
		bigfilesService.getBigfiles(request.params().get("id"), defaultResponseHandler(request));
	}

	/**
	 * Lists every object associated with the user.
	 * @param request Client request.
	 */
	@Get("/list")
	@SecuredAction(value = read_only, type = ActionType.AUTHENTICATED)
	public void listBigfiles(final HttpServerRequest request) {
		UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
			public void handle(final UserInfos user) {
				if (user != null) {
					Handler<Either<String, JsonArray>> handler = arrayResponseHandler(request);
					bigfilesService.listBigfiles(user, handler);
				}
			}
		});
	}

	/**
	 * Updates a single bigfiles.
	 * @param request Client request.
	 */
	@Put("/:id")
	@SecuredAction(value = contrib_ressource, type = ActionType.RESOURCE)
	public void updateBigfiles(final HttpServerRequest request) {
		RequestUtils.bodyToJson(request, pathPrefix + "update", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				bigfilesService.updateBigfiles(request.params().get("id"), data, defaultResponseHandler(request));
			}
		});
	}

	/**
	 * Deletes a single bigfiles.
	 * @param request Client request.
	 */
	@Delete("/:id")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void deleteBigfiles(final HttpServerRequest request) {
		bigfilesService.deleteBigfiles(request.params().get("id"), defaultResponseHandler(request));
	}

	///////////////////
	//// TRASH BIN ////
	///////////////////

	/**
	 * Puts a bigfiles into the trash bin.
	 * @param request Client request containing the id.
	 */
	@Put("/:id/trash")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void trashBigfiles(final HttpServerRequest request) {
		final String id = request.params().get("id");
		bigfilesService.trashBigfiles(id, defaultResponseHandler(request));
	}

	/**
	 * Recovers a bigfiles from the trash bin.
	 * @param request Client request containing the id.
	 */
	@Put("/:id/recover")
	@SecuredAction(value = manage_ressource, type = ActionType.RESOURCE)
	public void recoverBigfiles(final HttpServerRequest request) {
		final String id = request.params().get("id");
		bigfilesService.recoverBigfiles(id, defaultResponseHandler(request));
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
