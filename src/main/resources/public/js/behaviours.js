Behaviours.register('sharebigfiles', {
	rights: {
		workflow: {
			view: 'fr.openent.sharebigfiles.controllers.SharebigfilesController|view',
			create: 'fr.openent.sharebigfiles.controllers.SharebigfilesController|createSharebigfiles'
		},
		resource: {
			read: {
				right: "fr-openent-sharebigfiles-controllers-SharebigfilesController|getSharebigfiles"
			},
			contrib: {
				right: "fr-openent-sharebigfiles-controllers-SharebigfilesController|updateSharebigfiles"
			},
			manager: {
				right: "fr-openent-sharebigfiles-controllers-SharebigfilesController|addRights"
			}
		}
	},
	loadResources: function(callback){
		http().get('/sharebigfiles/list').done(function(sharebigfiles){
			this.resources = _.map(_.where(sharebigfiles, { trashed: 0 }), function(sharebigfiles){
				sharebigfiles.icon = sharebigfiles.icon || '/img/illustrations/sharebigfiles-default.png';
				return {
					title: sharebigfiles.title,
					owner: sharebigfiles.owner,
					icon: sharebigfiles.icon,
					path: '/sharebigfiles#/view-sharebigfiles/' + sharebigfiles._id,
					_id: sharebigfiles._id
				};
			});
			callback(this.resources);
		}.bind(this));
	}
});
