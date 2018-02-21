import { routes, ng, template, moment, idiom as lang, notify, _ } from 'entcore';
import { upload } from './model';

let Upload = upload.Upload;

/**
 Application routes.
 **/
routes.define(function($routeProvider){
	$routeProvider
			.when('/editFileLog/:id', {
				action: 'editFileLog'
			})
            .when('/editFileLog/:id/:list', {
                action: 'editFileLog'
            })
			.when('/downloadFile/:id', {
				action: 'downloadFile'
			})
            .when('/downloadFile/:id/:list', {
                action: 'downloadFile'
            })
			.when('/create', {
				action: 'createFile'
			})
            .when('/create/:fromDrop', {
                action: 'createFile'
            })
			.when('/view/:id', {
				action: 'editFile'
			})
            .when('/view/:id/:list', {
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
export const sharebigfilesController = ng.controller('SharebigfilesController', ['$scope', 'model', 'route', '$location', 
function($scope, model, route, $location) {

	$scope.template = template;
	$scope.newItem = new Upload();
	$scope.newLogId = "";
	$scope.currentErrors = [];
    $scope.display = {};
	$scope.fileName = "";
	$scope.newItem.expDateUpgrade = 0;
	$scope.uploads = model.uploads;
	$scope.me = model.me;
    template.open('errors', 'errors');
	template.open('main', 'library');
    template.open('list', 'table-list');

    //configurations datas
    var expirationDateList = [];
    var expDate = 0;
    var expiryDate = new Date();
    var residualQuota = 0;
    var residualRepository = 0;
    var maxRepository = 0;
    $scope.maxQuota = 0;

	route({
		defaultView: function(){
			model.uploads.syncBigFiles();
			$scope.boxes.selectAll=false;
		},
		editFileLog: function(params){
            loadFromRoute(params.id, params.list, "log");
		},
		downloadFile: function(params){
			downloadFile(params.id, params.list);
		},
        createFile: function(params){
            deselectAll();
            openNewFolderView(params.fromDrop);
        },
		editFile: function(params){			
            loadFromRoute(params.id, params.list, "edit");
		}
	});

	var loadFromRoute = function(id, isList, target) {
		var item = model.uploads.findWhere({ _id:  id });
		if (!item) {
			var totalAsynchroneCall = 2;
			$scope.getQuota(function() {
				totalAsynchroneCall--;
				if (totalAsynchroneCall === 0) {
					item = model.uploads.findWhere({ _id:  id });
					goToTarget(target, item, isList);
				}
			});

			model.uploads.syncBigFiles(function() {
				totalAsynchroneCall--;
				if (totalAsynchroneCall === 0) {
					item = model.uploads.findWhere({ _id:  id });
					goToTarget(target, item, isList);
				}
			});			
		} else {
			goToTarget(target, item, isList);
		}
	};
	
	var goToTarget = function(target, item, isList) {
		if (target === "edit") {
			$scope.editFile(item, isList);
		} else {
			//TODO stop the loop on download log view --> bad idea from ...
			$scope.fileName = item.fileNameLabel;
			editFileLog(item.fileId, isList);
		}
	};

    $scope.redirect = function(path){
        $location.path(path);
	};
	
	$scope.translate = function(label) {
		return lang.translate(label);
	}

	var openNewFolderView = function(fromDrop){
        $scope.currentErrors = [];
        if (maxRepository === 0) {
            $scope.getQuota(function() {
				openPanelImport(fromDrop);
            })
        } else {
			openPanelImport(fromDrop);
        }
	};

	var openPanelImport = function(fromDrop) {
		initNewItem(fromDrop);
		template.open('importFile', 'importFile');
		shareBigFilesOpen();
		$scope.display.showImportPanel = true;
	};

	$scope.updateExpirationDate = function() {
		let newExpDate = moment(new Date()).add($scope.newItem.expDate, 'days');
		$scope.expiryDate = moment(newExpDate, 'YYYY-MM-DD HH:mm.ss.SSS').valueOf();
	}

	$scope.updateExpirationDateUpgrade = function() {
		let newExpDate = moment($scope.newItem.created.$date).add($scope.newItem.expDateUpgrade, 'days');
		$scope.expiryDateUpgrade = $scope.expDateUprade = moment(newExpDate, 'YYYY-MM-DD HH:mm.ss.SSS').valueOf();
	};

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
	};

	var editFileLog = function(logId, fromList){
		$scope.currentErrors = [];
        if (fromList === undefined) {
            deselectAll();
        }
		template.open('downloadFileLog', 'downloadFileLog');
		shareBigFilesOpen();
		$scope.display.showLogPanel = true;
		$scope.newLogId = logId;
	};

	$scope.boxes = { selectAll: false }
	$scope.switchSelectAll = function(){
		$scope.uploads.forEach(function(upload){
			upload.selected = $scope.boxes.selectAll;
		});
	};

    var deselectAll = function() {
        _.forEach($scope.uploads.selection(), function(upload){
            upload.selected = false;
        });
    };

	var shareBigFilesOpen = function(){
		template.open('list', 'table-list');
	};

	$scope.getQuota = function(cb){
        $scope.currentErrors = [];
		$scope.newItem.getQuota().then(function(result){
			residualQuota = result.residualQuota;
            residualRepository = result.residualRepositoryQuota;
            maxRepository = result.maxRepositoryQuota;
            $scope.maxQuota = result.maxFileQuota;
            if(typeof cb === 'function'){
                cb();
            }
		}).catch(function(e){
			bigFilesError(e);
		})
	};

	$scope.getExpirationDateList = function(){
		$scope.newItem.getExpirationDateList().then(function(result){
            expirationDateList = result.expirationDateList;
            expDate = result.expirationDateList[0];
            var myDate = new Date();
            let expiryDate = myDate.setDate(myDate.getDate() + expDate);
			initNewItemExpirationData();
		}).catch(function(e){
			notify.error(e);
		})
	};

	var downloadFile = function(id, fromList){
        if (fromList === undefined) {
            deselectAll();
        }
		window.location.href = $scope.newItem.downloadFile(id);
        $scope.redirect('/');
	};

	$scope.editFile = function(file, fromList) {
		if (file.isOutdated()) {
			file.selected = true;
			$scope.uploads.selection().push(file);
		} else {
			$scope.currentErrors = [];
			if (fromList === undefined) {
				deselectAll();
			}
			initNewItem(undefined);

			$scope.newItem.fileNameLabel = file.fileNameLabel;
			$scope.newItem.created = file.created;
			$scope.newItem.expiryDate = file.expiryDate;
			$scope.newItem.description = file.description;
			$scope.newItem._id = file._id;
			$scope.newItem.myRights = file.myRights;
			generateExpDateUpgrade(file);
			$scope.expiryDateUpgrade = moment(file.expiryDate.$date).valueOf();

			template.open('editFile', 'editFile');
			shareBigFilesOpen();
			$scope.display.showEditPanel = true;
		}
	};

	var generateExpDateUpgrade = function(file) {
		var dateExp = moment(file.expiryDate.$date).format('MM/DD/YYYY');
		var dateCrea = moment(file.created.$date).format('MM/DD/YYYY');
        $scope.newItem.expDateUpgrade =  moment(dateExp).diff(dateCrea, 'days');
		if ($scope.newItem.expDateUpgrade === 0) {
			//in fact, it's possible lifetime can be less than 24h because the hour can't manage
			$scope.newItem.expDateUpgrade = 1;
		}
	};

	var initNewItem = function(fromDrop) {
		//not from drop zone
		if (fromDrop === undefined) $scope.newItem = new Upload();
        $scope.newItem.residualQuota = residualQuota;
        initNewItemExpirationData();

    };

    var initNewItemExpirationData = function() {
        $scope.expiryDate = $scope.newItem.expiryDate = expiryDate;
        $scope.newItem.expirationDateList = expirationDateList;
        $scope.newItem.expDate = expDate;
    };

	$scope.updateFile = function(fileId) {
        $scope.currentErrors = [];
		if (!$scope.newItem.fileNameLabel) {
			bigFilesWarn({error: 'sharebigfiles.empty.filename'});
		} else {
			$scope.updateExpirationDateUpgrade();
			$scope.newItem.expiryDate.$date = $scope.expDateUprade;
			var data = {
				"fileNameLabel": $scope.newItem.fileNameLabel,
				"expiryDate": moment($scope.expDateUprade).valueOf(),
				"description": $scope.newItem.description
			};
			$scope.newItem.updateFile(fileId, data, function () {
				model.uploads.syncBigFiles(function () {
					$scope.display.showEditPanel = false;
					$scope.redirect('/');
				});
			}, function (e) {
				bigFilesError(e);
			});
		}
	};

	$scope.setFilesName = function(){
		$scope.currentErrors = [];
		$scope.newItem.name = '';

		if ($scope.newItem.newFiles.length > 0) {
			var file = $scope.newItem.newFiles[0];
			$scope.newItem.name = file.name;
		}
	};

	$scope.postFiles = function(){
        $scope.currentErrors = [];
		if (!$scope.newItem.fileNameLabel) {
			bigFilesWarn({error: 'sharebigfiles.empty.filename'});
		}
		if (!$scope.newItem.newFiles) {
            bigFilesWarn({error: 'sharebigfiles.empty.files'});
        }
		if ($scope.currentErrors.length === 0) {
			_.forEach($scope.newItem.newFiles, function (targetAttachment) {
				var attachmentObj = {
					file: targetAttachment,
					progress: {
						total: 100,
						completion: 0
					}
				}

				if ($scope.newItem.loadingAttachments) {
					$scope.newItem.loadingAttachments.push(attachmentObj);
				} else {
					$scope.newItem.loadingAttachments = [attachmentObj];

					if (!$scope.newItem.description) {
						$scope.newItem.description = "";
					}
					var date = moment($scope.expiryDate).valueOf();
					var formData = new FormData();

					var currentSize = attachmentObj.file.size;
					//put size of repository for back side check if size of repository is exceeded
					var residualTotalSize = residualRepository - currentSize;
					if (residualTotalSize < 0) {
						attachmentObj.file.size = maxRepository;
					}

					formData.append('file', attachmentObj.file);
					formData.append('expiryDate', date);
					formData.append('fileNameLabel', $scope.newItem.fileNameLabel);
					formData.append('description', $scope.newItem.description);
					//to inform back side on error type
					if (residualTotalSize < 0) {
						formData.append('size', maxRepository.toString());
					}

					$scope.newItem.postAttachment(formData, {
							onUploadProgress: function (progressEvent) {
									if (progressEvent.lengthComputable) {
										var percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
										attachmentObj.progress.completion = percentage
										$scope.$apply();
									}
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
								model.uploads.syncBigFiles(function () {
									initNewItem(undefined);
									$scope.display.showImportPanel = false;
									$scope.redirect('/');
								});
							},
							function (e) {
								$scope.newItem.loadingAttachments = undefined;
								bigFilesError(e);
							}
					)
				}
			})
		}
	};

	$scope.remove = function() {
		$scope.currentErrors = [];
		$scope.newItem.deleteItems(function () {
			model.uploads.syncBigFiles();
		},function (e) {
			bigFilesError(e);
		});
	}

	$scope.orderLog = {
		field: 'downloadDate', desc: true
	}

	$scope.orderLog.order = function(item){
		if($scope.orderLog.field === 'downloadDate' && item.downloadDate){
			return moment(item.downloadDate.$date);
		}

		if($scope.orderLog.field.indexOf('.') >= 0){
			var splitted_field = $scope.orderLog.field.split('.')
			var sortValue = item
			for(var i = 0; i < splitted_field.length; i++){
				sortValue = typeof sortValue === 'undefined' ? undefined : sortValue[splitted_field[i]]
			}
			return sortValue
		} else
			return item[$scope.orderLog.field];
	}

	$scope.orderByLogField = function(fieldName){
		if(fieldName === $scope.orderLog.field){
			$scope.orderLog.desc = !$scope.orderLog.desc;
		}
		else{
			$scope.orderLog.desc = false;
			$scope.orderLog.field = fieldName;
		}
	};

	$scope.order = {
		field: 'modified', desc: true
	}

	$scope.order.order = function(item){
		if($scope.order.field === 'modified' && item.modified){
			return moment(item.modified.$date);
		} else if($scope.order.field === 'created' && item.created){
			return moment(item.created.$date);
		} else if($scope.order.field === 'expiryDate' && item.expiryDate){
			return moment(item.expiryDate.$date);
		} else if ($scope.order.field === 'downloadLogs' && item.downloadLogs) {
			return item.downloadLogs.length;
		}

		if($scope.order.field.indexOf('.') >= 0){
			var splitted_field = $scope.order.field.split('.')
			var sortValue = item
			for(var i = 0; i < splitted_field.length; i++){
				sortValue = typeof sortValue === 'undefined' ? undefined : sortValue[splitted_field[i]]
			}
			return sortValue
		} else
			return item[$scope.order.field];
	}

	$scope.orderByField = function(fieldName){
		if(fieldName === $scope.order.field){
			$scope.order.desc = !$scope.order.desc;
		}
		else{
			$scope.order.desc = false;
			$scope.order.field = fieldName;
		}
	};

	$scope.shareSharebigfiles = function(){
		$scope.sharedSharebigfiles = $scope.uploads.selection();
        $scope.display.showPanel = true;
    };

    $scope.lowerThan = function(val){
        return function(item){
            return item <= val;
        }
    };

	$scope.canManage = function(item){
		return (item.myRights.manage !== undefined);
	};

	$scope.canContribute = function(item){
        return (item.myRights.contrib !== undefined);
    };

	$scope.reloadSelected = function() {
		var saveSelected = $scope.uploads.selection();
		$scope.uploads.syncBigFiles(function() {
			$scope.uploads.forEach(function(upload) {
				saveSelected.forEach(function (selected) {
					if (upload._id === selected._id) {
						upload.selected = true;
					}
				});
			});
		});
	}

    var bigFilesWarn = function(e){
        notify.error(e.error);
        $scope.currentErrors.push(e);
    };


    var bigFilesError = function(e){
		notify.error(e.error);
		$scope.currentErrors.push(e);
        $scope.$apply();
	};
}]);