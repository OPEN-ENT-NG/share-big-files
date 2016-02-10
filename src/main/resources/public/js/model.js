//  [SHAREBIGFILES]   //
function Sharebigfiles(){}
Sharebigfiles.prototype = {
	API_PATH 	: "/sharebigfiles",

	delete 		: function(){ return http().delete	(this.API_PATH + '/' + this._id).done(function(){ notify.info('sharebigfiles.notify.deleted') }) },
	trash 		: function(){ return http().put		(this.API_PATH + '/' + this._id + '/trash').done(function(){ notify.info('sharebigfiles.notify.trashed') }) },
	restore 	: function(){ return http().put		(this.API_PATH + '/' + this._id + '/recover').done(function(){ notify.info('sharebigfiles.notify.restored') }) },
	create 		: function(hook){
		var sharebigfiles = this
		return http().postJson(this.API_PATH, {
			"title": 		sharebigfiles.title,
			"thumbnail": 	(sharebigfiles.thumbnail === undefined ? "" : sharebigfiles.thumbnail)
		}).done(function(){ notify.info('sharebigfiles.notify.saved'); hook() })
	},
	update : function(hook){
		var sharebigfiles = this
		return http().putJson(this.API_PATH + '/' + this._id, {
			"title": 		sharebigfiles.title,
			"thumbnail": 	sharebigfiles.thumbnail
		}).done(function(){ notify.info('sharebigfiles.notify.modified'); hook() })
	},
    get : function(hook){
        var sharebigfiles = this
        return http().get(this.API_PATH + "/get/" + this._id).done(function(data){
            for (var prop in data) {
                if (data.hasOwnProperty(prop)){
                    sharebigfiles[prop] = data[prop]
                }
            }
            hook()
        })
    }
}

//  [SHAREBIGFILES COLLECTION]   //
function SharebigfilesCollection(){
	this.collection(Sharebigfiles, {
		behaviours: 'sharebigfiles',
		folder: 'mine',
		sync: function(){
			http().get("sharebigfiles/list").done(function(data){
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

function Upload(data) {

	this.postAttachment = function (attachment, options) {
		return http().postFile("message/" + this.id + "/attachment", attachment, options)
	}

}

///////////////////////
///   MODEL.BUILD   ///

model.build = function(){
	model.me.workflow.load(['sharebigfiles'])
	this.makeModels([Sharebigfiles, SharebigfilesCollection])

	this.sharebigfilesCollection = new SharebigfilesCollection()
}

///////////////////////
