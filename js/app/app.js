
angular.module('app', [
        'ngRoute',
        'ngResource',
        'ngSanitize',

        'ui.bootstrap',

        'services.i18nNotifications',
        'services.breadcrumbs',
        'directives.crud',

        'users',
        'mfo'
    ])

    .constant('I18N.MESSAGES', {
        'errors.route.changeError':'Route change error',
        'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
        'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
        'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
        'crud.user.save.error':"Something went wrong when saving a user...",
        'crud.project.save.success':"A project with id '{{id}}' was saved successfully.",
        'crud.project.remove.success':"A project with id '{{id}}' was removed successfully.",
        'crud.project.save.error':"Something went wrong when saving a project...",
        'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
        'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
        'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
        'login.error.serverError': "There was a problem with authenticating: {{exception}}."
    })

    .constant('CONFIG', {
        baseUrl: '/api/index.php'
    })

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({redirectTo:'/'});
    }])

    .controller('AppCtrl', ['$scope', 'i18nNotifications',
        function($scope, i18nNotifications) {

            $scope.notifications = i18nNotifications;

            $scope.removeNotification = function (notification) {
                i18nNotifications.remove(notification);
            };

            $scope.$on('$routeChangeError', function(event, current, previous, rejection){
                i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
            });

        }
    ])

    .controller('HeaderCtrl', ['$scope', '$location', '$route', 'breadcrumbs',
        function ($scope, $location, $route, breadcrumbs) {

            $scope.location = $location;
            $scope.breadcrumbs = breadcrumbs;

            $scope.home = function () {
                $location.path('/');
            };

            $scope.isNavbarActive = function (navBarPath) {
                return navBarPath === breadcrumbs.getFirst().name;
            };

            $scope.hasPendingRequests = function () {
//                return httpRequestTracker.hasPendingRequests();
            };
        }
    ]);