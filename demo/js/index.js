/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>
var TrNgGridDemo;
(function (TrNgGridDemo) {
    var RndGenOptions;
    (function (RndGenOptions) {
        RndGenOptions[RndGenOptions["Numbers"] = 0] = "Numbers";
        RndGenOptions[RndGenOptions["Lowercase"] = 1] = "Lowercase";
        RndGenOptions[RndGenOptions["Uppercase"] = 2] = "Uppercase";
    })(RndGenOptions || (RndGenOptions = {}));

    var TestController = (function () {
        function TestController($scope, $window) {
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
            $scope.generateItems = function (pageItems, totalItems) {
                $scope.myItems.splice(0);
                $scope.myPageItemsCount = pageItems;
                $scope.myItemsTotalCount = totalItems ? totalItems : $scope.myPageItemsCount;
                _this.generateItems($scope.myItems, $scope.myPageItemsCount);
                //$scope.mySelectedItems=$scope.myItems.slice(0);
            };

            $scope.simulateServerSideQueries = function (pageItems, totalItems) {
                //$window.alert(pageItems.toString()+"/"+totalItems);
                $scope.myPageItemsCount = pageItems;
                $scope.$watchCollection("[myGlobalFilter, myOrderBy, myOrderByReversed, myColumnFilter, myColumnFilter.id, myColumnFilter.name, myColumnFilter.address, myItemsCurrentPageIndex]", function () {
                    $scope.generateItems(pageItems, totalItems);
                });
            };

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

    angular.module("trNgGridDemo", ["ngRoute", "ngAnimate", "trNgGrid"]).config([
        "$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
            $routeProvider.when('/Common', {
                templateUrl: 'demo/html/common.html'
            }).when('/ColumnPicker', {
                templateUrl: 'demo/html/columns.html'
            }).when('/Paging', {
                templateUrl: 'demo/html/paging.html'
            }).when('/ServerSide', {
                templateUrl: 'demo/html/serverside.html'
            }).when('/Templates', {
                templateUrl: 'demo/html/templates.html'
            }).otherwise({
                templateUrl: 'demo/html/default.html'
            });
            $routeProvider.de;
            // configure html5 to get links working on jsfiddle
            //$locationProvider.html5Mode(true);
        }]).directive("projectMarkupTo", [
        function () {
            return {
                restrict: "EA",
                template: function (element, tAttr) {
                    var projectionElementId = tAttr["projectMarkupTo"];
                    var currentElementContents = element.html().replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/ /g, "&nbsp;");
                    $(projectionElementId).html(currentElementContents);
                }
            };
        }
    ]);
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=index.js.map
