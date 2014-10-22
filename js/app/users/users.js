angular.module('users', [], ['$routeProvider',
        function($routeProvider){

            $routeProvider
                .when('/', {
                    templateUrl: 'js/app/users/users.tpl.html',
                    controller: 'UsersCtrl',
    //                resolve: {
    //                    projects:['Projects', function(Projects){
    ////                        return Projects.all();
    //                    }]
    //                }
                })
                .when('/users/new', {
                    controller : 'NewUserCtrl',
                    templateUrl : 'js/app/users/usernew.tpl.html'
                })
                .when('/users/edit/:userId', {
                    controller : 'EditUserCtrl',
                    templateUrl : 'js/app/users/useredit.tpl.html'
                })
                .when('/users', {
                    templateUrl: 'js/app/users/users.tpl.html',
                    controller: 'UsersCtrl'
                })
                .when('/users/:userId', {
                    templateUrl: 'js/app/users/user.tpl.html',
                    controller : 'UsersByIdCtrl'
                })

        }
    ])

    .controller("UsersCtrl", [ '$scope', 'userservice',
        function($scope, userservice) {
            userservice.getUsers( $scope );
        }
    ])

    .controller("UsersByIdCtrl", [ '$scope','userservice', '$routeParams',
        function($scope, userservice, $routeParams) {
            userservice.getUser($routeParams.userId, $scope);
        }
    ])

    .controller("NewUserCtrl", [ '$scope','userservice',
        function($scope, userservice) {
//            userservice.getUsers( $scope );

            $scope.createNewUser = function(){
                var newuser = { 'name':$scope.name, 'email':$scope.email, 'role':$scope.role };
                // Call UserService to create a new user
                //
                userservice.createUser ( newuser, $scope );

                // Push new user to existing table column
                //
//                $scope.users.push( newuser );
                // Reset fields values
                //
                $scope.name='';
                $scope.email='';
                $scope.role='';
            };
        }
    ])

    .controller("EditUserCtrl", [ '$scope','userservice', '$routeParams', '$location',
        function($scope, userservice, $routeParams, $location) {
            userservice.getUser($routeParams.userId, $scope);

            $scope.createNewUser = function(){
                var newuser = { 'id':$scope.user.id, 'name':$scope.user.name, 'email':$scope.user.email, 'role':$scope.user.role };
                // Call UserService to create a new user
                //
                userservice.updateUser ( newuser, $scope );

                // Push new user to existing table column
                //
//                $scope.users.push( newuser );
                // Reset fields values
            };

            $scope.deleteUser = function(){
                var newuser = { 'id':$scope.user.id };
                // Call UserService to create a new user
                //
                userservice.deleteUser ( newuser, $scope );

                // Push new user to existing table column
                //
//                $scope.users.push( newuser );
                // Reset fields values

                $location.path('/users');
            };
        }
    ])

    .factory( 'userservice', [ '$resource',
        function( $resource ){
            return new User( $resource );
        }
    ]);

function User( resource ) {

    this.resource = resource;

    this.createUser = function ( user, scope ) {
        //
        // Save Action Method
        //
        var User = resource('/api/index.php/users/');
        User.save(user, function(response){
            scope.message = response.message;
        });
    };

    this.updateUser = function ( user, scope ) {
        //
        // Update Action Method
        //
        var User = resource('/api/index.php/users/:userId', null, {
            update: {method: 'PUT'}
        });

        User.update({ userId:user.id }, user);
    };

    this.getUser = function ( id, scope ) {
        //
        // GET Action Method
        //
        var User = resource('/api/index.php/users/:userId', {userId:'@userId'});
        User.get( {userId:id}, function(user){
            scope.user = user;
        })
    };

    this.getUsers = function( scope ) {
        //
        // Query Action Method
        //
        var Users = resource('api/index.php/users/');
        Users.query(function(users){
            scope.users = users;
        });
    };

    this.deleteUser = function ( user, scope ) {
        //
        // Delete Action Method
        //
        var User = resource('/api/index.php/users/:userId', null, {
            delete: {method: 'DELETE'}
        });

        User.delete({ userId:user.id });
    };
}