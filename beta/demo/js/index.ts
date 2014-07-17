/// <reference path="../../src/external/typings/jquery/jquery.d.ts" />
/// <reference path="../../src/external/typings/angularjs/angular.d.ts" />

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

        addNew: () => void;
        onServerSideItemsRequested: (currentPage: number, filterBy: string, filterByFields: Object, orderBy: string, orderByReverse: boolean) => void;
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
        constructor(public $scope:ITestControllerScope, $window:ng.IWindowService, $timeout:ng.ITimeoutService){
            $scope.externalTestProp = "Externals should be visible";
            $scope.myLocale = "en";
            $scope.myGlobalFilter="";
            $scope.myOrderBy="";
            $scope.myOrderByReversed=false;
            $scope.myColumnFilter={};
            $scope.mySelectedItems=[];
            $scope.myItemsTotalCount = 0;
            $scope.myItems = [];
            $scope.myEnableFieldAutoDetection = true,
            $scope.availableFields = ["id", "name", "address"];
            $scope.myFields = null;
            $scope.myItemsCurrentPageIndex = 0;
            $scope.myPageItemsCount=10;
            $scope.myEnableFiltering = true;
            $scope.myEnableSorting = true;
            $scope.myEnableSelections = true;
            $scope.myEnableMultiRowSelections = true;
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
            $scope.generateItems = (pageItems: number, totalItems?: number, generateComplexItems?:boolean) => {
                $scope.myItems = [];
                //$scope.myItems.splice(0);
                $scope.myPageItemsCount = pageItems;
                $scope.myItemsTotalCount = totalItems?totalItems:$scope.myPageItemsCount;
                this.generateItems($scope.myItems, $scope.myPageItemsCount, generateComplexItems);
                //$scope.mySelectedItems=$scope.myItems.slice(0);
            };

            $scope.addDateToItems = () => { this.addDateToItems(); };

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

                $scope.generateItems(10,100, true);
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
                id: parseInt(randomString(Math.random() * 2 + 1, RndGenOptions.Numbers) + idColumnFilter),
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

    export interface IMainControllerScope extends ng.IScope {
        theme: string;
        themeUrl: string;
        isFrame: boolean;
    }

    export class MainController {
        constructor(private $scope: IMainControllerScope, private $sce: ng.ISCEService, $location: ng.ILocationService) {
            $scope.isFrame = $location.absUrl().indexOf("isFrame=true") >= 0;
            $scope.theme = "slate";
            this.setupThemeUrl();

            this.$scope.$watch("theme", (newValue: string, oldValue: string) => {
                if (newValue != oldValue) {
                    this.setupThemeUrl();
                }
            });
        }

        /*setupLocaleUrl() {
            var localeUrl = "https://code.angularjs.org/1.2.9/i18n/angular-locale_" + this.$scope.locale + ".js";
            this.$scope.localeUrl = this.$sce.trustAsResourceUrl(localeUrl);
        }*/

        setupThemeUrl() {
            var themeUrl = "//netdna.bootstrapcdn.com/bootswatch/3.0.3/"+this.$scope.theme+"/bootstrap.min.css";
            this.$scope.themeUrl = this.$sce.trustAsResourceUrl(themeUrl);
        }
    }

    // https://github.com/ocombe/ocLazyLoad
    angular.module("trNgGridDemo", ["ngRoute", "trNgGrid", "ui.bootstrap", "oc.lazyLoad"])
        .config(["$routeProvider", "$locationProvider", ($routeProvider: any, $locationProvider: any) => {
            // html5 is not working
            //$locationProvider
            //    .html5Mode(true)
            //    .hashPrefix('!');

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
                .when('/Selections', {
                    templateUrl: 'demo/html/selections.html'
                })
                .when('/ServerSide', {
                    templateUrl: 'demo/html/serverside.html'
                })
                .when('/Customizations', {
                    templateUrl: 'demo/html/customizations.html'
                })
                .when('/GlobalOptions', {
                    templateUrl: 'demo/html/globaloptions.html'
                })
                .when('/Localization', {
                    templateUrl: 'demo/html/localization.html'
                })
                .when('/TestNgSwitch', {
                    templateUrl: 'demo/html/tests/test_ng_switch.html'
                })
                .when('/TestItemsUpdate', {
                    templateUrl: 'demo/html/tests/test_items_update.html'
                })
                .when('/TestHybridMode', {
                    templateUrl: 'demo/html/tests/test_hybrid_mode.html'
                })
                .when('/TestFixedHeaderFooter', {
                    templateUrl: 'demo/html/tests/test_fixed_header_footer.html'
                })
                .when('/TemplatePager', {
                    templateUrl: 'demo/html/tests/test_template_pager.html'
                })
                .when('/Benchmark', {
                    templateUrl: 'demo/html/tests/test_benchmark.html',
                    resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                        loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            // you can lazy load files for an existing module
                            return $ocLazyLoad.load(
                                {
                                    name: 'ngGrid',
                                    files:
                                    [
                                        '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',
                                        '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.css',
                                        '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid-flexible-height.min.js',
                                        '//cdnjs.cloudflare.com/ajax/libs/ng-grid/2.0.11/ng-grid.min.js',
                                    ]
                                });
                        }]
                    }
                })
                .otherwise({
                    templateUrl: 'demo/html/default.html'
                });
        }])
        .directive("projectMarkupTo", [
            () => {
                return {
                    restrict: "EA",
                    template: (element: JQuery, tAttr: ng.IAttributes) => {
                        var projectionElementId = tAttr["projectMarkupTo"];
                        var currentElementContents = element
                            .html()
                            .replace(/&/g, '&amp;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#39;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/\n/g, '<br>');
                            //.replace(/</g, "&lt;")
                            //.replace(/>/g, "&gt;")
                            //.replace(/"/g, "&quot;");
                        currentElementContents = prettyPrintOne(currentElementContents, null, false);

                        //.replace(/</g, "&lt;")
                        //.replace(/>/g, "&gt;")
                        //.replace(/"/g, "&quot;");
                        //.replace(/  /g, "&nbsp;&nbsp;");
                        angular.element(document.querySelector(projectionElementId))
                            .html(currentElementContents)
                            .addClass('prettyprint prettyprinted')
                            .attr("ng-non-bindable", "");
                    }
                };
            }
        ])
        .run(function () {
            TrNgGrid.debugMode = true;

            var defaultTranslation = {};

            var enTranslation = angular.extend({}, defaultTranslation);
            enTranslation[TrNgGrid.translationDateFormat] = "yyyy-MM-dd";
            TrNgGrid.translations["en"] = enTranslation;

            var enGbTranslation = angular.extend({}, enTranslation);
            // more date formats here: http://en.wikipedia.org/wiki/Date_format_by_country
            enGbTranslation[TrNgGrid.translationDateFormat] = "dd/MM/yyyy";
            TrNgGrid.translations["en-gb"] = enGbTranslation;

            var deTranslation = angular.extend({}, enTranslation, 
             {
                "Born": "Geboren",
                "Search": "Suche",
                "First Page": "Erste Seite",
                "Next Page": "Nächste Seite",
                "Previous Page": "Vorherige Seite",
                "Last Page": "Letzte Seite",
                "Sort": "Sortieren",
                "No items to display": "Nichts darzustellen",
                "displayed": "angezeigt",
                "in total": "insgesamt"
                });
            TrNgGrid.translations["de"] = deTranslation;

            var deChTranslation = angular.extend({}, deTranslation);
            deChTranslation[TrNgGrid.translationDateFormat] = "dd.MM.yyyy";
            TrNgGrid.translations["de-ch"] = deChTranslation;
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

