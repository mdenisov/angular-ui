
angular.module('app', [
        'ngRoute',
        'ngResource',

        'users'
    ])

    .constant('MONGOLAB_CONFIG', {
        baseUrl: '/databases/',
        dbName: 'dashboard'
    })

    .controller('AppCtrl', ['$scope',
        function($scope) {



        }
    ])

    .controller('HeaderCtrl', ['$scope', '$location', '$route',
        function ($scope, $location, $route) {

            $scope.location = $location;

            $scope.home = function () {
                $location.path('/');
            };

            $scope.isNavbarActive = function (navBarPath) {
//                return navBarPath === breadcrumbs.getFirst().name;
            };

            $scope.hasPendingRequests = function () {
//                return httpRequestTracker.hasPendingRequests();
            };
        }
    ]);