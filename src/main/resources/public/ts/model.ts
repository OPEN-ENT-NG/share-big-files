import { moment, model } from 'entcore';
import http from 'axios';

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

export let upload: any = {};
upload.Upload = function() { }

upload.Upload.prototype = {
	creationDate: function(){
		return moment(parseInt(this.created.$date)).format('DD/MM/YYYY HH:mm')
	},
	expireDate: function(){
		return moment(parseInt(this.expiryDate.$date)).format('DD/MM/YYYY')
	},
	downloadedDate: function(downloadlog){
		return moment(parseInt(downloadlog.downloadDate.$date)).format('DD/MM/YYYY HH:mm')
	},
	classFromContentType: function() {
		for (var type in types) {
			if (types[type](this.fileMetadata['content-type'])) {
				return type;
			}
		}
	
		return 'unknown';
	},
	isOutdated: function() {
		return (this.outdated && this.outdated === true) ? true : false;
	},
	isMarkedLikeObsolete: function() {
		return moment().isAfter(parseInt(this.expiryDate.$date));
	},
	fileExtension: function() {
		return this.fileMetadata.filename.split('.').pop();
	},
	postAttachment: function (attachment, options, attachmentObj, cb, cbe) {
		return http.post("/sharebigfiles", attachment, options)
			.then(function(result: any) {
				if(typeof cb === 'function'){
					cb(result.data.id, attachmentObj);
				}
			})
			.catch(function(e){
				if(typeof cbe === 'function'){
					cbe(model.parseError(e));
				}
			});
	},
	getList: function () {
		return http.get("/sharebigfiles/list").then(function(list) {
			return list.data;
		});
	},
	deleteItems: function (cb, cbe) {
		var idArray = [];
		model.uploads.selection().forEach(function (item) {
			idArray.push(item._id);
		});
		return http.post("/sharebigfiles/deletes", {"ids": idArray}).then(function(r){
			if(typeof cb === 'function'){
				cb();
			}
		}).catch(function(e){
			if(typeof cbe === 'function'){
				cbe(model.parseError(e));
			}
		});
	},
	getQuota: function () {
		return http.get("/sharebigfiles/quota").then(function(quota) {
			return quota.data;
		})
	},
	updateFile: function (fileId, data, cb, cbe) {
		return http.put("/sharebigfiles/"+fileId, data).then(function(r){
			if(typeof cb === 'function'){
				cb();
			}
		}).catch(function(e){
			if(typeof cbe === 'function'){
				cbe(model.parseError(e));
			}
		});
	},
	getExpirationDateList: function () {
		return http.get("/sharebigfiles/expirationDateList").then(function(list) {
			return list.data;
		})
	},
	downloadFile: function (id) {
		for (var i = 0; i < model.uploads.all.length ; i++) {
			if (model.uploads.all[i]._id=== (id)) {
				model.uploads.all[i].downloadLogs.push({userDisplayName:model.me.username, downloadDate:{$date : moment(new Date()).valueOf()}});
			}
		}
		return "/sharebigfiles/download/"+id;
	}
};

model.parseError = function(e) {
	var error: any = {};
	try {
		error = JSON.parse(e.request.responseText);
	}
	catch (err) {
		error.error = "sharebigfiles.error.unknown";
	}
	error.status = e.status;

	return error;
};