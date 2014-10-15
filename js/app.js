
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

    app.run(function($window, $rootScope, $location) {

    });

})(window, document);