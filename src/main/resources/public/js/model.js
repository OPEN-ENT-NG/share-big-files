//  [SHAREBIGFILES]   //
function Sharebigfiles(){}
Sharebigfiles.prototype = {
	API_PATH 	: "/sharebigfiles",

	delete 		: function(icb, cb, cbe){
		return http().delete(this.API_PATH + '/' + this._id)
				.done(function(){
					icb();
					if(typeof cb === 'function'){
						cb();
					}
				}).error(function(e){
					if(typeof cbe === 'function'){
						cbe(model.parseError(e));
					}
				});
	},
	create 		: function(cb, cbe){
		var sharebigfiles = this
		return http().postJson(this.API_PATH, {
			"title": 		sharebigfiles.title,
			"thumbnail": 	(sharebigfiles.thumbnail === undefined ? "" : sharebigfiles.thumbnail)
		}).done(function(){
			//fixme bad notify or must be in callback function
			notify.info('sharebigfiles.notify.saved');
			if(typeof cb === 'function'){
				cb();
			}
		}).error(function(e){
			if(typeof cbe === 'function'){
				cbe(model.parseError(e));
			}
		});
	},
	update : function(cb, cbe){
		var sharebigfiles = this
		return http().putJson(this.API_PATH + '/' + this._id, {
			"title": 		sharebigfiles.title,
			"thumbnail": 	sharebigfiles.thumbnail
		}).done(function(){
			//fixme bad notify or must be in callback function
			notify.info('sharebigfiles.notify.modified');
			if(typeof cb === 'function'){
				cb();
			}
		}).error(function(e){
			if(typeof cbe === 'function'){
				cbe(model.parseError(e));
			}
		});
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
		remove: function(cb, cbe){
			collection = this
			var parsedCount = 0
			this.selection().forEach(function(item){
				if(collection.folder === 'trash'){
					item.delete(function() {
						if(++parsedCount === collection.selection().length)
							collection.sync()
					},cb, cbe);
				}
				else{
					//fixme trash microservice
					item.trash().done(function(){
						if(++parsedCount === collection.selection().length)
							collection.sync()
					})
				}
			})
		},
	})
}

function Log(data) {

}

function Upload(data) {
	this.creationDate = function(){
		return moment(parseInt(this.created.$date)).format('DD/MM/YYYY HH:mm')
	};
	this.expireDate = function(){
		return moment(parseInt(this.expiryDate.$date)).format('DD/MM/YYYY HH:mm')
	};
	this.downloadedDate = function(downloadlog){
		return moment(parseInt(downloadlog.downloadDate.$date)).format('DD/MM/YYYY HH:mm')
	};
}

Upload.prototype.postAttachment = function (attachment, options, attachmentObj, cb, cbe) {
	return http().postFile("/sharebigfiles", attachment, options)
		.done(function(result) {
			if(typeof cb === 'function'){
				cb(result.id, attachmentObj);
			}
		})
		.error(function(e){
			if(typeof cbe === 'function'){
				cbe(model.parseError(e));
			}
		});

};

Upload.prototype.getList = function () {
	return http().get("/sharebigfiles/list")
};

Upload.prototype.deleteItem = function (id) {
	return http().delete("/sharebigfiles/"+id)
};

Upload.prototype.getQuota = function () {
	return http().get("/sharebigfiles/quota2")
};

Upload.prototype.updateFile = function (fileId, data, cbe) {
	return http().putJson("sharebigfiles/"+fileId, data).error(function(e){
		if(typeof cbe === 'function'){
			cbe(model.parseError(e));
		}
	})
};

Upload.prototype.getExpirationDateList = function () {
	return http().get("/sharebigfiles/expirationDateList")
};

Upload.prototype.downloadFile = function (id) {
	return "/sharebigfiles/download/"+id;
};


model.parseError = function(e) {
	var error = {};
	try {
		error = JSON.parse(e.responseText);
	}
	catch (err) {
		error.error = "search.engine.error.unknown";
	}
	error.status = e.status;

	return error;
};

///////////////////////
///   MODEL.BUILD   ///

model.build = function(){
	model.me.workflow.load(['sharebigfiles'])
	this.makeModels([Sharebigfiles, SharebigfilesCollection, Upload, Log])

	this.sharebigfilesCollection = new SharebigfilesCollection()
	this.collection(Upload,{
		sync:function() {
			var that = this;
			http().get('/sharebigfiles/list').done(function (data) {
				that.load(data)
			})
		}
	});
	this.collection(Log,{
		sync:"/sharebigfiles/public/json/fileDownload.json"
	});
}

///////////////////////
