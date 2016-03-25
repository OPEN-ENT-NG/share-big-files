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
function SharebigfilesController($scope, model, template, route, date){

	$scope.template = template;
	$scope.expDateList = {tab:[1,5,10,30]};

	$scope.newItem = new Upload();
	$scope.newLogId = "";
	$scope.editFileId = "";

// 	$scope.display.share = false;
	$scope.showSharePanel = false;

	$scope.newItem.expDateUpgrade = 0;
	$scope.newItem.expDate = 1;
	$scope.newItem.residualQuota = 0;
	$scope.selection = model.uploads.selection();
    $scope.ordering = 'title';


	var myDate = new Date();
	$scope.expiryDate = myDate.setDate(myDate.getDate() + $scope.newItem.expDate);

	$scope.maxFileSize = parseInt(lang.translate('max.file.size'));
	$scope.lightbox = {};
	$scope.uploads = model.uploads;
	$scope.logs = model.logs;
	$scope.me = model.me;

	$scope.dateMaxExpirationDays = 30;

    template.open('list', 'table-list');

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
			template.open('main', 'library');
			$scope.editFile(params.id);
		}
	})

	$scope.openNewFolderView = function(){
		//ui.showLightbox();
		$scope.lightbox.show = true;
		template.open('lightbox', 'importFile')
	}

	$scope.selectedDocuments = function(){
		return _.where($scope.openedFolder.content, {selected: true});
	};

	$scope.updateExpirationDate = function() {
		newExpDate = moment(new Date()).add($scope.newItem.expDate, 'days');
		$scope.expiryDate = moment(newExpDate, 'YYYY-MM-DD HH:mm.ss.SSS').valueOf();
	}

	$scope.updateExpirationDateUpgrade = function() {
		newExpDate = moment($scope.newItem.expiryDate.$date).add($scope.newItem.expDateUpgrade, 'days');
		$scope.expiryDateUpgrade = $scope.expDateUprade = moment(newExpDate, 'YYYY-MM-DD HH:mm.ss.SSS').valueOf();
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
		}).e404(function(e){
			var error = JSON.parse(e.responseText);
			bigFilesError(error);
		})
	};

	$scope.getExpirationDateList = function(){
		$scope.newItem.getExpirationDateList(
		).done(function(result){
			$scope.newItem.expirationDateList = result.expirationDateList;
			var expList = [0];
			$scope.newItem.expirationDateListEdit = expList.concat($scope.newItem.expirationDateList);
		}).e400(function(e){
			var error = JSON.parse(e.responseText);
			notify.error(error.error);
		})
	};

	$scope.downloadFile = function(id){
		window.location.href = $scope.newItem.downloadFile(id);
	};

	$scope.downloadAction = function(){
		model.uploads.selection().forEach(function(item){

			$scope.downloadFile(item._id);

		});
	}

	$scope.multipleSelection = function(){
		if(model.uploads.selection().length>1){
			$scope.multipleSelected = true;
		}
		else{
			$scope.multipleSelected = false;
		}
	}

	$scope.editFileAction = function(){
		model.uploads.selection().forEach(function(item){
			$scope.editFile(item);
		});
	}

	$scope.editFile = function(file) {
		$scope.lightbox.show = true;
		$scope.newItem.fileNameLabel = file.fileNameLabel;
		$scope.newItem.created = file.created;
		$scope.newItem.expiryDate = file.expiryDate;
		$scope.newItem.description = file.description;
		$scope.newItem._id = file._id;
		$scope.getExpirationMax(file);
		$scope.expiryDateUpgrade =  moment(file.expiryDate.$date).format('DD/MM/YYYY').valueOf();

		template.open('lightbox', 'editFile');
	};

	$scope.getExpirationMax = function(file) {
		var dateExp = moment(file.expiryDate.$date).format('MM/DD/YYYY');;
		var dateCrea = moment(file.created.$date).format('MM/DD/YYYY');;
		var diff = $scope.newItem.expirationDateList[$scope.newItem.expirationDateList.length-1] - moment(dateExp).diff(dateCrea, 'days');
		$scope.expirationMax = diff;
	}

	$scope.selectedFile = function() {
		$scope.selection = model.uploads.selection();
	}

	$scope.closeImportView = function() {
		$scope.lightbox.show=false;
		//window.location.reload();
		model.uploads.sync();
		$scope.newItem = new Upload();

	};

	$scope.closeEditView = function() {
		$scope.lightbox.show=false;
		//window.location.reload();
		model.uploads.sync();
	};

	$scope.updateFile = function(fileId) {
		$scope.newItem.expiryDate.$date = $scope.expDateUprade;
		var data = {
			"fileNameLabel": $scope.newItem.fileNameLabel,
			"expiryDate": moment($scope.expDateUprade).valueOf(),
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

			if(!$scope.newItem.description) {
				$scope.newItem.description="";
			}
			var date = moment($scope.expiryDate).valueOf();
				var formData = new FormData();
				formData.append('file', attachmentObj.file);
				formData.append('expiryDate',  date);
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
	};

	$scope.removesharebigfiles = function() {
		if(model.uploads.selection().length==1){
			$scope.deleteItem(item);
		}
		else {
			var itemArray = [];
			model.uploads.selection().forEach(function (item) {
				itemArray.push(item._id);
			});
			$scope.deleteItems({ids:itemArray});
		}
	}

	$scope.deleteItem = function(item){
		$scope.newItem.deleteItem(item._id, function () {
			bigFilesOk('sharebigfiles.notify.deleted');
			model.uploads.sync();
		},function (e) {
			bigFilesError(e);
		});
		if(template.contains('list', 'sharebigfiles-infos'))
			$scope.closeInfos()
	}

	$scope.deleteItems = function(itemArray){
		$scope.newItem.deleteItems(itemArray, function () {
			bigFilesOk('sharebigfiles.notify.deleted');
			model.uploads.sync();
		},function (e) {
			bigFilesError(e);
		});
		if(template.contains('list', 'sharebigfiles-infos'))
			$scope.closeInfos()
	}

    $scope.orderBy = function(what){
        $scope.ordering = ($scope.ordering === what ? '-' + what : what)
    }

    //TODO uploads.selection(), $event
    $scope.shareSharebigfiles = function(){
        $scope.sharedSharebigfiles = $scope.uploads.selection();
// 		$scope.display.share = true;
        $scope.showSharePanel = true;
        template.open('share', 'share');
    }

    $scope.lowerThan = function(val){
        return function(item){
            return item <= val;
        }
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