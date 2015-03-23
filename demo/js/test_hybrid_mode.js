var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TrNgGridHybridDemo;
(function (TrNgGridHybridDemo) {
    var HybridModeTestController = (function (_super) {
        __extends(HybridModeTestController, _super);
        function HybridModeTestController($scope, $window, $timeout) {
            _super.call(this, $scope, $window, $timeout);
            $scope.myCurrentPage = 2;
            $scope.myPageItemsCount = 5;
            this.$scope.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
                $scope.requestedPageNumber = currentPage;
                $scope.myItemsTotalCount = 200;
                $scope.generateItems(pageItems, $scope.myItemsTotalCount);
            };
        }
        return HybridModeTestController;
    })(TrNgGridDemo.TestController);
    TrNgGridHybridDemo.HybridModeTestController = HybridModeTestController;
    angular.module("trNgGridDemo").controller("HybridModeTestController", ["$scope", "$window", "$timeout", HybridModeTestController]);
})(TrNgGridHybridDemo || (TrNgGridHybridDemo = {}));
