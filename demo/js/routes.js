var TrNgGridDemo;
(function (TrNgGridDemo) {
    var allConfigurations = {
        "release": {
            name: "release",
            fullName: "trNgGrid v3.0.5 RC",
            titleCssClass: "text-success"
        }
    };
    angular.module("trNgGridDemo", ["ui.router", "ngRoute", "oc.lazyLoad"]).config([
        "$stateProvider",
        "$urlRouterProvider",
        "$locationProvider",
        function ($stateProvider, $urlRouterProvider, $location) {
            $urlRouterProvider.otherwise("/Unknown");
            $stateProvider.state("demo", {
                url: '?isFrame&theme&themeVersion',
                abstract: true,
                templateUrl: '../demo/demo.html',
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        '$stateParams',
                        '$location',
                        function ($ocLazyLoad, $stateParams, $location) {
                            var configuration = $location.absUrl().indexOf("/release/") >= 0 ? "release" : $location.absUrl().indexOf("/beta/") >= 0 ? "beta" : "alpha";
                            var theme = $stateParams["theme"] || "slate";
                            var themeVersion = $stateParams["themeVersion"] || "3.3.0";
                            $stateParams["theme"] = theme;
                            $stateParams["themeVersion"] = themeVersion;
                            $stateParams["configuration"] = configuration;
                            return $ocLazyLoad.load([
                                {
                                    name: 'trNgGrid',
                                    files: [
                                        '../' + configuration + '/trNgGrid.js',
                                        '../' + configuration + '/trNgGrid.css'
                                    ],
                                },
                                {
                                    name: 'trNgGridDemo',
                                    files: [
                                        '../demo/css/index.css',
                                        '../demo/js/demo.js',
                                        '../demo/js/benchmark.js',
                                        '../demo/js/test_hybrid_mode.js',
                                        '../demo/js/translations.js'
                                    ],
                                },
                                {
                                    name: 'ui.bootstrap',
                                    files: [
                                        '//necolas.github.io/normalize.css/latest/normalize.css',
                                        '//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap.js',
                                        '//google-code-prettify.googlecode.com/svn/loader/prettify.js',
                                        '//google-code-prettify.googlecode.com/svn/loader/prettify.css',
                                        '//maxcdn.bootstrapcdn.com/bootswatch/' + themeVersion + '/' + theme + '/bootstrap.min.css'
                                    ],
                                }
                            ]);
                        }
                    ]
                },
                controller: [
                    '$scope',
                    '$stateParams',
                    '$state',
                    '$window',
                    '$timeout',
                    function ($scope, $stateParams, $state, $window, $timeout) {
                        var stateChangeDereg = $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                            var templateStateRegex = /^demo\.customizations\.global.*/gi;
                            if ((fromState.name != toState.name && fromState.name != "" && (fromState.name.match(templateStateRegex) || toState.name.match(templateStateRegex))) || (fromParams["theme"] && fromParams["theme"] != toParams["theme"]) || (fromParams["themeVersion"] && fromParams["themeVersion"] != toParams["themeVersion"]) || (fromParams["configuration"] && fromParams["configuration"] != toParams["configuration"])) {
                                $window.location.reload();
                            }
                        });
                        $scope.isFrame = !!$stateParams["isFrame"];
                        $scope.configurations = allConfigurations;
                        $scope.currentConfiguration = $scope.configurations[$stateParams["configuration"]];
                        $scope.theme = $stateParams["theme"];
                        $scope.themeVersion = $stateParams["themeVersion"];
                        $scope.changeTheme = function (theme) {
                            $state.go(".", {
                                theme: theme
                            }, {});
                        };
                        $scope.changeThemeVersion = function (themeVersion) {
                            $state.go(".", {
                                themeVersion: themeVersion,
                                theme: 'slate'
                            }, {});
                        };
                    }
                ]
            }).state("demo.default", {
                url: '',
                views: {
                    '': {
                        templateUrl: '../demo/html/default.html'
                    },
                    'relNotes@demo.default': {
                        templateUrl: 'relnotes.html'
                    }
                }
            }).state("demo.common", {
                url: '/Common',
                templateUrl: '../demo/html/common.html'
            }).state("demo.unknown", {
                url: '/Unknown',
                template: '<div>Sorry, I didn\'t understand that.</div>'
            }).state('demo.columns', {
                url: '/Columns',
                templateUrl: '../demo/html/columns.html'
            }).state('demo.paging', {
                url: '/Paging',
                templateUrl: '../demo/html/paging.html'
            }).state('demo.selections', {
                url: '/Selections',
                templateUrl: '../demo/html/selections.html'
            }).state('demo.serverside', {
                url: '/ServerSide',
                templateUrl: '../demo/html/serverside.html'
            }).state('demo.customizations', {
                url: '',
                template: '<ui-view/>',
                abstract: true
            }).state('demo.customizations.global', {
                url: '/Customizations_Global',
                templateUrl: '../demo/html/customizations_global.html'
            }).state('demo.customizations.global_beta', {
                url: '/Customizations_Global_Beta',
                views: {
                    '': {
                        templateUrl: '../demo/html/customizations_global_beta.html'
                    },
                    'source': {
                        template: '../demo/js/customizations_global_beta.ts'
                    },
                },
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        function ($ocLazyLoad) { return $ocLazyLoad.load({
                            name: 'trNgGridDemoGlobalCustomizations',
                            files: [
                                '../demo/js/customizations_global_beta.js'
                            ],
                        }); }
                    ]
                }
            }).state('demo.customizations.instance', {
                url: '/Customizations_Instance',
                templateUrl: '../demo/html/customizations_instance.html'
            }).state('demo.globaloptions', {
                url: '/GlobalOptions',
                templateUrl: '../demo/html/globaloptions.html'
            }).state('demo.localization', {
                url: '/Localization',
                templateUrl: '../demo/html/localization.html',
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        function ($ocLazyLoad) { return $ocLazyLoad.load({
                            name: 'trNgGridDemoLocalization',
                            files: [
                                '../demo/js/translations.js'
                            ],
                        }); }
                    ]
                }
            }).state('demo.localization_beta', {
                url: '/Localization_Beta',
                views: {
                    '': {
                        templateUrl: '../demo/html/localization_beta.html'
                    },
                    'source': {
                        template: '../demo/js/translations_beta.ts'
                    }
                },
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        function ($ocLazyLoad) { return $ocLazyLoad.load({
                            name: 'trNgGridDemoLocalization',
                            files: [
                                '../demo/js/translations_beta.js'
                            ],
                        }); }
                    ]
                }
            }).state('demo.templatepager', {
                url: '/TemplatePager',
                templateUrl: '../demo/html/tests/test_template_pager.html'
            }).state('demo.benchmark', {
                url: '/Benchmark',
                templateUrl: '../demo/html/tests/test_benchmark.html',
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        function ($ocLazyLoad) { return $ocLazyLoad.load({
                            name: 'ngGrid',
                            files: [
                                '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',
                                '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.css',
                                '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid-flexible-height.min.js',
                                '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.js'
                            ],
                        }); }
                    ]
                }
            }).state('demo.tests', {
                url: '',
                abstract: true,
                template: '<div ui-view></div>'
            }).state('demo.tests.ngswitch', {
                url: '/TestNgSwitch',
                templateUrl: '../demo/html/tests/test_ng_switch.html'
            }).state('demo.tests.simple_beta', {
                url: '/TestSimpleBeta',
                templateUrl: '../demo/html/tests/test_simple_beta.html'
            }).state('demo.tests.itemsupdate', {
                url: '/TestItemsUpdate',
                templateUrl: '../demo/html/tests/test_items_update.html'
            }).state('demo.tests.specialsymbols', {
                url: '/TestSpecialSymbols',
                templateUrl: '../demo/html/tests/test_symbols_data_keys.html'
            }).state('demo.tests.hybridmode', {
                url: '/TestHybridMode',
                templateUrl: '../demo/html/tests/test_hybrid_mode.html'
            }).state('demo.tests.fixedheaderfooter', {
                url: '/TestFixedHeaderFooter',
                templateUrl: '../demo/html/tests/test_fixed_header_footer.html'
            });
        }
    ]);
})(TrNgGridDemo || (TrNgGridDemo = {}));
