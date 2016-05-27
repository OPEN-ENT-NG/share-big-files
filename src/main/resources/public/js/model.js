var types = {
	'doc': function (type) {
		return type.indexOf('document') !== -1 && type.indexOf('wordprocessing') !== -1;
	},
	'xls': function (type) {
		return (type.indexOf('document') !== -1 && type.indexOf('spreadsheet') !== -1) || (type.indexOf('ms-excel') !== -1);
	},
	'img': function (type) {
		return type.indexOf('image') !== -1;
	},
	'pdf': function (type) {
		return type.indexOf('pdf') !== -1 || type === 'application/x-download';
	},
	'ppt': function (type) {
		return (type.indexOf('document') !== -1 && type.indexOf('presentation') !== -1) || type.indexOf('powerpoint') !== -1;
	},
	'video': function (type) {
		return type.indexOf('video') !== -1;
	},
	'audio': function (type) {
		return type.indexOf('audio') !== -1;
	},
	'zip': function (type) {
		return type.indexOf('zip') !== -1 ||
				type.indexOf('rar') !== -1 ||
				type.indexOf('tar') !== -1 ||
				type.indexOf('7z') !== -1;
	}
};

function Upload() {
	this.creationDate = function(){
		return moment(parseInt(this.created.$date)).format('DD/MM/YYYY HH:mm')
	};
	this.expireDate = function(){
		return moment(parseInt(this.expiryDate.$date)).format('DD/MM/YYYY')
	};
	this.downloadedDate = function(downloadlog){
		return moment(parseInt(downloadlog.downloadDate.$date)).format('DD/MM/YYYY HH:mm')
	};
};

Upload.prototype.classFromContentType = function() {
	for (var type in types) {
		if (types[type](this.fileMetadata['content-type'])) {
			return type;
		}
	}

	return 'unknown';
};

Upload.prototype.isOutdated = function() {
	return (this.outdated && this.outdated === true) ? true : false;
}

Upload.prototype.isMarkedLikeObsolete = function() {
	return moment().isAfter(parseInt(this.expiryDate.$date));
}

Upload.prototype.fileExtension = function() {
	return this.fileMetadata.filename.split('.').pop();
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

Upload.prototype.deleteItem = function (id, cb, cbe) {
	return http().delete("/sharebigfiles/"+id).done(function(r){
		if(typeof cb === 'function'){
			cb();
		}
	}).error(function(e){
		if(typeof cbe === 'function'){
			cbe(model.parseError(e));
		}
	});
};

Upload.prototype.deleteItems = function (itemArray, cb, cbe) {
	return http().deleteJson("/sharebigfiles/deletes", itemArray).done(function(r){
		if(typeof cb === 'function'){
			cb();
		}
	}).error(function(e){
		if(typeof cbe === 'function'){
			cbe(model.parseError(e));
		}
	});
};

Upload.prototype.getQuota = function () {
	return http().get("/sharebigfiles/quota")
};

Upload.prototype.updateFile = function (fileId, data, cb, cbe) {
	return http().putJson("/sharebigfiles/"+fileId, data).done(function(r){
		if(typeof cb === 'function'){
			cb();
		}
	}).error(function(e){
		if(typeof cbe === 'function'){
			cbe(model.parseError(e));
		}
	});
};

Upload.prototype.getExpirationDateList = function () {
	return http().get("/sharebigfiles/expirationDateList")
};

Upload.prototype.downloadFile = function (id) {
	for (var i = 0; i < model.uploads.all.length ; i++) {
		if (model.uploads.all[i]._id=== (id)) {
			model.uploads.all[i].downloadLogs.push({userDisplayName:model.me.username, downloadDate:{$date : moment(new Date()).valueOf()}});
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
		error.error = "sharebigfiles.error.unknown";
	}
	error.status = e.status;

	return error;
};

model.build = function(){
	//model.me.workflow.load(['sharebigfiles'])
	this.makeModel(Upload);

	this.collection(Upload,{
		syncBigFiles:function(cb) {
			var that = this;
			http().get('/sharebigfiles/list').done(function (data) {
				that.load(data);
				if(typeof cb === 'function'){
					cb();
				}
			})
		},
		behaviours: 'sharebigfiles'
	});
};