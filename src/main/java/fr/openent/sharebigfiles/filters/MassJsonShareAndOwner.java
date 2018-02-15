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

import com.mongodb.DBObject;
import com.mongodb.QueryBuilder;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
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

public class MassJsonShareAndOwner implements ResourcesProvider {

	private MongoDbConf conf = MongoDbConf.getInstance();

	@Override
	public void authorize(final HttpServerRequest request, final Binding binding, final UserInfos user, final Handler<Boolean> handler) {
		RequestUtils.bodyToJson(request, Server.getPathPrefix(Config.getInstance().getConfig()) + "deletes", new Handler<JsonObject>() {
			public void handle(JsonObject data) {
				final List<String> ids = data.getJsonArray("ids").getList();
				if (ids != null && !ids.isEmpty()) {
					List<DBObject> groups = new ArrayList<>();
					String sharedMethod = binding.getServiceMethod().replaceAll("\\.", "-");
					groups.add(QueryBuilder.start("userId").is(user.getUserId())
							.put(sharedMethod).is(true).get());
					for (String gpId: user.getGroupsIds()) {
						groups.add(QueryBuilder.start("groupId").is(gpId)
								.put(sharedMethod).is(true).get());
					}
					QueryBuilder query = QueryBuilder.start("_id").in(new HashSet<String>(ids)).or(
							QueryBuilder.start("owner.userId").is(user.getUserId()).get(),
							QueryBuilder.start("shared").elemMatch(
									new QueryBuilder().or(groups.toArray(new DBObject[groups.size()])).get()).get()
					);
					MongoAppFilter.executeCountQuery(request, conf.getCollection(), MongoQueryBuilder.build(query), ids.size(), handler);
				} else {
					handler.handle(false);
				}
			}
		});
	}
}
