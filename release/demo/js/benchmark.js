var TrNgGridDemo;
(function (TrNgGridDemo) {
    function applyMeasureTime(scope, fct) {
        var startTime = new Date().getTime();
        scope.$apply(function () {
            fct();
        });
        var endTime = new Date().getTime();
        scope.benchmarkTime = endTime - startTime;
        scope.$digest();
    }

    var BenchmarkController = (function () {
        function BenchmarkController($scope) {
            this.$scope = $scope;
            $scope.ngGridOptions = {
                data: 'myItems',
                plugins: [new ngGridFlexibleHeightPlugin()],
                showFilter: true,
                showFooter: true,
                showColumnMenu: true,
                enableSorting: true
            };
            TrNgGrid.debugMode = false;
        }
        return BenchmarkController;
    })();
    TrNgGridDemo.BenchmarkController = BenchmarkController;

    function switchGrid(element, gridType) {
        var scope = angular.element(element).scope();

        scope.$apply(function () {
            scope.benchmarkGridType = "";
        });
        applyMeasureTime(scope, function () {
            scope.benchmarkGridType = gridType;
        });
    }
    TrNgGridDemo.switchGrid = switchGrid;

    function modifyRandomItem(element) {
        var scope = angular.element(element).scope();
        var itemIndex = (0 | Math.random() * (scope.myItems.length - 1));
        var item = scope.myItems[itemIndex];
        if (item) {
            applyMeasureTime(scope, function () {
                item["id"] = 0;
                item["name"] = "__Changed__";
                item["address"] = "__Changed__";
            });
        }
    }
    TrNgGridDemo.modifyRandomItem = modifyRandomItem;

    function generateBenchmarkItems(element) {
        var scope = angular.element(element).scope();
        scope.benchmarkGridType = "";
        applyMeasureTime(scope, function () {
        });

        scope.generateItems(scope.benchmarkItemCount);
        applyMeasureTime(scope, function () {
        });
    }
    TrNgGridDemo.generateBenchmarkItems = generateBenchmarkItems;
    ;
})(TrNgGridDemo || (TrNgGridDemo = {}));
