/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>

module TrNgGridDemo{
    export interface ITestControllerScope extends ng.IScope{
        externalTestProp: string;
        myItemsTotalCount:number;
        myItems: Array<any>;
        myItemsCurrentPageIndex:number;
        myPageItemsCount:number;
        mySelectedItems:Array<any>;
        myGlobalFilter:string;
        myColumnFilter:Object;
        myOrderBy:string;
        myOrderByReversed:boolean;
        myEnableFiltering:boolean;
        myEnableSorting:boolean;
        myEnableSelections:boolean;
        myEnableMultiRowSelections:boolean;

        requestedItemsGridOptions:Object;

        addNew:()=>void;
        onServerSideItemsRequested:(currentPage:number, filterBy:string, filterByFields:Object, orderBy:string, orderByReverse:boolean)=>void;
        generateItems:(pageItems:number, totalItems?:number)=>void;
        showMessage:(event:ng.IAngularEvent, msg:string) => void;
        simulateServerSideQueries:(pageItems:number, totalItems?:number)=>void;
    }

    enum RndGenOptions{
        Numbers,
        Lowercase,
        Uppercase
    }

    export class TestController{
        constructor(private $scope:ITestControllerScope, $window:ng.IWindowService, $timeout:ng.ITimeoutService){
            $scope.externalTestProp = "Externals should be visible";
            $scope.myGlobalFilter="";
            $scope.myOrderBy="";
            $scope.myOrderByReversed=false;
            $scope.myColumnFilter={};
            $scope.mySelectedItems=[];
            $scope.myItemsTotalCount = 0;
            $scope.myItems = [];
            $scope.myItemsCurrentPageIndex = 0;
            $scope.myPageItemsCount=10;
            $scope.myEnableFiltering = true;
            $scope.myEnableSorting = true;
            $scope.myEnableSelections = true;
            $scope.myEnableMultiRowSelections = true;
            $scope.generateItems = (pageItems:number, totalItems?:number) => {
                $scope.myItems.splice(0);
                $scope.myPageItemsCount = pageItems;
                $scope.myItemsTotalCount = totalItems?totalItems:$scope.myPageItemsCount;
                this.generateItems($scope.myItems, $scope.myPageItemsCount);
                //$scope.mySelectedItems=$scope.myItems.slice(0);
            };

            var prevServerItemsRequestedCallbackPromise:ng.IPromise<any>;
            $scope.onServerSideItemsRequested = (currentPage:number, filterBy:string, filterByFields:Object, orderBy:string, orderByReverse:boolean)=>{
                if(prevServerItemsRequestedCallbackPromise){
                    $timeout.cancel(prevServerItemsRequestedCallbackPromise);
                    prevServerItemsRequestedCallbackPromise = null;
                }
                $scope.requestedItemsGridOptions = {
                    currentPage:currentPage,
                    filterBy:filterBy,
                    filterByFields: angular.toJson(filterByFields),
                    orderBy:orderBy,
                    orderByReverse:orderByReverse,
                    requestTrapped:true
                };

                $scope.generateItems(10,100);
                prevServerItemsRequestedCallbackPromise = $timeout(()=>{
                    $scope.requestedItemsGridOptions["requestTrapped"] = false;
                    prevServerItemsRequestedCallbackPromise = null;
                }, 3000, true);
            };

/*
            $scope.simulateServerSideQueries=(pageItems:number, totalItems?:number)=>{
              //$window.alert(pageItems.toString()+"/"+totalItems);
              $scope.myPageItemsCount = pageItems;
              $scope.$watchCollection("[myGlobalFilter, myOrderBy, myOrderByReversed, myColumnFilter, myColumnFilter.id, myColumnFilter.name, myColumnFilter.address, myItemsCurrentPageIndex]",()=>{
                  $scope.generateItems(pageItems, totalItems);
              });
            };
*/

            $scope.addNew = () => {
                this.addNewRandomItem($scope.myItems);
            };

            $scope.showMessage = (event, msg)=>{
                event.stopPropagation();
                $window.alert(msg);
            };

        }

        generateItems(items:Array<any>, itemCount:number){
            // generate n random myItems
            for(var index=0;index<itemCount;index++){
                this.addNewRandomItem(items);
            }
        }

        addNewRandomItem(items:Array<any>){
            var idColumnFilter = this.$scope.myColumnFilter["id"]?this.$scope.myColumnFilter["id"]:"";
            var nameColumnFilter = this.$scope.myColumnFilter["name"]?this.$scope.myColumnFilter["name"]:"";
            var addressColumnFilter = this.$scope.myColumnFilter["address"]?this.$scope.myColumnFilter["address"]:"";

            items.push({
                id:this.randomString(Math.random()*2+1, RndGenOptions.Numbers) + idColumnFilter,
                name:this.randomUpercase()+this.randomString(Math.random()*5+1, RndGenOptions.Lowercase) + this.$scope.myGlobalFilter + nameColumnFilter,
                address:this.$scope.myGlobalFilter + this.randomString(2, RndGenOptions.Numbers)+" "+this.randomUpercase()+this.randomString(Math.random()*10+1, RndGenOptions.Lowercase)+addressColumnFilter+" Ave"
            });
        }

        private randomString(count:number,...options:RndGenOptions[]):string{
            if(options.length==0){
                options=<Array<RndGenOptions>>[RndGenOptions.Lowercase, RndGenOptions.Uppercase, RndGenOptions.Numbers];
            }
            var s= '';
            while(s.length< count){
                switch(options[Math.floor(Math.random()*options.length)]){
                    case RndGenOptions.Numbers:
                        s+=this.randomNumber();
                        break;
                    case RndGenOptions.Lowercase:
                        s+=this.randomLowercase();
                        break;
                    case RndGenOptions.Uppercase:
                        s+=this.randomUpercase();
                        break;

                }
            }
            return s;
        }

        private charCodeA = "A".charCodeAt(0);
        private charCodea = "a".charCodeAt(0);

        private randomNumber():string{
            return Math.floor(Math.random()*10).toString();
        }

        private randomUpercase():string{
            return String.fromCharCode(Math.floor(Math.random()*26)+this.charCodeA);
        }

        private randomLowercase():string{
            return String.fromCharCode(Math.floor(Math.random()*26)+this.charCodea);
        }
    }

    angular.module("trNgGridDemo", ["ngRoute", "ngAnimate", "trNgGrid"])
        .config(["$routeProvider", "$locationProvider", ($routeProvider:any, $locationProvider:any)=>{
            $routeProvider
                .when('/Common', {
                    templateUrl: 'demo/html/common.html'
                })
                .when('/ColumnPicker', {
                    templateUrl: 'demo/html/columns.html'
                })
                .when('/Paging', {
                    templateUrl: 'demo/html/paging.html'
                })
                .when('/ServerSide', {
                    templateUrl: 'demo/html/serverside.html'
                })
                .when('/Templates', {
                    templateUrl: 'demo/html/templates.html'
                })
                .when('/Detailed', {
                    templateUrl: 'demo/html/detailed.html'
                })
                .otherwise({
                    templateUrl: 'demo/html/default.html'
                });
            $routeProvider.de


            // configure html5 to get links working on jsfiddle
            //$locationProvider.html5Mode(true);
        }])
        .directive("projectMarkupTo",[
            ()=>{
                return{
                    restrict:"EA",
                    template: (element:JQuery, tAttr:ng.IAttributes) => {
                        var projectionElementId = tAttr["projectMarkupTo"];
                        var currentElementContents = element
                            .html()
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/"/g, "&quot;")
                            .replace(/  /g, "&nbsp;&nbsp;");
                        $(projectionElementId).html(currentElementContents);
                    }
                };
            }
        ]);

}

