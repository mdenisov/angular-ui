
angular.module('users', [
        'services.crud',
        'dataResource',

        'services.i18nNotifications',
        'show-errors',
        'users-edit-validateEmails'
    ])

//    .config(['$routeProvider', function ($routeProvider) {
//        $routeProvider.when('/users', {
//            templateUrl:'js/app/users/users-list.tpl.html',
//            controller:'UsersViewCtrl',
//            resolve:{
//                users:['Users', function (Users) {
//                    return Users.all();
//                }]
//            }
//        });
//    }])
//
//    .controller('UsersViewCtrl', ['$scope', '$location', 'users',
//        function ($scope, $location, users) {
//            $scope.users = users;
//        }
//    ])
//
//    .factory('Users', ['dataResource',
//        function ($dataResource) {
//
//            var Users = $dataResource('users');
//
//            Users.forUser = function(userId, successcb, errorcb) {
//                //TODO: get projects for this user only (!)
//                return Projects.query({}, successcb, errorcb);
//            };
//
//            Users.prototype.isProductOwner = function (userId) {
//                return this.productOwner === userId;
//            };
//            Users.prototype.canActAsProductOwner = function (userId) {
//                return !this.isScrumMaster(userId) && !this.isDevTeamMember(userId);
//            };
//            Users.prototype.isScrumMaster = function (userId) {
//                return this.scrumMaster === userId;
//            };
//            Users.prototype.canActAsScrumMaster = function (userId) {
//                return !this.isProductOwner(userId);
//            };
//            Users.prototype.isDevTeamMember = function (userId) {
//                return this.teamMembers.indexOf(userId) >= 0;
//            };
//            Users.prototype.canActAsDevTeamMember = function (userId) {
//                return !this.isProductOwner(userId);
//            };
//
//            Users.prototype.getRoles = function (userId) {
//                var roles = [];
//                if (this.isProductOwner(userId)) {
//                    roles.push('PO');
//                } else {
//                    if (this.isScrumMaster(userId)){
//                        roles.push('SM');
//                    }
//                    if (this.isDevTeamMember(userId)){
//                        roles.push('DEV');
//                    }
//                }
//                return roles;
//            };
//
//            return Users;
//        }
//    ]);



    .config(['crudRouteProvider', function (crudRouteProvider) {

        crudRouteProvider.routesFor('Users', '', '', 'js/app')
            .whenList({
                users: ['Users', function(Users) { return Users.all(); }]
            })
            .when('/users/page/:page', {
                templateUrl:'js/app/users/users-list.tpl.html',
                controller:'UsersListCtrl',
                resolve:{
                    users: ['$route', 'Users', function($route, Users) {
                        console.log($route.current.params.page);
                        return Users.query({page: 1});
                    }]
                }
            })
//            .whenList({
////                users: ['Users', function(Users) { return Users.all(); }]
//                users: ['$route', 'Users', function($route, Users) {
//                    console.log($route.current.params.page);
//                    return Users.query({page: 1});
//                }]
//            })
            .whenNew({
                user: ['Users', function(Users) { return new Users(); }]
            })
            .whenEdit({
                user:['$route', 'Users', function ($route, Users) {
                    return Users.getById($route.current.params.itemId);
                }]
            });
    }])

    .filter('startsWithLetter', function () {
        return function (items, name, email) {
            var filtered = [];
            var nameMatch = new RegExp(name, 'i');
            var emailMatch = new RegExp(email, 'i');
            for (var i = 0; i < items.length; i++) {
                var item = items[i];

                console.log(nameMatch.test(item.name));

                if (nameMatch.test(item.name) || emailMatch.test(item.email) ) {
                    filtered.push(item);
                }
            }
            return filtered;
        };
    })

    .factory('Users', ['dataResource', function (dataResource) {

        var userResource = dataResource('users');

        userResource.prototype.getFullName = function () {
            return this.lastName + " " + this.firstName + " (" + this.email + ")";
        };

        return userResource;
    }])

    .controller('UsersListCtrl', ['$scope', 'crudListMethods', 'users', 'i18nNotifications',
        function ($scope, crudListMethods, users, i18nNotifications) {
            $scope.users = users;

//            console.log(users.query({page: 1}));
            console.log(users);

            angular.extend($scope, crudListMethods('/users'));

            $scope.remove = function(user, $index, $event) {
                // Don't let the click bubble up to the ng-click on the enclosing div, which will try to trigger
                // an edit of this item.
                $event.stopPropagation();

                // Remove this user
                user.$remove(function() {
                    // It is gone from the DB so we can remove it from the local list too
                    $scope.users.splice($index,1);
                    i18nNotifications.pushForCurrentRoute('crud.user.remove.success', 'success', {id : user.$id()});
                }, function() {
                    i18nNotifications.pushForCurrentRoute('crud.user.remove.error', 'error', {id : user.$id()});
                });
            };
        }
    ])

    .controller('UsersEditCtrl', ['$scope', '$location', 'user', 'i18nNotifications',
        function ($scope, $location, user, i18nNotifications) {

            $scope.user = user;
//            $scope.password = user.password;

            $scope.onSave = function (user) {
                i18nNotifications.pushForNextRoute('crud.user.save.success', 'success', {id : user.$id()});
                $location.path('/users');
            };

            $scope.onError = function() {
                i18nNotifications.pushForCurrentRoute('crud.user.save.error', 'error');
            };

            $scope.onRemove = function(user) {
                i18nNotifications.pushForNextRoute('crud.user.remove.success', 'success', {id : user.$id()});
                $location.path('/users');
            };

        }
    ]);