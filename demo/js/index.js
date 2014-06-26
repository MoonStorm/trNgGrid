/// <reference path="../../src/external/typings/jquery/jquery.d.ts" />
/// <reference path="../../src/external/typings/angularjs/angular.d.ts" />
var TrNgGridDemo;
(function (TrNgGridDemo) {
    var RndGenOptions;
    (function (RndGenOptions) {
        RndGenOptions[RndGenOptions["Numbers"] = 0] = "Numbers";
        RndGenOptions[RndGenOptions["Lowercase"] = 1] = "Lowercase";
        RndGenOptions[RndGenOptions["Uppercase"] = 2] = "Uppercase";
    })(RndGenOptions || (RndGenOptions = {}));

    var TestController = (function () {
        function TestController($scope, $window, $timeout) {
            var _this = this;
            this.$scope = $scope;
            this.charCodeA = "A".charCodeAt(0);
            this.charCodea = "a".charCodeAt(0);
            $scope.externalTestProp = "Externals should be visible";
            $scope.myGlobalFilter = "";
            $scope.myOrderBy = "";
            $scope.myOrderByReversed = false;
            $scope.myColumnFilter = {};
            $scope.mySelectedItems = [];
            $scope.myItemsTotalCount = 0;
            $scope.myItems = [];
            $scope.myItemsCurrentPageIndex = 0;
            $scope.myPageItemsCount = 10;
            $scope.myEnableFiltering = true;
            $scope.myEnableSorting = true;
            $scope.myEnableSelections = true;
            $scope.myEnableMultiRowSelections = true;
            $scope.generateItems = function (pageItems, totalItems) {
                $scope.myItems = [];

                //$scope.myItems.splice(0);
                $scope.myPageItemsCount = pageItems;
                $scope.myItemsTotalCount = totalItems ? totalItems : $scope.myPageItemsCount;
                _this.generateItems($scope.myItems, $scope.myPageItemsCount);
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

                $scope.generateItems(10, 100);
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
        }
        TestController.prototype.generateItems = function (items, itemCount) {
            for (var index = 0; index < itemCount; index++) {
                this.addNewRandomItem(items);
            }
        };

        TestController.prototype.addNewRandomItem = function (items) {
            var idColumnFilter = this.$scope.myColumnFilter["id"] ? this.$scope.myColumnFilter["id"] : "";
            var nameColumnFilter = this.$scope.myColumnFilter["name"] ? this.$scope.myColumnFilter["name"] : "";
            var addressColumnFilter = this.$scope.myColumnFilter["address"] ? this.$scope.myColumnFilter["address"] : "";

            items.push({
                id: this.randomString(Math.random() * 2 + 1, 0 /* Numbers */) + idColumnFilter,
                name: this.randomUpercase() + this.randomString(Math.random() * 5 + 1, 1 /* Lowercase */) + this.$scope.myGlobalFilter + nameColumnFilter,
                address: this.$scope.myGlobalFilter + this.randomString(2, 0 /* Numbers */) + " " + this.randomUpercase() + this.randomString(Math.random() * 10 + 1, 1 /* Lowercase */) + addressColumnFilter + " Ave"
            });
        };

        TestController.prototype.addDateToItems = function () {
            var maxTimeSpan = new Date(1980, 0).getTime();
            for (var itemIndex = 0; itemIndex < this.$scope.myItems.length; itemIndex++) {
                var rndTimeSpan = Math.floor(Math.random() * maxTimeSpan);
                this.$scope.myItems[itemIndex]["born"] = new Date(new Date(1980, 2, 4).getTime() + rndTimeSpan);
            }
        };

        TestController.prototype.randomString = function (count) {
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
                        s += this.randomNumber();
                        break;
                    case 1 /* Lowercase */:
                        s += this.randomLowercase();
                        break;
                    case 2 /* Uppercase */:
                        s += this.randomUpercase();
                        break;
                }
            }
            return s;
        };

        TestController.prototype.randomNumber = function () {
            return Math.floor(Math.random() * 10).toString();
        };

        TestController.prototype.randomUpercase = function () {
            return String.fromCharCode(Math.floor(Math.random() * 26) + this.charCodeA);
        };

        TestController.prototype.randomLowercase = function () {
            return String.fromCharCode(Math.floor(Math.random() * 26) + this.charCodea);
        };
        return TestController;
    })();
    TrNgGridDemo.TestController = TestController;

    var MainController = (function () {
        function MainController($scope, $sce) {
            var _this = this;
            this.$scope = $scope;
            this.$sce = $sce;
            $scope.theme = "slate";
            $scope.locale = "en-gb";
            this.setupLocaleUrl();
            this.setupThemeUrl();

            this.$scope.$watch("locale", function (newValue, oldValue) {
                if (newValue != oldValue) {
                    _this.setupLocaleUrl();
                }
            });

            this.$scope.$watch("theme", function (newValue, oldValue) {
                if (newValue != oldValue) {
                    _this.setupThemeUrl();
                }
            });
        }
        MainController.prototype.setupLocaleUrl = function () {
            var localeUrl = "https://code.angularjs.org/1.2.9/i18n/angular-locale_" + this.$scope.locale + ".js";
            this.$scope.localeUrl = this.$sce.trustAsResourceUrl(localeUrl);
        };

        MainController.prototype.setupThemeUrl = function () {
            var themeUrl = "//netdna.bootstrapcdn.com/bootswatch/3.0.3/" + this.$scope.theme + "/bootstrap.min.css";
            this.$scope.themeUrl = this.$sce.trustAsResourceUrl(themeUrl);
        };
        return MainController;
    })();
    TrNgGridDemo.MainController = MainController;

    angular.module("trNgGridDemo", ["ngRoute", "ngAnimate", "trNgGrid"]).config([
        "$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
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
            }).when('/Templates', {
                templateUrl: 'demo/html/templates.html'
            }).when('/GlobalOptions', {
                templateUrl: 'demo/html/globaloptions.html'
            }).when('/Localization', {
                templateUrl: 'demo/html/localization.html'
            }).when('/TestNgSwitch', {
                templateUrl: 'demo/html/tests/test_ng_switch.html'
            }).when('/TestItemsUpdate', {
                templateUrl: 'demo/html/tests/test_items_update.html'
            }).when('/TestFixedHeaderFooter', {
                templateUrl: 'demo/html/tests/test_fixed_header_footer.html'
            }).otherwise({
                templateUrl: 'demo/html/default.html'
            });
            // configure html5 to get links working on jsfiddle
            //$locationProvider.html5Mode(true);
        }]).directive("projectMarkupTo", [
        function () {
            return {
                restrict: "EA",
                template: function (element, tAttr) {
                    var projectionElementId = tAttr["projectMarkupTo"];
                    var currentElementContents = element.html().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/  /g, "&nbsp;&nbsp;");
                    angular.element(document.querySelector(projectionElementId)).html(currentElementContents);
                }
            };
        }
    ]).directive("fixedHeaderFooter", [
        function () {
            var applyFixedHeaderFooter = function (grid) {
                // too buggy, doesn't work
                // $(element).fixedHeaderTable({ height: attrs['fixedHeaderFooter'] }).show();
                // http://larrysteinle.com/2011/12/04/jqueryscrolltable/
                var scrollBarWidth = 16;
                var $scroll = $(grid);
                var $table = $scroll.find("table");
                var $header = $table.find("thead:first-child");
                var $footer = $table.find("tfoot:first-child");
                var $body = $table.find("tbody:first-child");

                //Remove Cell Width Formatting
                $body.find("tr:first-child").find("th, td").each(function (i, c) {
                    $(c).css("width", "auto");
                });
                $header.find("th, td").each(function (i, c) {
                    $(c).css("width", "auto");
                });
                $footer.find("th, td").each(function (i, c) {
                    $(c).css("width", "auto");
                });

                //Set Width of Table, Header, Footer and Body Elements
                $table.css("width", $scroll.width() - scrollBarWidth + 2);

                //Disable positioning so browser can do all the hard work.
                //This allows us to support min-width, max-width, nowrap, etc.
                $header.css("position", "relative");
                $footer.css("position", "relative");

                //Navigate thru each cell hard coding the width so when the association
                //is broken all of the columns will continue to align based on normal
                //table rules. Only traverse the first row cells in the body for efficiency.
                $body.find("tr:first-child").find("th, td").each(function (i, c) {
                    $(c).css("width", $(c).width());
                });
                $header.find("th, td").each(function (i, c) {
                    $(c).css("width", $(c).width());
                });
                $footer.find("th, td").each(function (i, c) {
                    $(c).css("width", $(c).width());
                });

                //Enable positioning for fixed header positioning.
                $header.css("position", "absolute");
                $footer.css("position", "absolute");

                $table.css("width", $scroll.width() - scrollBarWidth - 3);

                //Position Heading Based on Height of Heading
                $scroll.css("margin-top", ($header.height() + 1) + "px");
                $header.css("margin-top", (($header.height() - 1) * -1) + "px");

                //Position Footer Based on Height of Scroll Host
                $scroll.css("margin-bottom", $footer.css("height"));
                $footer.css("margin-top", $scroll.height() - 1 + "px");
            };

            return {
                // Restrict it to be an attribute in this case
                restrict: 'A',
                // responsible for registering DOM listeners as well as updating the DOM
                link: function (scope, element, attrs) {
                }
            };
        }
    ]);
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=index.js.map
