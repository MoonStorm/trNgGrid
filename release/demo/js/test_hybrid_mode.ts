/// <reference path="../../src/external/typings/angularjs/angular.d.ts" />

module TrNgGridDemo {
    export interface IHybridTestControllerScope extends ITestControllerScope {
        requestedPageNumber: number;
    }

    export class HybridModeTestController extends TestController{
        constructor($scope: IHybridTestControllerScope, $window: ng.IWindowService, $timeout: ng.ITimeoutService) {
            super($scope, $window, $timeout);
            $scope.myPageItemsCount = 5
            $scope.myCurrentPage = 2;            
            
            this.$scope.onServerSideItemsRequested = (currentPage: number, pageItems:number, filterBy: string, filterByFields: Object, orderBy: string, orderByReverse: boolean) => {
                $scope.requestedPageNumber = currentPage;
                $scope.generateItems(pageItems, $scope.myItemsTotalCount);
                $scope.myItemsTotalCount = 200; 
            };
        }
    }
} 