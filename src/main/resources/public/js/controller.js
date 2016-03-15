/**
 Application routes.
 **/
routes.define(function($routeProvider){
	$routeProvider
			.when('/downloadFileLog', {
				action: 'downloadFileLog'
			})
			.when('/downloadFile/:id', {
				action: 'downloadFile'
			})
			.when('/view/:id', {
				action: 'editFile'
			})
			.otherwise({
				action: 'defaultView'
			})
})

/**
 Wrapper controller
 ------------------
 Main controller.
 **/
function SharebigfilesController($scope, $rootScope, model, template, route, date){

	$scope.template = template
	$scope.expDateList = {tab:[1,5,10,30]};

	$scope.newItem = new Upload();
	$scope.newLog = new Log();
	$scope.newLogId = "";
	$scope.editFileId = "48efd526-1de4-4407-9771-900711f74ccd";

	$scope.newItem.expDate = 1;
	$scope.newItem.residualQuota = 0;

	var myDate = new Date();
	$scope.expiryDate = myDate.setDate(myDate.getDate() + $scope.newItem.expDate);

	$scope.maxFileSize = parseInt(lang.translate('max.file.size'));
	$scope.lightbox = {}
	$scope.uploads = model.uploads;
	$scope.logs = model.logs;
	$scope.me = model.me;

	route({
		defaultView: function(){
			template.open('main', 'library')
		},
		downloadFileLog: function(){
			template.open('list', 'downloadFileLog')
			//$scope.readMail(new Mail({ id: params.mailId }));
		},
		downloadFile: function(params){
			$scope.downloadFile(params.id);
		},
		editFile: function(params){
			template.open('main', 'library')
			$scope.editFile(params.id);
		}
	})

	$rootScope.longDate = function(dateStr){
		return date.create(dateStr.split(' ')[0]).format('DD MMMM YYYY')
	}

	$scope.openNewFolderView = function(){
		//ui.showLightbox();
		$scope.lightbox.show = true;
		template.open('lightbox', 'importFile')
	}

	$scope.updateExpirationDateUpgrade = function() {
		newExpDate = moment($scope.newItem.expiryDate.$date).add($scope.newItem.expDate, 'days');
		$scope.newItem.expiryDate.$date = moment(newExpDate, 'YYYY-MM-DD HH:mm.ss.SSS').valueOf();
	}

	$scope.updateExpirationDate = function() {
		newExpDate = moment(new Date()).add($scope.newItem.expDate, 'days');
		$scope.expiryDate = moment(newExpDate, 'YYYY-MM-DD HH:mm.ss.SSS');
	}

	$scope.maxSize = function(){
		//var leftOvers = model.quota.max - model.quota.used;
		//if(model.quota.unit === 'gb'){
		//	leftOvers *= 1000;
		//}
		//return leftOvers;
	};

	$scope.totalFilesSize = function(fileList){
		var size = 0
		//if(!fileList.files)
		//	return size
		//for(var i = 0; i < fileList.files.length; i++){
		//	size += fileList.files[i].size
		//}
		return size
	}

	$scope.getAppropriateDataUnit = function(bytes){
		var order = 0
		var orders = {
			0: lang.translate("byte"),
			1: "Ko",
			2: "Mo",
			3: "Go",
			4: "To"
		}
		var finalNb = bytes
		while(finalNb >= 1024 && order < 4){
			finalNb = finalNb / 1024
			order++
		}
		return {
			nb: finalNb,
			order: orders[order]
		}
	}

	$scope.formatDocumentSize = function(size){
		var formattedData = $scope.getAppropriateDataUnit(size)
		return (Math.round(formattedData.nb*10)/10)+" "+formattedData.order
	}

	$scope.goShareBigFiles = function() {
		template.open('main', 'sharebigfiles')
	};

	$scope.downloadFileLog = function(logId){
		template.open('list', 'downloadFileLog');
		$scope.newLogId = logId;
		//setCurrentFile(file, true);
	};

	$scope.shareBigFilesOpen = function(){
		template.open('list', 'table-list');
		//setCurrentFile(file, true);
	};

	$scope.shortDate = function(dateItem){
		if(!dateItem){
			return moment().format('L');
		}

		if(typeof dateItem === "number")
			return date.format(dateItem, 'L')

		if(typeof dateItem === "string")
			return date.format(dateItem.split(' ')[0], 'L')

		return moment().format('L');
	}

	$scope.longDate = function(dateString){
		if(!dateString){
			return moment().format('D MMMM YYYY');
		}

		return date.format(dateString.split(' ')[0], 'D MMMM YYYY')
	}

	$scope.fileList = function(){
		var list = $scope.newItem.log();

		//$scope.newItem.getList(
		//
		//).done(function(result){
		//	for(var i = 0; i < result.length; i++){
		//		$scope.newItem.attachments.push(JSON.parse(JSON.stringify(result)))
		//	}
		//}).e400(function(e){
		//	var error = JSON.parse(e.responseText);
		//	notify.error(error.error);
		//})
	};

	$scope.criteriaMatch = function( criteria ) {
		return function( item ) {
			return item.fileId === criteria;
		};
	};

	$scope.getQuota = function(){
		$scope.newItem.getQuota(

		).done(function(result){
			$scope.newItem.residualQuota = result.residualQuota;
		}).e400(function(e){
			var error = JSON.parse(e.responseText);
			notify.error(error.error);
		})
	};

	$scope.getExpirationDateList = function(){
		$scope.newItem.getExpirationDateList(
		).done(function(result){
			$scope.newItem.expirationDateList = result.expirationDateList;
		}).e400(function(e){
			var error = JSON.parse(e.responseText);
			notify.error(error.error);
		})
	};

	$scope.downloadFile = function(id){
		window.location.href = $scope.newItem.downloadFile(id);
		model.uploads.sync();
	};

	$scope.editFile = function(file) {
		$scope.lightbox.show = true;
		$scope.newItem.fileNameLabel = file.fileNameLabel;
		$scope.newItem.created = file.created;
		$scope.newItem.expiryDate = file.expiryDate;
		$scope.newItem.description = file.description;
		$scope.newItem._id = file._id;

		template.open('lightbox', 'editFile');
	};

	$scope.editMaxDate = function(createdDate) {
		var timeDiff = Math.abs($scope.expiryDate.getTime() - createdDate.getTime());
		var maxDate = Math.ceil(timeDiff / (1000 * 3600 * 24));
		return maxDate;
	}

	$scope.closeImportView = function() {
		$scope.lightbox.show=false;
		//window.location.reload();
		model.uploads.sync();
	};

	$scope.updateFile = function(fileId) {
		var data = {
			"fileNameLabel": $scope.newItem.fileNameLabel,
			"expiryDate": moment($scope.newItem.expiryDate.$date).format('YYYY-MM-DD HH:mm.ss.SSS'),
			"description": $scope.newItem.description
		};
		$scope.newItem.updateFile(fileId, data, function (e) {
			bigFilesError(e);
		});
	}
	$scope.postFiles = function(){
		_.forEach($scope.newItem.newFiles, function(targetAttachment){
			var attachmentObj = {
				file: targetAttachment,
				progress: {
					total: 100,
					completion: 0
				}
			}

			if($scope.newItem.loadingAttachments) {
				$scope.newItem.loadingAttachments.push(attachmentObj);
			} else {
				$scope.newItem.loadingAttachments = [attachmentObj];

				var formData = new FormData();
				formData.append('file', attachmentObj.file);
				formData.append('expiryDate', $scope.expiryDate);
				formData.append('fileNameLabel', $scope.newItem.label);
				formData.append('description', $scope.newItem.description);

				$scope.newItem.postAttachment(formData, {
							xhr: function () {
								var xhr = new window.XMLHttpRequest();

								xhr.upload.addEventListener("progress", function (e) {
									if (e.lengthComputable) {
										var percentage = Math.round((e.loaded * 100) / e.total)
										attachmentObj.progress.completion = percentage
										$scope.$apply();
									}
								}, false);

								return xhr;
							}
						},
						attachmentObj,
						function (id, attachmentObj) {
							attachmentObj.id = id;
							attachmentObj.filename = attachmentObj.file.name;
							attachmentObj.size = attachmentObj.file.size;
							attachmentObj.contentType = attachmentObj.file.type;
							if (!$scope.newItem.attachments)
								$scope.newItem.attachments = [];
							$scope.newItem.attachments.push(attachmentObj);
							$scope.getQuota();
						},
						function (e) {
							bigFilesError(e);
						}
				)
			}
		})
	}

	var bigFilesError = function(e){
		notify.error(e.error);
		$scope.currentErrors.push(e);
		$scope.$apply();
	};

	var bigFilesOk = function(i18n){
		notify.info(i18n);
		$scope.$apply();
	};
}

/**
 FolderController
 ----------------
 Sharebigfiles are split in 3 "folders" :
 - Ownermade
 - Shared
 - Deleted
 This controller helps dealing with these 3 views.
 **/
function FolderController($scope, $rootScope, model, template){

	$scope.sharebigfilesList = model.sharebigfilesCollection.sharebigfiless
	$scope.filterSharebigfiles = {}
	$scope.select = { all: false }
	$scope.ordering = 'title'

	var DEFAULT_VIEW = function(){
		if(model.me.workflow.sharebigfiles.create !== true)
			$scope.folders["shared"].list()
		else
			$scope.folders["mine"].list()
	}

	//////////////////////
	// Sharebigfiles listing //
	//////////////////////

	var refreshListing = function(folder){
		$scope.select.all = false
		$scope.sharebigfilesList.sync()
		if(typeof folder === "string")
			$scope.sharebigfilesList.folder = folder
		if(!template.contains('list', 'table-list') && !template.contains('list', 'icons-list'))
			template.open('list', 'table-list')
	}

	$scope.folders = {
		"mine": {
			list: function(){
				$scope.filterSharebigfiles = {
					"owner.userId": model.me.userId,
					"trashed": 0
				}
				refreshListing("mine")
			},
			workflow: "sharebigfiles.create"
		},
		"shared": {
			list: function(){
				$scope.filterSharebigfiles = function(item){
					return item.owner.userId !== model.me.userId
				}
				refreshListing("shared")
			}
		},
		"trash": {
			list: function(){
				$scope.filterSharebigfiles = {
					"trashed": 1
				}
				refreshListing("trash")
			},
			workflow: "sharebigfiles.create"
		}
	}

	//Deep filtering an Object based on another Object properties
	//Supports "dot notation" for accessing nested objects, ex: ({a {b: 1}} can be filtered using {"a.b": 1})
	var deepObjectFilter = function(object, filter){
		for(var prop in filter){
			var splitted_prop 	= prop.split(".")
			var obj_value 		= object
			var filter_value 	= filter[prop]
			for(i = 0; i < splitted_prop.length; i++){
				obj_value 		= obj_value[splitted_prop[i]]
			}
			if(filter_value instanceof Object && obj_value instanceof Object){
				if(!deepObjectFilter(obj_value, filter_value))
					return false
			} else if(obj_value !== filter_value)
				return false
		}
		return true
	}
	var sharebigfilesObjectFiltering = function(item){ return deepObjectFilter(item, $scope.filterSharebigfiles) }
	var selectMultiple = function(items){
		_.forEach(items, function(item){ item.selected = true })
	}

	$scope.switchAll = function(){
		if($scope.select.all){
			$scope.uploads.selectAll();
		}
		else{
			$scope.uploads.deselectAll();
		}
	}

	$scope.orderBy = function(what){
		$scope.ordering = ($scope.ordering === what ? '-' + what : what)
	}

	$scope.opensharebigfiles = function(sharebigfiles){
		$rootScope.sharebigfiles = sharebigfiles
		template.open('main', 'sharebigfiles')
	}

	/////////////////////////////////////
	// Sharebigfiles creation /modification //
	/////////////////////////////////////

	$scope.newsharebigfiles = function(){
		$scope.sharebigfiles = new Sharebigfiles()
		$scope.sharebigfilesList.deselectAll()
		$scope.select.all = false
		template.open('list', 'sharebigfiles-infos')
	}

	$scope.editInfos = function(){
		$scope.sharebigfiles = $scope.sharebigfilesList.selection()[0]
		template.open('list', 'sharebigfiles-infos')
	}

	$scope.download = false;

	$scope.removeIcon = function(){
		$scope.sharebigfiles.thumbnail = ""
	}
	$scope.downloadsharebigfiles = function() {
		if($scope.download == false){
			$scope.download = true;
		}
		else {
			$scope.download = false;
		}
	}

	$scope.removesharebigfiles = function(){
		$scope.sharebigfilesList.remove(function () {
			bigFilesOk('sharebigfiles.notify.deleted');
		},function (e) {
			bigFilesError(e);
		});
		if(template.contains('list', 'sharebigfiles-infos'))
			$scope.closeInfos()
	}

	$scope.saveInfos = function(id){
		if(!$scope.sharebigfiles.title){
			notify.error('sharebigfiles.title.missing')
			return;
		}

		if (id) {
			$scope.sharebigfiles._id = id;
		}

		if($scope.sharebigfiles._id) {
			$scope.sharebigfiles.update(DEFAULT_VIEW,
					function (e) {
						bigFilesError(e);
					});
		} else {
			$scope.sharebigfiles.create(DEFAULT_VIEW,
					function (e) {
						bigFilesError(e);
					});
		}
	}

	$scope.closeInfos = function(){
		DEFAULT_VIEW()
	}

	$scope.sharesharebigfiles = function(){
		$rootScope.sharedSharebigfiles = $scope.sharebigfilesList.selection()
		template.open('lightbox', 'share')
	}

	$rootScope.$on('share-updated', function(){
		$scope.sharebigfilesList.sync()
	})

	var bigFilesError = function(e){
		notify.error(e.error);
		$scope.currentErrors.push(e);
		$scope.$apply();
	};

	var bigFilesOk = function(i18n){
		notify.info(i18n);
		$scope.$apply();
	};

	//Default view displayed on opening
	DEFAULT_VIEW()

}
