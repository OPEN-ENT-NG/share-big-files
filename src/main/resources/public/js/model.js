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
};

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

Upload.prototype.deleteItems = function (itemArray) {
	return http().deleteJson("/sharebigfiles/deletes", itemArray)
};

Upload.prototype.getQuota = function () {
	return http().get("/sharebigfiles/quota")
};

Upload.prototype.updateFile = function (fileId, data, cbe) {
	return http().putJson("/sharebigfiles/"+fileId, data).error(function(e){
		if(typeof cbe === 'function'){
			cbe(model.parseError(e));
		}
	})
};

Upload.prototype.getExpirationDateList = function () {
	return http().get("/sharebigfiles/expirationDateList")
};

Upload.prototype.downloadFile = function (id) {
	for (var i = 0; i < model.uploads.all.length ; i++) {
		if (model.uploads.all[i]._id=== (id)) {
			model.uploads.all[i].downloadLogs.push({userDisplayName:model.me.username, downloadDate:new Date()});
		}
	}
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

model.build = function(){
	//model.me.workflow.load(['sharebigfiles'])
	this.makeModel(Upload);

	this.collection(Upload,{
		sync:function() {
			var that = this;
			http().get('/sharebigfiles/list').done(function (data) {
				that.load(data)
			})
		},
		behaviours: 'sharebigfiles'
	});
};