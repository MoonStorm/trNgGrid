/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../typings/angularjs/angular-route.d.ts" />
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
        for (var _i = 1; _i < arguments.length; _i++) {
            options[_i - 1] = arguments[_i];
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
            $scope.myItems = null;
            $scope.myEnableFieldAutoDetection = true, $scope.availableFields = ["id", "name", "address"];
            $scope.myFields = null;
            $scope.myItemsCurrentPageIndex = 0;
            $scope.myPageItemsCount = 10;
            $scope.myEnableFiltering = true;
            $scope.myEnableSorting = true;
            $scope.myEnableSelections = true;
            $scope.myEnableMultiRowSelections = true;
            $scope.myNextItemsTotalCount = 100;
            $scope.alert = function (message) {
                $window.alert(message);
            };
            $scope.alertOnSelectionChange = function () {
                $scope.$watch("mySelectedItems.length", function (newLength) {
                    if (newLength > 0) {
                        $window.alert("The selection now contains " + newLength + " items");
                    }
                });
            };
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
            var serverSideRequestCount = 0;
            $scope.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
                if (prevServerItemsRequestedCallbackPromise) {
                    $timeout.cancel(prevServerItemsRequestedCallbackPromise);
                    prevServerItemsRequestedCallbackPromise = null;
                }
                $scope.requestedItemsGridOptions = {
                    serverSideRequestCount: ++serverSideRequestCount,
                    pageItems: pageItems,
                    currentPage: currentPage,
                    filterBy: filterBy,
                    filterByFields: angular.toJson(filterByFields),
                    orderBy: orderBy,
                    orderByReverse: orderByReverse,
                    requestTrapped: true
                };
                $scope.generateItems(pageItems, $scope.myNextItemsTotalCount, true);
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
                }
                else {
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
            }
            else {
                itemAddress = this.generateAddress();
            }
            items.push({
                id: parseInt(idColumnFilter + TrNgGridDemo.randomString(Math.random() * 2 + 1, 0 /* Numbers */)),
                name: randomUpercase() + TrNgGridDemo.randomString(Math.random() * 5 + 1, 1 /* Lowercase */) + this.$scope.myGlobalFilter + nameColumnFilter,
                address: itemAddress,
            });
        };
        TestController.prototype.addDateToItems = function () {
            var maxTimeSpan = new Date(1980, 0).getTime(); // approx 10 years span
            for (var itemIndex = 0; itemIndex < this.$scope.myItems.length; itemIndex++) {
                var rndTimeSpan = Math.floor(Math.random() * maxTimeSpan);
                this.$scope.myItems[itemIndex]["born"] = new Date(new Date(1980, 2, 4).getTime() + rndTimeSpan);
            }
        };
        return TestController;
    })();
    TrNgGridDemo.TestController = TestController;
    angular.module("trNgGridDemo").directive("projectMarkupTo", [
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
    ]).filter("testComputedField", function () {
        return function (combinedFieldValueUnused, item) {
            return item.id + " / " + item.name;
        };
    }).filter('capitalize', function () {
        return function (input, all) {
            return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }) : '';
        };
    });
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=demo.js.map