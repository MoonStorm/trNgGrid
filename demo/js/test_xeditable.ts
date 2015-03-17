// NOTE: This code was written in TypeScript
module TrNgGridXEditableDemo {
    export interface IXEditableTestControllerScope extends TrNgGridDemo.ITestControllerScope{
        saveUser(formData: any, id: number): boolean;
        removeUser(gridItem: any): void; 
        addUser(): void;

        newFormData:any;
    }

    export class XEditableTestController extends TrNgGridDemo.TestController {

        constructor($scope: IXEditableTestControllerScope, $window: ng.IWindowService, $timeout: ng.ITimeoutService) {
            super($scope, $window, $timeout);
            $scope.saveUser = function (formData, id) {
                //$scope.user not updated yet

                angular.extend(formData, { id: id });
                //return $http.post('/saveUser', data);
                return true;
            };

            // remove user
            $scope.removeUser = function (gridItem) {
                var itemIndex = this.myItems.indexOf(gridItem);
                this.myItems.splice(itemIndex, 1);
            };

            // add user
            $scope.addUser = function() {
                $scope.newFormData = {
                    id: this.myItems.length + 1,
                    name: '',
                    address: ''
                };
                this.myItems.push($scope.newFormData);
            };
        }
    }

    angular.module("TrNgGridXEditableDemo", ["trNgGrid", "xeditable"]);
}