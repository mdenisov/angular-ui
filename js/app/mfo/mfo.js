
angular.module('mfo', [
        'services.crud',
        'dataResource',

        'services.i18nNotifications',
        'show-errors',
//        'users-edit-validateEmails'
    ])

    .config(['crudRouteProvider', function (crudRouteProvider) {

        crudRouteProvider.routesFor('Mfo', '', '', 'js/app')
            .whenList({
                mfos: ['Mfo', function(Mfo) { return Mfo.all(); }]
            })
            .whenNew({
				mfo: ['Mfo', function(Mfo) { return new Mfo(); }]
            })
            .whenEdit({
				mfo:['$route', 'Mfo', function ($route, Mfo) {
                    return Mfo.getById($route.current.params.itemId);
                }]
            });
    }])

    .filter('startsWithLetter', function () {
        return function (items, search) {
            var filtered = [];

            if (items) {
                var searchMatch = new RegExp(search, 'i');

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];

                    if (searchMatch.test(item.name) || searchMatch.test(item.email) ) {
                        filtered.push(item);
                    }
                }
                return filtered;
            }
            return filtered;
        };
    })

    .factory('Mfo', ['dataResource', function (dataResource) {

        var mfoResource = dataResource('mfo');

		mfoResource.prototype.getFullName = function () {
            return this.lastName + " " + this.firstName + " (" + this.email + ")";
        };

        return mfoResource;
    }])

    .controller('MfoListCtrl', ['$scope', 'crudListMethods', 'mfos', 'i18nNotifications',
        function ($scope, crudListMethods, mfos, i18nNotifications) {
            $scope.mfos = mfos;

            angular.extend($scope, crudListMethods('/mfo'));

            $scope.remove = function(mfo, $index, $event) {
                // Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
                // an edit of this item.
                $event.stopPropagation();

                // Remove this user
				mfo.$remove(function() {
                    // It is gone from the DB so we can remove it from the local list too
                    $scope.mfos.splice($index,1);
                    i18nNotifications.pushForCurrentRoute('crud.user.remove.success', 'success', {id : mfo.$id()});
                }, function() {
                    i18nNotifications.pushForCurrentRoute('crud.user.remove.error', 'error', {id : mfo.$id()});
                });
            };

            $scope.sortField = undefined;
            $scope.reverse = false;

            $scope.sort = function(fieldName) {
                if($scope.sortField === fieldName) {
                    $scope.reverse = true;
                } else {
                    $scope.sortField = fieldName;
                    $scope.reverse = false;
                }
            };

            $scope.isSortUp = function(fieldName) {
                return $scope.sortField === fieldName && !$scope.reverse;
            };

            $scope.isSortDown = function(fieldName) {
                return $scope.sortField === fieldName && $scope.reverse;
            };
        }
    ])

    .controller('MfoEditCtrl', ['$scope', '$location', '$http', 'mfo', 'i18nNotifications',
        function ($scope, $location, $http, mfo, i18nNotifications) {

            $scope.mfo = mfo;
            $scope.mfo.region_selected = $scope.mfo.region_id;
//            $scope.password = user.password;

            $scope.onSave = function (mfo) {
                i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', {id : mfo.$id()});
                $location.path('/mfo');
            };

            $scope.onError = function() {
                i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error');
            };

            $scope.onRemove = function(mfo) {
                i18nNotifications.pushForNextRoute('crud.user.remove.success', 'success', {id : mfo.$id()});
                $location.path('/mfo');
            };

			$scope.getRegion = function(val) {
				return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
					params: {
						address: val,
						sensor: false
					}
				}).then(function(response){
					return response.data.results.map(function(item) {
						return item.formatted_address;
					});
				});
			};

            $scope.regions = [
                {id: 1, name: "google"},
                {id: 2, name: "microsoft"}
            ];

            $scope.setRegion = function(region) {
                $scope.mfo.region_id = region.id;
            };

        }
    ]);