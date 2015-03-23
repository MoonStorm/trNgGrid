var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
// NOTE: This code was written in TypeScript
var TrNgGridXEditableDemo;
(function (TrNgGridXEditableDemo) {
    var XEditableTestController = (function (_super) {
        __extends(XEditableTestController, _super);
        function XEditableTestController($scope, $window, $timeout) {
            _super.call(this, $scope, $window, $timeout);
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
            $scope.addUser = function () {
                $scope.newFormData = {
                    id: this.myItems.length + 1,
                    name: '',
                    address: ''
                };
                this.myItems.push($scope.newFormData);
            };
        }
        return XEditableTestController;
    })(TrNgGridDemo.TestController);
    TrNgGridXEditableDemo.XEditableTestController = XEditableTestController;
    angular.module("TrNgGridXEditableDemo", ["trNgGrid", "xeditable"]).controller("XEditableTestController", ["$scope", "$window", "$timeout", XEditableTestController]);
})(TrNgGridXEditableDemo || (TrNgGridXEditableDemo = {}));
