/**
	Application routes.
**/
routes.define(function($routeProvider){
	$routeProvider
		.when('/downloadFileLog', {
			action: 'downloadFileLog'
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
	$scope.expDateTest = [1,5,10,30,50,100];

	$scope.newItem = new Upload();
	$scope.newLog = new Log();

	$scope.newItem.expDate = 1;
	$scope.date = new Date();

	$scope.maxFileSize = parseInt(lang.translate('max.file.size'));
	$scope.lightbox = {}
	$scope.uploads = model.uploads;
	$scope.logs = model.logs;

	route({
		defaultView: function(){
			template.open('main', 'library')
		},
		downloadFileLog: function(){
			template.open('list', 'downloadFileLog')
			//$scope.readMail(new Mail({ id: params.mailId }));
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

	$scope.downloadFileLog = function(){
		template.open('list', 'downloadFileLog');
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

	$scope.postFiles = function(){
			_.forEach($scope.newItem.newFiles, function(targetAttachment){
				var attachmentObj = {
					file: targetAttachment,
					progress: {
						total: 100,
						completion: 0
					}
				}

				if($scope.newItem.loadingAttachments)
					$scope.newItem.loadingAttachments.push(attachmentObj);
				else
					$scope.newItem.loadingAttachments = [attachmentObj];

				var formData = new FormData();
				formData.append('file', attachmentObj.file);
				formData.append('expiryDate', "2016-02-25 10:00.30.555");
				formData.append('fileNameLabel', $scope.newItem.label);

				$scope.newItem.postAttachment(formData, {
					xhr: function() {
						var xhr = new window.XMLHttpRequest();

						xhr.upload.addEventListener("progress", function(e) {
							if (e.lengthComputable) {
								var percentage = Math.round((e.loaded * 100) / e.total)
								attachmentObj.progress.completion = percentage
								$scope.$apply()
							}
						}, false);

						return xhr;
					}
				}).done(function(result){
					attachmentObj.id = result.id
					attachmentObj.filename = attachmentObj.file.name
					attachmentObj.size = attachmentObj.file.size
					attachmentObj.contentType = attachmentObj.file.type
					if(!$scope.newItem.attachments)
						$scope.newItem.attachments = []
					$scope.newItem.attachments.push(attachmentObj)
					$scope.getQuota()
				}).e400(function(e){
					var error = JSON.parse(e.responseText);
					notify.error(error.error);
				})
			})
		}
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
		$scope.sharebigfilesList.remove()
		if(template.contains('list', 'sharebigfiles-infos'))
			$scope.closeInfos()
	}

	$scope.saveInfos = function(){
		if(!$scope.sharebigfiles.title){
			notify.error('sharebigfiles.title.missing')
			return;
		}
		if($scope.sharebigfiles._id){
			$scope.sharebigfiles.update(DEFAULT_VIEW)
		}
		else{
			$scope.sharebigfiles.create(DEFAULT_VIEW)
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

	//Default view displayed on opening
	DEFAULT_VIEW()

}
