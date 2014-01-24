/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>
var TrNgGridDemo;
(function (TrNgGridDemo) {
    var TestController = (function () {
        function TestController($scope) {
            var _this = this;
            $scope.externalTestProp = "Externals should be visible";
            $scope.totalItems = 1000;
            $scope.items = [];
            $scope.currentPage = 0;
            $scope.pageItems = 10;
            $scope.generateItems = function (pageItems, totalItems) {
                $scope.pageItems = pageItems;
                $scope.totalItems = totalItems ? totalItems : $scope.pageItems;
                $scope.totalItems = totalItems;
                _this.generateItems($scope.items, $scope.pageItems);
            };

            $scope.addNew = function () {
                this.addNewRandomItem($scope.items);
            };

            $scope.$watch("currentPage", function (newPage, oldPage) {
                if (newPage !== oldPage) {
                    $scope.items.splice(0);
                    this.generateItems($scope.items, $scope.pageItems);
                }
            });
        }
        TestController.prototype.generateItems = function (items, itemCount) {
            for (var index = 0; index < itemCount; index++) {
                this.addNewRandomItem(items);
            }
        };

        TestController.prototype.addNewRandomItem = function (items) {
            items.push({
                id: this.randomstring(Math.floor(Math.random() * 3), true),
                name: this.randomstring(Math.floor(Math.random() * 10)),
                street: this.randomstring(2, true) + " " + this.randomstring(Math.floor(Math.random() * 10)) + "ave"
            });
        };

        TestController.prototype.randomstring = function (count, numbersOnly) {
            var s = '';
            var charCodeA = "A".charCodeAt(0);
            var charCodea = "a".charCodeAt(0);
            var randomchar = function (numbersOnly) {
                var n = Math.floor(Math.random() * (numbersOnly ? 10 : 62));
                if (n < 10)
                    return n.toString();
                if (n < 36)
                    return String.fromCharCode(n + charCodeA - 10);
                return String.fromCharCode(n + charCodea - 36);
            };
            while (s.length < count)
                s += randomchar(numbersOnly);
            return s;
        };
        return TestController;
    })();
    TrNgGridDemo.TestController = TestController;

    angular.module("trNgGridDemo", ["ngRoute", "ngAnimate", "trNgGrid"]).config([
        "$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
            $routeProvider.when('/Common', {
                templateUrl: 'demo/html/common.html'
            });
            $routeProvider.when('/Detailed', {
                templateUrl: 'demo/html/detailed.html'
            });
            $routeProvider.when('/ColumnPicker', {
                templateUrl: 'demo/html/columns.html'
            });
            // configure html5 to get links working on jsfiddle
            //$locationProvider.html5Mode(true);
        }]);
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=index.js.map
