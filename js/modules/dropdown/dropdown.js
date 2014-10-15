
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