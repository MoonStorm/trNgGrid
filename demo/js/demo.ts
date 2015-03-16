module TrNgGridDemo{
    declare var prettyPrintOne: (unformattedText:string, language?:string, generateLineNumbers?:boolean) => string;

    export interface ITestControllerScope extends ng.IScope{
        externalTestProp: string;
        myItemsTotalCount: number;
        myLocale: string;
        myItems: Array<any>;
        myCurrentPage: number;
        myFields: Array<string>;
        myItemsCurrentPageIndex: number;
        myPageItemsCount: number;
        mySelectedItems: Array<any>;
        myGridFilteredItems: Array<any>;
        myGridFilteredItemsPage: Array<any>;
        myGlobalFilter: string;
        myColumnFilter: Object;
        myOrderBy: string;
        myEnableFieldAutoDetection: boolean;
        myOrderByReversed: boolean;
        myEnableFiltering: boolean;
        myEnableSorting: boolean;
        myEnableSelections: boolean;
        mySelectionMode: TrNgGrid.SelectionMode;
        myEnableMultiRowSelections: boolean;
        SelectionMode: any;
        availableFields: Array<string>;

        requestedItemsGridOptions: Object;
        myNextItemsTotalCount:number;

        alert: (message: string) => void;
        alertOnSelectionChange: () => void;
        addNew: () => void;
        onServerSideItemsRequested: (currentPage: number, pageItems:number, filterBy: string, filterByFields: Object, orderBy: string, orderByReverse: boolean) => void;
        generateItems: (pageItems: number, totalItems?: number, generateComplexItems?:boolean) => void;
        addDateToItems: () => void;
        showMessage: (event: ng.IAngularEvent, msg: string) => void;
        simulateServerSideQueries: (pageItems: number, totalItems?: number) => void;
        removeSelectedElements: () => void;
        //toogleFieldEnforcement: (fieldName: string) => void;
    }

    export enum RndGenOptions{
        Numbers,
        Lowercase,
        Uppercase
    }

    var charCodeA = "A".charCodeAt(0);
    var charCodea = "a".charCodeAt(0);

    var randomNumber = () => {
        return Math.floor(Math.random() * 10).toString();
    };

    var randomUpercase = () => {
        return String.fromCharCode(Math.floor(Math.random() * 26) + charCodeA);
    };

    var randomLowercase = () => {
        return String.fromCharCode(Math.floor(Math.random() * 26) + charCodea);
    };

    export var randomString: (count: number, ...options: RndGenOptions[]) => string = (count: number, ...options: RndGenOptions[]) => {
        if (options.length == 0) {
            options = <Array<RndGenOptions>>[RndGenOptions.Lowercase, RndGenOptions.Uppercase, RndGenOptions.Numbers];
        }
        var s = '';
        while (s.length < count) {
            switch (options[Math.floor(Math.random() * options.length)]) {
                case RndGenOptions.Numbers:
                    s += randomNumber();
                    break;
                case RndGenOptions.Lowercase:
                    s += randomLowercase();
                    break;
                case RndGenOptions.Uppercase:
                    s += randomUpercase();
                    break;

            }
        }
        return s;
    };

    export class TestController{ 
        constructor(public $scope: ITestControllerScope, $window: ng.IWindowService, $timeout: ng.ITimeoutService) {
            TrNgGrid.debugMode = true;
            $scope.externalTestProp = "Externals should be visible";
            $scope.myLocale = "en";
            $scope.myGlobalFilter="";
            $scope.myOrderBy="";
            $scope.myOrderByReversed=false;
            $scope.myColumnFilter={};
            $scope.mySelectedItems = [];
            $scope.myGridFilteredItems = [];
            $scope.myGridFilteredItemsPage = [];
            $scope.myItemsTotalCount = 0;
            $scope.myItems=null;
            $scope.myEnableFieldAutoDetection = true,
            $scope.availableFields = ["id", "name", "address"];
            $scope.myFields = null;
            $scope.myItemsCurrentPageIndex = 0;
            $scope.myPageItemsCount=10;
            $scope.myEnableFiltering = true;
            $scope.myEnableSorting = true;
            $scope.myEnableSelections = true;
            $scope.myEnableMultiRowSelections = true;
            $scope.myNextItemsTotalCount = 100;

            //$scope.$watch("myGridFilteredItemsPage", (newValue, oldvalue) => {
            //    debugger;
            //});

            //$scope.$watch("myGridFilteredItems", (newValue, oldvalue) => {
            //    debugger;
            //});

            $scope.alert = (message) => {
                $window.alert(message);
            };
            $scope.alertOnSelectionChange = function(){
                $scope.$watch("mySelectedItems.length", function(newLength: number){
                    if (newLength > 0) {
                        $window.alert("The selection now contains " + newLength + " items");
                    }
                });
            };
            /*$scope.toogleFieldEnforcement = (fieldName: string) => {
                var fieldIndex = $scope.myFields.indexOf(fieldName);
                if (fieldIndex < 0) {
                    $scope.myFields.push(fieldName);
                }
                else {
                    $scope.myFields.splice(fieldIndex, 1);
                }
            };*/
            $scope.removeSelectedElements = () => {
                angular.forEach($scope.mySelectedItems, (selectedItem) => {
                    $scope.myItems.splice($scope.myItems.indexOf(selectedItem), 1);
                }); 
            };
            $scope.generateItems = (pageItems: number, totalItems?: number, generateComplexItems?: boolean) => {
                $scope.myItems = [];
                //$scope.myItems.splice(0);
                $scope.myPageItemsCount = pageItems;
                $scope.myItemsTotalCount = totalItems ? totalItems : $scope.myPageItemsCount;
                this.generateItems($scope.myItems, $scope.myPageItemsCount, generateComplexItems);
                //$scope.mySelectedItems=$scope.myItems.slice(0);
            };

            $scope.addDateToItems = () => { this.addDateToItems(); };

            var prevServerItemsRequestedCallbackPromise: ng.IPromise<any>;
            var serverSideRequestCount = 0;
            $scope.onServerSideItemsRequested = (currentPage:number, pageItems:number, filterBy:string, filterByFields:Object, orderBy:string, orderByReverse:boolean)=>{
                if(prevServerItemsRequestedCallbackPromise){
                    $timeout.cancel(prevServerItemsRequestedCallbackPromise);
                    prevServerItemsRequestedCallbackPromise = null;
                }
                $scope.requestedItemsGridOptions = {
                    serverSideRequestCount:++serverSideRequestCount,
                    pageItems:pageItems,
                    currentPage:currentPage,
                    filterBy:filterBy,
                    filterByFields: angular.toJson(filterByFields),
                    orderBy:orderBy,
                    orderByReverse:orderByReverse,
                    requestTrapped:true
                };

                $scope.generateItems(pageItems,$scope.myNextItemsTotalCount);
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
            $scope.SelectionMode = TrNgGrid.SelectionMode;

            $scope.addNew = () => {
                this.addNewRandomItem($scope.myItems);
            };

            $scope.showMessage = (event, msg)=>{
                event.stopPropagation();
                $window.alert(msg);
            };

            $scope.$watch("myEnableFieldAutoDetection", (newValue: boolean, oldValue: boolean) => {
                if (newValue === oldValue)
                    return;

                if (newValue) {
                    $scope.myFields = null;
                }
                else {
                    $scope.myFields = $scope.availableFields.slice();
                }
            });

        }

        generateItems(items:Array<any>, itemCount:number, generateComplexItems?:boolean){
            // generate n random myItems
            for(var index=0;index<itemCount;index++){
                this.addNewRandomItem(items, generateComplexItems);
            }
        }

        private generateAddress() {
            var addressColumnFilter = this.$scope.myColumnFilter["address"] ? this.$scope.myColumnFilter["address"] : "";
            return this.$scope.myGlobalFilter + randomString(2, RndGenOptions.Numbers) + " " + randomUpercase() + randomString(Math.random() * 10 + 1, RndGenOptions.Lowercase) + addressColumnFilter + " Ave";
        }

        addNewRandomItem(items: Array<any>, generateComplexItems?: boolean){
            var idColumnFilter = this.$scope.myColumnFilter["id"]?this.$scope.myColumnFilter["id"]:"";
            var nameColumnFilter = this.$scope.myColumnFilter["name"]?this.$scope.myColumnFilter["name"]:"";

            var itemAddress: any;
            if (generateComplexItems) {
                itemAddress = {
                    last: this.generateAddress(),
                    prev: []
                };
                for (var addrIndex = 0; addrIndex < Math.random() * 5 + 1; addrIndex++) {
                    itemAddress.prev.push({
                        address: this.generateAddress(),
                        index: addrIndex
                    });
                }
            }
            else {
                itemAddress = this.generateAddress();
            }
            items.push({
                id: parseInt(idColumnFilter + randomString(Math.random() * 2 + 1, RndGenOptions.Numbers)), //items.length), 
                name: randomUpercase() + randomString(Math.random() * 5 + 1, RndGenOptions.Lowercase) + this.$scope.myGlobalFilter + nameColumnFilter,
                address: itemAddress,
            });
        }

        addDateToItems() {
            var maxTimeSpan = new Date(1980, 0).getTime(); // approx 10 years span
            for (var itemIndex = 0; itemIndex < this.$scope.myItems.length; itemIndex++) {
                var rndTimeSpan = Math.floor(Math.random() * maxTimeSpan);
                this.$scope.myItems[itemIndex]["born"] = new Date(new Date(1980, 2, 4).getTime() + rndTimeSpan);
            }
        }
    }

    function populateSample(dstElement: any, rawText: string) {
        var formattedText = rawText
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            //.replace(/\n/g, '<br/>');
            //.replace(/</g, "&lt;")
            //.replace(/>/g, "&gt;")
            //.replace(/"/g, "&quot;");
        formattedText = prettyPrintOne(formattedText, null, false);

        //.replace(/</g, "&lt;")
        //.replace(/>/g, "&gt;")
        //.replace(/"/g, "&quot;");
        //.replace(/  /g, "&nbsp;&nbsp;");
        angular.element(dstElement)
            .html(formattedText)
            .addClass('prettyprint prettyprinted')
            .attr("ng-non-bindable", "");        
    }

    angular.module("trNgGridDemo")
        .controller("TrNgGridDemo.TestController", ["$scope", "$window", "$timeout",  TestController])
        .directive("projectMarkupTo", [ "$document",
            ($document:ng.IDocumentService) => { 
                return {
                    restrict: "EA",
                    template: (element: JQuery, tAttrs: ng.IAttributes) => {
                        var projectionElementId = tAttrs["projectMarkupTo"];
                        populateSample(document.querySelector(projectionElementId), element.html());
                    }
                };
            }
        ])
        .directive("projectMarkupFromStateView", [ "$http", "$state",
            ($http:ng.IHttpService, $state:ng.ui.IStateService) => {
                return {
                    restrict: "EA",
                    compile: (element: JQuery, tAttrs: Object) => {
                        var stateView = tAttrs["projectMarkupFromStateView"];
                        var currentStateView = $state.current.views[stateView];
                        $http.get(currentStateView.template).success((data: string) => {
                            populateSample(element, data);
                        });
                    }
                };
            }
        ])
        .filter("testComputedField", function() {
            return function(combinedFieldValueUnused: any, item: any) {
                return item.id + " / " + item.name;
            };
        })
        .filter('capitalize', function() {
            return function(input, all) {
                return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
                               return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                           }) : '';
            }
        });
    //.directive("fixedHeaderFooter", [
    //    () => {
    //        var applyFixedHeaderFooter = (grid: JQuery) => {
    //            // too buggy, doesn't work
    //            // $(element).fixedHeaderTable({ height: attrs['fixedHeaderFooter'] }).show();

    //            // http://larrysteinle.com/2011/12/04/jqueryscrolltable/
    //            var scrollBarWidth = 16; //IE, Chrome, Mozilla & Opera use Size 16 by default
    //            var $scroll = $(grid);
    //            var $table = $scroll.find("table");
    //            var $header = $table.find("thead:first-child");
    //            var $footer = $table.find("tfoot:first-child");
    //            var $body = $table.find("tbody:first-child");

    //            //Remove Cell Width Formatting
    //            $body.find("tr:first-child").find("th, td").each(function (i, c) { $(c).css("width", "auto"); });
    //            $header.find("th, td").each(function (i, c) { $(c).css("width", "auto"); });
    //            $footer.find("th, td").each(function (i, c) { $(c).css("width", "auto"); });

    //            //Set Width of Table, Header, Footer and Body Elements
    //            $table.css("width", $scroll.width() -scrollBarWidth + 2);

    //            //Disable positioning so browser can do all the hard work.
    //            //This allows us to support min-width, max-width, nowrap, etc.
    //            $header.css("position", "relative");
    //            $footer.css("position", "relative");

    //            //Navigate thru each cell hard coding the width so when the association
    //            //is broken all of the columns will continue to align based on normal
    //            //table rules. Only traverse the first row cells in the body for efficiency.
    //            $body.find("tr:first-child").find("th, td").each(function (i, c) { $(c).css("width", $(c).width()); });
    //            $header.find("th, td").each(function (i, c) { $(c).css("width", $(c).width()); });
    //            $footer.find("th, td").each(function (i, c) { $(c).css("width", $(c).width()); });

    //            //Enable positioning for fixed header positioning.
    //            $header.css("position", "absolute");
    //            $footer.css("position", "absolute");

    //            $table.css("width", $scroll.width() - scrollBarWidth - 3);

    //            //Position Heading Based on Height of Heading
    //            $scroll.css("margin-top", ($header.height() + 1) + "px");
    //            $header.css("margin-top", (($header.height() - 1) * -1) + "px");

    //            //Position Footer Based on Height of Scroll Host
    //            $scroll.css("margin-bottom", $footer.css("height"));
    //            $footer.css("margin-top", $scroll.height() - 1 + "px");
    //        };

    //        return {
    //            // Restrict it to be an attribute in this case
    //            restrict: 'A',
    //            // responsible for registering DOM listeners as well as updating the DOM
    //            link: function (scope: ng.IScope, element: JQuery, attrs: ng.IAttributes) {
    //            }
    //        };
    //    }
    //]);
}

