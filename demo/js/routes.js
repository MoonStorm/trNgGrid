/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/uirouter/angular-ui-router.d.ts" />
var TrNgGridDemo;
(function (TrNgGridDemo) {
    var allConfigurations = {
        "release": {
            name: "release",
            fullName: "trNgGrid 3.0.4",
            titleCssClass: "text-success"
        },
        "beta": {
            name: "beta",
            fullName: "trNgGrid beta",
            titleCssClass: "text-warning"
        }
    };
    // https://github.com/ocombe/ocLazyLoad
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
                    // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        '$stateParams',
                        '$location',
                        function ($ocLazyLoad, $stateParams, $location) {
                            var configuration = $location.absUrl().indexOf("/release/") >= 0 ? "release" : "beta";
                            var theme = $stateParams["theme"] || "slate";
                            var themeVersion = $stateParams["themeVersion"] || "3.0.3";
                            $stateParams["theme"] = theme;
                            $stateParams["themeVersion"] = themeVersion;
                            $stateParams["configuration"] = configuration;
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load([
                                {
                                    name: 'trNgGrid',
                                    files: [
                                        '../' + configuration + '/src/js/trNgGrid.js',
                                        '../' + configuration + '/src/css/trNgGrid.css'
                                    ],
                                    cache: false
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
                                    cache: false
                                },
                                {
                                    name: 'ui.bootstrap',
                                    files: [
                                        '//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap.js',
                                        '//google-code-prettify.googlecode.com/svn/loader/prettify.js',
                                        '//google-code-prettify.googlecode.com/svn/loader/prettify.css',
                                        '//maxcdn.bootstrapcdn.com/bootswatch/' + themeVersion + '/' + theme + '/bootstrap.min.css'
                                    ],
                                    cache: false
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
                    function ($scope, $stateParams, $state, $window) {
                        $scope.isFrame = !!$stateParams["isFrame"];
                        $scope.configurations = allConfigurations;
                        $scope.currentConfiguration = $scope.configurations[$stateParams["configuration"]];
                        $scope.theme = $stateParams["theme"];
                        $scope.themeVersion = $stateParams["themeVersion"];
                        $scope.changeTheme = function (theme) {
                            $state.go(".", {
                                theme: theme
                            }, {});
                            //.then(() => {
                            //    // reload links to 3rd party resources
                            //    $window.location.reload(true);
                            //});
                        };
                        $scope.changeThemeVersion = function (themeVersion) {
                            $state.go(".", {
                                themeVersion: themeVersion,
                                theme: 'slate'
                            }, {});
                            //.then(() => {
                            //    // reload links to 3rd party resources
                            //    $window.location.reload(true);
                            //});
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
                url: '/Customizations',
                templateUrl: '../demo/html/customizations.html'
            }).state('demo.globaloptions', {
                url: '/GlobalOptions',
                templateUrl: '../demo/html/globaloptions.html'
            }).state('demo.localization', {
                url: '/Localization',
                templateUrl: '../demo/html/localization.html',
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad',
                        function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load({
                                name: 'trNgGridDemoLocalization',
                                files: [
                                    '../demo/js/translations.js'
                                ],
                                cache: false
                            });
                        }
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
                        function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load({
                                name: 'ngGrid',
                                files: [
                                    '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',
                                    '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.css',
                                    '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid-flexible-height.min.js',
                                    '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.js'
                                ],
                                cache: false
                            });
                        }
                    ]
                }
            }).state('demo.tests', {
                url: '',
                abstract: true,
                template: '<div ui-view></div>'
            }).state('demo.tests.ngswitch', {
                url: '/TestNgSwitch',
                templateUrl: '../demo/html/tests/test_ng_switch.html'
            }).state('demo.tests.itemsupdate', {
                url: '/TestItemsUpdate',
                templateUrl: '../demo/html/tests/test_items_update.html'
            }).state('demo.tests.hybridmode', {
                url: '/TestHybridMode',
                templateUrl: '../demo/html/tests/test_hybrid_mode.html'
            }).state('demo.tests.fixedheaderfooter', {
                url: '/TestFixedHeaderFooter',
                templateUrl: '../demo/html/tests/test_fixed_header_footer.html'
            });
            // html5 is not working without server-side changes
            //$location.html5Mode(true);
        }
    ]);
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=routes.js.map