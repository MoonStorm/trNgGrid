module TrNgGridDemo {

    var allConfigurations: { [configurationKey: string]: IDemoConfiguration } = {
        "release": {
            name: "release",
            fullName: "trNgGrid v3.1.0",
            titleCssClass: "text-success"
        }
        //"beta": {
        //    name: "beta",
        //    fullName: "trNgGrid vNext (BETA)",
        //    titleCssClass: "text-warning"
        //}
    };

    export interface IDemoConfiguration {
        name: string;
        fullName: string;
        titleCssClass: string;
    }

    export interface IMainControllerScope extends ng.IScope {
        theme: string;
        themeVersion:string;
        isFrame: boolean;
        configurations: { [configurationKey: string]: IDemoConfiguration }
        currentConfiguration: IDemoConfiguration;
        changeTheme(theme: string): void;
        changeThemeVersion(themeVersion: string): void;
    }

    // https://github.com/ocombe/ocLazyLoad
    angular.module("trNgGridDemo", ["ui.router", "ngRoute", "oc.lazyLoad"])
        .config([
            "$stateProvider", "$urlRouterProvider", "$locationProvider", ($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider, $location: ng.ILocationProvider) => {
                $urlRouterProvider.otherwise("/Unknown");

                $stateProvider
                    .state("demo", {
                        url: '?isFrame&theme&themeVersion',
                        abstract: true,
                        templateUrl: '../demo/demo.html',
                        resolve: {
                            // Any property in resolve should return a promise and is executed before the view is loaded
                            loadMyCtrl: [
                                '$ocLazyLoad', '$stateParams', '$location', ($ocLazyLoad: any, $stateParams: ng.ui.IStateParamsService, $location: ng.ILocationService) => {
                                    var configuration = $location.absUrl().indexOf("/release/") >= 0
                                        ? "release"
                                        : $location.absUrl().indexOf("/beta/") >= 0 ? "beta" : "alpha";
                                    var theme = $stateParams["theme"] || "slate";
                                    var themeVersion = $stateParams["themeVersion"] || "3.3.0";
                                    $stateParams["theme"] = theme;
                                    $stateParams["themeVersion"] = themeVersion;
                                    $stateParams["configuration"] = configuration;

                                    // you can lazy load files for an existing module
                                    return $ocLazyLoad.load([
                                        {
                                            name: 'trNgGrid',
                                            files:
                                            [
                                                '../' + configuration + '/trNgGrid.js',
                                                '../' + configuration + '/trNgGrid.css'
                                            ]
                                            //cache: false
                                        },
                                        {
                                            name: 'trNgGridDemo',
                                            serie: true,
                                            files: [
                                                '//necolas.github.io/normalize.css/latest/normalize.css',
                                                '//google-code-prettify.googlecode.com/svn/loader/prettify.js',
                                                '//google-code-prettify.googlecode.com/svn/loader/prettify.css',
                                                '../demo/css/index.css',
                                                // '../demo/js/tracking.js',
                                                '../demo/js/demo.js',
                                                '../demo/js/benchmark.js',
                                                '../demo/js/test_hybrid_mode.js',
                                                '../demo/js/translations.js'
                                            ]
                                            //cache: false
                                        },
                                        {
                                            name: 'ui.bootstrap',
                                            serie: true,
                                            files:
                                            [
                                                '//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.12.0/ui-bootstrap.js',
                                                '//maxcdn.bootstrapcdn.com/bootswatch/' + themeVersion + '/' + theme + '/bootstrap.min.css'
                                                // if (this.$scope.ui.themeVersion == "latest") {
                                                // CROSS ORIGIN problem in FF, don't use
                                                //themeUrl = "//thomaspark.github.io/bootswatch/" + this.$scope.ui.theme + "/bootstrap.css";
                                            ],
                                            cache: false
                                        }
                                    ]);
                                }
                            ]
                        },
                        controller: [
                            '$scope', '$stateParams', '$state', '$window', '$timeout',
                            ($scope: IMainControllerScope, $stateParams: ng.ui.IStateParamsService, $state: ng.ui.IStateService, $window: ng.IWindowService, $timeout:ng.ITimeoutService) => {
                                var stateChangeDereg = $scope.$on('$stateChangeSuccess',(event: ng.IAngularEvent, toState: ng.ui.IState, toParams: ng.ui.IStateParamsService, fromState: ng.ui.IState, fromParams: ng.ui.IStateParamsService) => {
                                    var templateStateRegex = /^demo\.customizations\.global.*/gi;
                                    if ((fromState.name != toState.name && fromState.name != "" && (fromState.name.match(templateStateRegex) || toState.name.match(templateStateRegex)))
                                        || (fromParams["theme"] && fromParams["theme"] != toParams["theme"])
                                        || (fromParams["themeVersion"] && fromParams["themeVersion"] != toParams["themeVersion"])
                                        || (fromParams["configuration"] && fromParams["configuration"] != toParams["configuration"])) {

                                        //event.preventDefault();
                                        //stateChangeDereg();
                                        $window.location.reload();

                                        //$timeout(() => {
                                        //    $state.transitionTo(toState.name, toParams, { location:true, inherit:true, reload: true });
                                        //});
                                    }
                                });
                                $scope.isFrame = !!$stateParams["isFrame"];
                                $scope.configurations = allConfigurations;
                                $scope.currentConfiguration = $scope.configurations[$stateParams["configuration"]];
                                $scope.theme = $stateParams["theme"];
                                $scope.themeVersion = $stateParams["themeVersion"];

                                $scope.changeTheme = (theme: string) => {
                                    $state.go(".", {
                                        theme: theme
                                    },
                                    {
                                        //reload: true,
                                        //inherit: false,
                                        //notify: true

                                    });
                                    //.then(() => {
                                    //    // reload links to 3rd party resources
                                    //    $window.location.reload(true);
                                    //});
                                };

                                $scope.changeThemeVersion = (themeVersion: string) => {
                                    $state.go(".", {
                                        themeVersion: themeVersion,
                                        theme: 'slate'
                                    },
                                    {
                                        //reload: true,
                                        //inherit: false,
                                        //notify: true

                                    });
                                    //.then(() => {
                                    //    // reload links to 3rd party resources
                                    //    $window.location.reload(true);
                                    //});
                                };
                            }
                        ]
                    })
                    .state("demo.default", {
                        url: '',
                        views: {
                            '': {
                                templateUrl: '../demo/html/default.html'
                            },
                            'relNotes@demo.default': {
                                templateUrl: 'relnotes.html'
                            }
                        }
                    })
                    .state("demo.common", {
                        url: '/Common',
                        templateUrl: '../demo/html/common.html'
                    })
                    .state("demo.unknown", {
                        url: '/Unknown',
                        template: '<div>Sorry, I didn\'t understand that.</div>'
                    })
                    .state('demo.columns', {
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
                                    '$ocLazyLoad', ($ocLazyLoad:any) => $ocLazyLoad.load({
                                        name: 'trNgGridDemoGlobalCustomizations',
                                        files: [
                                            '../demo/js/customizations_global_beta.js'
                                        ],
                                        //cache: false
                                    })
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
                                '$ocLazyLoad', ($ocLazyLoad:any) => $ocLazyLoad.load({
                                    name: 'trNgGridDemoLocalization',
                                    files: [
                                        '../demo/js/translations.js'
                                    ],
                                    //cache: false
                                })
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
                                '$ocLazyLoad', ($ocLazyLoad:any) => $ocLazyLoad.load({
                                    name: 'trNgGridDemoLocalization',
                                    files: [
                                        '../demo/js/translations_beta.js'
                                    ],
                                    //cache: false
                                })
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
                                '$ocLazyLoad', ($ocLazyLoad:any) => $ocLazyLoad.load({
                                    name: 'ngGrid',
                                    serie: true,
                                    files: [
                                        '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',
                                        '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.css',
                                        '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid-flexible-height.min.js',
                                        '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.js'
                                    ],
                                    //cache: false
                                })
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
                    }).state('demo.tests.xeditable', {
                    url: '/TestXEditable',
                        views: {
                            '': {
                                templateUrl: '../demo/html/tests/test_xeditable.html'
                            },
                            'source': {
                                template: '../demo/js/test_xeditable.ts'
                            }
                        },
                        resolve: {
                            loadMyCtrl: [
                                '$ocLazyLoad', ($ocLazyLoad: any) => $ocLazyLoad.load([
                                    {
                                        name: 'xeditable',
                                        files: [
                                            "//vitalets.github.io/angular-xeditable/dist/js/xeditable.js",
                                            "//vitalets.github.io/angular-xeditable/dist/css/xeditable.css"
                                        ],
                                        //cache: false
                                    },
                                    {
                                        name: 'TrNgGridXEditableDemo',
                                        serie:true,
                                        files: [
                                            '../demo/js/demo.js',
                                            '../demo/js/test_xeditable.js'
                                        ],
                                        //cache: false
                                    }
                                ])
                            ]
                        }
                    });
    
                // html5 is not working without server-side support
                //$location.html5Mode(true);
            }
        ]);
}