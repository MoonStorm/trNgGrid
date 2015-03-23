module TrNgGridHybridDemo {
    export interface IHybridTestControllerScope extends TrNgGridDemo.ITestControllerScope {
        requestedPageNumber: number;
    }

    export class HybridModeTestController extends TrNgGridDemo.TestController{
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

    angular.module("trNgGridDemo")
        .controller("HybridModeTestController", ["$scope", "$window", "$timeout", HybridModeTestController]);
} 