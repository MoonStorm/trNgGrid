angular
    .module('myApp', ['trNgGrid'])
    .controller("MainCtrl", ["$scope", function ($scope) {
        $scope.myItems = [{ name: "Moroni", age: 50 },
                 { name: "Tiancum", age: 43 },
                 { name: "Jacob", age: 27 },
                 { name: "Nephi", age: 29 },
                 { name: "Enos", age: 99 }];
    }]);


