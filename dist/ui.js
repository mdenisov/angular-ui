
/**
 * banki-angular-ui
 * @author Maxim Denisov
 */

'use strict';

angular.module('banki.ui', [
    'banki.ui.tab',
	'banki.ui.collapse',
	'banki.ui.button',
	'banki.ui.tooltip',
    'banki.ui.typeahead',
    'banki.ui.popover',
    'banki.ui.modal',
    'banki.ui.dropdown',
    'banki.ui.select',
	'banki.ui.datepicker',
	'banki.ui.timepicker',
	'banki.ui.alert'
]);



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



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Tabs module
 */
'use strict';

angular.module('banki.ui.button', [])

	.provider('$button', function() {

		var defaults = this.defaults = {
			activeClass: 'active',
			toggleEvent: 'click'
		};

		this.$get = function() {
			return {
				defaults: defaults
			};
		};

	})

	.directive('uiCheckboxGroup', function() {

		return {
			restrict: 'A',
			require: 'ngModel',
			compile: function postLink(element, attr) {
				element.attr('data-toggle', 'buttons');
				element.removeAttr('ng-model');
				var children = element[0].querySelectorAll('input[type="checkbox"]');
				angular.forEach(children, function(child) {
					var childEl = angular.element(child);
					childEl.attr('ui-checkbox', '');
					childEl.attr('ng-model', attr.ngModel + '.' + childEl.attr('value'));
				});
			}

		};

	})

	.directive('uiCheckbox', function($button, $$rAF) {

		var defaults = $button.defaults;
		var constantValueRegExp = /^(true|false|\d+)$/;

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function postLink(scope, element, attr, controller) {

				var options = defaults;

				// Support label > input[type="checkbox"]
				var isInput = element[0].nodeName === 'INPUT';
				var activeElement = isInput ? element.parent() : element;

				var trueValue = angular.isDefined(attr.trueValue) ? attr.trueValue : true;
				if (constantValueRegExp.test(attr.trueValue)) {
					trueValue = scope.$eval(attr.trueValue);
				}
				var falseValue = angular.isDefined(attr.falseValue) ? attr.falseValue : false;
				if (constantValueRegExp.test(attr.falseValue)) {
					falseValue = scope.$eval(attr.falseValue);
				}

				// Parse exotic values
				var hasExoticValues = typeof trueValue !== 'boolean' || typeof falseValue !== 'boolean';
				if (hasExoticValues) {
					controller.$parsers.push(function(viewValue) {
						// console.warn('$parser', element.attr('ng-model'), 'viewValue', viewValue);
						return viewValue ? trueValue : falseValue;
					});
					// Fix rendering for exotic values
					scope.$watch(attr.ngModel, function(newValue, oldValue) {
						controller.$render();
					});
				}

				// model -> view
				controller.$render = function() {
					// console.warn('$render', element.attr('ng-model'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
					var isActive = angular.equals(controller.$modelValue, trueValue);
					$$rAF(function() {
						if (isInput) element[0].checked = isActive;
						activeElement.toggleClass(options.activeClass, isActive);
					});
				};

				// view -> model
				element.bind(options.toggleEvent, function() {
					scope.$apply(function() {
						// console.warn('!click', element.attr('ng-model'), 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue, 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue);
						if (!isInput) {
							controller.$setViewValue(!activeElement.hasClass('active'));
						}
						if (!hasExoticValues) {
							controller.$render();
						}
					});
				});

			}

		};

	})

	.directive('uiRadioGroup', function() {

		return {
			restrict: 'A',
			require: 'ngModel',
			compile: function postLink(element, attr) {
				element.attr('data-toggle', 'buttons');
				element.removeAttr('ng-model');
				var children = element[0].querySelectorAll('input[type="radio"]');
				angular.forEach(children, function(child) {
					angular.element(child).attr('ui-radio', '');
					angular.element(child).attr('ng-model', attr.ngModel);
				});
			}

		};

	})

	.directive('uiRadio', function($button, $$rAF) {

		var defaults = $button.defaults;
		var constantValueRegExp = /^(true|false|\d+)$/;

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function postLink(scope, element, attr, controller) {

				var options = defaults;

				// Support `label > input[type="radio"]` markup
				var isInput = element[0].nodeName === 'INPUT';
				var activeElement = isInput ? element.parent() : element;

				var value = constantValueRegExp.test(attr.value) ? scope.$eval(attr.value) : attr.value;

				// model -> view
				controller.$render = function() {
					// console.warn('$render', element.attr('value'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
					var isActive = angular.equals(controller.$modelValue, value);
					$$rAF(function() {
						if (isInput) element[0].checked = isActive;
						activeElement.toggleClass(options.activeClass, isActive);
					});
				};

				// view -> model
				element.bind(options.toggleEvent, function() {
					scope.$apply(function() {
						// console.warn('!click', element.attr('value'), 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue, 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue);
						controller.$setViewValue(value);
						controller.$render();
					});
				});

			}

		};

	});



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Collapse module
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



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Datepicker module
 */
'use strict';

angular.module('banki.ui.datepicker', ['banki.helpers.dateParser', 'banki.ui.tooltip'])

	.provider('$datepicker', function() {

		var defaults = this.defaults = {
			animation: 'am-fade',
			prefixClass: 'datepicker',
			placement: 'bottom-left',
			template: 'datepicker/datepicker.tpl.html',
			trigger: 'focus',
			container: false,
			keyboard: true,
			html: false,
			delay: 0,
			// lang: $locale.id,
			useNative: false,
			dateType: 'date',
			dateFormat: 'shortDate',
			modelDateFormat: null,
			dayFormat: 'dd',
			strictFormat: false,
			autoclose: false,
			minDate: -Infinity,
			maxDate: +Infinity,
			startView: 0,
			minView: 0,
			startWeek: 0,
			daysOfWeekDisabled: '',
			iconLeft: 'glyphicon glyphicon-chevron-left',
			iconRight: 'glyphicon glyphicon-chevron-right'
		};

		this.$get = function($window, $document, $rootScope, $sce, $locale, dateFilter, datepickerViews, $tooltip) {

			var bodyEl = angular.element($window.document.body);
			var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
			var isTouch = ('createTouch' in $window.document) && isNative;
			if (!defaults.lang) defaults.lang = $locale.id;

			function DatepickerFactory(element, controller, config) {

				var $datepicker = $tooltip(element, angular.extend({}, defaults, config));
				var parentScope = config.scope;
				var options = $datepicker.$options;
				var scope = $datepicker.$scope;
				if (options.startView) options.startView -= options.minView;

				// View vars

				var pickerViews = datepickerViews($datepicker);
				$datepicker.$views = pickerViews.views;
				var viewDate = pickerViews.viewDate;
				scope.$mode = options.startView;
				scope.$iconLeft = options.iconLeft;
				scope.$iconRight = options.iconRight;
				var $picker = $datepicker.$views[scope.$mode];

				// Scope methods

				scope.$select = function(date) {
					$datepicker.select(date);
				};
				scope.$selectPane = function(value) {
					$datepicker.$selectPane(value);
				};
				scope.$toggleMode = function() {
					$datepicker.setMode((scope.$mode + 1) % $datepicker.$views.length);
				};

				// Public methods

				$datepicker.update = function(date) {
					// console.warn('$datepicker.update() newValue=%o', date);
					if (angular.isDate(date) && !isNaN(date.getTime())) {
						$datepicker.$date = date;
						$picker.update.call($picker, date);
					}
					// Build only if pristine
					$datepicker.$build(true);
				};

				$datepicker.updateDisabledDates = function(dateRanges) {
					options.disabledDateRanges = dateRanges;
					for (var i = 0, l = scope.rows.length; i < l; i++) {
						angular.forEach(scope.rows[i], $datepicker.$setDisabledEl);
					}
				};

				$datepicker.select = function(date, keep) {
					// console.warn('$datepicker.select', date, scope.$mode);
					if (!angular.isDate(controller.$dateValue)) controller.$dateValue = new Date(date);
					if (!scope.$mode || keep) {
						controller.$setViewValue(angular.copy(date));
						controller.$render();
						if (options.autoclose && !keep) {
							$datepicker.hide(true);
						}
					} else {
						angular.extend(viewDate, {
							year: date.getFullYear(),
							month: date.getMonth(),
							date: date.getDate()
						});
						$datepicker.setMode(scope.$mode - 1);
						$datepicker.$build();
					}
				};

				$datepicker.setMode = function(mode) {
					// console.warn('$datepicker.setMode', mode);
					scope.$mode = mode;
					$picker = $datepicker.$views[scope.$mode];
					$datepicker.$build();
				};

				// Protected methods

				$datepicker.$build = function(pristine) {
					// console.warn('$datepicker.$build() viewDate=%o', viewDate);
					if (pristine === true && $picker.built) return;
					if (pristine === false && !$picker.built) return;
					$picker.build.call($picker);
				};

				$datepicker.$updateSelected = function() {
					for (var i = 0, l = scope.rows.length; i < l; i++) {
						angular.forEach(scope.rows[i], updateSelected);
					}
				};

				$datepicker.$isSelected = function(date) {
					return $picker.isSelected(date);
				};

				$datepicker.$setDisabledEl = function(el) {
					el.disabled = $picker.isDisabled(el.date);
				};

				$datepicker.$selectPane = function(value) {
					var steps = $picker.steps;
					var targetDate = new Date(Date.UTC(viewDate.year + ((steps.year || 0) * value), viewDate.month + ((steps.month || 0) * value), viewDate.date + ((steps.day || 0) * value)));
					angular.extend(viewDate, {
						year: targetDate.getUTCFullYear(),
						month: targetDate.getUTCMonth(),
						date: targetDate.getUTCDate()
					});
					$datepicker.$build();
				};

				$datepicker.$onMouseDown = function(evt) {
					// Prevent blur on mousedown on .dropdown-menu
					evt.preventDefault();
					evt.stopPropagation();
					// Emulate click for mobile devices
					if (isTouch) {
						var targetEl = angular.element(evt.target);
						if (targetEl[0].nodeName.toLowerCase() !== 'button') {
							targetEl = targetEl.parent();
						}
						targetEl.triggerHandler('click');
					}
				};

				$datepicker.$onKeyDown = function(evt) {
					if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey) return;
					evt.preventDefault();
					evt.stopPropagation();

					if (evt.keyCode === 13) {
						if (!scope.$mode) {
							return $datepicker.hide(true);
						} else {
							return scope.$apply(function() {
								$datepicker.setMode(scope.$mode - 1);
							});
						}
					}

					// Navigate with keyboard
					$picker.onKeyDown(evt);
					parentScope.$digest();
				};

				// Private

				function updateSelected(el) {
					el.selected = $datepicker.$isSelected(el.date);
				}

				function focusElement() {
					element[0].focus();
				}

				// Overrides

				var _init = $datepicker.init;
				$datepicker.init = function() {
					if (isNative && options.useNative) {
						element.prop('type', 'date');
						element.css('-webkit-appearance', 'textfield');
						return;
					} else if (isTouch) {
						element.prop('type', 'text');
						element.attr('readonly', 'true');
						element.on('click', focusElement);
					}
					_init();
				};

				var _destroy = $datepicker.destroy;
				$datepicker.destroy = function() {
					if (isNative && options.useNative) {
						element.off('click', focusElement);
					}
					_destroy();
				};

				var _show = $datepicker.show;
				$datepicker.show = function() {
					_show();
					setTimeout(function() {
						$datepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
						if (options.keyboard) {
							element.on('keydown', $datepicker.$onKeyDown);
						}
					});
				};

				var _hide = $datepicker.hide;
				$datepicker.hide = function(blur) {
					if (!$datepicker.$isShown) return;
					$datepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $datepicker.$onMouseDown);
					if (options.keyboard) {
						element.off('keydown', $datepicker.$onKeyDown);
					}
					_hide(blur);
				};

				return $datepicker;

			}

			DatepickerFactory.defaults = defaults;
			return DatepickerFactory;

		};

	})

	.directive('uiDatepicker', function($window, $parse, $q, $locale, dateFilter, $datepicker, $dateParser, $timeout) {

		var defaults = $datepicker.defaults;
		var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);

		return {
			restrict: 'EAC',
			require: 'ngModel',
			link: function postLink(scope, element, attr, controller) {

				// Directive options
				var options = {
					scope: scope,
					controller: controller
				};
				angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'autoclose', 'dateType', 'dateFormat', 'modelDateFormat', 'dayFormat', 'strictFormat', 'startWeek', 'startDate', 'useNative', 'lang', 'startView', 'minView', 'iconLeft', 'iconRight', 'daysOfWeekDisabled'], function(key) {
					if (angular.isDefined(attr[key])) options[key] = attr[key];
				});

				// Visibility binding support
				attr.bsShow && scope.$watch(attr.bsShow, function(newValue, oldValue) {
					if (!datepicker || !angular.isDefined(newValue)) return;
					if (angular.isString(newValue)) newValue = !! newValue.match(/true|,?(datepicker),?/i);
					newValue === true ? datepicker.show() : datepicker.hide();
				});

				// Initialize datepicker
				var datepicker = $datepicker(element, controller, options);
				options = datepicker.$options;
				// Set expected iOS format
				if (isNative && options.useNative) options.dateFormat = 'yyyy-MM-dd';

				// Initialize parser
				var dateParser = $dateParser({
					format: options.dateFormat,
					lang: options.lang,
					strict: options.strictFormat
				});

				// Observe attributes for changes
				angular.forEach(['minDate', 'maxDate'], function(key) {
					// console.warn('attr.$observe(%s)', key, attr[key]);
					angular.isDefined(attr[key]) && attr.$observe(key, function(newValue) {
						// console.warn('attr.$observe(%s)=%o', key, newValue);
						datepicker.$options[key] = dateParser.getDateForAttribute(key, newValue);
						// Build only if dirty
						!isNaN(datepicker.$options[key]) && datepicker.$build(false);
					});
				});

				// Watch model for changes
				scope.$watch(attr.ngModel, function(newValue, oldValue) {
					datepicker.update(controller.$dateValue);
				}, true);

				// Normalize undefined/null/empty array,
				// so that we don't treat changing from undefined->null as a change.

				function normalizeDateRanges(ranges) {
					if (!ranges || !ranges.length) return null;
					return ranges;
				}

				if (angular.isDefined(attr.disabledDates)) {
					scope.$watch(attr.disabledDates, function(disabledRanges, previousValue) {
						disabledRanges = normalizeDateRanges(disabledRanges);
						previousValue = normalizeDateRanges(previousValue);

						if (disabledRanges !== previousValue) {
							datepicker.updateDisabledDates(disabledRanges);
						}
					});
				}

				// viewValue -> $parsers -> modelValue
				controller.$parsers.unshift(function(viewValue) {
					// console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
					// Null values should correctly reset the model value & validity
					if (!viewValue) {
						controller.$setValidity('date', true);
						return;
					}
					var parsedDate = dateParser.parse(viewValue, controller.$dateValue);
					if (!parsedDate || isNaN(parsedDate.getTime())) {
						controller.$setValidity('date', false);
						return;
					} else {
						var isMinValid = isNaN(datepicker.$options.minDate) || parsedDate.getTime() >= datepicker.$options.minDate;
						var isMaxValid = isNaN(datepicker.$options.maxDate) || parsedDate.getTime() <= datepicker.$options.maxDate;
						var isValid = isMinValid && isMaxValid;
						controller.$setValidity('date', isValid);
						controller.$setValidity('min', isMinValid);
						controller.$setValidity('max', isMaxValid);
						// Only update the model when we have a valid date
						if (isValid) controller.$dateValue = parsedDate;
					}
					if (options.dateType === 'string') {
						return dateFilter(parsedDate, options.modelDateFormat || options.dateFormat);
					} else if (options.dateType === 'number') {
						return controller.$dateValue.getTime();
					} else if (options.dateType === 'iso') {
						return controller.$dateValue.toISOString();
					} else {
						return new Date(controller.$dateValue);
					}
				});

				// modelValue -> $formatters -> viewValue
				controller.$formatters.push(function(modelValue) {
					// console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
					var date;
					if (angular.isUndefined(modelValue) || modelValue === null) {
						date = NaN;
					} else if (angular.isDate(modelValue)) {
						date = modelValue;
					} else if (options.dateType === 'string') {
						date = dateParser.parse(modelValue, null, options.modelDateFormat);
					} else {
						date = new Date(modelValue);
					}
					// Setup default value?
					// if(isNaN(date.getTime())) {
					//   var today = new Date();
					//   date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
					// }
					controller.$dateValue = date;
					return controller.$dateValue;
				});

				// viewValue -> element
				controller.$render = function() {
					// console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
					element.val(!controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : dateFilter(controller.$dateValue, options.dateFormat));
				};

				// Garbage collection
				scope.$on('$destroy', function() {
					if (datepicker) datepicker.destroy();
					options = null;
					datepicker = null;
				});

			}
		};

	})

	.provider('datepickerViews', function() {

		var defaults = this.defaults = {
			dayFormat: 'dd',
			daySplit: 7
		};

		// Split array into smaller arrays

		function split(arr, size) {
			var arrays = [];
			while (arr.length > 0) {
				arrays.push(arr.splice(0, size));
			}
			return arrays;
		}

		// Modulus operator

		function mod(n, m) {
			return ((n % m) + m) % m;
		}

		this.$get = function($locale, $sce, dateFilter, $dateParser) {

			return function(picker) {

				var scope = picker.$scope;
				var options = picker.$options;
				var dateParser = $dateParser();

				var weekDaysMin = $locale.DATETIME_FORMATS.SHORTDAY;
				var weekDaysLabels = weekDaysMin.slice(options.startWeek).concat(weekDaysMin.slice(0, options.startWeek));
				var weekDaysLabelsHtml = $sce.trustAsHtml('<th class="dow text-center">' + weekDaysLabels.join('</th><th class="dow text-center">') + '</th>');

				var startDate = picker.$date || (options.startDate ? dateParser.getDateForAttribute('startDate', options.startDate) : new Date());
				var viewDate = {
					year: startDate.getFullYear(),
					month: startDate.getMonth(),
					date: startDate.getDate()
				};
				var timezoneOffset = startDate.getTimezoneOffset() * 6e4;

				var views = [{
					format: options.dayFormat,
					split: 7,
					steps: {
						month: 1
					},
					update: function(date, force) {
						if (!this.built || force || date.getFullYear() !== viewDate.year || date.getMonth() !== viewDate.month) {
							angular.extend(viewDate, {
								year: picker.$date.getFullYear(),
								month: picker.$date.getMonth(),
								date: picker.$date.getDate()
							});
							picker.$build();
						} else if (date.getDate() !== viewDate.date) {
							viewDate.date = picker.$date.getDate();
							picker.$updateSelected();
						}
					},
					build: function() {
						var firstDayOfMonth = new Date(viewDate.year, viewDate.month, 1),
							firstDayOfMonthOffset = firstDayOfMonth.getTimezoneOffset();
						var firstDate = new Date(+firstDayOfMonth - mod(firstDayOfMonth.getDay() - options.startWeek, 7) * 864e5),
							firstDateOffset = firstDate.getTimezoneOffset();
						var today = new Date().toDateString();
						// Handle daylight time switch
						if (firstDateOffset !== firstDayOfMonthOffset) firstDate = new Date(+firstDate + (firstDateOffset - firstDayOfMonthOffset) * 60e3);
						var days = [],
							day;
						for (var i = 0; i < 42; i++) { // < 7 * 6
							day = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate() + i);
							days.push({
								date: day,
								isToday: day.toDateString() === today,
								label: dateFilter(day, this.format),
								selected: picker.$date && this.isSelected(day),
								muted: day.getMonth() !== viewDate.month,
								disabled: this.isDisabled(day)
							});
						}
						scope.title = dateFilter(firstDayOfMonth, 'MMMM yyyy');
						scope.showLabels = true;
						scope.labels = weekDaysLabelsHtml;
						scope.rows = split(days, this.split);
						this.built = true;
					},
					isSelected: function(date) {
						return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth() && date.getDate() === picker.$date.getDate();
					},
					isDisabled: function(date) {
						var time = date.getTime();

						// Disabled because of min/max date.
						if (time < options.minDate || time > options.maxDate) return true;

						// Disabled due to being a disabled day of the week
						if (options.daysOfWeekDisabled.indexOf(date.getDay()) !== -1) return true;

						// Disabled because of disabled date range.
						if (options.disabledDateRanges) {
							for (var i = 0; i < options.disabledDateRanges.length; i++) {
								if (time >= options.disabledDateRanges[i].start) {
									if (time <= options.disabledDateRanges[i].end) return true;

									// The disabledDateRanges is expected to be sorted, so if time >= start,
									// we know it's not disabled.
									return false;
								}
							}
						}

						return false;
					},
					onKeyDown: function(evt) {
						var actualTime = picker.$date.getTime();
						var newDate;

						if (evt.keyCode === 37) newDate = new Date(actualTime - 1 * 864e5);
						else if (evt.keyCode === 38) newDate = new Date(actualTime - 7 * 864e5);
						else if (evt.keyCode === 39) newDate = new Date(actualTime + 1 * 864e5);
						else if (evt.keyCode === 40) newDate = new Date(actualTime + 7 * 864e5);

						if (!this.isDisabled(newDate)) picker.select(newDate, true);
					}
				}, {
					name: 'month',
					format: 'MMM',
					split: 4,
					steps: {
						year: 1
					},
					update: function(date, force) {
						if (!this.built || date.getFullYear() !== viewDate.year) {
							angular.extend(viewDate, {
								year: picker.$date.getFullYear(),
								month: picker.$date.getMonth(),
								date: picker.$date.getDate()
							});
							picker.$build();
						} else if (date.getMonth() !== viewDate.month) {
							angular.extend(viewDate, {
								month: picker.$date.getMonth(),
								date: picker.$date.getDate()
							});
							picker.$updateSelected();
						}
					},
					build: function() {
						var firstMonth = new Date(viewDate.year, 0, 1);
						var months = [],
							month;
						for (var i = 0; i < 12; i++) {
							month = new Date(viewDate.year, i, 1);
							months.push({
								date: month,
								label: dateFilter(month, this.format),
								selected: picker.$isSelected(month),
								disabled: this.isDisabled(month)
							});
						}
						scope.title = dateFilter(month, 'yyyy');
						scope.showLabels = false;
						scope.rows = split(months, this.split);
						this.built = true;
					},
					isSelected: function(date) {
						return picker.$date && date.getFullYear() === picker.$date.getFullYear() && date.getMonth() === picker.$date.getMonth();
					},
					isDisabled: function(date) {
						var lastDate = +new Date(date.getFullYear(), date.getMonth() + 1, 0);
						return lastDate < options.minDate || date.getTime() > options.maxDate;
					},
					onKeyDown: function(evt) {
						var actualMonth = picker.$date.getMonth();
						var newDate = new Date(picker.$date);

						if (evt.keyCode === 37) newDate.setMonth(actualMonth - 1);
						else if (evt.keyCode === 38) newDate.setMonth(actualMonth - 4);
						else if (evt.keyCode === 39) newDate.setMonth(actualMonth + 1);
						else if (evt.keyCode === 40) newDate.setMonth(actualMonth + 4);

						if (!this.isDisabled(newDate)) picker.select(newDate, true);
					}
				}, {
					name: 'year',
					format: 'yyyy',
					split: 4,
					steps: {
						year: 12
					},
					update: function(date, force) {
						if (!this.built || force || parseInt(date.getFullYear() / 20, 10) !== parseInt(viewDate.year / 20, 10)) {
							angular.extend(viewDate, {
								year: picker.$date.getFullYear(),
								month: picker.$date.getMonth(),
								date: picker.$date.getDate()
							});
							picker.$build();
						} else if (date.getFullYear() !== viewDate.year) {
							angular.extend(viewDate, {
								year: picker.$date.getFullYear(),
								month: picker.$date.getMonth(),
								date: picker.$date.getDate()
							});
							picker.$updateSelected();
						}
					},
					build: function() {
						var firstYear = viewDate.year - viewDate.year % (this.split * 3);
						var years = [],
							year;
						for (var i = 0; i < 12; i++) {
							year = new Date(firstYear + i, 0, 1);
							years.push({
								date: year,
								label: dateFilter(year, this.format),
								selected: picker.$isSelected(year),
								disabled: this.isDisabled(year)
							});
						}
						scope.title = years[0].label + '-' + years[years.length - 1].label;
						scope.showLabels = false;
						scope.rows = split(years, this.split);
						this.built = true;
					},
					isSelected: function(date) {
						return picker.$date && date.getFullYear() === picker.$date.getFullYear();
					},
					isDisabled: function(date) {
						var lastDate = +new Date(date.getFullYear() + 1, 0, 0);
						return lastDate < options.minDate || date.getTime() > options.maxDate;
					},
					onKeyDown: function(evt) {
						var actualYear = picker.$date.getFullYear(),
							newDate = new Date(picker.$date);

						if (evt.keyCode === 37) newDate.setYear(actualYear - 1);
						else if (evt.keyCode === 38) newDate.setYear(actualYear - 4);
						else if (evt.keyCode === 39) newDate.setYear(actualYear + 1);
						else if (evt.keyCode === 40) newDate.setYear(actualYear + 4);

						if (!this.isDisabled(newDate)) picker.select(newDate, true);
					}
				}];

				return {
					views: options.minView ? Array.prototype.slice.call(views, options.minView) : views,
					viewDate: viewDate
				};

			};

		};

	})

	.run(['$templateCache', function($templateCache) {

		$templateCache.put('datepicker/datepicker.tpl.html', '<div class="dropdown-menu datepicker" ng-class="\'datepicker-mode-\' + $mode" style="max-width: 320px;"><table style="table-layout: fixed; height: 100%; width: 100%;"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$selectPane(-1)"><i class="{{$iconLeft}}"></i></button></th><th colspan="{{ rows[0].length - 2 }}"><button tabindex="-1" type="button" class="btn btn-default btn-block text-strong"  ng-click="$toggleMode()"><strong style="text-transform: capitalize;" ng-bind="title"></strong></button></th><th><button tabindex="-1" type="button" class="btn btn-default pull-right" ng-click="$selectPane(+1)"><i class="{{$iconRight}}"></i></button></th></tr><tr ng-show="showLabels" ng-bind-html="labels"></tr></thead><tbody><tr ng-repeat="(i, row) in rows" height="{{ 100 / rows.length }}%"><td class="text-center" ng-repeat="(j, el) in row"><button tabindex="-1" type="button" class="btn btn-default" style="width: 100%" ng-class="{\'btn-primary\': el.selected, \'btn-info btn-today\': el.isToday && !el.selected}" ng-click="$select(el.date)" ng-disabled="el.disabled"><span ng-class="{\'text-muted\': el.muted}" ng-bind="el.label"></span></button></td></tr></tbody></table></div>');

	}]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Dropdown module
 */
'use strict';

angular.module('banki.ui.dropdown', ['banki.ui.tooltip'])

    .provider('$dropdown', function() {

        var defaults = this.defaults = {
            animation: 'am-fade',
            prefixClass: 'dropdown',
            placement: 'bottom-left',
            template: 'dropdown/dropdown.tpl.html',
            trigger: 'click',
            container: false,
            keyboard: true,
            html: true,
            delay: 0
        };

        this.$get = function($window, $rootScope, $tooltip) {

            var bodyEl = angular.element($window.document.body);
            var matchesSelector = Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector;

            function DropdownFactory(element, config) {

                var $dropdown = {};

                // Common vars
                var options = angular.extend({}, defaults, config);
                var scope = $dropdown.$scope = options.scope && options.scope.$new() || $rootScope.$new();

                $dropdown = $tooltip(element, options);
                var parentEl = element.parent();

                // Protected methods

                $dropdown.$onKeyDown = function(evt) {
                    if (!/(38|40)/.test(evt.keyCode)) return;
                    evt.preventDefault();
                    evt.stopPropagation();

                    // Retrieve focused index
                    var items = angular.element($dropdown.$element[0].querySelectorAll('li:not(.divider) a'));
                    if (!items.length) return;
                    var index;
                    angular.forEach(items, function(el, i) {
                        if (matchesSelector && matchesSelector.call(el, ':focus')) index = i;
                    });

                    // Navigate with keyboard
                    if (evt.keyCode === 38 && index > 0) index--;
                    else if (evt.keyCode === 40 && index < items.length - 1) index++;
                    else if (angular.isUndefined(index)) index = 0;
                    items.eq(index)[0].focus();

                };

                // Overrides

                var show = $dropdown.show;
                $dropdown.show = function() {
                    show();
                    setTimeout(function() {
                        options.keyboard && $dropdown.$element.on('keydown', $dropdown.$onKeyDown);
                        bodyEl.on('click', onBodyClick);
                    });
                    parentEl.hasClass('dropdown') && parentEl.addClass('open');
                };

                var hide = $dropdown.hide;
                $dropdown.hide = function() {
                    if (!$dropdown.$isShown) return;
                    options.keyboard && $dropdown.$element.off('keydown', $dropdown.$onKeyDown);
                    bodyEl.off('click', onBodyClick);
                    parentEl.hasClass('dropdown') && parentEl.removeClass('open');
                    hide();
                };

                // Private functions

                function onBodyClick(evt) {
                    if (evt.target === element[0]) return;
                    return evt.target !== element[0] && $dropdown.hide();
                }

                return $dropdown;

            }

            return DropdownFactory;

        };

    })

    .directive('uiDropdown', function($window, $sce, $dropdown) {

        return {
            restrict: 'EAC',
            scope: true,
            link: function postLink(scope, element, attr, transclusion) {

                // Directive options
                var options = {
                    scope: scope
                };
                angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template'], function(key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Support scope as an object
                attr.uiDropdown && scope.$watch(attr.uiDropdown, function(newValue, oldValue) {
                    scope.content = newValue;
                }, true);

                // Visibility binding support
                attr.uiShow && scope.$watch(attr.uiShow, function(newValue, oldValue) {
                    if (!dropdown || !angular.isDefined(newValue)) return;
                    if (angular.isString(newValue)) newValue = !! newValue.match(/true|,?(dropdown),?/i);
                    newValue === true ? dropdown.show() : dropdown.hide();
                });

                // Initialize dropdown
                var dropdown = $dropdown(element, options);

                // Garbage collection
                scope.$on('$destroy', function() {
                    if (dropdown) dropdown.destroy();
                    options = null;
                    dropdown = null;
                });

            }
        };

    })

    .run(['$templateCache', function($templateCache) {

        $templateCache.put('dropdown/dropdown.tpl.html', '<ul tabindex="-1" class="dropdown-menu" role="menu"><li role="presentation" ng-class="{divider: item.divider}" ng-repeat="item in content" ><a role="menuitem" tabindex="-1" ng-href="{{item.href}}" ng-if="!item.divider && item.href" target="{{item.target || \'\'}}" ng-bind="item.text"></a><a role="menuitem" tabindex="-1" href="javascript:void(0)" ng-if="!item.divider && item.click" ng-click="$eval(item.click);$hide()" ng-bind="item.text"></a></li></ul>');

    }]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Modal module
 */
'use strict';

angular.module('banki.ui.modal', ['banki.helpers.dimensions'])

    .provider('$modal', function() {

        var defaults = this.defaults = {
            animation: 'am-fade',
            backdropAnimation: 'am-fade',
            prefixClass: 'modal',
            prefixEvent: 'modal',
            placement: 'top',
            template: 'modal/modal.tpl.html',
            contentTemplate: false,
            container: false,
            element: null,
            backdrop: true,
            keyboard: true,
            html: true,
            show: true
        };

        this.$get = function($window, $rootScope, $compile, $q, $templateCache, $http, $animate, $timeout, $sce, dimensions) {

            var forEach = angular.forEach;
            var trim = String.prototype.trim;
            var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;
            var bodyElement = angular.element($window.document.body);
            var htmlReplaceRegExp = /ng-bind="/ig;

            function ModalFactory(config) {

                var $modal = {};

                // Common vars
                var options = $modal.$options = angular.extend({}, defaults, config);
                $modal.$promise = fetchTemplate(options.template);
                var scope = $modal.$scope = options.scope && options.scope.$new() || $rootScope.$new();
                if (!options.element && !options.container) {
                    options.container = 'body';
                }

                // Support scope as string options
                forEach(['title', 'content'], function(key) {
                    if (options[key]) scope[key] = $sce.trustAsHtml(options[key]);
                });

                // Provide scope helpers
                scope.$hide = function() {
                    scope.$$postDigest(function() {
                        $modal.hide();
                    });
                };
                scope.$show = function() {
                    scope.$$postDigest(function() {
                        $modal.show();
                    });
                };
                scope.$toggle = function() {
                    scope.$$postDigest(function() {
                        $modal.toggle();
                    });
                };

                // Support contentTemplate option
                if (options.contentTemplate) {
                    $modal.$promise = $modal.$promise.then(function(template) {
                        var templateEl = angular.element(template);
                        return fetchTemplate(options.contentTemplate)
                            .then(function(contentTemplate) {
                                var contentEl = findElement('[ng-bind="content"]', templateEl[0]).removeAttr('ng-bind').html(contentTemplate);
                                // Drop the default footer as you probably don't want it if you use a custom contentTemplate
                                if (!config.template) contentEl.next().remove();
                                return templateEl[0].outerHTML;
                            });
                    });
                }

                // Fetch, compile then initialize modal
                var modalLinker, modalElement;
                var backdropElement = angular.element('<div class="' + options.prefixClass + '-backdrop"/>');
                $modal.$promise.then(function(template) {
                    if (angular.isObject(template)) template = template.data;
                    if (options.html) template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
                    template = trim.apply(template);
                    modalLinker = $compile(template);
                    $modal.init();
                });

                $modal.init = function() {

                    // Options: show
                    if (options.show) {
                        scope.$$postDigest(function() {
                            $modal.show();
                        });
                    }

                };

                $modal.destroy = function() {

                    // Remove element
                    if (modalElement) {
                        modalElement.remove();
                        modalElement = null;
                    }
                    if (backdropElement) {
                        backdropElement.remove();
                        backdropElement = null;
                    }

                    // Destroy scope
                    scope.$destroy();

                };

                $modal.show = function() {
                    if (scope.$isShown) return;

                    if (scope.$emit(options.prefixEvent + '.show.before', $modal).defaultPrevented) {
                        return;
                    }
                    var parent;
                    if (angular.isElement(options.container)) {
                        parent = options.container;
                    } else {
                        parent = options.container ? findElement(options.container) : null;
                    }
                    var after = options.container ? null : options.element;

                    // Fetch a cloned element linked from template
                    modalElement = $modal.$element = modalLinker(scope, function(clonedElement, scope) {});

                    // Set the initial positioning.
                    modalElement.css({
                        display: 'block'
                    }).addClass(options.placement);

                    // Options: animation
                    if (options.animation) {
                        if (options.backdrop) {
                            backdropElement.addClass(options.backdropAnimation);
                        }
                        modalElement.addClass(options.animation);
                    }

                    if (options.backdrop) {
                        $animate.enter(backdropElement, bodyElement, null);
                    }
                    // Support v1.3+ $animate
                    // https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
                    var promise = $animate.enter(modalElement, parent, after, enterAnimateCallback);
                    if (promise && promise.then) promise.then(enterAnimateCallback);

                    scope.$isShown = true;
                    scope.$$phase || (scope.$root && scope.$root.$$phase) || scope.$digest();
                    // Focus once the enter-animation has started
                    // Weird PhantomJS bug hack
                    var el = modalElement[0];
                    requestAnimationFrame(function() {
                        el.focus();
                    });

                    bodyElement.addClass(options.prefixClass + '-open');
                    if (options.animation) {
                        bodyElement.addClass(options.prefixClass + '-with-' + options.animation);
                    }

                    // Bind events
                    if (options.backdrop) {
                        modalElement.on('click', hideOnBackdropClick);
                        backdropElement.on('click', hideOnBackdropClick);
                    }
                    if (options.keyboard) {
                        modalElement.on('keyup', $modal.$onKeyUp);
                    }
                };

                function enterAnimateCallback() {
                    scope.$emit(options.prefixEvent + '.show', $modal);
                }

                $modal.hide = function() {
                    if (!scope.$isShown) return;

                    if (scope.$emit(options.prefixEvent + '.hide.before', $modal).defaultPrevented) {
                        return;
                    }
                    var promise = $animate.leave(modalElement, leaveAnimateCallback);
                    // Support v1.3+ $animate
                    // https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
                    if (promise && promise.then) promise.then(leaveAnimateCallback);

                    if (options.backdrop) {
                        $animate.leave(backdropElement);
                    }
                    scope.$isShown = false;
                    scope.$$phase || (scope.$root && scope.$root.$$phase) || scope.$digest();

                    // Unbind events
                    if (options.backdrop) {
                        modalElement.off('click', hideOnBackdropClick);
                        backdropElement.off('click', hideOnBackdropClick);
                    }
                    if (options.keyboard) {
                        modalElement.off('keyup', $modal.$onKeyUp);
                    }
                };

                function leaveAnimateCallback() {
                    scope.$emit(options.prefixEvent + '.hide', $modal);
                    bodyElement.removeClass(options.prefixClass + '-open');
                    if (options.animation) {
                        bodyElement.removeClass(options.prefixClass + '-with-' + options.animation);
                    }
                }

                $modal.toggle = function() {

                    scope.$isShown ? $modal.hide() : $modal.show();

                };

                $modal.focus = function() {
                    modalElement[0].focus();
                };

                // Protected methods

                $modal.$onKeyUp = function(evt) {

                    if (evt.which === 27 && scope.$isShown) {
                        $modal.hide();
                        evt.stopPropagation();
                    }

                };

                // Private methods

                function hideOnBackdropClick(evt) {
                    if (evt.target !== evt.currentTarget) return;
                    options.backdrop === 'static' ? $modal.focus() : $modal.hide();
                }

                return $modal;

            }

            // Helper functions

            function findElement(query, element) {
                return angular.element((element || document).querySelectorAll(query));
            }

            function fetchTemplate(template) {
                return $q.when($templateCache.get(template) || $http.get(template))
                    .then(function(res) {
                        if (angular.isObject(res)) {
                            $templateCache.put(template, res.data);
                            return res.data;
                        }
                        return res;
                    });
            }

            return ModalFactory;

        };

    })

    .directive('uiModal', function($window, $sce, $modal) {

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
                angular.forEach(['template', 'contentTemplate', 'placement', 'backdrop', 'keyboard', 'html', 'container', 'animation'], function(key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Support scope as data-attrs
                angular.forEach(['title', 'content'], function(key) {
                    attr[key] && attr.$observe(key, function(newValue, oldValue) {
                        scope[key] = $sce.trustAsHtml(newValue);
                    });
                });

                // Support scope as an object
                attr.uiModal && scope.$watch(attr.uiModal, function(newValue, oldValue) {
                    if (angular.isObject(newValue)) {
                        angular.extend(scope, newValue);
                    } else {
                        scope.content = newValue;
                    }
                }, true);

                // Initialize modal
                var modal = $modal(options);

                // Trigger
                element.on(attr.trigger || 'click', modal.toggle);

                // Garbage collection
                scope.$on('$destroy', function() {
                    if (modal) modal.destroy();
                    options = null;
                    modal = null;
                });

            }
        };

    })

    .run(['$templateCache', function($templateCache) {

        $templateCache.put('modal/modal.tpl.html', '<div class="modal" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" ng-show="title"><button type="button" class="close" ng-click="$hide()">&times;</button><h4 class="modal-title" ng-bind="title"></h4></div><div class="modal-body" ng-bind="content"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="$hide()">Закрыть</button></div></div></div></div>');

    }]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Popover module
 */
'use strict';

angular.module('banki.ui.popover', ['banki.ui.tooltip'])

    .provider('$popover', function() {

        var defaults = this.defaults = {
            animation: 'am-fade',
            customClass: '',
            container: false,
            target: false,
            placement: 'right',
            template: 'popover/popover.tpl.html',
            contentTemplate: false,
            trigger: 'click',
            keyboard: true,
            html: false,
            title: '',
            content: '',
            delay: 0
        };

        this.$get = function($tooltip) {

            function PopoverFactory(element, config) {

                // Common vars
                var options = angular.extend({}, defaults, config);

                var $popover = $tooltip(element, options);

                // Support scope as string options [/*title, */content]
                if (options.content) {
                    $popover.$scope.content = options.content;
                }

                return $popover;

            }

            return PopoverFactory;

        };

    })

    .directive('uiPopover', function($window, $sce, $popover) {

        var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;

        return {
            restrict: 'EAC',
            scope: true,
            link: function postLink(scope, element, attr) {

                // Directive options
                var options = {
                    scope: scope
                };
                angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'target', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'customClass'], function(key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Support scope as data-attrs
                angular.forEach(['title', 'content'], function(key) {
                    attr[key] && attr.$observe(key, function(newValue, oldValue) {
                        scope[key] = $sce.trustAsHtml(newValue);
                        angular.isDefined(oldValue) && requestAnimationFrame(function() {
                            popover && popover.$applyPlacement();
                        });
                    });
                });

                // Support scope as an object
                attr.uiPopover && scope.$watch(attr.uiPopover, function(newValue, oldValue) {
                    if (angular.isObject(newValue)) {
                        angular.extend(scope, newValue);
                    } else {
                        scope.content = newValue;
                    }
                    angular.isDefined(oldValue) && requestAnimationFrame(function() {
                        popover && popover.$applyPlacement();
                    });
                }, true);

                // Visibility binding support
                attr.uiShow && scope.$watch(attr.uiShow, function(newValue, oldValue) {
                    if (!popover || !angular.isDefined(newValue)) return;
                    if (angular.isString(newValue)) newValue = !! newValue.match(/true|,?(popover),?/i);
                    newValue === true ? popover.show() : popover.hide();
                });

                // Initialize popover
                var popover = $popover(element, options);

                // Garbage collection
                scope.$on('$destroy', function() {
                    if (popover) popover.destroy();
                    options = null;
                    popover = null;
                });

            }
        };

    })

    .run(['$templateCache', function($templateCache) {

        $templateCache.put('popover/popover.tpl.html', '<div class="popover"><div class="arrow"></div><h3 class="popover-title" ng-bind="title" ng-show="title"></h3><div class="popover-content" ng-bind="content"></div></div>');

    }]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Select module
 */
'use strict';

angular.module('banki.ui.select', ['banki.ui.tooltip', 'banki.helpers.parseOptions'])

    .provider('$select', function() {

        var defaults = this.defaults = {
            animation: 'am-fade',
            prefixClass: 'select',
            prefixEvent: '$select',
            placement: 'bottom-left',
            template: 'select/select.tpl.html',
            trigger: 'focus',
            container: false,
            keyboard: true,
            html: true,
            delay: 0,
            multiple: false,
            allNoneButtons: false,
            sort: true,
            caretHtml: '&nbsp;<span class="caret"></span>',
            placeholder: 'Choose among the following...',
            maxLength: 3,
            maxLengthHtml: 'selected',
            iconCheckmark: 'glyphicon glyphicon-ok'
        };

        this.$get = function($window, $document, $rootScope, $tooltip) {

            var bodyEl = angular.element($window.document.body);
            var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
            var isTouch = ('createTouch' in $window.document) && isNative;

            function SelectFactory(element, controller, config) {

                var $select = {};

                // Common vars
                var options = angular.extend({}, defaults, config);

                $select = $tooltip(element, options);
                var scope = $select.$scope;

                scope.$matches = [];
                scope.$activeIndex = 0;
                scope.$isMultiple = options.multiple;
                scope.$showAllNoneButtons = options.allNoneButtons && options.multiple;
                scope.$iconCheckmark = options.iconCheckmark;

                scope.$activate = function(index) {
                    scope.$$postDigest(function() {
                        $select.activate(index);
                    });
                };

                scope.$select = function(index, evt) {
                    scope.$$postDigest(function() {
                        $select.select(index);
                    });
                };

                scope.$isVisible = function() {
                    return $select.$isVisible();
                };

                scope.$isActive = function(index) {
                    return $select.$isActive(index);
                };

                scope.$selectAll = function() {
                    for (var i = 0; i < scope.$matches.length; i++) {
                        if (!scope.$isActive(i)) {
                            scope.$select(i);
                        }
                    }
                };

                scope.$selectNone = function() {
                    for (var i = 0; i < scope.$matches.length; i++) {
                        if (scope.$isActive(i)) {
                            scope.$select(i);
                        }
                    }
                };

                // Public methods

                $select.update = function(matches) {
                    scope.$matches = matches;
                    $select.$updateActiveIndex();
                };

                $select.activate = function(index) {
                    if (options.multiple) {
                        scope.$activeIndex.sort();
                        $select.$isActive(index) ? scope.$activeIndex.splice(scope.$activeIndex.indexOf(index), 1) : scope.$activeIndex.push(index);
                        if (options.sort) scope.$activeIndex.sort();
                    } else {
                        scope.$activeIndex = index;
                    }
                    return scope.$activeIndex;
                };

                $select.select = function(index) {
                    var value = scope.$matches[index].value;
                    scope.$apply(function() {
                        $select.activate(index);
                        if (options.multiple) {
                            controller.$setViewValue(scope.$activeIndex.map(function(index) {
                                return scope.$matches[index].value;
                            }));
                        } else {
                            controller.$setViewValue(value);
                            // Hide if single select
                            $select.hide();
                        }
                    });
                    // Emit event
                    scope.$emit(options.prefixEvent + '.select', value, index);
                };

                // Protected methods

                $select.$updateActiveIndex = function() {
                    if (controller.$modelValue && scope.$matches.length) {
                        if (options.multiple && angular.isArray(controller.$modelValue)) {
                            scope.$activeIndex = controller.$modelValue.map(function(value) {
                                return $select.$getIndex(value);
                            });
                        } else {
                            scope.$activeIndex = $select.$getIndex(controller.$modelValue);
                        }
                    } else if (scope.$activeIndex >= scope.$matches.length) {
                        scope.$activeIndex = options.multiple ? [] : 0;
                    }
                };

                $select.$isVisible = function() {
                    if (!options.minLength || !controller) {
                        return scope.$matches.length;
                    }
                    // minLength support
                    return scope.$matches.length && controller.$viewValue.length >= options.minLength;
                };

                $select.$isActive = function(index) {
                    if (options.multiple) {
                        return scope.$activeIndex.indexOf(index) !== -1;
                    } else {
                        return scope.$activeIndex === index;
                    }
                };

                $select.$getIndex = function(value) {
                    var l = scope.$matches.length,
                        i = l;
                    if (!l) return;
                    for (i = l; i--;) {
                        if (scope.$matches[i].value === value) break;
                    }
                    if (i < 0) return;
                    return i;
                };

                $select.$onMouseDown = function(evt) {
                    // Prevent blur on mousedown on .dropdown-menu
                    evt.preventDefault();
                    evt.stopPropagation();
                    // Emulate click for mobile devices
                    if (isTouch) {
                        var targetEl = angular.element(evt.target);
                        targetEl.triggerHandler('click');
                    }
                };

                $select.$onKeyDown = function(evt) {
                    if (!/(9|13|38|40)/.test(evt.keyCode)) return;
                    evt.preventDefault();
                    evt.stopPropagation();

                    // Select with enter
                    if (!options.multiple && (evt.keyCode === 13 || evt.keyCode === 9)) {
                        return $select.select(scope.$activeIndex);
                    }

                    // Navigate with keyboard
                    if (evt.keyCode === 38 && scope.$activeIndex > 0) scope.$activeIndex--;
                    else if (evt.keyCode === 40 && scope.$activeIndex < scope.$matches.length - 1) scope.$activeIndex++;
                    else if (angular.isUndefined(scope.$activeIndex)) scope.$activeIndex = 0;
                    scope.$digest();
                };

                // Overrides

                var _show = $select.show;
                $select.show = function() {
                    _show();
                    if (options.multiple) {
                        $select.$element.addClass('select-multiple');
                    }
                    setTimeout(function() {
                        $select.$element.on(isTouch ? 'touchstart' : 'mousedown', $select.$onMouseDown);
                        if (options.keyboard) {
                            element.on('keydown', $select.$onKeyDown);
                        }
                    });
                };

                var _hide = $select.hide;
                $select.hide = function() {
                    $select.$element.off(isTouch ? 'touchstart' : 'mousedown', $select.$onMouseDown);
                    if (options.keyboard) {
                        element.off('keydown', $select.$onKeyDown);
                    }
                    _hide(true);
                };

                return $select;

            }

            SelectFactory.defaults = defaults;
            return SelectFactory;

        };

    })

    .directive('uiSelect', function($window, $parse, $q, $select, $parseOptions) {

        var defaults = $select.defaults;

        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function postLink(scope, element, attr, controller) {

                // Directive options
                var options = {
                    scope: scope,
                    placeholder: defaults.placeholder
                };
                angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'placeholder', 'multiple', 'allNoneButtons', 'maxLength', 'maxLengthHtml'], function(key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Add support for select markup
                if (element[0].nodeName.toLowerCase() === 'select') {
                    var inputEl = element;
                    inputEl.css('display', 'none');
                    element = angular.element('<button type="button" class="btn btn-default"></button>');
                    inputEl.after(element);
                }

                // Build proper ngOptions
                var parsedOptions = $parseOptions(attr.ngOptions);

                // Initialize select
                var select = $select(element, controller, options);

                // Watch ngOptions values before filtering for changes
                var watchedOptions = parsedOptions.$match[7].replace(/\|.+/, '').trim();
                scope.$watch(watchedOptions, function(newValue, oldValue) {
                    // console.warn('scope.$watch(%s)', watchedOptions, newValue, oldValue);
                    parsedOptions.valuesFn(scope, controller)
                        .then(function(values) {
                            select.update(values);
                            controller.$render();
                        });
                }, true);

                // Watch model for changes
                scope.$watch(attr.ngModel, function(newValue, oldValue) {
                    // console.warn('scope.$watch(%s)', attr.ngModel, newValue, oldValue);
                    select.$updateActiveIndex();
                    controller.$render();
                }, true);

                // Model rendering in view
                controller.$render = function() {
                    // console.warn('$render', element.attr('ng-model'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
                    var selected, index;
                    if (options.multiple && angular.isArray(controller.$modelValue)) {
                        selected = controller.$modelValue.map(function(value) {
                            index = select.$getIndex(value);
                            return angular.isDefined(index) ? select.$scope.$matches[index].label : false;
                        }).filter(angular.isDefined);
                        if (selected.length > (options.maxLength || defaults.maxLength)) {
                            selected = selected.length + ' ' + (options.maxLengthHtml || defaults.maxLengthHtml);
                        } else {
                            selected = selected.join(', ');
                        }
                    } else {
                        index = select.$getIndex(controller.$modelValue);
                        selected = angular.isDefined(index) ? select.$scope.$matches[index].label : false;
                    }
                    element.html((selected ? selected : options.placeholder) + defaults.caretHtml);
                };

                // Garbage collection
                scope.$on('$destroy', function() {
                    if (select) select.destroy();
                    options = null;
                    select = null;
                });

            }
        };

    })

    .run(['$templateCache', function($templateCache) {

        $templateCache.put('select/select.tpl.html', '<ul tabindex="-1" class="select dropdown-menu" ng-show="$isVisible()" role="select"><li ng-if="$showAllNoneButtons"><div class="btn-group" style="margin-bottom: 5px; margin-left: 5px"><button class="btn btn-default btn-xs" ng-click="$selectAll()">All</button><button class="btn btn-default btn-xs" ng-click="$selectNone()">None</button></div></li><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $isActive($index)}"><a style="cursor: default;" role="menuitem" tabindex="-1" ng-click="$select($index, $event)"><span ng-bind="match.label"></span><i class="{{$iconCheckmark}} pull-right" ng-if="$isMultiple && $isActive($index)"></i></a></li></ul>');

    }]);



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



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Timepicker module
 */
'use strict';

angular.module('banki.ui.timepicker', ['banki.helpers.dateParser', 'banki.ui.tooltip'])

	.provider('$timepicker', function() {

		var defaults = this.defaults = {
			animation: 'am-fade',
			prefixClass: 'timepicker',
			placement: 'bottom-left',
			template: 'timepicker/timepicker.tpl.html',
			trigger: 'focus',
			container: false,
			keyboard: true,
			html: false,
			delay: 0,
			// lang: $locale.id,
			useNative: true,
			timeType: 'date',
			timeFormat: 'shortTime',
			modelTimeFormat: null,
			autoclose: false,
			minTime: -Infinity,
			maxTime: +Infinity,
			length: 5,
			hourStep: 1,
			minuteStep: 5,
			iconUp: 'glyphicon glyphicon-chevron-up',
			iconDown: 'glyphicon glyphicon-chevron-down',
			arrowBehavior: 'pager'
		};

		this.$get = function($window, $document, $rootScope, $sce, $locale, dateFilter, $tooltip) {

			var bodyEl = angular.element($window.document.body);
			var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
			var isTouch = ('createTouch' in $window.document) && isNative;
			if (!defaults.lang) defaults.lang = $locale.id;

			function timepickerFactory(element, controller, config) {

				var $timepicker = $tooltip(element, angular.extend({}, defaults, config));
				var parentScope = config.scope;
				var options = $timepicker.$options;
				var scope = $timepicker.$scope;

				// View vars

				var selectedIndex = 0;
				var startDate = controller.$dateValue || new Date();
				var viewDate = {
					hour: startDate.getHours(),
					meridian: startDate.getHours() < 12,
					minute: startDate.getMinutes(),
					second: startDate.getSeconds(),
					millisecond: startDate.getMilliseconds()
				};

				var format = $locale.DATETIME_FORMATS[options.timeFormat] || options.timeFormat;
				var formats = /(h+)([:\.])?(m+)[ ]?(a?)/i.exec(format).slice(1);
				scope.$iconUp = options.iconUp;
				scope.$iconDown = options.iconDown;

				// Scope methods

				scope.$select = function(date, index) {
					$timepicker.select(date, index);
				};
				scope.$moveIndex = function(value, index) {
					$timepicker.$moveIndex(value, index);
				};
				scope.$switchMeridian = function(date) {
					$timepicker.switchMeridian(date);
				};

				// Public methods

				$timepicker.update = function(date) {
					// console.warn('$timepicker.update() newValue=%o', date);
					if (angular.isDate(date) && !isNaN(date.getTime())) {
						$timepicker.$date = date;
						angular.extend(viewDate, {
							hour: date.getHours(),
							minute: date.getMinutes(),
							second: date.getSeconds(),
							millisecond: date.getMilliseconds()
						});
						$timepicker.$build();
					} else if (!$timepicker.$isBuilt) {
						$timepicker.$build();
					}
				};

				$timepicker.select = function(date, index, keep) {
					// console.warn('$timepicker.select', date, scope.$mode);
					if (!controller.$dateValue || isNaN(controller.$dateValue.getTime())) controller.$dateValue = new Date(1970, 0, 1);
					if (!angular.isDate(date)) date = new Date(date);
					if (index === 0) controller.$dateValue.setHours(date.getHours());
					else if (index === 1) controller.$dateValue.setMinutes(date.getMinutes());
					controller.$setViewValue(controller.$dateValue);
					controller.$render();
					if (options.autoclose && !keep) {
						$timepicker.hide(true);
					}
				};

				$timepicker.switchMeridian = function(date) {
					if (!controller.$dateValue || isNaN(controller.$dateValue.getTime())) {
						return;
					}
					var hours = (date || controller.$dateValue).getHours();
					controller.$dateValue.setHours(hours < 12 ? hours + 12 : hours - 12);
					controller.$setViewValue(controller.$dateValue);
					controller.$render();
				};

				// Protected methods

				$timepicker.$build = function() {
					// console.warn('$timepicker.$build() viewDate=%o', viewDate);
					var i, midIndex = scope.midIndex = parseInt(options.length / 2, 10);
					var hours = [],
						hour;
					for (i = 0; i < options.length; i++) {
						hour = new Date(1970, 0, 1, viewDate.hour - (midIndex - i) * options.hourStep);
						hours.push({
							date: hour,
							label: dateFilter(hour, formats[0]),
							selected: $timepicker.$date && $timepicker.$isSelected(hour, 0),
							disabled: $timepicker.$isDisabled(hour, 0)
						});
					}
					var minutes = [],
						minute;
					for (i = 0; i < options.length; i++) {
						minute = new Date(1970, 0, 1, 0, viewDate.minute - (midIndex - i) * options.minuteStep);
						minutes.push({
							date: minute,
							label: dateFilter(minute, formats[2]),
							selected: $timepicker.$date && $timepicker.$isSelected(minute, 1),
							disabled: $timepicker.$isDisabled(minute, 1)
						});
					}

					var rows = [];
					for (i = 0; i < options.length; i++) {
						rows.push([hours[i], minutes[i]]);
					}
					scope.rows = rows;
					scope.showAM = !! formats[3];
					scope.isAM = ($timepicker.$date || hours[midIndex].date).getHours() < 12;
					scope.timeSeparator = formats[1];
					$timepicker.$isBuilt = true;
				};

				$timepicker.$isSelected = function(date, index) {
					if (!$timepicker.$date) return false;
					else if (index === 0) {
						return date.getHours() === $timepicker.$date.getHours();
					} else if (index === 1) {
						return date.getMinutes() === $timepicker.$date.getMinutes();
					}
				};

				$timepicker.$isDisabled = function(date, index) {
					var selectedTime;
					if (index === 0) {
						selectedTime = date.getTime() + viewDate.minute * 6e4;
					} else if (index === 1) {
						selectedTime = date.getTime() + viewDate.hour * 36e5;
					}
					return selectedTime < options.minTime * 1 || selectedTime > options.maxTime * 1;
				};

				scope.$arrowAction = function(value, index) {
					if (options.arrowBehavior === 'picker') {
						$timepicker.$setTimeByStep(value, index);
					} else {
						$timepicker.$moveIndex(value, index);
					}
				};

				$timepicker.$setTimeByStep = function(value, index) {
					var newDate = new Date($timepicker.$date);
					var hours = newDate.getHours(),
						hoursLength = dateFilter(newDate, 'h').length;
					var minutes = newDate.getMinutes(),
						minutesLength = dateFilter(newDate, 'mm').length;
					if (index === 0) {
						newDate.setHours(hours - (parseInt(options.hourStep, 10) * value));
					} else {
						newDate.setMinutes(minutes - (parseInt(options.minuteStep, 10) * value));
					}
					$timepicker.select(newDate, index, true);
					parentScope.$digest();
				};

				$timepicker.$moveIndex = function(value, index) {
					var targetDate;
					if (index === 0) {
						targetDate = new Date(1970, 0, 1, viewDate.hour + (value * options.length), viewDate.minute);
						angular.extend(viewDate, {
							hour: targetDate.getHours()
						});
					} else if (index === 1) {
						targetDate = new Date(1970, 0, 1, viewDate.hour, viewDate.minute + (value * options.length * options.minuteStep));
						angular.extend(viewDate, {
							minute: targetDate.getMinutes()
						});
					}
					$timepicker.$build();
				};

				$timepicker.$onMouseDown = function(evt) {
					// Prevent blur on mousedown on .dropdown-menu
					if (evt.target.nodeName.toLowerCase() !== 'input') evt.preventDefault();
					evt.stopPropagation();
					// Emulate click for mobile devices
					if (isTouch) {
						var targetEl = angular.element(evt.target);
						if (targetEl[0].nodeName.toLowerCase() !== 'button') {
							targetEl = targetEl.parent();
						}
						targetEl.triggerHandler('click');
					}
				};

				$timepicker.$onKeyDown = function(evt) {
					if (!/(38|37|39|40|13)/.test(evt.keyCode) || evt.shiftKey || evt.altKey) return;
					evt.preventDefault();
					evt.stopPropagation();

					// Close on enter
					if (evt.keyCode === 13) return $timepicker.hide(true);

					// Navigate with keyboard
					var newDate = new Date($timepicker.$date);
					var hours = newDate.getHours(),
						hoursLength = dateFilter(newDate, 'h').length;
					var minutes = newDate.getMinutes(),
						minutesLength = dateFilter(newDate, 'mm').length;
					var lateralMove = /(37|39)/.test(evt.keyCode);
					var count = 2 + !! formats[3] * 1;

					// Navigate indexes (left, right)
					if (lateralMove) {
						if (evt.keyCode === 37) selectedIndex = selectedIndex < 1 ? count - 1 : selectedIndex - 1;
						else if (evt.keyCode === 39) selectedIndex = selectedIndex < count - 1 ? selectedIndex + 1 : 0;
					}

					// Update values (up, down)
					var selectRange = [0, hoursLength];
					if (selectedIndex === 0) {
						if (evt.keyCode === 38) newDate.setHours(hours - parseInt(options.hourStep, 10));
						else if (evt.keyCode === 40) newDate.setHours(hours + parseInt(options.hourStep, 10));
						selectRange = [0, hoursLength];
					} else if (selectedIndex === 1) {
						if (evt.keyCode === 38) newDate.setMinutes(minutes - parseInt(options.minuteStep, 10));
						else if (evt.keyCode === 40) newDate.setMinutes(minutes + parseInt(options.minuteStep, 10));
						selectRange = [hoursLength + 1, hoursLength + 1 + minutesLength];
					} else if (selectedIndex === 2) {
						if (!lateralMove) $timepicker.switchMeridian();
						selectRange = [hoursLength + 1 + minutesLength + 1, hoursLength + 1 + minutesLength + 3];
					}
					$timepicker.select(newDate, selectedIndex, true);
					createSelection(selectRange[0], selectRange[1]);
					parentScope.$digest();
				};

				// Private

				function createSelection(start, end) {
					if (element[0].createTextRange) {
						var selRange = element[0].createTextRange();
						selRange.collapse(true);
						selRange.moveStart('character', start);
						selRange.moveEnd('character', end);
						selRange.select();
					} else if (element[0].setSelectionRange) {
						element[0].setSelectionRange(start, end);
					} else if (angular.isUndefined(element[0].selectionStart)) {
						element[0].selectionStart = start;
						element[0].selectionEnd = end;
					}
				}

				function focusElement() {
					element[0].focus();
				}

				// Overrides

				var _init = $timepicker.init;
				$timepicker.init = function() {
					if (isNative && options.useNative) {
						element.prop('type', 'time');
						element.css('-webkit-appearance', 'textfield');
						return;
					} else if (isTouch) {
						element.prop('type', 'text');
						element.attr('readonly', 'true');
						element.on('click', focusElement);
					}
					_init();
				};

				var _destroy = $timepicker.destroy;
				$timepicker.destroy = function() {
					if (isNative && options.useNative) {
						element.off('click', focusElement);
					}
					_destroy();
				};

				var _show = $timepicker.show;
				$timepicker.show = function() {
					_show();
					setTimeout(function() {
						$timepicker.$element.on(isTouch ? 'touchstart' : 'mousedown', $timepicker.$onMouseDown);
						if (options.keyboard) {
							element.on('keydown', $timepicker.$onKeyDown);
						}
					});
				};

				var _hide = $timepicker.hide;
				$timepicker.hide = function(blur) {
					if (!$timepicker.$isShown) return;
					$timepicker.$element.off(isTouch ? 'touchstart' : 'mousedown', $timepicker.$onMouseDown);
					if (options.keyboard) {
						element.off('keydown', $timepicker.$onKeyDown);
					}
					_hide(blur);
				};

				return $timepicker;

			}

			timepickerFactory.defaults = defaults;
			return timepickerFactory;

		};

	})


	.directive('uiTimepicker', function($window, $parse, $q, $locale, dateFilter, $timepicker, $dateParser, $timeout) {

		var defaults = $timepicker.defaults;
		var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
		var requestAnimationFrame = $window.requestAnimationFrame || $window.setTimeout;

		return {
			restrict: 'EAC',
			require: 'ngModel',
			link: function postLink(scope, element, attr, controller) {

				// Directive options
				var options = {
					scope: scope,
					controller: controller
				};
				angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'autoclose', 'timeType', 'timeFormat', 'modelTimeFormat', 'useNative', 'hourStep', 'minuteStep', 'length', 'arrowBehavior', 'iconUp', 'iconDown'], function(key) {
					if (angular.isDefined(attr[key])) options[key] = attr[key];
				});

				// Visibility binding support
				attr.bsShow && scope.$watch(attr.bsShow, function(newValue, oldValue) {
					if (!timepicker || !angular.isDefined(newValue)) return;
					if (angular.isString(newValue)) newValue = !! newValue.match(/true|,?(timepicker),?/i);
					newValue === true ? timepicker.show() : timepicker.hide();
				});

				// Initialize timepicker
				if (isNative && (options.useNative || defaults.useNative)) options.timeFormat = 'HH:mm';
				var timepicker = $timepicker(element, controller, options);
				options = timepicker.$options;

				// Initialize parser
				var dateParser = $dateParser({
					format: options.timeFormat,
					lang: options.lang
				});

				// Observe attributes for changes
				angular.forEach(['minTime', 'maxTime'], function(key) {
					// console.warn('attr.$observe(%s)', key, attr[key]);
					angular.isDefined(attr[key]) && attr.$observe(key, function(newValue) {
						timepicker.$options[key] = dateParser.getTimeForAttribute(key, newValue);
						!isNaN(timepicker.$options[key]) && timepicker.$build();
					});
				});

				// Watch model for changes
				scope.$watch(attr.ngModel, function(newValue, oldValue) {
					// console.warn('scope.$watch(%s)', attr.ngModel, newValue, oldValue, controller.$dateValue);
					timepicker.update(controller.$dateValue);
				}, true);

				// viewValue -> $parsers -> modelValue
				controller.$parsers.unshift(function(viewValue) {
					// console.warn('$parser("%s"): viewValue=%o', element.attr('ng-model'), viewValue);
					// Null values should correctly reset the model value & validity
					if (!viewValue) {
						controller.$setValidity('date', true);
						return;
					}
					var parsedTime = angular.isDate(viewValue) ? viewValue : dateParser.parse(viewValue, controller.$dateValue);
					if (!parsedTime || isNaN(parsedTime.getTime())) {
						controller.$setValidity('date', false);
						return;
					} else {
						var isMinValid = isNaN(options.minTime) || parsedTime.getTime() >= options.minTime;
						var isMaxValid = isNaN(options.maxTime) || parsedTime.getTime() <= options.maxTime;
						var isValid = isMinValid && isMaxValid;
						controller.$setValidity('date', isValid);
						controller.$setValidity('min', isMinValid);
						controller.$setValidity('max', isMaxValid);
						// Only update the model when we have a valid date
						if (!isValid) {
							return;
						}
						controller.$dateValue = parsedTime;
					}
					if (options.timeType === 'string') {
						return dateFilter(parsedTime, options.modelTimeFormat || options.timeFormat);
					} else if (options.timeType === 'number') {
						return controller.$dateValue.getTime();
					} else if (options.timeType === 'iso') {
						return controller.$dateValue.toISOString();
					} else {
						return new Date(controller.$dateValue);
					}
				});

				// modelValue -> $formatters -> viewValue
				controller.$formatters.push(function(modelValue) {
					// console.warn('$formatter("%s"): modelValue=%o (%o)', element.attr('ng-model'), modelValue, typeof modelValue);
					var date;
					if (angular.isUndefined(modelValue) || modelValue === null) {
						date = NaN;
					} else if (angular.isDate(modelValue)) {
						date = modelValue;
					} else if (options.timeType === 'string') {
						date = dateParser.parse(modelValue, null, options.modelTimeFormat);
					} else {
						date = new Date(modelValue);
					}
					// Setup default value?
					// if(isNaN(date.getTime())) date = new Date(new Date().setMinutes(0) + 36e5);
					controller.$dateValue = date;
					return controller.$dateValue;
				});

				// viewValue -> element
				controller.$render = function() {
					// console.warn('$render("%s"): viewValue=%o', element.attr('ng-model'), controller.$viewValue);
					element.val(!controller.$dateValue || isNaN(controller.$dateValue.getTime()) ? '' : dateFilter(controller.$dateValue, options.timeFormat));
				};

				// Garbage collection
				scope.$on('$destroy', function() {
					if (timepicker) timepicker.destroy();
					options = null;
					timepicker = null;
				});

			}
		};

	})

	.run(['$templateCache', function($templateCache) {

		$templateCache.put('timepicker/timepicker.tpl.html', '<div class="dropdown-menu timepicker" style="min-width: 0px;width: auto;"><table height="100%"><thead><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$arrowAction(-1, 0)"><i class="{{ $iconUp }}"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$arrowAction(-1, 1)"><i class="{{ $iconUp }}"></i></button></th></tr></thead><tbody><tr ng-repeat="(i, row) in rows"><td class="text-center"><button tabindex="-1" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[0].selected}" ng-click="$select(row[0].date, 0)" ng-disabled="row[0].disabled"><span ng-class="{\'text-muted\': row[0].muted}" ng-bind="row[0].label"></span></button></td><td><span ng-bind="i == midIndex ? timeSeparator : \' \'"></span></td><td class="text-center"><button tabindex="-1" ng-if="row[1].date" style="width: 100%" type="button" class="btn btn-default" ng-class="{\'btn-primary\': row[1].selected}" ng-click="$select(row[1].date, 1)" ng-disabled="row[1].disabled"><span ng-class="{\'text-muted\': row[1].muted}" ng-bind="row[1].label"></span></button></td><td ng-if="showAM">&nbsp;</td><td ng-if="showAM"><button tabindex="-1" ng-show="i == midIndex - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !!isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">AM</button><button tabindex="-1" ng-show="i == midIndex + 1 - !isAM * 1" style="width: 100%" type="button" ng-class="{\'btn-primary\': !isAM}" class="btn btn-default" ng-click="$switchMeridian()" ng-disabled="el.disabled">PM</button></td></tr></tbody><tfoot><tr class="text-center"><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$arrowAction(1, 0)"><i class="{{ $iconDown }}"></i></button></th><th>&nbsp;</th><th><button tabindex="-1" type="button" class="btn btn-default pull-left" ng-click="$arrowAction(1, 1)"><i class="{{ $iconDown }}"></i></button></th></tr></tfoot></table></div>');

	}]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Tooltip module
 */
'use strict';

angular.module('banki.ui.tooltip', ['banki.helpers.dimensions'])

	.provider('$tooltip', function() {

		var defaults = this.defaults = {
			animation: 'am-fade',
			customClass: '',
			prefixClass: 'tooltip',
			prefixEvent: 'tooltip',
			container: false,
			target: false,
			placement: 'top',
			template: 'tooltip/tooltip.tpl.html',
			contentTemplate: false,
			trigger: 'hover focus',
			keyboard: false,
			html: true,
			show: false,
			title: '',
			type: '',
			delay: 0
		};

		this.$get = function($window, $rootScope, $compile, $q, $templateCache, $http, $animate, dimensions, $$rAF) {

			var trim = String.prototype.trim;
			var isTouch = 'createTouch' in $window.document;
			var htmlReplaceRegExp = /ng-bind="/ig;

			function TooltipFactory(element, config) {

				var $tooltip = {};

				// Common vars
				var nodeName = element[0].nodeName.toLowerCase();
				var options = $tooltip.$options = angular.extend({}, defaults, config);
				$tooltip.$promise = fetchTemplate(options.template);
				var scope = $tooltip.$scope = options.scope && options.scope.$new() || $rootScope.$new();
				if(options.delay && angular.isString(options.delay)) {
					var split = options.delay.split(',').map(parseFloat);
					options.delay = split.length > 1 ? {show: split[0], hide: split[1]} : split[0];
				}

				// Support scope as string options
				if(options.title) {
					$tooltip.$scope.title = options.title;
				}

				// Provide scope helpers
				scope.$hide = function() {
					scope.$$postDigest(function() {
						$tooltip.hide();
					});
				};
				scope.$show = function() {
					scope.$$postDigest(function() {
						$tooltip.show();
					});
				};
				scope.$toggle = function() {
					scope.$$postDigest(function() {
						$tooltip.toggle();
					});
				};
				$tooltip.$isShown = scope.$isShown = false;

				// Private vars
				var timeout, hoverState;

				// Support contentTemplate option
				if(options.contentTemplate) {
					$tooltip.$promise = $tooltip.$promise.then(function(template) {
						var templateEl = angular.element(template);
						return fetchTemplate(options.contentTemplate)
							.then(function(contentTemplate) {
								var contentEl = findElement('[ng-bind="content"]', templateEl[0]);
								if(!contentEl.length) contentEl = findElement('[ng-bind="title"]', templateEl[0]);
								contentEl.removeAttr('ng-bind').html(contentTemplate);
								return templateEl[0].outerHTML;
							});
					});
				}

				// Fetch, compile then initialize tooltip
				var tipLinker, tipElement, tipTemplate, tipContainer;
				$tooltip.$promise.then(function(template) {
					if(angular.isObject(template)) template = template.data;
					if(options.html) template = template.replace(htmlReplaceRegExp, 'ng-bind-html="');
					template = trim.apply(template);
					tipTemplate = template;
					tipLinker = $compile(template);
					$tooltip.init();
				});

				$tooltip.init = function() {

					// Options: delay
					if (options.delay && angular.isNumber(options.delay)) {
						options.delay = {
							show: options.delay,
							hide: options.delay
						};
					}

					// Replace trigger on touch devices ?
					// if(isTouch && options.trigger === defaults.trigger) {
					//   options.trigger.replace(/hover/g, 'click');
					// }

					// Options : container
					if(options.container === 'self') {
						tipContainer = element;
					} else if(angular.isElement(options.container)) {
						tipContainer = options.container;
					} else if(options.container) {
						tipContainer = findElement(options.container);
					}

					// Options: trigger
					var triggers = options.trigger.split(' ');
					angular.forEach(triggers, function(trigger) {
						if(trigger === 'click') {
							element.on('click', $tooltip.toggle);
						} else if(trigger !== 'manual') {
							element.on(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
							element.on(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
							nodeName === 'button' && trigger !== 'hover' && element.on(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
						}
					});

					// Options: target
					if(options.target) {
						options.target = angular.isElement(options.target) ? options.target : findElement(options.target);
					}

					// Options: show
					if(options.show) {
						scope.$$postDigest(function() {
							options.trigger === 'focus' ? element[0].focus() : $tooltip.show();
						});
					}

				};

				$tooltip.destroy = function() {

					// Unbind events
					var triggers = options.trigger.split(' ');
					for (var i = triggers.length; i--;) {
						var trigger = triggers[i];
						if(trigger === 'click') {
							element.off('click', $tooltip.toggle);
						} else if(trigger !== 'manual') {
							element.off(trigger === 'hover' ? 'mouseenter' : 'focus', $tooltip.enter);
							element.off(trigger === 'hover' ? 'mouseleave' : 'blur', $tooltip.leave);
							nodeName === 'button' && trigger !== 'hover' && element.off(isTouch ? 'touchstart' : 'mousedown', $tooltip.$onFocusElementMouseDown);
						}
					}

					// Remove element
					if(tipElement) {
						tipElement.remove();
						tipElement = null;
					}

					// Cancel pending callbacks
					clearTimeout(timeout);

					// Destroy scope
					scope.$destroy();

				};

				$tooltip.enter = function() {

					clearTimeout(timeout);
					hoverState = 'in';
					if (!options.delay || !options.delay.show) {
						return $tooltip.show();
					}

					timeout = setTimeout(function() {
						if (hoverState ==='in') $tooltip.show();
					}, options.delay.show);

				};

				$tooltip.show = function() {

					scope.$emit(options.prefixEvent + '.show.before', $tooltip);
					var parent = options.container ? tipContainer : null;
					var after = options.container ? null : element;

					// Hide any existing tipElement
					if(tipElement) tipElement.remove();
					// Fetch a cloned element linked from template
					tipElement = $tooltip.$element = tipLinker(scope, function(clonedElement, scope) {});

					// Set the initial positioning.  Make the tooltip invisible
					// so IE doesn't try to focus on it off screen.
					tipElement.css({top: '-9999px', left: '-9999px', display: 'block', visibility: 'hidden'}).addClass(options.placement);

					// Options: animation
					if(options.animation) tipElement.addClass(options.animation);
					// Options: type
					if(options.type) tipElement.addClass(options.prefixClass + '-' + options.type);
					// Options: custom classes
					if(options.customClass) tipElement.addClass(options.customClass);

					// Support v1.3+ $animate
					// https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
					var promise = $animate.enter(tipElement, parent, after, enterAnimateCallback);
					if(promise && promise.then) promise.then(enterAnimateCallback);

					$tooltip.$isShown = scope.$isShown = true;
					scope.$$phase || (scope.$root && scope.$root.$$phase) || scope.$digest();
					$$rAF(function () {
						$tooltip.$applyPlacement();

						// Once placed, make the tooltip visible
						tipElement.css({visibility: 'visible'});
					}); // var a = bodyEl.offsetWidth + 1; ?

					// Bind events
					if(options.keyboard) {
						if(options.trigger !== 'focus') {
							$tooltip.focus();
							tipElement.on('keyup', $tooltip.$onKeyUp);
						} else {
							element.on('keyup', $tooltip.$onFocusKeyUp);
						}
					}

				};

				function enterAnimateCallback() {
					scope.$emit(options.prefixEvent + '.show', $tooltip);
				}

				$tooltip.leave = function() {

					clearTimeout(timeout);
					hoverState = 'out';
					if (!options.delay || !options.delay.hide) {
						return $tooltip.hide();
					}
					timeout = setTimeout(function () {
						if (hoverState === 'out') {
							$tooltip.hide();
						}
					}, options.delay.hide);

				};

				$tooltip.hide = function(blur) {

					if(!$tooltip.$isShown) return;
					scope.$emit(options.prefixEvent + '.hide.before', $tooltip);

					// Support v1.3+ $animate
					// https://github.com/angular/angular.js/commit/bf0f5502b1bbfddc5cdd2f138efd9188b8c652a9
					var promise = $animate.leave(tipElement, leaveAnimateCallback);
					if(promise && promise.then) promise.then(leaveAnimateCallback);

					$tooltip.$isShown = scope.$isShown = false;
					scope.$$phase || (scope.$root && scope.$root.$$phase) || scope.$digest();

					// Unbind events
					if(options.keyboard && tipElement !== null) {
						tipElement.off('keyup', $tooltip.$onKeyUp);
					}

				};

				function leaveAnimateCallback() {
					scope.$emit(options.prefixEvent + '.hide', $tooltip);
					// Allow to blur the input when hidden, like when pressing enter key
					if(blur && options.trigger === 'focus') {
						return element[0].blur();
					}
				}

				$tooltip.toggle = function() {
					$tooltip.$isShown ? $tooltip.leave() : $tooltip.enter();
				};

				$tooltip.focus = function() {
					tipElement[0].focus();
				};

				// Protected methods

				$tooltip.$applyPlacement = function() {
					if(!tipElement) return;

					// Get the position of the tooltip element.
					var elementPosition = getPosition();

					// Get the height and width of the tooltip so we can center it.
					var tipWidth = tipElement.prop('offsetWidth'),
						tipHeight = tipElement.prop('offsetHeight');

					// Get the tooltip's top and left coordinates to center it with this directive.
					var tipPosition = getCalculatedOffset(options.placement, elementPosition, tipWidth, tipHeight);

					// Now set the calculated positioning.
					tipPosition.top += 'px';
					tipPosition.left += 'px';
					tipElement.css(tipPosition);

				};

				$tooltip.$onKeyUp = function(evt) {
					if (evt.which === 27 && $tooltip.$isShown) {
						$tooltip.hide();
						evt.stopPropagation();
					}
				};

				$tooltip.$onFocusKeyUp = function(evt) {
					if (evt.which === 27) {
						element[0].blur();
						evt.stopPropagation();
					}
				};

				$tooltip.$onFocusElementMouseDown = function(evt) {
					evt.preventDefault();
					evt.stopPropagation();
					// Some browsers do not auto-focus buttons (eg. Safari)
					$tooltip.$isShown ? element[0].blur() : element[0].focus();
				};

				// Private methods

				function getPosition() {
					if(options.container === 'body') {
						return dimensions.offset(options.target[0] || element[0]);
					} else {
						return dimensions.position(options.target[0] || element[0]);
					}
				}

				function getCalculatedOffset(placement, position, actualWidth, actualHeight) {
					var offset;
					var split = placement.split('-');

					switch (split[0]) {
						case 'right':
							offset = {
								top: position.top + position.height / 2 - actualHeight / 2,
								left: position.left + position.width
							};
							break;
						case 'bottom':
							offset = {
								top: position.top + position.height,
								left: position.left + position.width / 2 - actualWidth / 2
							};
							break;
						case 'left':
							offset = {
								top: position.top + position.height / 2 - actualHeight / 2,
								left: position.left - actualWidth
							};
							break;
						default:
							offset = {
								top: position.top - actualHeight,
								left: position.left + position.width / 2 - actualWidth / 2
							};
							break;
					}

					if(!split[1]) {
						return offset;
					}

					// Add support for corners @todo css
					if(split[0] === 'top' || split[0] === 'bottom') {
						switch (split[1]) {
							case 'left':
								offset.left = position.left;
								break;
							case 'right':
								offset.left =  position.left + position.width - actualWidth;
						}
					} else if(split[0] === 'left' || split[0] === 'right') {
						switch (split[1]) {
							case 'top':
								offset.top = position.top - actualHeight;
								break;
							case 'bottom':
								offset.top = position.top + position.height;
						}
					}

					return offset;
				}

				return $tooltip;

			}

			// Helper functions

			function findElement(query, element) {
				return angular.element((element || document).querySelectorAll(query));
			}

			function fetchTemplate(template) {
				return $q.when($templateCache.get(template) || $http.get(template))
					.then(function(res) {
						if(angular.isObject(res)) {
							$templateCache.put(template, res.data);
							return res.data;
						}
						return res;
					});
			}

			return TooltipFactory;

		};

	})

	.directive('uiTooltip', function($window, $location, $sce, $tooltip, $$rAF) {

		return {
			restrict: 'EAC',
			scope: true,
			link: function postLink(scope, element, attr, transclusion) {

				// Directive options
				var options = {scope: scope};
				angular.forEach(['template', 'contentTemplate', 'placement', 'container', 'target', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'type', 'customClass'], function(key) {
					if(angular.isDefined(attr[key])) options[key] = attr[key];
				});

				// Observe scope attributes for change
				attr.$observe('title', function(newValue, oldValue) {
					scope.title = $sce.trustAsHtml(newValue);
					angular.isDefined(oldValue) && $$rAF(function() {
						tooltip && tooltip.$applyPlacement();
					});
				});

				// Support scope as an object
				attr.uiTooltip && scope.$watch(attr.uiTooltip, function(newValue, oldValue) {
					if(angular.isObject(newValue)) {
						angular.extend(scope, newValue);
					} else {
						scope.title = newValue;
					}
					angular.isDefined(oldValue) && $$rAF(function() {
						tooltip && tooltip.$applyPlacement();
					});
				}, true);

				// Visibility binding support
				attr.uiShow && scope.$watch(attr.uiShow, function(newValue, oldValue) {
					if(!tooltip || !angular.isDefined(newValue)) return;
					if(angular.isString(newValue)) newValue = !!newValue.match(/true|,?(tooltip),?/i);
					newValue === true ? tooltip.show() : tooltip.hide();
				});

				// Initialize popover
				var tooltip = $tooltip(element, options);

				// Garbage collection
				scope.$on('$destroy', function() {
					if(tooltip) tooltip.destroy();
					options = null;
					tooltip = null;
				});

			}
		};

	})

	.run(['$templateCache', function($templateCache) {

		$templateCache.put('tooltip/tooltip.tpl.html', '<div class="tooltip in" ng-show="title"><div class="tooltip-arrow"></div><div class="tooltip-inner" ng-bind="title"></div></div>');

	}]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Typeahead module
 */
'use strict';

angular.module('banki.ui.typeahead', ['banki.ui.tooltip', 'banki.helpers.parseOptions'])

    .provider('$typeahead', function() {

        var defaults = this.defaults = {
            animation: 'am-fade',
            prefixClass: 'typeahead',
            prefixEvent: '$typeahead',
            placement: 'bottom-left',
            template: 'typeahead/typeahead.tpl.html',
            trigger: 'focus',
            container: false,
            keyboard: true,
            html: true,
            delay: 0,
            minLength: 1,
            filter: 'filter',
            limit: 6
        };

        this.$get = function($window, $rootScope, $tooltip) {

            var bodyEl = angular.element($window.document.body);

            function TypeaheadFactory(element, controller, config) {

                var $typeahead = {};

                // Common vars
                var options = angular.extend({}, defaults, config);

                $typeahead = $tooltip(element, options);
                var parentScope = config.scope;
                var scope = $typeahead.$scope;

                scope.$resetMatches = function() {
                    scope.$matches = [];
                    scope.$activeIndex = 0;
                };
                scope.$resetMatches();

                scope.$activate = function(index) {
                    scope.$$postDigest(function() {
                        $typeahead.activate(index);
                    });
                };

                scope.$select = function(index, evt) {
                    scope.$$postDigest(function() {
                        $typeahead.select(index);
                    });
                };

                scope.$isVisible = function() {
                    return $typeahead.$isVisible();
                };

                // Public methods

                $typeahead.update = function(matches) {
                    scope.$matches = matches;
                    if (scope.$activeIndex >= matches.length) {
                        scope.$activeIndex = 0;
                    }
                };

                $typeahead.activate = function(index) {
                    scope.$activeIndex = index;
                };

                $typeahead.select = function(index) {
                    var value = scope.$matches[index].value;
                    controller.$setViewValue(value);
                    controller.$render();
                    scope.$resetMatches();
                    if (parentScope) parentScope.$digest();
                    // Emit event
                    scope.$emit(options.prefixEvent + '.select', value, index);
                };

                // Protected methods

                $typeahead.$isVisible = function() {
                    if (!options.minLength || !controller) {
                        return !!scope.$matches.length;
                    }
                    // minLength support
                    return scope.$matches.length && angular.isString(controller.$viewValue) && controller.$viewValue.length >= options.minLength;
                };

                $typeahead.$getIndex = function(value) {
                    var l = scope.$matches.length,
                        i = l;
                    if (!l) return;
                    for (i = l; i--;) {
                        if (scope.$matches[i].value === value) break;
                    }
                    if (i < 0) return;
                    return i;
                };

                $typeahead.$onMouseDown = function(evt) {
                    // Prevent blur on mousedown
                    evt.preventDefault();
                    evt.stopPropagation();
                };

                $typeahead.$onKeyDown = function(evt) {
                    if (!/(38|40|13)/.test(evt.keyCode)) return;

                    // Let ngSubmit pass if the typeahead tip is hidden
                    if ($typeahead.$isVisible()) {
                        evt.preventDefault();
                        evt.stopPropagation();
                    }

                    // Select with enter
                    if (evt.keyCode === 13 && scope.$matches.length) {
                        $typeahead.select(scope.$activeIndex);
                    }

                    // Navigate with keyboard
                    else if (evt.keyCode === 38 && scope.$activeIndex > 0) scope.$activeIndex--;
                    else if (evt.keyCode === 40 && scope.$activeIndex < scope.$matches.length - 1) scope.$activeIndex++;
                    else if (angular.isUndefined(scope.$activeIndex)) scope.$activeIndex = 0;
                    scope.$digest();
                };

                // Overrides

                var show = $typeahead.show;
                $typeahead.show = function() {
                    show();
                    setTimeout(function() {
                        $typeahead.$element.on('mousedown', $typeahead.$onMouseDown);
                        if (options.keyboard) {
                            element.on('keydown', $typeahead.$onKeyDown);
                        }
                    });
                };

                var hide = $typeahead.hide;
                $typeahead.hide = function() {
                    $typeahead.$element.off('mousedown', $typeahead.$onMouseDown);
                    if (options.keyboard) {
                        element.off('keydown', $typeahead.$onKeyDown);
                    }
                    hide();
                };

                return $typeahead;

            }

            TypeaheadFactory.defaults = defaults;
            return TypeaheadFactory;

        };

    })

    .directive('uiTypeahead', function($window, $parse, $q, $typeahead, $parseOptions) {

        var defaults = $typeahead.defaults;

        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function postLink(scope, element, attr, controller) {

                // Directive options
                var options = {
                    scope: scope
                };
                angular.forEach(['placement', 'container', 'delay', 'trigger', 'keyboard', 'html', 'animation', 'template', 'filter', 'limit', 'minLength', 'watchOptions', 'selectMode'], function(key) {
                    if (angular.isDefined(attr[key])) options[key] = attr[key];
                });

                // Build proper ngOptions
                var filter = options.filter || defaults.filter;
                var limit = options.limit || defaults.limit;
                var ngOptions = attr.ngOptions;
                if (filter) ngOptions += ' | ' + filter + ':$viewValue';
                if (limit) ngOptions += ' | limitTo:' + limit;
                var parsedOptions = $parseOptions(ngOptions);

                // Initialize typeahead
                var typeahead = $typeahead(element, controller, options);

                // Watch options on demand
                if (options.watchOptions) {
                    // Watch ngOptions values before filtering for changes, drop function calls
                    var watchedOptions = parsedOptions.$match[7].replace(/\|.+/, '').replace(/\(.*\)/g, '').trim();
                    scope.$watch(watchedOptions, function(newValue, oldValue) {
                        // console.warn('scope.$watch(%s)', watchedOptions, newValue, oldValue);
                        parsedOptions.valuesFn(scope, controller).then(function(values) {
                            typeahead.update(values);
                            controller.$render();
                        });
                    }, true);
                }

                // Watch model for changes
                scope.$watch(attr.ngModel, function(newValue, oldValue) {
                    // console.warn('$watch', element.attr('ng-model'), newValue);
                    scope.$modelValue = newValue; // Publish modelValue on scope for custom templates
                    parsedOptions.valuesFn(scope, controller)
                        .then(function(values) {
                            // Prevent input with no future prospect if selectMode is truthy
                            // @TODO test selectMode
                            if (options.selectMode && !values.length && newValue.length > 0) {
                                controller.$setViewValue(controller.$viewValue.substring(0, controller.$viewValue.length - 1));
                                return;
                            }
                            if (values.length > limit) values = values.slice(0, limit);
                            var isVisible = typeahead.$isVisible();
                            isVisible && typeahead.update(values);
                            // Do not re-queue an update if a correct value has been selected
                            if (values.length === 1 && values[0].value === newValue) return;
                            !isVisible && typeahead.update(values);
                            // Queue a new rendering that will leverage collection loading
                            controller.$render();
                        });
                });

                // Model rendering in view
                controller.$render = function() {
                    // console.warn('$render', element.attr('ng-model'), 'controller.$modelValue', typeof controller.$modelValue, controller.$modelValue, 'controller.$viewValue', typeof controller.$viewValue, controller.$viewValue);
                    if (controller.$isEmpty(controller.$viewValue)) return element.val('');
                    var index = typeahead.$getIndex(controller.$modelValue);
                    var selected = angular.isDefined(index) ? typeahead.$scope.$matches[index].label : controller.$viewValue;
                    selected = angular.isObject(selected) ? selected.label : selected;
                    element.val(selected ? selected.replace(/<(?:.|\n)*?>/gm, '').trim() : '');
                };

                // Garbage collection
                scope.$on('$destroy', function() {
                    if (typeahead) typeahead.destroy();
                    options = null;
                    typeahead = null;
                });

            }
        };

    })

    .run(['$templateCache', function($templateCache) {

        $templateCache.put('typeahead/typeahead.tpl.html', '<ul tabindex="-1" class="typeahead dropdown-menu" ng-show="$isVisible()" role="select"><li role="presentation" ng-repeat="match in $matches" ng-class="{active: $index == $activeIndex}"><a role="menuitem" tabindex="-1" ng-click="$select($index, $event)" ng-bind="match.label"></a></li></ul>');

    }]);


'use strict';

angular.module('banki.helpers.dateParser', [])

	.provider('$dateParser', function($localeProvider) {

		// define a custom ParseDate object to use instead of native Date
		// to avoid date values wrapping when setting date component values
		function ParseDate() {
			this.year = 1970;
			this.month = 0;
			this.day = 1;
			this.hours = 0;
			this.minutes = 0;
			this.seconds = 0;
			this.milliseconds = 0;
		}

		ParseDate.prototype.setMilliseconds = function(value) {
			this.milliseconds = value;
		};
		ParseDate.prototype.setSeconds = function(value) {
			this.seconds = value;
		};
		ParseDate.prototype.setMinutes = function(value) {
			this.minutes = value;
		};
		ParseDate.prototype.setHours = function(value) {
			this.hours = value;
		};
		ParseDate.prototype.getHours = function() {
			return this.hours;
		};
		ParseDate.prototype.setDate = function(value) {
			this.day = value;
		};
		ParseDate.prototype.setMonth = function(value) {
			this.month = value;
		};
		ParseDate.prototype.setFullYear = function(value) {
			this.year = value;
		};
		ParseDate.prototype.fromDate = function(value) {
			this.year = value.getFullYear();
			this.month = value.getMonth();
			this.day = value.getDate();
			this.hours = value.getHours();
			this.minutes = value.getMinutes();
			this.seconds = value.getSeconds();
			this.milliseconds = value.getMilliseconds();
			return this;
		};

		ParseDate.prototype.toDate = function() {
			return new Date(this.year, this.month, this.day, this.hours, this.minutes, this.seconds, this.milliseconds);
		};

		var proto = ParseDate.prototype;

		function noop() {}

		function isNumeric(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}

		function indexOfCaseInsensitive(array, value) {
			var len = array.length,
				str = value.toString().toLowerCase();
			for (var i = 0; i < len; i++) {
				if (array[i].toLowerCase() === str) {
					return i;
				}
			}
			return -1; // Return -1 per the "Array.indexOf()" method.
		}

		var defaults = this.defaults = {
			format: 'shortDate',
			strict: false
		};

		this.$get = function($locale, dateFilter) {

			var DateParserFactory = function(config) {

				var options = angular.extend({}, defaults, config);

				var $dateParser = {};

				var regExpMap = {
					'sss': '[0-9]{3}',
					'ss': '[0-5][0-9]',
					's': options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
					'mm': '[0-5][0-9]',
					'm': options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
					'HH': '[01][0-9]|2[0-3]',
					'H': options.strict ? '1?[0-9]|2[0-3]' : '[01]?[0-9]|2[0-3]',
					'hh': '[0][1-9]|[1][012]',
					'h': options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
					'a': 'AM|PM',
					'EEEE': $locale.DATETIME_FORMATS.DAY.join('|'),
					'EEE': $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
					'dd': '0[1-9]|[12][0-9]|3[01]',
					'd': options.strict ? '[1-9]|[1-2][0-9]|3[01]' : '0?[1-9]|[1-2][0-9]|3[01]',
					'MMMM': $locale.DATETIME_FORMATS.MONTH.join('|'),
					'MMM': $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
					'MM': '0[1-9]|1[012]',
					'M': options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
					'yyyy': '[1]{1}[0-9]{3}|[2]{1}[0-9]{3}',
					'yy': '[0-9]{2}',
					'y': options.strict ? '-?(0|[1-9][0-9]{0,3})' : '-?0*[0-9]{1,4}',
				};

				var setFnMap = {
					'sss': proto.setMilliseconds,
					'ss': proto.setSeconds,
					's': proto.setSeconds,
					'mm': proto.setMinutes,
					'm': proto.setMinutes,
					'HH': proto.setHours,
					'H': proto.setHours,
					'hh': proto.setHours,
					'h': proto.setHours,
					'EEEE': noop,
					'EEE': noop,
					'dd': proto.setDate,
					'd': proto.setDate,
					'a': function(value) {
						var hours = this.getHours() % 12;
						return this.setHours(value.match(/pm/i) ? hours + 12 : hours);
					},
					'MMMM': function(value) {
						return this.setMonth(indexOfCaseInsensitive($locale.DATETIME_FORMATS.MONTH, value));
					},
					'MMM': function(value) {
						return this.setMonth(indexOfCaseInsensitive($locale.DATETIME_FORMATS.SHORTMONTH, value));
					},
					'MM': function(value) {
						return this.setMonth(1 * value - 1);
					},
					'M': function(value) {
						return this.setMonth(1 * value - 1);
					},
					'yyyy': proto.setFullYear,
					'yy': function(value) {
						return this.setFullYear(2000 + 1 * value);
					},
					'y': proto.setFullYear
				};

				var regex, setMap;

				$dateParser.init = function() {
					$dateParser.$format = $locale.DATETIME_FORMATS[options.format] || options.format;
					regex = regExpForFormat($dateParser.$format);
					setMap = setMapForFormat($dateParser.$format);
				};

				$dateParser.isValid = function(date) {
					if (angular.isDate(date)) return !isNaN(date.getTime());
					return regex.test(date);
				};

				$dateParser.parse = function(value, baseDate, format) {
					if (angular.isDate(value)) value = dateFilter(value, format || $dateParser.$format);
					var formatRegex = format ? regExpForFormat(format) : regex;
					var formatSetMap = format ? setMapForFormat(format) : setMap;
					var matches = formatRegex.exec(value);
					if (!matches) return false;
					// use custom ParseDate object to set parsed values
					var date = baseDate && !isNaN(baseDate.getTime()) ? new ParseDate().fromDate(baseDate) : new ParseDate().fromDate(new Date(1970, 0, 1, 0));
					for (var i = 0; i < matches.length - 1; i++) {
						formatSetMap[i] && formatSetMap[i].call(date, matches[i + 1]);
					}
					// convert back to native Date object
					return date.toDate();
				};

				$dateParser.getDateForAttribute = function(key, value) {
					var date;

					if (value === 'today') {
						var today = new Date();
						date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (key === 'maxDate' ? 1 : 0), 0, 0, 0, (key === 'minDate' ? 0 : -1));
					} else if (angular.isString(value) && value.match(/^".+"$/)) { // Support {{ dateObj }}
						date = new Date(value.substr(1, value.length - 2));
					} else if (isNumeric(value)) {
						date = new Date(parseInt(value, 10));
					} else if (angular.isString(value) && 0 === value.length) { // Reset date
						date = key === 'minDate' ? -Infinity : +Infinity;
					} else {
						date = new Date(value);
					}

					return date;
				};

				$dateParser.getTimeForAttribute = function(key, value) {
					var time;

					if (value === 'now') {
						time = new Date().setFullYear(1970, 0, 1);
					} else if (angular.isString(value) && value.match(/^".+"$/)) {
						time = new Date(value.substr(1, value.length - 2));
					} else if (isNumeric(value)) {
						time = new Date(parseInt(value, 10));
					} else if (angular.isString(value) && 0 === value.length) { // Reset time
						time = key === 'minTime' ? -Infinity : +Infinity;
					} else {
						time = $dateParser.parse(value, new Date(1970, 0, 1, 0));
					}

					return time;
				};

				// Private functions

				function setMapForFormat(format) {
					var keys = Object.keys(setFnMap),
						i;
					var map = [],
						sortedMap = [];
					// Map to setFn
					var clonedFormat = format;
					for (i = 0; i < keys.length; i++) {
						if (format.split(keys[i]).length > 1) {
							var index = clonedFormat.search(keys[i]);
							format = format.split(keys[i]).join('');
							if (setFnMap[keys[i]]) {
								map[index] = setFnMap[keys[i]];
							}
						}
					}
					// Sort result map
					angular.forEach(map, function(v) {
						// conditional required since angular.forEach broke around v1.2.21
						// related pr: https://github.com/angular/angular.js/pull/8525
						if (v) sortedMap.push(v);
					});
					return sortedMap;
				}

				function escapeReservedSymbols(text) {
					return text.replace(/\//g, '[\\/]').replace('/-/g', '[-]').replace(/\./g, '[.]').replace(/\\s/g, '[\\s]');
				}

				function regExpForFormat(format) {
					var keys = Object.keys(regExpMap),
						i;

					var re = format;
					// Abstract replaces to avoid collisions
					for (i = 0; i < keys.length; i++) {
						re = re.split(keys[i]).join('${' + i + '}');
					}
					// Replace abstracted values
					for (i = 0; i < keys.length; i++) {
						re = re.split('${' + i + '}').join('(' + regExpMap[keys[i]] + ')');
					}
					format = escapeReservedSymbols(format);

					return new RegExp('^' + re + '$', ['i']);
				}

				$dateParser.init();
				return $dateParser;

			};

			return DateParserFactory;

		};

	});


'use strict';

angular.module('banki.helpers.dimensions', [])

	.factory('dimensions', function($document, $window) {

		var jqLite = angular.element;
		var fn = {};

		/**
		 * Test the element nodeName
		 * @param element
		 * @param name
		 */
		var nodeName = fn.nodeName = function(element, name) {
			return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
		};

		/**
		 * Returns the element computed style
		 * @param element
		 * @param prop
		 * @param extra
		 */
		fn.css = function(element, prop, extra) {
			var value;
			if (element.currentStyle) { //IE
				value = element.currentStyle[prop];
			} else if (window.getComputedStyle) {
				value = window.getComputedStyle(element)[prop];
			} else {
				value = element.style[prop];
			}
			return extra === true ? parseFloat(value) || 0 : value;
		};

		/**
		 * Provides read-only equivalent of jQuery's offset function:
		 * @required-by bootstrap-tooltip, bootstrap-affix
		 * @url http://api.jquery.com/offset/
		 * @param element
		 */
		fn.offset = function(element) {
			var boxRect = element.getBoundingClientRect();
			var docElement = element.ownerDocument;
			return {
				width: boxRect.width || element.offsetWidth,
				height: boxRect.height || element.offsetHeight,
				top: boxRect.top + (window.pageYOffset || docElement.documentElement.scrollTop) - (docElement.documentElement.clientTop || 0),
				left: boxRect.left + (window.pageXOffset || docElement.documentElement.scrollLeft) - (docElement.documentElement.clientLeft || 0)
			};
		};

		/**
		 * Provides read-only equivalent of jQuery's position function
		 * @required-by bootstrap-tooltip, bootstrap-affix
		 * @url http://api.jquery.com/offset/
		 * @param element
		 */
		fn.position = function(element) {

			var offsetParentRect = {
					top: 0,
					left: 0
				},
				offsetParentElement,
				offset;

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
			if (fn.css(element, 'position') === 'fixed') {

				// We assume that getBoundingClientRect is available when computed position is fixed
				offset = element.getBoundingClientRect();

			} else {

				// Get *real* offsetParentElement
				offsetParentElement = offsetParent(element);
				offset = fn.offset(element);

				// Get correct offsets
				offset = fn.offset(element);
				if (!nodeName(offsetParentElement, 'html')) {
					offsetParentRect = fn.offset(offsetParentElement);
				}

				// Add offsetParent borders
				offsetParentRect.top += fn.css(offsetParentElement, 'borderTopWidth', true);
				offsetParentRect.left += fn.css(offsetParentElement, 'borderLeftWidth', true);
			}

			// Subtract parent offsets and element margins
			return {
				width: element.offsetWidth,
				height: element.offsetHeight,
				top: offset.top - offsetParentRect.top - fn.css(element, 'marginTop', true),
				left: offset.left - offsetParentRect.left - fn.css(element, 'marginLeft', true)
			};

		};

		/**
		 * Returns the closest, non-statically positioned offsetParent of a given element
		 * @required-by fn.position
		 * @param element
		 */
		var offsetParent = function offsetParentElement(element) {
			var docElement = element.ownerDocument;
			var offsetParent = element.offsetParent || docElement;
			if (nodeName(offsetParent, '#document')) return docElement.documentElement;
			while (offsetParent && !nodeName(offsetParent, 'html') && fn.css(offsetParent, 'position') === 'static') {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || docElement.documentElement;
		};

		/**
		 * Provides equivalent of jQuery's height function
		 * @required-by bootstrap-affix
		 * @url http://api.jquery.com/height/
		 * @param element
		 * @param outer
		 */
		fn.height = function(element, outer) {
			var value = element.offsetHeight;
			if (outer) {
				value += fn.css(element, 'marginTop', true) + fn.css(element, 'marginBottom', true);
			} else {
				value -= fn.css(element, 'paddingTop', true) + fn.css(element, 'paddingBottom', true) + fn.css(element, 'borderTopWidth', true) + fn.css(element, 'borderBottomWidth', true);
			}
			return value;
		};

		/**
		 * Provides equivalent of jQuery's width function
		 * @required-by bootstrap-affix
		 * @url http://api.jquery.com/width/
		 * @param element
		 * @param outer
		 */
		fn.width = function(element, outer) {
			var value = element.offsetWidth;
			if (outer) {
				value += fn.css(element, 'marginLeft', true) + fn.css(element, 'marginRight', true);
			} else {
				value -= fn.css(element, 'paddingLeft', true) + fn.css(element, 'paddingRight', true) + fn.css(element, 'borderLeftWidth', true) + fn.css(element, 'borderRightWidth', true);
			}
			return value;
		};

		return fn;

	});


'use strict';

angular.module('banki.helpers.parseOptions', [])

    .provider('$parseOptions', function() {

        var defaults = this.defaults = {
            regexp: /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/
        };

        this.$get = function($parse, $q) {

            function ParseOptionsFactory(attr, config) {

                var $parseOptions = {};

                // Common vars
                var options = angular.extend({}, defaults, config);
                $parseOptions.$values = [];

                // Private vars
                var match, displayFn, valueName, keyName, groupByFn, valueFn, valuesFn;

                $parseOptions.init = function() {
                    $parseOptions.$match = match = attr.match(options.regexp);
                    displayFn = $parse(match[2] || match[1]),
                        valueName = match[4] || match[6],
                        keyName = match[5],
                        groupByFn = $parse(match[3] || ''),
                        valueFn = $parse(match[2] ? match[1] : valueName),
                        valuesFn = $parse(match[7]);
                };

                $parseOptions.valuesFn = function(scope, controller) {
                    return $q.when(valuesFn(scope, controller))
                        .then(function(values) {
                            $parseOptions.$values = values ? parseValues(values, scope) : {};
                            return $parseOptions.$values;
                        });
                };

                // Private functions

                function parseValues(values, scope) {
                    return values.map(function(match, index) {
                        var locals = {}, label, value;
                        locals[valueName] = match;
                        label = displayFn(scope, locals);
                        value = valueFn(scope, locals) || index;
                        return {
                            label: label,
                            value: value,
                            index: index
                        };
                    });
                }

                $parseOptions.init();
                return $parseOptions;

            }

            return ParseOptionsFactory;

        };

    });


'use strict';


angular
	.module('dashboard')
	.directive('uiThumb', ['$window',
		function($window) {
			var helper = {
				support: !! ($window.FileReader && $window.CanvasRenderingContext2D),
				isFile: function(item) {
					return angular.isObject(item) && item instanceof $window.File;
				},
				isImage: function(file) {
					var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
					return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
				}
			};

			return {
				restrict: 'A',
				template: '<canvas/>',
				link: function(scope, element, attributes) {
					if (!helper.support) return;

					var params = scope.$eval(attributes.uiThumb);

					if (!helper.isFile(params.file)) return;
					if (!helper.isImage(params.file)) return;

					var canvas = element.find('canvas');
					var reader = new FileReader();

					reader.onload = onLoadFile;
					reader.readAsDataURL(params.file);

					function onLoadFile(event) {
						var img = new Image();
						img.onload = onLoadImage;
						img.src = event.target.result;
					}

					function onLoadImage() {
						var width = params.width || this.width / this.height * params.height;
						var height = params.height || this.height / this.width * params.width;
						canvas.attr({
							width: width,
							height: height
						});
						canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
					}
				}
			};
		}
	]);



/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Attaches input mask onto input element
 */
'use strict';

angular.module('ui.mask', [])
	.value('uiMaskConfig', {
		'maskDefinitions': {
			'9': /\d/,
			'A': /[a-zA-Z]/,
			'*': /[a-zA-Z0-9]/
		}
	})
	.directive('uiMask', ['uiMaskConfig', '$parse',
		function(maskConfig, $parse) {
			return {
				priority: 100,
				require: 'ngModel',
				restrict: 'A',
				compile: function uiMaskCompilingFunction() {
					var options = maskConfig;

					return function uiMaskLinkingFunction(scope, iElement, iAttrs, controller) {
						var maskProcessed = false,
							eventsBound = false,
							maskCaretMap, maskPatterns, maskPlaceholder, maskComponents,
						// Minimum required length of the value to be considered valid
							minRequiredLength,
							value, valueMasked, isValid,
						// Vars for initializing/uninitializing
							originalPlaceholder = iAttrs.placeholder,
							originalMaxlength = iAttrs.maxlength,
						// Vars used exclusively in eventHandler()
							oldValue, oldValueUnmasked, oldCaretPosition, oldSelectionLength;

						function initialize(maskAttr) {
							if (!angular.isDefined(maskAttr)) {
								return uninitialize();
							}
							processRawMask(maskAttr);
							if (!maskProcessed) {
								return uninitialize();
							}
							initializeElement();
							bindEventListeners();
							return true;
						}

						function initPlaceholder(placeholderAttr) {
							if (!angular.isDefined(placeholderAttr)) {
								return;
							}

							maskPlaceholder = placeholderAttr;

							// If the mask is processed, then we need to update the value
							if (maskProcessed) {
								eventHandler();
							}
						}

						function formatter(fromModelValue) {
							if (!maskProcessed) {
								return fromModelValue;
							}
							value = unmaskValue(fromModelValue || '');
							isValid = validateValue(value);
							controller.$setValidity('mask', isValid);
							return isValid && value.length ? maskValue(value) : undefined;
						}

						function parser(fromViewValue) {
							if (!maskProcessed) {
								return fromViewValue;
							}
							value = unmaskValue(fromViewValue || '');
							isValid = validateValue(value);
							// We have to set viewValue manually as the reformatting of the input
							// value performed by eventHandler() doesn't happen until after
							// this parser is called, which causes what the user sees in the input
							// to be out-of-sync with what the controller's $viewValue is set to.
							controller.$viewValue = value.length ? maskValue(value) : '';
							controller.$setValidity('mask', isValid);
							if (value === '' && iAttrs.required) {
								controller.$setValidity('required', false);
							}
							return isValid ? value : undefined;
						}

						var linkOptions = {};

						if (iAttrs.uiOptions) {
							linkOptions = scope.$eval('[' + iAttrs.uiOptions + ']');
							if (angular.isObject(linkOptions[0])) {
								// we can't use angular.copy nor angular.extend, they lack the power to do a deep merge
								linkOptions = (function(original, current) {
									for (var i in original) {
										if (Object.prototype.hasOwnProperty.call(original, i)) {
											if (!current[i]) {
												current[i] = angular.copy(original[i]);
											} else {
												angular.extend(current[i], original[i]);
											}
										}
									}
									return current;
								})(options, linkOptions[0]);
							}
						} else {
							linkOptions = options;
						}

						iAttrs.$observe('uiMask', initialize);
						iAttrs.$observe('placeholder', initPlaceholder);
						var modelViewValue = false;
						iAttrs.$observe('modelViewValue', function(val) {
							if (val === 'true') {
								modelViewValue = true;
							}
						});
						scope.$watch(iAttrs.ngModel, function(val) {
							if (modelViewValue && val) {
								var model = $parse(iAttrs.ngModel);
								model.assign(scope, controller.$viewValue);
							}
						});
						controller.$formatters.push(formatter);
						controller.$parsers.push(parser);

						function uninitialize() {
							maskProcessed = false;
							unbindEventListeners();

							if (angular.isDefined(originalPlaceholder)) {
								iElement.attr('placeholder', originalPlaceholder);
							} else {
								iElement.removeAttr('placeholder');
							}

							if (angular.isDefined(originalMaxlength)) {
								iElement.attr('maxlength', originalMaxlength);
							} else {
								iElement.removeAttr('maxlength');
							}

							iElement.val(controller.$modelValue);
							controller.$viewValue = controller.$modelValue;
							return false;
						}

						function initializeElement() {
							value = oldValueUnmasked = unmaskValue(controller.$modelValue || '');
							valueMasked = oldValue = maskValue(value);
							isValid = validateValue(value);
							var viewValue = isValid && value.length ? valueMasked : '';
							if (iAttrs.maxlength) { // Double maxlength to allow pasting new val at end of mask
								iElement.attr('maxlength', maskCaretMap[maskCaretMap.length - 1] * 2);
							}
							iElement.attr('placeholder', maskPlaceholder);
							iElement.val(viewValue);
							controller.$viewValue = viewValue;
							// Not using $setViewValue so we don't clobber the model value and dirty the form
							// without any kind of user interaction.
						}

						function bindEventListeners() {
							if (eventsBound) {
								return;
							}
							iElement.bind('blur', blurHandler);
							iElement.bind('mousedown mouseup', mouseDownUpHandler);
							iElement.bind('input keyup click focus', eventHandler);
							eventsBound = true;
						}

						function unbindEventListeners() {
							if (!eventsBound) {
								return;
							}
							iElement.unbind('blur', blurHandler);
							iElement.unbind('mousedown', mouseDownUpHandler);
							iElement.unbind('mouseup', mouseDownUpHandler);
							iElement.unbind('input', eventHandler);
							iElement.unbind('keyup', eventHandler);
							iElement.unbind('click', eventHandler);
							iElement.unbind('focus', eventHandler);
							eventsBound = false;
						}

						function validateValue(value) {
							// Zero-length value validity is ngRequired's determination
							return value.length ? value.length >= minRequiredLength : true;
						}

						function unmaskValue(value) {
							var valueUnmasked = '',
								maskPatternsCopy = maskPatterns.slice();
							// Preprocess by stripping mask components from value
							value = value.toString();
							angular.forEach(maskComponents, function(component) {
								value = value.replace(component, '');
							});
							angular.forEach(value.split(''), function(chr) {
								if (maskPatternsCopy.length && maskPatternsCopy[0].test(chr)) {
									valueUnmasked += chr;
									maskPatternsCopy.shift();
								}
							});
							return valueUnmasked;
						}

						function maskValue(unmaskedValue) {
							var valueMasked = '',
								maskCaretMapCopy = maskCaretMap.slice();

							angular.forEach(maskPlaceholder.split(''), function(chr, i) {
								if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
									valueMasked += unmaskedValue.charAt(0) || '_';
									unmaskedValue = unmaskedValue.substr(1);
									maskCaretMapCopy.shift();
								} else {
									valueMasked += chr;
								}
							});
							return valueMasked;
						}

						function getPlaceholderChar(i) {
							var placeholder = iAttrs.placeholder;

							if (typeof placeholder !== 'undefined' && placeholder[i]) {
								return placeholder[i];
							} else {
								return '_';
							}
						}

						// Generate array of mask components that will be stripped from a masked value
						// before processing to prevent mask components from being added to the unmasked value.
						// E.g., a mask pattern of '+7 9999' won't have the 7 bleed into the unmasked value.
						// If a maskable char is followed by a mask char and has a mask
						// char behind it, we'll split it into it's own component so if
						// a user is aggressively deleting in the input and a char ahead
						// of the maskable char gets deleted, we'll still be able to strip
						// it in the unmaskValue() preprocessing.

						function getMaskComponents() {
							return maskPlaceholder.replace(/[_]+/g, '_').replace(/([^_]+)([a-zA-Z0-9])([^_])/g, '$1$2_$3').split('_');
						}

						function processRawMask(mask) {
							var characterCount = 0;

							maskCaretMap = [];
							maskPatterns = [];
							maskPlaceholder = '';

							if (typeof mask === 'string') {
								minRequiredLength = 0;

								var isOptional = false,
									splitMask = mask.split('');

								angular.forEach(splitMask, function(chr, i) {
									if (linkOptions.maskDefinitions[chr]) {

										maskCaretMap.push(characterCount);

										maskPlaceholder += getPlaceholderChar(i);
										maskPatterns.push(linkOptions.maskDefinitions[chr]);

										characterCount++;
										if (!isOptional) {
											minRequiredLength++;
										}
									} else if (chr === '?') {
										isOptional = true;
									} else {
										maskPlaceholder += chr;
										characterCount++;
									}
								});
							}
							// Caret position immediately following last position is valid.
							maskCaretMap.push(maskCaretMap.slice().pop() + 1);

							maskComponents = getMaskComponents();
							maskProcessed = maskCaretMap.length > 1 ? true : false;
						}

						function blurHandler() {
							oldCaretPosition = 0;
							oldSelectionLength = 0;
							if (!isValid || value.length === 0) {
								valueMasked = '';
								iElement.val('');
								scope.$apply(function() {
									controller.$setViewValue('');
								});
							}
						}

						function mouseDownUpHandler(e) {
							if (e.type === 'mousedown') {
								iElement.bind('mouseout', mouseoutHandler);
							} else {
								iElement.unbind('mouseout', mouseoutHandler);
							}
						}

						iElement.bind('mousedown mouseup', mouseDownUpHandler);

						function mouseoutHandler() {
							/*jshint validthis: true */
							oldSelectionLength = getSelectionLength(this);
							iElement.unbind('mouseout', mouseoutHandler);
						}

						function eventHandler(e) {
							/*jshint validthis: true */
							e = e || {};
							// Allows more efficient minification
							var eventWhich = e.which,
								eventType = e.type;

							// Prevent shift and ctrl from mucking with old values
							if (eventWhich === 16 || eventWhich === 91) {
								return;
							}

							var val = iElement.val(),
								valOld = oldValue,
								valMasked,
								valUnmasked = unmaskValue(val),
								valUnmaskedOld = oldValueUnmasked,
								valAltered = false,

								caretPos = getCaretPosition(this) || 0,
								caretPosOld = oldCaretPosition || 0,
								caretPosDelta = caretPos - caretPosOld,
								caretPosMin = maskCaretMap[0],
								caretPosMax = maskCaretMap[valUnmasked.length] || maskCaretMap.slice().shift(),

								selectionLenOld = oldSelectionLength || 0,
								isSelected = getSelectionLength(this) > 0,
								wasSelected = selectionLenOld > 0,

							// Case: Typing a character to overwrite a selection
								isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld),
							// Case: Delete and backspace behave identically on a selection
								isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld),
								isSelection = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey, // Arrow key codes

								isKeyLeftArrow = eventWhich === 37,
							// Necessary due to "input" event not providing a key code
								isKeyBackspace = eventWhich === 8 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === -1)),
								isKeyDelete = eventWhich === 46 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === 0) && !wasSelected),

							// Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
							// ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
							// non-mask character. Also applied to click since users are (arguably) more likely to backspace
							// a character when clicking within a filled input.
								caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;

							oldSelectionLength = getSelectionLength(this);

							// These events don't require any action
							if (isSelection || (isSelected && (eventType === 'click' || eventType === 'keyup'))) {
								return;
							}

							// Value Handling
							// ==============

							// User attempted to delete but raw value was unaffected--correct this grievous offense
							if ((eventType === 'input') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
								while (isKeyBackspace && caretPos > caretPosMin && !isValidCaretPosition(caretPos)) {
									caretPos--;
								}
								while (isKeyDelete && caretPos < caretPosMax && maskCaretMap.indexOf(caretPos) === -1) {
									caretPos++;
								}
								var charIndex = maskCaretMap.indexOf(caretPos);
								// Strip out non-mask character that user would have deleted if mask hadn't been in the way.
								valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
								valAltered = true;
							}

							// Update values
							valMasked = maskValue(valUnmasked);

							oldValue = valMasked;
							oldValueUnmasked = valUnmasked;
							iElement.val(valMasked);
							if (valAltered) {
								// We've altered the raw value after it's been $digest'ed, we need to $apply the new value.
								scope.$apply(function() {
									controller.$setViewValue(valUnmasked);
								});
							}

							// Caret Repositioning
							// ===================

							// Ensure that typing always places caret ahead of typed character in cases where the first char of
							// the input is a mask char and the caret is placed at the 0 position.
							if (isAddition && (caretPos <= caretPosMin)) {
								caretPos = caretPosMin + 1;
							}

							if (caretBumpBack) {
								caretPos--;
							}

							// Make sure caret is within min and max position limits
							caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;

							// Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
							while (!isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
								caretPos += caretBumpBack ? -1 : 1;
							}

							if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !isValidCaretPosition(caretPosOld))) {
								caretPos++;
							}
							oldCaretPosition = caretPos;
							setCaretPosition(this, caretPos);
						}

						function isValidCaretPosition(pos) {
							return maskCaretMap.indexOf(pos) > -1;
						}

						function getCaretPosition(input) {
							if (!input) return 0;
							if (input.selectionStart !== undefined) {
								return input.selectionStart;
							} else if (document.selection) {
								// Curse you IE
								input.focus();
								var selection = document.selection.createRange();
								selection.moveStart('character', input.value ? -input.value.length : 0);
								return selection.text.length;
							}
							return 0;
						}

						function setCaretPosition(input, pos) {
							if (!input) return 0;
							if (input.offsetWidth === 0 || input.offsetHeight === 0) {
								return; // Input's hidden
							}
							if (input.setSelectionRange) {
								input.focus();
								input.setSelectionRange(pos, pos);
							} else if (input.createTextRange) {
								// Curse you IE
								var range = input.createTextRange();
								range.collapse(true);
								range.moveEnd('character', pos);
								range.moveStart('character', pos);
								range.select();
							}
						}

						function getSelectionLength(input) {
							if (!input) return 0;
							if (input.selectionStart !== undefined) {
								return (input.selectionEnd - input.selectionStart);
							}
							if (document.selection) {
								return (document.selection.createRange().text.length);
							}
							return 0;
						}

						// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
						if (!Array.prototype.indexOf) {
							Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {
								if (this === null) {
									throw new TypeError();
								}
								var t = Object(this);
								var len = t.length >>> 0;
								if (len === 0) {
									return -1;
								}
								var n = 0;
								if (arguments.length > 1) {
									n = Number(arguments[1]);
									if (n !== n) { // shortcut for verifying if it's NaN
										n = 0;
									} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
										n = (n > 0 || -1) * Math.floor(Math.abs(n));
									}
								}
								if (n >= len) {
									return -1;
								}
								var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
								for (; k < len; k++) {
									if (k in t && t[k] === searchElement) {
										return k;
									}
								}
								return -1;
							};
						}

					};
				}
			};
		}
	]);