/// <reference path="../../src/external/typings/jquery/jquery.d.ts" />
/// <reference path="../../src/external/typings/angularjs/angular.d.ts" />
var TrNgGridDemo;
(function (TrNgGridDemo) {
    (function (RndGenOptions) {
        RndGenOptions[RndGenOptions["Numbers"] = 0] = "Numbers";
        RndGenOptions[RndGenOptions["Lowercase"] = 1] = "Lowercase";
        RndGenOptions[RndGenOptions["Uppercase"] = 2] = "Uppercase";
    })(TrNgGridDemo.RndGenOptions || (TrNgGridDemo.RndGenOptions = {}));
    var RndGenOptions = TrNgGridDemo.RndGenOptions;

    var charCodeA = "A".charCodeAt(0);
    var charCodea = "a".charCodeAt(0);

    var randomNumber = function () {
        return Math.floor(Math.random() * 10).toString();
    };

    var randomUpercase = function () {
        return String.fromCharCode(Math.floor(Math.random() * 26) + charCodeA);
    };

    var randomLowercase = function () {
        return String.fromCharCode(Math.floor(Math.random() * 26) + charCodea);
    };

    TrNgGridDemo.randomString = function (count) {
        var options = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            options[_i] = arguments[_i + 1];
        }
        if (options.length == 0) {
            options = [1 /* Lowercase */, 2 /* Uppercase */, 0 /* Numbers */];
        }
        var s = '';
        while (s.length < count) {
            switch (options[Math.floor(Math.random() * options.length)]) {
                case 0 /* Numbers */:
                    s += randomNumber();
                    break;
                case 1 /* Lowercase */:
                    s += randomLowercase();
                    break;
                case 2 /* Uppercase */:
                    s += randomUpercase();
                    break;
            }
        }
        return s;
    };

    var TestController = (function () {
        function TestController($scope, $window, $timeout) {
            var _this = this;
            this.$scope = $scope;
            $scope.externalTestProp = "Externals should be visible";
            $scope.myLocale = "en";
            $scope.myGlobalFilter = "";
            $scope.myOrderBy = "";
            $scope.myOrderByReversed = false;
            $scope.myColumnFilter = {};
            $scope.mySelectedItems = [];
            $scope.myItemsTotalCount = 0;
            $scope.myItems = [];
            $scope.myEnableFieldAutoDetection = true, $scope.availableFields = ["id", "name", "address"];
            $scope.myFields = null;
            $scope.myItemsCurrentPageIndex = 0;
            $scope.myPageItemsCount = 10;
            $scope.myEnableFiltering = true;
            $scope.myEnableSorting = true;
            $scope.myEnableSelections = true;
            $scope.myEnableMultiRowSelections = true;

            /*$scope.toogleFieldEnforcement = (fieldName: string) => {
            var fieldIndex = $scope.myFields.indexOf(fieldName);
            if (fieldIndex < 0) {
            $scope.myFields.push(fieldName);
            }
            else {
            $scope.myFields.splice(fieldIndex, 1);
            }
            };*/
            $scope.removeSelectedElements = function () {
                angular.forEach($scope.mySelectedItems, function (selectedItem) {
                    $scope.myItems.splice($scope.myItems.indexOf(selectedItem), 1);
                });
            };
            $scope.generateItems = function (pageItems, totalItems, generateComplexItems) {
                $scope.myItems = [];

                //$scope.myItems.splice(0);
                $scope.myPageItemsCount = pageItems;
                $scope.myItemsTotalCount = totalItems ? totalItems : $scope.myPageItemsCount;
                _this.generateItems($scope.myItems, $scope.myPageItemsCount, generateComplexItems);
                //$scope.mySelectedItems=$scope.myItems.slice(0);
            };

            $scope.addDateToItems = function () {
                _this.addDateToItems();
            };

            var prevServerItemsRequestedCallbackPromise;
            $scope.onServerSideItemsRequested = function (currentPage, filterBy, filterByFields, orderBy, orderByReverse) {
                if (prevServerItemsRequestedCallbackPromise) {
                    $timeout.cancel(prevServerItemsRequestedCallbackPromise);
                    prevServerItemsRequestedCallbackPromise = null;
                }
                $scope.requestedItemsGridOptions = {
                    currentPage: currentPage,
                    filterBy: filterBy,
                    filterByFields: angular.toJson(filterByFields),
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true
                };

                $scope.generateItems(10, 100, true);
                prevServerItemsRequestedCallbackPromise = $timeout(function () {
                    $scope.requestedItemsGridOptions["requestTrapped"] = false;
                    prevServerItemsRequestedCallbackPromise = null;
                }, 3000, true);
            };

            /*
            $scope.simulateServerSideQueries=(pageItems:number, totalItems?:number)=>{
            //$window.alert(pageItems.toString()+"/"+totalItems);
            $scope.myPageItemsCount = pageItems;
            $scope.$watchCollection("[myGlobalFilter, myOrderBy, myOrderByReversed, myColumnFilter, myColumnFilter.id, myColumnFilter.name, myColumnFilter.address, myItemsCurrentPageIndex]",()=>{
            $scope.generateItems(pageItems, totalItems);
            });
            };
            */
            $scope.SelectionMode = TrNgGrid.SelectionMode;

            $scope.addNew = function () {
                _this.addNewRandomItem($scope.myItems);
            };

            $scope.showMessage = function (event, msg) {
                event.stopPropagation();
                $window.alert(msg);
            };

            $scope.$watch("myEnableFieldAutoDetection", function (newValue, oldValue) {
                if (newValue === oldValue)
                    return;

                if (newValue) {
                    $scope.myFields = null;
                } else {
                    $scope.myFields = $scope.availableFields.slice();
                }
            });
        }
        TestController.prototype.generateItems = function (items, itemCount, generateComplexItems) {
            for (var index = 0; index < itemCount; index++) {
                this.addNewRandomItem(items, generateComplexItems);
            }
        };

        TestController.prototype.generateAddress = function () {
            var addressColumnFilter = this.$scope.myColumnFilter["address"] ? this.$scope.myColumnFilter["address"] : "";
            return this.$scope.myGlobalFilter + TrNgGridDemo.randomString(2, 0 /* Numbers */) + " " + randomUpercase() + TrNgGridDemo.randomString(Math.random() * 10 + 1, 1 /* Lowercase */) + addressColumnFilter + " Ave";
        };

        TestController.prototype.addNewRandomItem = function (items, generateComplexItems) {
            var idColumnFilter = this.$scope.myColumnFilter["id"] ? this.$scope.myColumnFilter["id"] : "";
            var nameColumnFilter = this.$scope.myColumnFilter["name"] ? this.$scope.myColumnFilter["name"] : "";

            var itemAddress;
            if (generateComplexItems) {
                itemAddress = {
                    last: this.generateAddress(),
                    prev: []
                };
                for (var addrIndex = 0; addrIndex < Math.random() * 5 + 1; addrIndex++) {
                    itemAddress.prev.push({
                        address: this.generateAddress(),
                        index: addrIndex
                    });
                }
            } else {
                itemAddress = this.generateAddress();
            }
            items.push({
                id: parseInt(TrNgGridDemo.randomString(Math.random() * 2 + 1, 0 /* Numbers */) + idColumnFilter),
                name: randomUpercase() + TrNgGridDemo.randomString(Math.random() * 5 + 1, 1 /* Lowercase */) + this.$scope.myGlobalFilter + nameColumnFilter,
                address: itemAddress
            });
        };

        TestController.prototype.addDateToItems = function () {
            var maxTimeSpan = new Date(1980, 0).getTime();
            for (var itemIndex = 0; itemIndex < this.$scope.myItems.length; itemIndex++) {
                var rndTimeSpan = Math.floor(Math.random() * maxTimeSpan);
                this.$scope.myItems[itemIndex]["born"] = new Date(new Date(1980, 2, 4).getTime() + rndTimeSpan);
            }
        };
        return TestController;
    })();
    TrNgGridDemo.TestController = TestController;

    var MainController = (function () {
        function MainController($scope, $sce, $location) {
            var _this = this;
            this.$scope = $scope;
            this.$sce = $sce;
            $scope.isFrame = $location.absUrl().indexOf("isFrame=true") >= 0;
            $scope.ui = {
                theme: "slate",
                themeUrl: "",
                isMenuExpanded: false
            };
            this.setupThemeUrl();

            $scope.setTheme = function (theme) {
                $scope.ui.theme = theme;
                _this.setupThemeUrl();
                $scope.ui.isMenuExpanded = false;
            };
        }
        /*setupLocaleUrl() {
        var localeUrl = "https://code.angularjs.org/1.2.9/i18n/angular-locale_" + this.$scope.locale + ".js";
        this.$scope.localeUrl = this.$sce.trustAsResourceUrl(localeUrl);
        }*/
        MainController.prototype.setupThemeUrl = function () {
            var themeUrl = "//netdna.bootstrapcdn.com/bootswatch/3.0.3/" + this.$scope.ui.theme + "/bootstrap.min.css";
            this.$scope.ui.themeUrl = this.$sce.trustAsResourceUrl(themeUrl);
        };
        return MainController;
    })();
    TrNgGridDemo.MainController = MainController;

    // https://github.com/ocombe/ocLazyLoad
    angular.module("trNgGridDemo", ["ngRoute", "trNgGrid", "ui.bootstrap", "oc.lazyLoad"]).config([
        "$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
            // html5 is not working
            //$locationProvider
            //    .html5Mode(true)
            //    .hashPrefix('!');
            $routeProvider.when('/Common', {
                templateUrl: 'demo/html/common.html'
            }).when('/ColumnPicker', {
                templateUrl: 'demo/html/columns.html'
            }).when('/Paging', {
                templateUrl: 'demo/html/paging.html'
            }).when('/Selections', {
                templateUrl: 'demo/html/selections.html'
            }).when('/ServerSide', {
                templateUrl: 'demo/html/serverside.html'
            }).when('/Customizations', {
                templateUrl: 'demo/html/customizations.html'
            }).when('/GlobalOptions', {
                templateUrl: 'demo/html/globaloptions.html'
            }).when('/Localization', {
                templateUrl: 'demo/html/localization.html'
            }).when('/TestNgSwitch', {
                templateUrl: 'demo/html/tests/test_ng_switch.html'
            }).when('/TestItemsUpdate', {
                templateUrl: 'demo/html/tests/test_items_update.html'
            }).when('/TestHybridMode', {
                templateUrl: 'demo/html/tests/test_hybrid_mode.html'
            }).when('/TestFixedHeaderFooter', {
                templateUrl: 'demo/html/tests/test_fixed_header_footer.html'
            }).when('/TemplatePager', {
                templateUrl: 'demo/html/tests/test_template_pager.html'
            }).when('/Benchmark', {
                templateUrl: 'demo/html/tests/test_benchmark.html',
                resolve: {
                    loadMyCtrl: [
                        '$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load({
                                name: 'ngGrid',
                                files: [
                                    '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',
                                    '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.css',
                                    '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid-flexible-height.min.js',
                                    '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.js'
                                ]
                            });
                        }]
                }
            }).otherwise({
                templateUrl: 'demo/html/default.html'
            });
        }]).directive("projectMarkupTo", [
        function () {
            return {
                restrict: "EA",
                template: function (element, tAttr) {
                    var projectionElementId = tAttr["projectMarkupTo"];
                    var currentElementContents = element.html().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

                    //.replace(/</g, "&lt;")
                    //.replace(/>/g, "&gt;")
                    //.replace(/"/g, "&quot;");
                    currentElementContents = prettyPrintOne(currentElementContents, null, false);

                    //.replace(/</g, "&lt;")
                    //.replace(/>/g, "&gt;")
                    //.replace(/"/g, "&quot;");
                    //.replace(/  /g, "&nbsp;&nbsp;");
                    angular.element(document.querySelector(projectionElementId)).html(currentElementContents).addClass('prettyprint prettyprinted').attr("ng-non-bindable", "");
                }
            };
        }
    ]).run(function () {
        TrNgGrid.debugMode = true;

        var defaultTranslation = {};

        var enTranslation = angular.extend({}, defaultTranslation);
        enTranslation[TrNgGrid.translationDateFormat] = "yyyy-MM-dd";
        TrNgGrid.translations["en"] = enTranslation;

        var enGbTranslation = angular.extend({}, enTranslation);

        // more date formats here: http://en.wikipedia.org/wiki/Date_format_by_country
        enGbTranslation[TrNgGrid.translationDateFormat] = "dd/MM/yyyy";
        TrNgGrid.translations["en-gb"] = enGbTranslation;

        var deTranslation = angular.extend({}, enTranslation, {
            "Born": "Geboren",
            "Search": "Suche",
            "First Page": "Erste Seite",
            "Page": "Seite",
            "Next Page": "Nächste Seite",
            "Previous Page": "Vorherige Seite",
            "Last Page": "Letzte Seite",
            "Sort": "Sortieren",
            "No items to display": "Nichts darzustellen",
            "displayed": "angezeigt",
            "in total": "insgesamt"
        });
        TrNgGrid.translations["de"] = deTranslation;

        var deChTranslation = angular.extend({}, deTranslation);
        deChTranslation[TrNgGrid.translationDateFormat] = "dd.MM.yyyy";
        TrNgGrid.translations["de-ch"] = deChTranslation;
    });
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=index.js.map
