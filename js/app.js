
/**
 * banki-angular-ui
 * @author Maxim Denisov
 */

(function(window, document, undefined) {

    'use strict';

    var app = angular.module('dashboard', [
        'banki.ui'
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

	// tabs
	app.controller('CollapseCtrl', function($scope, $templateCache) {

		$scope.panels = [
			{title:'Collapsible Group Item #1', body: 'Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch.'},
			{title:'Collapsible Group Item #2', body: 'Food truck fixie locavore, accusamus mcsweeney\'s marfa nulla single-origin coffee squid. Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table craft beer twee.'},
			{title:'Collapsible Group Item #3', body: 'Etsy mixtape wayfarers, ethical wes anderson tofu before they sold out mcsweeney\'s organic lomo retro fanny pack lo-fi farm-to-table readymade.'}
		];

		$scope.panels.activePanel = 1;

	});

    app.run(function($window, $rootScope, $location) {

    });

})(window, document);