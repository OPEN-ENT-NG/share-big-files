//  [BIGFILES]   //
function Bigfiles(){}
Bigfiles.prototype = {
	API_PATH 	: "/bigfiles",

	delete 		: function(){ return http().delete	(this.API_PATH + '/' + this._id).done(function(){ notify.info('bigfiles.notify.deleted') }) },
	trash 		: function(){ return http().put		(this.API_PATH + '/' + this._id + '/trash').done(function(){ notify.info('bigfiles.notify.trashed') }) },
	restore 	: function(){ return http().put		(this.API_PATH + '/' + this._id + '/recover').done(function(){ notify.info('bigfiles.notify.restored') }) },
	create 		: function(hook){
		var bigfiles = this
		return http().postJson(this.API_PATH, {
			"title": 		bigfiles.title,
			"thumbnail": 	(bigfiles.thumbnail === undefined ? "" : bigfiles.thumbnail)
		}).done(function(){ notify.info('bigfiles.notify.saved'); hook() })
	},
	update : function(hook){
		var bigfiles = this
		return http().putJson(this.API_PATH + '/' + this._id, {
			"title": 		bigfiles.title,
			"thumbnail": 	bigfiles.thumbnail
		}).done(function(){ notify.info('bigfiles.notify.modified'); hook() })
	},
    get : function(hook){
        var bigfiles = this
        return http().get(this.API_PATH + "/get/" + this._id).done(function(data){
            for (var prop in data) {
                if (data.hasOwnProperty(prop)){
                    bigfiles[prop] = data[prop]
                }
            }
            hook()
        })
    }
}

//  [BIGFILES COLLECTION]   //
function BigfilesCollection(){
	this.collection(Bigfiles, {
		behaviours: 'bigfiles',
		folder: 'mine',
		sync: function(){
			http().get("bigfiles/list").done(function(data){
				this.load(data)
				this.all.forEach(function(item){ delete item.data })
			}.bind(this))
		},
		remove: function(){
			collection = this
			var parsedCount = 0
			this.selection().forEach(function(item){
				if(collection.folder === 'trash'){
					item.delete().done(function(){
						if(++parsedCount === collection.selection().length)
							collection.sync()
					})
				}
				else{
					item.trash().done(function(){
						if(++parsedCount === collection.selection().length)
							collection.sync()
					})
				}
			})
		},
		restore: function(){
			collection = this
			var parsedCount = 0
			this.selection().forEach(function(item){
				item.restore().done(function(){
					if(++parsedCount === collection.selection().length)
						collection.sync()
				})
			})
		}
	})
}

///////////////////////
///   MODEL.BUILD   ///

model.build = function(){
	model.me.workflow.load(['bigfiles'])
	this.makeModels([Bigfiles, BigfilesCollection])

	this.bigfilesCollection = new BigfilesCollection()
}

///////////////////////
