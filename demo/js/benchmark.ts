/// <reference path="../../typings/angularjs/angular.d.ts" />

module TrNgGridDemo {
    declare var ngGridFlexibleHeightPlugin;

    export interface IBenchmarkScope extends ITestControllerScope{
        ngGridOptions: any;
        benchmarkTime: number;
        benchmarkItemCount: number;
        benchmarkGridType: string;
    }

    function applyMeasureTime(scope: IBenchmarkScope, fct: () => any) {
        var startTime = new Date().getTime();
        scope.$apply(() => {
            fct();
        });
        var endTime = new Date().getTime();
        scope.benchmarkTime = endTime - startTime;
        scope.$digest();
    }

    export class BenchmarkController {
        constructor(private $scope: IBenchmarkScope) {
            $scope.ngGridOptions = {
                data: 'myItems',
                plugins: [new ngGridFlexibleHeightPlugin()],
                showFilter: true,
                showFooter: true,
                showColumnMenu: true,
                enableSorting:true

            };
            TrNgGrid.debugMode = false;
        }
    }

    export function switchGrid(element: Element, gridType: string) {
        var scope = <IBenchmarkScope>angular.element(element).scope();
        // reset the display to something neutral
        scope.$apply(() => { scope.benchmarkGridType = ""; });
        applyMeasureTime(scope, () => {
            scope.benchmarkGridType = gridType;
        });
    }

    export function modifyRandomItem(element: Element) {
        var scope = <IBenchmarkScope>angular.element(element).scope();
        var itemIndex = (0|Math.random() * (scope.myItems.length - 1));
        var item = scope.myItems[itemIndex];
        if (item) {
            applyMeasureTime(scope, () => {
                item["id"] = 0;
                item["name"] = "__Changed__";
                item["address"] = "__Changed__";
            });
        }
    }

    export function generateBenchmarkItems(element: Element) {
        var scope = <IBenchmarkScope>angular.element(element).scope();
        scope.benchmarkGridType = "";
        applyMeasureTime(scope, () => {
        });

        scope.generateItems(scope.benchmarkItemCount);
        applyMeasureTime(scope, () => {
        });
    };
}
 