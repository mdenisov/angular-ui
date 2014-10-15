
/**
 * banki-angular-ui
 * @author Maxim Denisov
 */
'use strict';

angular.module('banki.ui.collapse', [])

	.provider('$collapse', function() {

		var defaults = this.defaults = {
			animation: 'am-collapse',
			disallowToggle: false,
			activeClass: 'in',
			startCollapsed: false
		};

		var controller = this.controller = function($scope, $element, $attrs) {
			var self = this;

			// Attributes options
			self.$options = angular.copy(defaults);
			angular.forEach(['animation', 'disallowToggle', 'activeClass', 'startCollapsed'], function(key) {
				if (angular.isDefined($attrs[key])) self.$options[key] = $attrs[key];
			});

			self.$toggles = [];
			self.$targets = [];

			self.$viewChangeListeners = [];

			self.$registerToggle = function(element) {
				self.$toggles.push(element);
			};
			self.$registerTarget = function(element) {
				self.$targets.push(element);
			};

			self.$targets.$active = !self.$options.startCollapsed ? 0 : -1;
			self.$setActive = $scope.$setActive = function(value) {
				if (!self.$options.disallowToggle) {
					self.$targets.$active = self.$targets.$active === value ? -1 : value;
				} else {
					self.$targets.$active = value;
				}
				self.$viewChangeListeners.forEach(function(fn) {
					fn();
				});
			};

		};

		this.$get = function() {
			var $collapse = {};
			$collapse.defaults = defaults;
			$collapse.controller = controller;
			return $collapse;
		};

	})

	.directive('uiCollapse', ["$window", "$animate", "$collapse",
		function($window, $animate, $collapse) {

			var defaults = $collapse.defaults;

			return {
				require: ['?ngModel', 'uiCollapse'],
				controller: ['$scope', '$element', '$attrs', $collapse.controller],
				link: function postLink(scope, element, attrs, controllers) {

					var ngModelCtrl = controllers[0];
					var uiCollapseCtrl = controllers[1];

					if (ngModelCtrl) {

						// Update the modelValue following
						uiCollapseCtrl.$viewChangeListeners.push(function() {
							ngModelCtrl.$setViewValue(uiCollapseCtrl.$targets.$active);
						});

						// modelValue -> $formatters -> viewValue
						ngModelCtrl.$formatters.push(function(modelValue) {
							// console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
							if (uiCollapseCtrl.$targets.$active !== modelValue * 1) {
								uiCollapseCtrl.$setActive(modelValue * 1);
							}
							return modelValue;
						});

					}

				}
			};

		}
	])

	.directive('uiCollapseToggle', function() {

		return {
			require: ['^?ngModel', '^uiCollapse'],
			link: function postLink(scope, element, attrs, controllers) {

				var ngModelCtrl = controllers[0];
				var uiCollapseCtrl = controllers[1];

				// Add base attr
				element.attr('data-toggle', 'collapse');

				// Push pane to parent bsCollapse controller
				uiCollapseCtrl.$registerToggle(element);
				element.on('click', function() {
					var index = attrs.bsCollapseToggle || uiCollapseCtrl.$toggles.indexOf(element);
					uiCollapseCtrl.$setActive(index * 1);
					scope.$apply();
				});

			}
		};

	})

	.directive('uiCollapseTarget', ["$animate",
		function($animate) {

			return {
				require: ['^?ngModel', '^uiCollapse'],
				// scope: true,
				link: function postLink(scope, element, attrs, controllers) {

					var ngModelCtrl = controllers[0];
					var uiCollapseCtrl = controllers[1];

					// Add base class
					element.addClass('collapse');

					// Add animation class
					if (uiCollapseCtrl.$options.animation) {
						element.addClass(uiCollapseCtrl.$options.animation);
					}

					// Push pane to parent bsCollapse controller
					uiCollapseCtrl.$registerTarget(element);

					function render() {
						var index = uiCollapseCtrl.$targets.indexOf(element);
						var active = uiCollapseCtrl.$targets.$active;
						$animate[index === active ? 'addClass' : 'removeClass'](element, uiCollapseCtrl.$options.activeClass);
					}

					uiCollapseCtrl.$viewChangeListeners.push(function() {
						render();
					});
					render();

				}
			};

		}
	])

	.run(['$templateCache', function($templateCache) {

		$templateCache.put('tab/tab.tpl.html', '<ul class="nav" ng-class="$navClass" role="tablist"><li ng-repeat="$pane in $panes" ng-class="$index == $panes.$active ? $activeClass : \'\'"><a role="tab" data-toggle="tab" ng-click="$setActive($index)" data-index="{{ $index }}" ng-bind-html="$pane.title"></a></li></ul><div ng-transclude class="tab-content"></div>');

	}]);