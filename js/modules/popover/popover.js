
/**
 * banki-angular-ui
 * @author Maxim Denisov
 * @description Tooltip module
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