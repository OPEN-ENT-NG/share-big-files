/**
	Application routes.
**/
routes.define(function($routeProvider){
	$routeProvider
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

	route({
		defaultView: function(){
			template.open('main', 'library')
		}
	})

	$rootScope.longDate = function(dateStr){
		return date.create(dateStr.split(' ')[0]).format('DD MMMM YYYY')
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

				if($scope.newItem.loadingAttachments)
					$scope.newItem.loadingAttachments.push(attachmentObj)
				else
					$scope.newItem.loadingAttachments = [attachmentObj]

				var formData = new FormData()
				formData.append('file', attachmentObj.file)

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
			selectMultiple($scope.sharebigfilesList.filter(sharebigfilesObjectFiltering).filter(function(item){ return item.myRights.manager !== undefined }))
		}
		else{
			$scope.sharebigfilesList.deselectAll();
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

	$scope.removeIcon = function(){
		$scope.sharebigfiles.thumbnail = ""
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
