/// <reference path="../external/typings/jquery/jquery.d.ts"/>
/// <reference path="../external/typings/angularjs/angular.d.ts"/>

module TrNgGrid{
    export declare var tableCssClass: string;
    export declare var cellCssClass: string;
    export declare var columnHeaderContentsCssClass: string;
    export declare var titleCssClass: string;
    export declare var sortCssClass: string;
    export declare var filterColumnCssClass: string;
    export declare var filterInputWrapperCssClass: string;
    export declare var sortActiveCssClass: string;
    export declare var sortInactiveCssClass: string;
    export declare var sortReverseOrderCssClass: string;
    export declare var sortNormalOrderCssClass: string;
    export declare var selectedRowCssClass: string;
    export declare var footerOpsContainerCssClass: string;

    export declare var columnHeaderTemplateId;
    export declare var columnFilterTemplateId;
    export declare var columnSortTemplateId;

    var tableDirective="trNgGrid";

    var headerDirective="trNgGridHeader";
    var headerDirectiveAttribute = "tr-ng-grid-header";
    columnHeaderTemplateId = headerDirective + ".html";

    var bodyDirective="trNgGridBody";
    var bodyDirectiveAttribute="tr-ng-grid-body";

    var footerDirective="trNgGridFooter";
    var footerDirectiveAttribute="tr-ng-grid-footer";

    var globalFilterDirective="trNgGridGlobalFilter";
    var globalFilterDirectiveAttribute="tr-ng-grid-global-filter";

    var pagerDirective="trNgGridPager";
    var pagerDirectiveAttribute="tr-ng-grid-pager";

    var columnDirective="trNgGridColumn";
    var columnDirectiveAttribute="tr-ng-grid-column";

    var sortDirective="trNgGridColumnSort";
    var sortDirectiveAttribute="tr-ng-grid-column-sort";
    columnSortTemplateId = sortDirective + ".html";

    var filterColumnDirective="trNgGridColumnFilter";
    var filterColumnDirectiveAttribute = "tr-ng-grid-column-filter";
    columnFilterTemplateId = filterColumnDirective+".html";

    var rowPageItemIndexAttribute="tr-ng-grid-row-page-item-index";

    tableCssClass="tr-ng-grid table table-bordered table-hover"; // at the time of coding, table-striped is not working properly with selection
    cellCssClass = "tr-ng-cell";
    columnHeaderContentsCssClass = "tr-ng-column-header";
    titleCssClass="tr-ng-title"; 
    sortCssClass="tr-ng-sort";
    filterColumnCssClass="tr-ng-column-filter";
    filterInputWrapperCssClass="";
    sortActiveCssClass ="tr-ng-sort-active text-info";
    sortInactiveCssClass ="tr-ng-sort-inactive text-muted";
    sortReverseOrderCssClass ="tr-ng-sort-order-reverse glyphicon glyphicon-chevron-up";
    sortNormalOrderCssClass = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-down";
    selectedRowCssClass="active";
    footerOpsContainerCssClass="tr-ng-grid-footer form-inline";

    interface IGridColumnOptions{
        fieldName: string;
        displayName: string;
        displayAlign: string;
        displayFormat: string;
        enableSorting:boolean;
        enableFiltering:boolean;
        cellWidth:string;
        cellHeight:string;
    }

    interface IGridOptions{
        items: Array<any>;
        selectedItems:Array<any>;
        filterBy:string;
        filterByFields:Object;
        orderBy:string;
        orderByReverse:boolean;
        pageItems:number;
        currentPage:number;
        totalItems:number;
        enableFiltering:boolean;
        enableSorting:boolean;
        enableSelections:boolean;
        enableMultiRowSelections:boolean;
        onDataRequired:(gridOptions:IGridOptions)=>void;
        onDataRequiredDelay:number;
        gridColumnDefs:Array<IGridColumnOptions>;
    }

    interface IGridScope extends IGridOptions, ng.IScope{

    }

    interface IGridColumnScope extends ng.IScope{
        currentGridColumnDef:IGridColumnOptions;
        gridOptions:IGridOptions;
        toggleSorting: (propertyName:string) => void;
        filter:string;
    }

    interface IGridBodyScope extends ng.IScope{
        gridOptions:IGridOptions;
        toggleItemSelection:(item:any)=>void;
    }

    interface IGridFooterScope extends ng.IScope{
        gridOptions:IGridOptions;
        isPaged:boolean;
        totalItemsCount:number;
        startItemIndex: number;
        lastPageIndex: number;
        pageIndexes: Array<number>;
        endItemIndex:number;
        pageCanGoBack:boolean;
        pageCanGoForward: boolean;
        pageSelectionActive: boolean;
        switchPageSelection: ($event: ng.IAngularEvent, pageSelectionActive: boolean) => void;
        navigateToPage:($event:ng.IAngularEvent, pageIndex:number)=>void;
    }

    class GridController{
        public externalScope:ng.IScope;
        public internalScope:ng.IScope;
        public gridOptions:IGridOptions;
        private gridElement:JQuery;
        private scheduledRecompilationDereg:Function;
        private dataRequestPromise:ng.IPromise<any>;

        constructor(
            private $compile:ng.ICompileService,
            $scope:IGridScope,
            $element:JQuery,
            $attrs:ng.IAttributes,
            $transclude: ng.ITranscludeFunction,
            private $parse:ng.IParseService,
            private $timeout: ng.ITimeoutService) {

            this.gridElement = $element;
            this.internalScope = $scope;
            this.scheduledRecompilationDereg = null;

            var scopeOptionsIdentifier = "gridOptions";

            // initialise the options
            this.gridOptions = <IGridOptions>{
                items: [],
                selectedItems:[],
                filterBy:null,
                filterByFields:{},
                orderBy:null,
                orderByReverse:false,
                pageItems:null,
                currentPage:0,
                totalItems:null,
                enableFiltering:true,
                enableSorting:true,
                enableSelections:true,
                enableMultiRowSelections:true,
                onDataRequiredDelay:1000
            };
            this.gridOptions.onDataRequired = $attrs["onDataRequired"]?$scope.onDataRequired:null;
            this.gridOptions.gridColumnDefs = [];
            $scope[scopeOptionsIdentifier] = this.gridOptions;

            this.externalScope = this.internalScope.$parent;

            //link the outer scope with the internal one
            this.linkScope(this.internalScope, scopeOptionsIdentifier, $attrs);

            //set up watchers for some of the special attributes we support

            if(this.gridOptions.onDataRequired){
                $scope.$watchCollection("[gridOptions.filterBy, " +
                    "gridOptions.filterByFields, " +
                    "gridOptions.orderBy, " +
                    "gridOptions.orderByReverse, " +
                    "gridOptions.currentPage]",()=>{

                    if(this.dataRequestPromise){
                        this.$timeout.cancel(this.dataRequestPromise);
                        this.dataRequestPromise = null;
                    }

                    // for the time being, Angular is not able to bind only when losing focus, so we'll introduce a delay
                    this.dataRequestPromise = this.$timeout(()=>{
                        this.dataRequestPromise = null;
                        this.gridOptions.onDataRequired(this.gridOptions);
                    },this.gridOptions.onDataRequiredDelay, true);
                });
            }

            this.internalScope.$watch("enableMultiRowSelections", (newValue:boolean, oldValue:boolean)=>{
                if(newValue!==oldValue && !newValue){
                    if(this.gridOptions.selectedItems.length > 1){
                        this.gridOptions.selectedItems.splice(1);
                    }
                }
            });
            this.internalScope.$watch("enableSelections", (newValue:boolean, oldValue:boolean)=>{
                if(newValue!==oldValue && !newValue){
                    this.gridOptions.selectedItems.splice(0);
                    this.gridOptions.enableMultiRowSelections = false;
                }
            });
        }

        setColumnOptions(columnIndex:number, columnOptions:IGridColumnOptions){
            if(columnIndex>=this.gridOptions.gridColumnDefs.length){
                this.gridOptions.gridColumnDefs.push(<IGridColumnOptions>{});
                this.setColumnOptions(columnIndex, columnOptions);
            }
            else{
                this.gridOptions.gridColumnDefs[columnIndex] = columnOptions;
            }
        }

        toggleSorting(propertyName: string) {
            if(this.gridOptions.orderBy!=propertyName){
                // the column has changed
                this.gridOptions.orderBy = propertyName;
            }
            else{
                // the sort direction has changed
                this.gridOptions.orderByReverse=!this.gridOptions.orderByReverse;
            }
        }

        setFilter(propertyName:string, filter:string){
            if(!filter){
                delete(this.gridOptions.filterByFields[propertyName]);
            }
            else{
                this.gridOptions.filterByFields[propertyName] = filter;
            }

            // in order for someone to successfully listen to changes made to this object, we need to replace it
            this.gridOptions.filterByFields = $.extend({}, this.gridOptions.filterByFields);
        }

        toggleItemSelection(item:any){
            if(!this.gridOptions.enableSelections)
                return;

            var itemIndex = this.gridOptions.selectedItems.indexOf(item);
            if(itemIndex>=0){
                this.gridOptions.selectedItems.splice(itemIndex, 1);
            }
            else{
                if(!this.gridOptions.enableMultiRowSelections){
                    this.gridOptions.selectedItems.splice(0);
                }
                this.gridOptions.selectedItems.push(item);
            }
        }

        scheduleRecompilationOnAvailableItems(){
            if(this.scheduledRecompilationDereg || (this.gridOptions.items && this.gridOptions.items.length))
                // already have one set up
                return;

            this.scheduledRecompilationDereg = this.internalScope.$watch("items.length", (newLength:number, oldLength:number)=>{
                if (newLength > 0) {
                   // unregister the watch
                   this.scheduledRecompilationDereg();

                   // recompile
                   this.$compile(this.gridElement)(this.externalScope);
               }
            });
        }

        linkScope(scope:ng.IScope, scopeTargetIdentifier:string, attrs:ng.IAttributes){
            // this method shouldn't even be here
            // but it is because we want to allow people to either set attributes with either a constant or a watchable variable

            // watch for a resolution to issue #5951 on angular
            // https://github.com/angular/angular.js/issues/5951

            var target = scope[scopeTargetIdentifier];

            for(var propName in target){
                var attributeExists = typeof(attrs[propName])!="undefined" && attrs[propName]!=null;

                if(attributeExists){
                    var isArray = false;

                    // initialise from the scope first
                    if(typeof(scope[propName])!="undefined" && scope[propName]!=null){
                        target[propName] = scope[propName];
                        isArray=target[propName] instanceof Array;
                    }

                    //allow arrays to be changed: if(!isArray){
                    var compiledAttr = this.$parse(attrs[propName]);
                    var dualDataBindingPossible = /*typeof(compiledAttr)!="array" &&*/ compiledAttr && compiledAttr.assign; // very fragile, replace it as soon as possible
                    if(dualDataBindingPossible){
                        ((propName:string)=>
                        {
                            // set up one of the bindings
                            scope.$watch(scopeTargetIdentifier+"."+propName, (newValue:any, oldValue:any)=>{
                                if(newValue!==oldValue){
                                        scope[propName] = target[propName];
                                }
                            });

                            // set up the other one
                            scope.$watch(propName, (newValue:any, oldValue:any)=>{
                                if(newValue!==oldValue){
                                    target[propName] = scope[propName];
                                }
                            });
                        })(propName);
                    }
                }
            }
        }

        splitByCamelCasing(input:string) {
            var splitInput = input.split(/(?=[A-Z])/);
            if(splitInput.length && splitInput[0].length){
                splitInput[0] = splitInput[0][0].toLocaleUpperCase()+splitInput[0].substr(1);
            }

            return splitInput.join(" ");
        }
    }

    angular.module("trNgGrid", [])
        .directive(tableDirective, [function () {
                return {
                    restrict: 'A',
                    // create an isolated scope, and remember the original scope can be found in the parent
                    scope: {
                        items: '=',
                        selectedItems:'=?',
                        filterBy:'=?',
                        filterByFields:'=?',
                        orderBy:'=?',
                        orderByReverse:'=?',
                        pageItems:'=?',
                        currentPage:'=?',
                        totalItems:'=?',
                        enableFiltering:'=?',
                        enableSorting:'=?',
                        enableSelections:'=?',
                        enableMultiRowSelections:'=?',
                        onDataRequired:'&',
                        onDataRequiredDelay:'=?'
                    },
                    // executed prior to pre-linking phase but after compilation
                    // as we're creating an isolated scope, we need something to link them
                    controller: ["$compile", "$scope", "$element", "$attrs", "$transclude","$parse","$timeout", GridController],
                    // dom manipulation in the compile stage
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        templateElement.addClass(tableCssClass);
                        var insertFooterElement = false;
                        var insertHeadElement = false;

                        // make sure the header is present
                        var tableHeadElement = templateElement.children("thead");
                        if (tableHeadElement.length == 0) {
                            tableHeadElement = $("<thead>");
                            insertHeadElement = true;
                        }
                        var tableHeadRowTemplate = tableHeadElement.children("tr");
                        if(tableHeadRowTemplate.length == 0){
                            tableHeadRowTemplate = $("<tr>").appendTo(tableHeadElement);
                        }
                        tableHeadRowTemplate.attr(headerDirectiveAttribute, "");
                        // help a bit with the attributes
                        tableHeadRowTemplate.children("th[field-name]").attr(columnDirectiveAttribute,"");

                        //discoverColumnDefinitionsFromUi(tableHeadRowTemplate);

                        // make sure the body is present
                        var tableBodyElement = templateElement.children("tbody");
                        if (tableBodyElement.length === 0) {
                            tableBodyElement = $("<tbody>").appendTo(templateElement);
                        }

                        var tableBodyRowTemplate = tableBodyElement.children("tr");
                        if (tableBodyRowTemplate.length === 0) {
                            tableBodyRowTemplate = $("<tr>").appendTo(tableBodyElement);
                        }
                        tableBodyElement.attr(bodyDirectiveAttribute,"");

                        // make sure the footer is present
                        var tableFooterElement = templateElement.children("tfoot");
                        if (tableFooterElement.length == 0) {
                            tableFooterElement = $("<tfoot>");
                            insertFooterElement = true;
                        }
                        var tableFooterRowTemplate = tableFooterElement.children("tr");
                        if(tableFooterRowTemplate.length == 0){
                            tableFooterRowTemplate = $("<tr>").appendTo(tableFooterElement);
                        }
                        if(tableFooterRowTemplate.children("td").length==0){
                            var fullTableLengthFooterCell = $("<td>")
                                .attr("colspan", "999")//TODO: fix this hack
                                .appendTo(tableFooterRowTemplate);

                            var footerOpsContainer = $("<div>")
                                .attr(footerDirectiveAttribute,"")
                                .appendTo(fullTableLengthFooterCell);
                        }

                        if(insertHeadElement){
                            templateElement.prepend(tableHeadElement);
                        }

                        if(insertFooterElement){
                            tableFooterElement.insertBefore(tableBodyElement);
                        }
                    }
                };
            }])
        .directive(headerDirective,["$compile",
            function($compile:ng.ICompileService){
                return {
                    restrict: 'A',
                    scope:false,
                    require:'^'+tableDirective,
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        return{ 
                            //pre linking function - executed before children get linked (be careful with the dom changes)
                            pre:function (scope: ng.IScope, instanceElement: JQuery, tAttrs: ng.IAttributes, gridController:GridController) {
                                // deal with the situation where no column definition exists on the th elements in the table
                                if (instanceElement.children("th").length == 0) {
                                    // no columns defined for the header, attempt to identify the properties and populate the columns definition
                                    if (gridController.gridOptions.items && gridController.gridOptions.items.length > 0) {
                                        var columnNames = [];
                                        for (var propName in gridController.gridOptions.items[0]) {
                                            // exclude the library properties
                                            if (!propName.match(/^[_\$]/g)) {
                                                columnNames.push(propName);
                                            }
                                        }
                                        for (var columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
                                            // create the th definition and add the column directive, serialised
                                            var headerCellElement = $("<th>").attr(columnDirectiveAttribute, "").attr("field-name", columnNames[columnIndex]).appendTo(instanceElement);
                                            $compile(headerCellElement)(scope);
                                        }
                                    }
                                    else
                                    {
                                        // watch for items to arrive and re-run the compilation then
                                        gridController.scheduleRecompilationOnAvailableItems();
                                    }
                                }
                            }
                        };
                    }
                }
            }
        ])
        .directive(columnDirective,[ "$compile",
            function($compile:ng.ICompileService){
                return {
                    restrict :'A',
                    // column settings, dual-databinding is not necessary here
                    scope: true,
                    require: '^' + tableDirective,
                    tem
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        var columnIndex:number;
                        return{
                            //pre linking function, prepare a few things
                            pre: function(scope: IGridColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController){
                                var isValid = instanceElement.prop("tagName")=="TH";
                                if(!isValid){
                                    throw "The template has an invalid header column template element. Column templates must be defined on TH elements inside THEAD/TR";
                                }

                                // set up the scope for the column inside the header
                                // the directive can be present on the header's td elements but also on the body's elements but we extract column information from the header only
                                columnIndex = instanceElement.parent().children("th").index(instanceElement);
                                if(columnIndex<0)
                                    return;

                                scope.gridOptions = controller.gridOptions;
                                scope.toggleSorting = (propertyName) => controller.toggleSorting(propertyName);
                                scope.filter="";
                                scope.$watch("filter", (newValue:string, oldValue:string) => {
                                    if(newValue!==oldValue){
                                        controller.setFilter(scope.currentGridColumnDef.fieldName, newValue);
                                    }
                                });

                                // prepare the child scope
                                var columnDefSetup = () =>{
                                    scope.currentGridColumnDef.fieldName = tAttrs["fieldName"];
                                    scope.currentGridColumnDef.displayName = typeof (tAttrs["displayName"]) == "undefined" ? controller.splitByCamelCasing(tAttrs["fieldName"]) : tAttrs["displayName"],
                                    scope.currentGridColumnDef.enableFiltering = tAttrs["enableFiltering"]=="true" || (typeof(tAttrs["enableFiltering"])=="undefined" && scope.gridOptions.enableFiltering);
                                    scope.currentGridColumnDef.enableSorting = tAttrs["enableSorting"]=="true" || (typeof(tAttrs["enableSorting"])=="undefined" && scope.gridOptions.enableSorting);
                                    scope.currentGridColumnDef.displayAlign = tAttrs["displayAlign"];
                                    scope.currentGridColumnDef.displayFormat = tAttrs["displayFormat"];
                                    scope.currentGridColumnDef.cellWidth = tAttrs["cellWidth"];
                                    scope.currentGridColumnDef.cellHeight = tAttrs["cellHeight"];
                                };

                                scope.currentGridColumnDef=<IGridColumnOptions>{};
                                columnDefSetup();

                                scope.$watchCollection("[gridOptions.enableFiltering,gridOptions.enableSorting]", (newValue:boolean, oldValue:boolean)=>{
                                        columnDefSetup();
                                });
                                controller.setColumnOptions(columnIndex, scope.currentGridColumnDef);
                                instanceElement.removeAttr(columnDirectiveAttribute);
                            },
                            //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                            post: function (scope: IGridColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController) {
                                // we're sure we're inside the header
                                if(scope.currentGridColumnDef){
                                    if(!scope.currentGridColumnDef.fieldName){
                                        throw "The column definition for trNgGrid must contain the field name";
                                    }

                                    if (scope.currentGridColumnDef.cellWidth) {
                                        instanceElement.css("width", scope.currentGridColumnDef.cellWidth);
                                    }
                                    if (scope.currentGridColumnDef.cellHeight) {
                                        instanceElement.css("height", scope.currentGridColumnDef.cellHeight);
                                    }

                                    if(instanceElement.text()==""){
                                        //prepopulate
                                        var cellContentsElement = $("<div>")
                                            .addClass(cellCssClass)
                                            .addClass(columnHeaderContentsCssClass);

                                        // the column title was not specified, attempt to include it and recompile
                                        var tileElement = $("<div>")
                                            .addClass(titleCssClass)
                                            .text(scope.currentGridColumnDef.displayName)
                                            .appendTo(cellContentsElement);

                                        $("<div>")
                                            .attr(sortDirectiveAttribute, "")
                                            .appendTo(tileElement);

                                        $("<div>")
                                            .attr(filterColumnDirectiveAttribute,"")
                                            .appendTo(cellContentsElement);

                                        //instanceElement.append(cellContentsElement);

                                        // pass the outside scope
                                        instanceElement.append($compile(cellContentsElement)(scope));
                                    }
                                }
                            }
                        }
                    }
                };
            }
        ])
        .directive(sortDirective, [
            function(){
                return {
                    restrict : 'A',
                    replace:true,
                    templateUrl : columnSortTemplateId
                };
            }
        ])
        .directive(filterColumnDirective, [
            function(){
                return {
                    restrict : 'A',
                    replace:true,
                    templateUrl: columnFilterTemplateId
                };
            }
        ])
        .filter("paging", ()=>{
            return (input:Array<any>, gridOptions:IGridOptions)=>{
                //currentPage?:number, pageItems?:number
                if(input)
                    gridOptions.totalItems = input.length;

                if(!gridOptions.pageItems || !input || input.length==0)
                    return input;

                if(!gridOptions.currentPage){
                    gridOptions.currentPage = 0;
                }

                var startIndex = gridOptions.currentPage*gridOptions.pageItems;
                if(startIndex>=input.length){
                    gridOptions.currentPage = 0;
                    startIndex = 0;
                }
                var endIndex = gridOptions.currentPage*gridOptions.pageItems+gridOptions.pageItems;

/*              Update: Not called for server-side paging
                if(startIndex>=input.length){
                    // server side paging, ignore the operation
                    return input;
                }
*/
                return input.slice(startIndex, endIndex);
            };
        })
        .directive(bodyDirective,[ "$compile",
            function($compile:ng.ICompileService){
                return {
                    restrict :'A',
                    scope:true,
                    require:'^'+tableDirective,
                    replace:true,
                    compile: function (templateElement: JQuery, tAttrs: Object) {
                        // we cannot allow angular to use the body row template just yet
                        var bodyOriginalTemplateRow = templateElement.children("tr");
                        templateElement.contents().remove();

                        //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                        return {
                            post: function (scope: IGridBodyScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController) {
                                // set up the scope
                                scope.gridOptions = controller.gridOptions;
                                scope.toggleItemSelection = (item) => controller.toggleItemSelection(item);

                                // find the body row template, which was initially excluded from the compilation
                                // apply the ng-repeat
                                var ngRepeatAttrValue = "gridItem in gridOptions.items";
                                if(scope.gridOptions.onDataRequired){
                                    // data is retrieved externally, watchers set up in the controller take care of calling this method
                                }
                                else{
                                    // the grid's internal mechanisms are active
                                    ngRepeatAttrValue+=" | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse | paging:gridOptions";
                                }

                                // ng-switch calls the post-linking function to refresh the dom, so we can't mess the original template
                                var bodyTemplateRow = bodyOriginalTemplateRow.clone(true);

                                bodyTemplateRow.attr("ng-repeat", ngRepeatAttrValue);
                                if(!bodyTemplateRow.attr("ng-click")){
                                    bodyTemplateRow.attr("ng-click", "toggleItemSelection(gridItem)");
                                }
                                bodyTemplateRow.attr("ng-class","{'"+selectedRowCssClass+"':gridOptions.selectedItems.indexOf(gridItem)>=0}");

                                bodyTemplateRow.attr(rowPageItemIndexAttribute, "{{$index}}");
                                angular.forEach(scope.gridOptions.gridColumnDefs, (columnOptions:IGridColumnOptions, index:number) => {
                                    var cellTemplateElement = bodyTemplateRow.children("td:nth-child("+(index+1)+")");
                                    var cellTemplateFieldName = cellTemplateElement.attr("field-name"); // cellTemplateElement.is("[" + columnDirectiveAttribute + "]");
                                    var createInnerCellContents = false;

                                    if (cellTemplateFieldName !== columnOptions.fieldName) {
                                        // inconsistencies between column definition and body cell template
                                        createInnerCellContents = true;

                                        var newCellTemplateElement = $("<td>");
                                        if (cellTemplateElement.length == 0)
                                            bodyTemplateRow.append(newCellTemplateElement);
                                        else
                                            cellTemplateElement.before(newCellTemplateElement);

                                        cellTemplateElement = newCellTemplateElement;
                                    }
                                    else {
                                        // create the content if the td had no children
                                        createInnerCellContents = (cellTemplateElement.text() == "");
                                    }

                                    if (createInnerCellContents) {
                                        var cellContentsElement = $("<div>").addClass(cellCssClass);
                                        if (columnOptions.fieldName) {
                                            // according to the column options, a model bound cell is needed here
                                            cellContentsElement.attr("field-name",columnOptions.fieldName);
                                            var cellContentsElementText = "{{gridItem." + columnOptions.fieldName;
                                            if (columnOptions.displayFormat) {
                                                // add the display filter
                                                if (columnOptions.displayFormat[0] != '|' && columnOptions.displayFormat[0] != '.') {
                                                    cellContentsElementText += " | "; // assume an angular filter by default
                                                }
                                                cellContentsElementText += columnOptions.displayFormat;
                                            }
                                            cellContentsElementText += "}}";
                                            cellContentsElement.text(cellContentsElementText);
                                        }
                                        else {
                                            cellContentsElement.text("Invalid column match inside the table body");
                                        }

                                        cellTemplateElement.append(cellContentsElement);
                                    }

                                    if (columnOptions.displayAlign) {
                                        cellTemplateElement.addClass("text-" + columnOptions.displayAlign);
                                    }
                                    if (columnOptions.cellWidth) {
                                        cellTemplateElement.css("width", columnOptions.cellWidth);
                                    }
                                    if (columnOptions.cellHeight) {
                                        cellTemplateElement.css("height", columnOptions.cellHeight);
                                    }
                                });

                                // now we need to compile, but in order for this to work, we need to have the dom in place
                                // also we remove the column directive, it was just used to mark data bound body columns
                                compiledInstanceElement.append($compile(bodyTemplateRow)(scope));
                                compiledInstanceElement.removeAttr(bodyDirectiveAttribute);
                                compiledInstanceElement.children("td[" + columnDirectiveAttribute + "]").removeAttr(columnDirectiveAttribute);
                           }
                        }
                    }
                }
            }
        ])
        .directive(footerDirective, [
            function(){
                return {
                    restrict:'A',
                    scope:false,
                    require:'^'+tableDirective,
                    replace:true,
                    template:'<div class="'+footerOpsContainerCssClass+'">' +
                                '<span '+globalFilterDirectiveAttribute+'=""/>'+
                                '<span '+pagerDirectiveAttribute+'=""/>'+
                            '</div>'
                };
            }
        ])
        .directive(globalFilterDirective,[
            function(){
                return {
                    restrict :'A',
                    replace:true,
                    scope:true,
                    require:'^'+tableDirective,
                    template: function(templateElement: JQuery, tAttrs: ng.IAttributes) {
                        return  '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">' +
                                        '<input class="form-control" type="text" ng-model="gridOptions.filterBy" placeholder="Search"/>' +
                                '</span>';
                    },
                    compile: function(templateElement: JQuery, tAttrs: ng.IAttributes) {
                        //templateElement.attr("ng-show", "gridOptions.enableFiltering");
                        return{
                            pre: function (scope: IGridFooterScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController) {
                                scope.gridOptions = controller.gridOptions;
                            },
                            post: function(scope: IGridFooterScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController){
                            }
                        }
                    }
                };
            }
        ])
        .directive(pagerDirective,[
            function(){
                var setupScope = (scope: IGridFooterScope, controller: GridController) => {
                    scope.gridOptions = controller.gridOptions;
                    scope.isPaged = !!scope.gridOptions.pageItems;

                    // do not set scope.gridOptions.totalItems, it might be set from the outside
                    scope.totalItemsCount = (typeof(scope.gridOptions.totalItems)!="undefined" && scope.gridOptions.totalItems!=null)
                        ?scope.gridOptions.totalItems
                        :(scope.gridOptions.items?scope.gridOptions.items.length:0);

                    scope.startItemIndex = scope.isPaged?(scope.gridOptions.pageItems*scope.gridOptions.currentPage):0;
                    scope.endItemIndex = scope.isPaged?(scope.startItemIndex + scope.gridOptions.pageItems-1):scope.totalItemsCount-1;
                    if(scope.endItemIndex>=scope.totalItemsCount){
                        scope.endItemIndex=scope.totalItemsCount-1;
                    }
                    if(scope.endItemIndex<scope.startItemIndex){
                        scope.endItemIndex = scope.startItemIndex;
                    }
                    scope.lastPageIndex = (!scope.totalItemsCount || !scope.isPaged)
                        ? 0
                    : (Math.floor(scope.totalItemsCount / scope.gridOptions.pageItems) + ((scope.totalItemsCount % scope.gridOptions.pageItems) ? 0 : -1));

                    scope.pageIndexes = [];
                    for (var pageIndex = 0; pageIndex <= scope.lastPageIndex; pageIndex++) {
                        scope.pageIndexes.push(pageIndex);
                    }
                    scope.pageSelectionActive = scope.pageIndexes.length > 1;

                    scope.pageCanGoBack = scope.isPaged && scope.gridOptions.currentPage>0;
                    scope.pageCanGoForward = scope.isPaged && scope.gridOptions.currentPage < scope.lastPageIndex;

                    scope.navigateToPage = ($event, pageIndex) => {
                        scope.gridOptions.currentPage = pageIndex;
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    scope.switchPageSelection = ($event, pageSelectionActive) => {
                        scope.pageSelectionActive = pageSelectionActive;
                        if ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                        }
                    }
                };

                //ng - model = "gridOptions.currentPage" 

                return {
                    restrict :'A',
                    scope:true,
                    require:'^'+tableDirective,
                    template: function(templateElement: JQuery, tAttrs: ng.IAttributes) {
                        return '<span class="pull-right form-group">' +
                                    '<ul class="pagination">' +
                                                '<li ng-show="pageCanGoBack" >' +
                                                    '<a href="#" ng-click="navigateToPage($event, 0)" title="First Page">|&lArr;</a>' +
                                                '</li>' +
                                                '<li ng-show="pageCanGoBack" >' +                                                
                                                    '<a href="#" ng-click="navigateToPage($event, gridOptions.currentPage - 1)" title="Previous Page">&lArr;</a>' +
                                                '</li>' +
                                                '<li ng-show="pageSelectionActive" style="white-space: nowrap;">' +
                                                    '<span>Page: ' +
                                                    '<select ng-model="gridOptions.currentPage" ng-options="pageIndex as (pageIndex+1) for pageIndex in pageIndexes"></select></span>' +
                                                '</li>' +                                                
                                                '<li class="disabled" style="white-space: nowrap;">' +
                                                    '<span ng-hide="totalItemsCount">No items to display</span>' +
                                                    '<span ng-show="totalItemsCount" title="Select Page">'+
                                                        '  {{startItemIndex+1}} - {{endItemIndex+1}} displayed' +
                                                        '<span>, {{totalItemsCount}} in total</span>' +
                                                    '</span > ' +
                                                    //' (page {{gridOptions.currentPage}})'+
                                                '</li>' +
                                                '<li ng-show="pageCanGoForward">' +
                                                    '<a href="#" ng-click="navigateToPage($event, gridOptions.currentPage + 1)" title="Next Page">&rArr;</a>' +
                                                '</li>' +
                                                '<li>' +
                                                '<li ng-show="pageCanGoForward">' +
                                                    '<a href="#" ng-show="pageCanGoForward" ng-click="navigateToPage($event, lastPageIndex)" title="Last Page">&rArr;|</a>' +
                                                '</li>' +
                                    '</ul>'+
                                '</span>';
                    },
                    replace:true,
                    link:{
                        pre: function (scope: IGridFooterScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController) {
                            setupScope(scope, controller);
                        },
                        post: function (scope: IGridFooterScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController) {
                            // equality checks: http://teropa.info/blog/2014/01/26/the-three-watch-depths-of-angularjs.html
                            scope.$watchCollection("[gridOptions.currentPage, gridOptions.items.length, gridOptions.totalItems, gridOptions.pageItems]", (newValues: Array<any>, oldValues: Array<any>) => {
                                setupScope(scope, controller);
                            });
                        }
                    }
                };
            }
        ])
        .run(["$templateCache",
            function ($templateCache: ng.ITemplateCacheService) {
                // set up default templates
                $templateCache.put(TrNgGrid.columnFilterTemplateId,
                    "<div ng-show='currentGridColumnDef.enableFiltering' class='" + TrNgGrid.filterColumnCssClass + "'>"
                    + "<div class='" + TrNgGrid.filterInputWrapperCssClass + "'>"
                    + "<input class='form-control input-sm' type='text' ng-model='filter'/>"
                    + "</div>"
                    + "</div>");
                $templateCache.put(TrNgGrid.columnSortTemplateId,
                    "<div ng-show='currentGridColumnDef.enableSorting' ng-click='toggleSorting(currentGridColumnDef.fieldName)' title='Sort' class='" + TrNgGrid.sortCssClass + "'>"
                    + "<div "
                    + "ng-class=\"{'" + TrNgGrid.sortActiveCssClass + "':gridOptions.orderBy==currentGridColumnDef.fieldName,'" + TrNgGrid.sortInactiveCssClass + "':gridOptions.orderBy!=currentGridColumnDef.fieldName,'" + sortNormalOrderCssClass + "':gridOptions.orderBy!=currentGridColumnDef.fieldName||!gridOptions.orderByReverse,'" + sortReverseOrderCssClass + "':gridOptions.orderBy==currentGridColumnDef.fieldName&&gridOptions.orderByReverse}\" "
                    + " >"
                    + "</div>"
                    + "</div>"
                    );
            }
        ]);
}