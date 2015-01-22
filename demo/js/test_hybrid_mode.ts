/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="demo.ts" />

module TrNgGridDemo {
    export interface IHybridTestControllerScope extends ITestControllerScope {
        requestedPageNumber: number;
    }

    export class HybridModeTestController extends TestController{
        constructor($scope: IHybridTestControllerScope, $window: ng.IWindowService, $timeout: ng.ITimeoutService) {
            super($scope, $window, $timeout);
            $scope.myCurrentPage = 2;        
            $scope.myPageItemsCount = 5;    
            
            this.$scope.onServerSideItemsRequested = (currentPage: number, pageItems: number, filterBy: string, filterByFields: Object, orderBy: string, orderByReverse: boolean) => {
                $scope.requestedPageNumber = currentPage;
                $scope.myItemsTotalCount = 200; 
                $scope.generateItems(pageItems, $scope.myItemsTotalCount);
            };
        }
    }
} 