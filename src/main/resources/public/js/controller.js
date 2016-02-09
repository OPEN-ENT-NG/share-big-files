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
function BigfilesController($scope, $rootScope, model, template, route, date){

	$scope.template = template

	route({
		defaultView: function(){
			$scope.openView('main', 'library')
		}
	})

	$rootScope.longDate = function(dateStr){
		return date.create(dateStr.split(' ')[0]).format('DD MMMM YYYY')
	}

	$scope.openView = function(container, view){
		if(container === "lightbox")
			ui.showLightbox()
		else
			ui.hideLightbox()
		template.open(container, view)
	}

}

/**
	FolderController
	----------------
	Bigfiles are split in 3 "folders" :
		- Ownermade
		- Shared
		- Deleted
	This controller helps dealing with these 3 views.
**/
function FolderController($scope, $rootScope, model, template){

	$scope.bigfilesList = model.bigfilesCollection.bigfiless
	$scope.filterBigfiles = {}
	$scope.select = { all: false }
	$scope.ordering = 'title'

	var DEFAULT_VIEW = function(){
		if(model.me.workflow.bigfiles.create !== true)
			$scope.folders["shared"].list()
		else
			$scope.folders["mine"].list()
	}

	//////////////////////
	// Bigfiles listing //
	//////////////////////

	var refreshListing = function(folder){
		$scope.select.all = false
		$scope.bigfilesList.sync()
		if(typeof folder === "string")
			$scope.bigfilesList.folder = folder
		if(!template.contains('list', 'table-list') && !template.contains('list', 'icons-list'))
			$scope.openView('list', 'table-list')
	}

	$scope.folders = {
		"mine": {
			list: function(){
				$scope.filterBigfiles = {
					"owner.userId": model.me.userId,
					"trashed": 0
				}
				refreshListing("mine")
			},
			workflow: "bigfiles.create"
		},
		"shared": {
			list: function(){
				$scope.filterBigfiles = function(item){
					return item.owner.userId !== model.me.userId
				}
				refreshListing("shared")
			}
		},
		"trash": {
			list: function(){
				$scope.filterBigfiles = {
					"trashed": 1
				}
				refreshListing("trash")
			},
			workflow: "bigfiles.create"
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
	var bigfilesObjectFiltering = function(item){ return deepObjectFilter(item, $scope.filterBigfiles) }
	var selectMultiple = function(items){
		_.forEach(items, function(item){ item.selected = true })
	}

	$scope.switchAll = function(){
		if($scope.select.all){
			selectMultiple($scope.bigfilesList.filter(bigfilesObjectFiltering).filter(function(item){ return item.myRights.manager !== undefined }))
		}
		else{
			$scope.bigfilesList.deselectAll();
		}
	}

	$scope.orderBy = function(what){
		$scope.ordering = ($scope.ordering === what ? '-' + what : what)
	}

	$scope.openbigfiles = function(bigfiles){
		$rootScope.bigfiles = bigfiles
		$scope.openView('main', 'bigfiles')
	}

	/////////////////////////////////////
	// Bigfiles creation /modification //
	/////////////////////////////////////

	$scope.newbigfiles = function(){
		$scope.bigfiles = new Bigfiles()
		$scope.bigfilesList.deselectAll()
		$scope.select.all = false
		$scope.openView('list', 'bigfiles-infos')
	}

	$scope.editInfos = function(){
		$scope.bigfiles = $scope.bigfilesList.selection()[0]
		$scope.openView('list', 'bigfiles-infos')
	}

	$scope.removeIcon = function(){
		$scope.bigfiles.thumbnail = ""
	}

	$scope.removebigfiles = function(){
		$scope.bigfilesList.remove()
		if(template.contains('list', 'bigfiles-infos'))
			$scope.closeInfos()
	}

	$scope.saveInfos = function(){
		if(!$scope.bigfiles.title){
			notify.error('bigfiles.title.missing')
			return;
		}
		if($scope.bigfiles._id){
			$scope.bigfiles.update(DEFAULT_VIEW)
		}
		else{
			$scope.bigfiles.create(DEFAULT_VIEW)
		}
	}

	$scope.closeInfos = function(){
		DEFAULT_VIEW()
	}

	$scope.sharebigfiles = function(){
		$rootScope.sharedBigfiles = $scope.bigfilesList.selection()
		$scope.openView('lightbox', 'share')
	}

	$rootScope.$on('share-updated', function(){
		$scope.bigfilesList.sync()
	})

	//Default view displayed on opening
	DEFAULT_VIEW()

}
