/// <reference path="../../src/external/typings/angularjs/angular.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var TrNgGridDemo;
(function (TrNgGridDemo) {
    var HybridModeTestController = (function (_super) {
        __extends(HybridModeTestController, _super);
        function HybridModeTestController($scope, $window, $timeout) {
            _super.call(this, $scope, $window, $timeout);
            $scope.myPageItemsCount = 5;
            $scope.myCurrentPage = 2;

            this.$scope.onServerSideItemsRequested = function (currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
                $scope.requestedPageNumber = currentPage;
                $scope.generateItems(pageItems, $scope.myItemsTotalCount);
                $scope.myItemsTotalCount = 200;
            };
        }
        return HybridModeTestController;
    })(TrNgGridDemo.TestController);
    TrNgGridDemo.HybridModeTestController = HybridModeTestController;
})(TrNgGridDemo || (TrNgGridDemo = {}));
//# sourceMappingURL=test_hybrid_mode.js.map
