
/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Alert module
 */
'use strict';

angular.module('banki.ui.alert', ['banki.ui.modal'])

	.provider('$alert', function() {

		var defaults = this.defaults = {
			animation: 'am-fade',
			prefixClass: 'alert',
			prefixEvent: 'alert',
			placement: null,
			template: 'alert/alert.tpl.html',
			container: false,
			element: null,
			backdrop: false,
			keyboard: true,
			show: true,
			// Specific options
			duration: false,
			type: false,
			dismissable: true
		};

		this.$get = function($modal, $timeout) {

			function AlertFactory(config) {

				var $alert = {};

				// Common vars
				var options = angular.extend({}, defaults, config);

				$alert = $modal(options);

				// Support scope as string options [/*title, content, */ type, dismissable]
				$alert.$scope.dismissable = !! options.dismissable;
				if (options.type) {
					$alert.$scope.type = options.type;
				}

				// Support auto-close duration
				var show = $alert.show;
				if (options.duration) {
					$alert.show = function() {
						show();
						$timeout(function() {
							$alert.hide();
						}, options.duration * 1000);
					};
				}

				return $alert;

			}

			return AlertFactory;

		};

	})

	.directive('uiAlert', function($window, $sce, $alert) {

		var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;

		return {
			restrict: 'EAC',
			scope: true,
			link: function postLink(scope, element, attr, transclusion) {

				// Directive options
				var options = {
					scope: scope,
					element: element,
					show: false
				};
				angular.forEach(['template', 'placement', 'keyboard', 'html', 'container', 'animation', 'duration', 'dismissable'], function(key) {
					if (angular.isDefined(attr[key])) options[key] = attr[key];
				});

				// Support scope as data-attrs
				angular.forEach(['title', 'content', 'type'], function(key) {
					attr[key] && attr.$observe(key, function(newValue, oldValue) {
						scope[key] = $sce.trustAsHtml(newValue);
					});
				});

				// Support scope as an object
				attr.uiAlert && scope.$watch(attr.uiAlert, function(newValue, oldValue) {
					if (angular.isObject(newValue)) {
						angular.extend(scope, newValue);
					} else {
						scope.content = newValue;
					}
				}, true);

				// Initialize alert
				var alert = $alert(options);

				// Trigger
				element.on(attr.trigger || 'click', alert.toggle);

				// Garbage collection
				scope.$on('$destroy', function() {
					if (alert) alert.destroy();
					options = null;
					alert = null;
				});

			}
		};

	})

	.run(['$templateCache', function($templateCache) {

		$templateCache.put('alert/alert.tpl.html', '<div class="alert" ng-class="[type ? \'alert-\' + type : null]"><button type="button" class="close" ng-if="dismissable" ng-click="$hide()">&times;</button><strong ng-bind="title"></strong>&nbsp;<span ng-bind-html="content"></span></div>');

	}]);