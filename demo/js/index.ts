/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>

module TrNgGridDemo{
    export interface ITestControllerScope extends ng.IScope{
        externalTestProp: string;
        totalItems:number;
        items: Array<any>;
        currentPage:number;
        pageItems:number;

        addNew:()=>void;
        generateItems:(pageItems:number, totalItems?:number)=>void;
    }

    export class TestController{
        constructor($scope:ITestControllerScope){
            $scope.externalTestProp = "Externals should be visible";
            $scope.totalItems = 1000;
            $scope.items = [];
            $scope.currentPage = 0;
            $scope.pageItems=10;
            $scope.generateItems = (pageItems:number, totalItems?:number) => {
                $scope.pageItems = pageItems;
                $scope.totalItems = totalItems?totalItems:$scope.pageItems;
                $scope.totalItems=totalItems;
                this.generateItems($scope.items, $scope.pageItems);
            };

            $scope.addNew = function () {
                this.addNewRandomItem($scope.items);
            };

            $scope.$watch("currentPage", function(newPage, oldPage){
                if(newPage!==oldPage){
                    $scope.items.splice(0);
                    this.generateItems($scope.items, $scope.pageItems);
                }
            });

        }

        generateItems(items:Array<any>, itemCount:number){
            // generate n random items
            for(var index=0;index<itemCount;index++){
                this.addNewRandomItem(items);
            }
        }

        addNewRandomItem(items:Array<any>){
            items.push({
                id:this.randomstring(Math.floor(Math.random()*3), true),
                name:this.randomstring(Math.floor(Math.random()*10)),
                street:this.randomstring(2, true) + " " +this.randomstring(Math.floor(Math.random()*10)) + "ave"
            });
        }

        randomstring(count:number, numbersOnly?:boolean):string{
           var s= '';
            var charCodeA = "A".charCodeAt(0);
            var charCodea = "a".charCodeAt(0);
            var randomchar=(numbersOnly?:boolean) => {
                var n= Math.floor(Math.random()*(numbersOnly?10:62));
                if(n<10) return n.toString(); //1-10
                if(n<36) return String.fromCharCode(n+charCodeA-10); //A-Z
                return String.fromCharCode(n+charCodea-36); //a-z
            };
            while(s.length< count) s+= randomchar(numbersOnly);
            return s;
        }
    }

    angular.module("trNgGridDemo", ["ngRoute", "ngAnimate", "trNgGrid"])
        .config(["$routeProvider", "$locationProvider", ($routeProvider:any, $locationProvider:any)=>{
            $routeProvider.when('/Common', {
                templateUrl: 'demo/html/common.html'
            });
            $routeProvider.when('/Detailed', {
                templateUrl: 'demo/html/detailed.html'
            });
            $routeProvider.when('/ColumnPicker', {
                templateUrl: 'demo/html/columns.html'
            });

            // configure html5 to get links working on jsfiddle
            //$locationProvider.html5Mode(true);
        }]);

}

