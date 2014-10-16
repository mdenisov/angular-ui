
/**
 * banki-angular-ui
 * @author Maxim Denisov
 */

(function(window, document, undefined) {

    'use strict';

    var app = angular.module('dashboard', [
        'banki.ui',
		'ui.mask',
		'ngSanitize'
    ]);

    app.controller('MainCtrl', function ($scope, $rootScope, $location) {

        $scope.$location = $location;

    });

	// tabs
	app.controller('TabCtrl', function($scope, $templateCache) {

		$scope.tabs = [
			{title:'Home', content: 'Raw denim you probably haven\'t heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica.'},
			{title:'Profile', content: 'Food truck fixie locavore, accusamus mcsweeney\'s marfa nulla single-origin coffee squid. Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table craft beer twee.'},
			{title:'About', content: 'Etsy mixtape wayfarers, ethical wes anderson tofu before they sold out mcsweeney\'s organic lomo retro fanny pack lo-fi farm-to-table readymade.'}
		];

		$scope.tabs.activeTab = 1;

	});

	// collapse
	app.controller('CollapseCtrl', function($scope, $templateCache) {

		$scope.panels = [
			{title:'Collapsible Group Item #1', body: 'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch.'},
			{title:'Collapsible Group Item #2', body: 'Food truck fixie locavore, accusamus mcsweeney\'s marfa nulla single-origin coffee squid. Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table craft beer twee.'},
			{title:'Collapsible Group Item #3', body: 'Etsy mixtape wayfarers, ethical wes anderson tofu before they sold out mcsweeney\'s organic lomo retro fanny pack lo-fi farm-to-table readymade.'}
		];

		$scope.panels.activePanel = 1;

	});

	// buttons
	app.controller('ButtonCtrl', function($scope, $templateCache) {

		$scope.button = {
			toggle: false,
			checkbox: {left: false, middle: true, right: false},
			radio: 'left'
		};

	});

	// tooltips
	app.controller('TooltipCtrl', function($scope, $q, $sce, $templateCache) {

		$scope.tooltip = {title: 'Hello Tooltip! This is a multiline message!'};

	});

    // typeahead
    app.controller('TypeaheadCtrl', function($scope, $templateCache, $http) {

        $scope.selectedState = '';
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

        $scope.selectedIcon = '';
        $scope.icons = [
            {value: 'Gear', label: '<i class="fa fa-gear"></i> Gear'},
            {value: 'Globe', label: '<i class="fa fa-globe"></i> Globe'},
            {value: 'Heart', label: '<i class="fa fa-heart"></i> Heart'},
            {value: 'Camera', label: '<i class="fa fa-camera"></i> Camera'}
        ];

        $scope.selectedAddress = '';
        $scope.getAddress = function(viewValue) {
            var params = {address: viewValue, sensor: false};
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {params: params})
                .then(function(res) {
                    return res.data.results;
                });
        };

    });

    // popover
    app.controller('PopoverCtrl', function($scope, $templateCache) {

        $scope.popover = {title: 'Title', content: 'Hello Popover. This is a multiline message!'};

    });

    // modal
    app.controller('ModalCtrl', function($scope, $modal, $templateCache) {

        $scope.modal = {title: 'Title', content: 'Hello Modal<br />This is a multiline message!'};

    });

    // dropdown
    app.controller('DropdownCtrl', function($scope, $dropdown, $templateCache) {

        $scope.dropdown = [
            {text: '<i class="fa fa-download"></i>&nbsp;Another action', href: '#anotherAction'},
            {text: '<i class="fa fa-globe"></i>&nbsp;Display an alert', click: 'alert("Holy guacamole!")'},
            {text: '<i class="fa fa-external-link"></i>&nbsp;External link', href: '/auth/facebook', target: '_self'},
            {divider: true},
            {text: 'Separated link', href: '#separatedLink'}
        ];

    });

    // select
    app.controller('SelectCtrl', function($scope, $templateCache, $http) {

        $scope.selectedIcon = '';
        $scope.selectedIcons = ['Globe', 'Heart'];
        $scope.icons = [
            {value: 'Gear', label: '<i class="fa fa-gear"></i> Gear'},
            {value: 'Globe', label: '<i class="fa fa-globe"></i> Globe'},
            {value: 'Heart', label: '<i class="fa fa-heart"></i> Heart'},
            {value: 'Camera', label: '<i class="fa fa-camera"></i> Camera'}
        ];

        $scope.selectedMonth = 0;
        $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    });

    // datepicker
	app.config(function($datepickerProvider) {
		angular.extend($datepickerProvider.defaults, {
			dateFormat: 'dd/MM/yyyy',
			startWeek: 1
		});
	});

    app.controller('DatepickerCtrl', function($scope, $templateCache, $http) {

		$scope.selectedDate = new Date();
		$scope.selectedDateAsNumber = Date.UTC(1986, 1, 22);
		// $scope.fromDate = new Date();
		// $scope.untilDate = new Date();
		$scope.getType = function(key) {
			return Object.prototype.toString.call($scope[key]);
		};

		$scope.clearDates = function() {
			$scope.selectedDate = null;
		};

    });

	// datepicker
	app.controller('TimepickerCtrl', function($scope, $http) {

		$scope.time = new Date(1970, 0, 1, 10, 30);
		$scope.selectedTimeAsNumber = 10 * 36e5;
		$scope.selectedTimeAsString = '10:00';
		$scope.sharedDate = new Date(new Date().setMinutes(0));

	});

	// alert
	app.controller('AlertCtrl', function($scope, $templateCache, $timeout, $alert) {

		$scope.alert = {title: 'Holy guacamole!', content: 'Best check yo self, you\'re not looking too good.', type: 'info'};

		// Service usage
		var myAlert = $alert({title: 'Holy guacamole!', content: 'Best check yo self, you\'re not looking too good.', placement: 'top', type: 'info', keyboard: true, show: false});
		$scope.showAlert = function() {
			myAlert.show(); // or myAlert.$promise.then(myAlert.show) if you use an external html template
		};

	});

    app.run(function($window, $rootScope, $location) {

    });

})(window, document);