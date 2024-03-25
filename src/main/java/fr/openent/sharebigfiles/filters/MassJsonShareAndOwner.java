/*
 * Copyright © Conseil Régional Nord Pas de Calais - Picardie, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.sharebigfiles.filters;

import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import org.bson.conversions.Bson;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.Config;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import static com.mongodb.client.model.Filters.*;

public class MassJsonShareAndOwner implements ResourcesProvider {

	private MongoDbConf conf = MongoDbConf.getInstance();

	@Override
	public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
		RequestUtils.bodyToJson(request, Server.getPathPrefix(Config.getInstance().getConfig()) + "deletes", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				final List<String> ids = data.getJsonArray("ids").getList();
				if (ids != null && !ids.isEmpty()) {
					List<Bson> groups = new ArrayList<>();
					String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
					groups.add(and(eq("userId", user.getUserId()), eq(sharedMethod, true)));
					for (String gpId: user.getGroupsIds()) {
						groups.add(and(eq("groupId", gpId), eq(sharedMethod, true)));
					}
					Bson query = and(in("_id", new HashSet<>(ids)), or(
							eq("owner.userId", user.getUserId()),
							elemMatch("shared", or(groups)))
					);
					MongoAppFilter.executeCountQuery(request, conf.getCollection(), MongoQueryBuilder.build(query), ids.size(), handler);
				} else {
					handler.handle(false);
				}
			}
		});
	}
}
