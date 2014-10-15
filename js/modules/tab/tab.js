
/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Tabs module
 */

'use strict';

angular.module('banki.ui.tab', [])

    .provider('$tab', function() {

        var defaults = this.defaults = {
            animation: 'am-fade',
            template: 'tab/tab.tpl.html',
            navClass: 'nav-tabs',
            activeClass: 'active'
        };

        var controller = this.controller = function($scope, $element, $attrs) {
            var self = this;

            // Attributes options
            self.$options = angular.copy(defaults);
            angular.forEach(['animation', 'navClass', 'activeClass'], function(key) {
                if(angular.isDefined($attrs[key])) self.$options[key] = $attrs[key];
            });

            // Publish options on scope
            $scope.$navClass = self.$options.navClass;
            $scope.$activeClass = self.$options.activeClass;

            self.$panes = $scope.$panes = [];

            self.$viewChangeListeners = [];

            self.$push = function(pane) {
                self.$panes.push(pane);
            };

            self.$panes.$active = 0;
            self.$setActive = $scope.$setActive = function(value) {
                self.$panes.$active = value;
                self.$viewChangeListeners.forEach(function(fn) {
                    fn();
                });
            };

        };

        this.$get = function() {
            var $tab = {};
            $tab.defaults = defaults;
            $tab.controller = controller;
            return $tab;
        };

    })

    .directive('uiTabs', ["$window", "$animate", "$tab", function($window, $animate, $tab) {

        var defaults = $tab.defaults;

        return {
            require: ['?ngModel', 'uiTabs'],
            transclude: true,
            scope: true,
            controller: ['$scope', '$element', '$attrs', $tab.controller],
            templateUrl: function(element, attr) {
                return attr.template || defaults.template;
            },
            link: function postLink(scope, element, attrs, controllers) {

                var ngModelCtrl = controllers[0];
                var uiTabsCtrl = controllers[1];

                if(ngModelCtrl) {

                    // Update the modelValue following
					uiTabsCtrl.$viewChangeListeners.push(function() {
                        ngModelCtrl.$setViewValue(uiTabsCtrl.$panes.$active);
                    });

                    // modelValue -> $formatters -> viewValue
                    ngModelCtrl.$formatters.push(function(modelValue) {
                        // console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
						uiTabsCtrl.$setActive(modelValue * 1);
                        return modelValue;
                    });

                }

            }
        };

    }])

    .directive('uiPane', ["$window", "$animate", "$sce", function($window, $animate, $sce) {

        return {
            require: ['^?ngModel', '^uiTabs'],
            scope: true,
            link: function postLink(scope, element, attrs, controllers) {

                var ngModelCtrl = controllers[0];
                var uiTabsCtrl = controllers[1];

                // Add base class
                element.addClass('tab-pane');

                // Observe title attribute for change
                attrs.$observe('title', function(newValue, oldValue) {
                    scope.title = $sce.trustAsHtml(newValue);
                });

                // Add animation class
                if(uiTabsCtrl.$options.animation) {
                    element.addClass(uiTabsCtrl.$options.animation);
                }

                // Push pane to parent bsTabs controller
				uiTabsCtrl.$push(scope);

                function render() {
                    var index = uiTabsCtrl.$panes.indexOf(scope);
                    var active = uiTabsCtrl.$panes.$active;
                    $animate[index === active ? 'addClass' : 'removeClass'](element, uiTabsCtrl.$options.activeClass);
                }

				uiTabsCtrl.$viewChangeListeners.push(function() {
                    render();
                });
                render();

            }
        };

    }])

	.run(['$templateCache', function($templateCache) {

		$templateCache.put('tab/tab.tpl.html', '<ul class="nav" ng-class="$navClass" role="tablist"><li ng-repeat="$pane in $panes" ng-class="$index == $panes.$active ? $activeClass : \'\'"><a role="tab" data-toggle="tab" ng-click="$setActive($index)" data-index="{{ $index }}" ng-bind-html="$pane.title"></a></li></ul><div ng-transclude class="tab-content"></div>');

	}]);