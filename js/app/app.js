
angular.module('app', [
        'ngRoute',
        'ngResource',

        'directives.crud',
        'users'
    ])

    .constant('CONFIG', {
        baseUrl: '/api/index.php'
    })

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo:'/'});
    }])

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