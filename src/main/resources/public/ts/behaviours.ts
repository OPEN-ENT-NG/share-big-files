import { Behaviours, model, _ } from 'entcore';
import http from 'axios';

var sharebigfilesBehaviours = {
	resources: {
		read: {
			right: "fr-openent-sharebigfiles-controllers-ShareBigFilesController|listRights"
		},
		contrib: {
			right: "fr-openent-sharebigfiles-controllers-ShareBigFilesController|update"
		},
		manage: {
			right: "fr-openent-sharebigfiles-controllers-ShareBigFilesController|addRights"
		}
	},
	workflow: {
		create: "fr.openent.sharebigfiles.controllers.ShareBigFilesController|create"
	}
};

Behaviours.register('sharebigfiles', {
	behaviours:  sharebigfilesBehaviours,
	/**
	 * Allows to set rights for behaviours.
	 */
	resource : function(resource) {
		var rightsContainer = resource;
		if (!resource.myRights) {
			resource.myRights = {};
		}

		for (var behaviour in sharebigfilesBehaviours.resources) {
			if (model.me.hasRight(rightsContainer, sharebigfilesBehaviours.resources[behaviour]) || model.me.userId === resource.owner.userId || model.me.userId === rightsContainer.owner.userId) {
				if (resource.myRights[behaviour] !== undefined) {
					resource.myRights[behaviour] = resource.myRights[behaviour] && sharebigfilesBehaviours.resources[behaviour];
				} else {
					resource.myRights[behaviour] = sharebigfilesBehaviours.resources[behaviour];
				}
			}
		}
		return resource;
	},

	/**
	 * Allows to load workflow rights according to rights defined by the
	 * administrator for the current user in the console.
	 */
	workflow : function() {
		var workflow = {};

		var sharebigfilesWorkflow = sharebigfilesBehaviours.workflow;
		for (var prop in sharebigfilesWorkflow) {
			if (model.me.hasWorkflow(sharebigfilesWorkflow[prop])) {
				workflow[prop] = true;
			}
		}

		return workflow;
	},

	/**
	 * Allows to define all rights to display in the share windows. Names are
	 * defined in the server part with
	 * <code>@SecuredAction(value = "xxxx.read", type = ActionType.RESOURCE)</code>
	 * without the prefix <code>xxx</code>.
	 */
	resourceRights : function() {
		return [ 'read', 'contrib', 'manager' ];
	},

	/**
	 * Function required by the "linker" component to display the collaborative editor info
	 */
	loadResources: function(callback){
		http.get('/sharebigfiles/list').then(function(results) {
			this.resources = _.map(results.data, function(itemResult) {
				return {
					title : itemResult.fileNameLabel,
					ownerName : itemResult.owner.displayName,
					owner : itemResult.owner.userId,
					icon : '/sharebigfiles/public/img/APPNAME-large.png',
					path : '/sharebigfiles#/view/' + itemResult._id,
					id : itemResult._id
				};
			})
			if(typeof callback === 'function'){
				callback(this.resources);
			}
		}.bind(this));
	}
});