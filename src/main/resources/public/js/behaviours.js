Behaviours.register('bigfiles', {
	rights: {
		workflow: {
			view: 'net.atos.entng.bigfiles.controllers.BigfilesController|view',
			create: 'net.atos.entng.bigfiles.controllers.BigfilesController|createBigfiles'
		},
		resource: {
			read: {
				right: "net-atos-entng-bigfiles-controllers-BigfilesController|getBigfiles"
			},
			contrib: {
				right: "net-atos-entng-bigfiles-controllers-BigfilesController|updateBigfiles"
			},
			manager: {
				right: "net-atos-entng-bigfiles-controllers-BigfilesController|addRights"
			}
		}
	},
	loadResources: function(callback){
		http().get('/bigfiles/list').done(function(bigfiles){
			this.resources = _.map(_.where(bigfiles, { trashed: 0 }), function(bigfiles){
				bigfiles.icon = bigfiles.icon || '/img/illustrations/bigfiles-default.png';
				return {
					title: bigfiles.title,
					owner: bigfiles.owner,
					icon: bigfiles.icon,
					path: '/bigfiles#/view-bigfiles/' + bigfiles._id,
					_id: bigfiles._id
				};
			});
			callback(this.resources);
		}.bind(this));
	}
});
