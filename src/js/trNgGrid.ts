/**
 * Created by dcristiu on 13/01/14.
 */

/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>

module TrNgGrid{
    var tableDirective="trNgGrid";

    var headerDirective="trNgGridHeader";
    var headerDirectiveAttribute="tr-ng-grid-header";

    var bodyDirective="trNgGridBody";
    var bodyDirectiveAttribute="tr-ng-grid-body";

    var globalFilterDirective="trNgGridGlobalFilter";
    var globalFilterDirectiveAttribute="tr-ng-grid-global-filter";

    var pagerDirective="trNgGridPager";
    var pagerDirectiveAttribute="tr-ng-grid-pager";

    var columnDirective="trNgGridColumn";
    var columnDirectiveAttribute="tr-ng-grid-column";
    /*var columnIndexAttribute="tr-ng-grid-column-index";
    var columnIndexScopePropName="trNgGridColumnIndex";*/

    var sortDirective="trNgGridColumnSort";
    var sortDirectiveAttribute="tr-ng-grid-column-sort";

    var filterColumnDirective="trNgGridColumnFilter";
    var filterColumnDirectiveAttribute="tr-ng-grid-column-filter";

    var rowPageItemIndexAttribute="tr-ng-grid-row-page-item-index";

    var tableCssClass="tr-ng-grid table table-bordered table-hover"; // at the time of coding, table-striped is not working properly with selection
    var cellCssClass="tr-ng-cell";
    var titleCssClass="tr-ng-title";
    var sortCssClass="tr-ng-sort btn btn-primary";
    var filterColumnCssClass="tr-ng-column-filter";
    var sortActiveCssClass="tr-ng-sort-active";
    var sortInactiveCssClass="tr-ng-sort-inactive";
    var sortReverseCssClass="tr-ng-sort-reverse";
    var selectedRowCssClass="active";

    var footerOpsContainerCssClass="navbar navbar-default";

    interface IGridColumnOptions{
        fieldName:string;
        disableSorting:boolean;
        disableFiltering:boolean;
        cellWidth:string;
        cellHeight:string;
    }

    interface IGridOptions{
        items:Array<any>;
        selectedItems:Array<any>;
        filterBy:string;
        filterByFields:Object;
        orderBy:string;
        orderByReverse:boolean;
        pageItems:number;
        currentPage:number;
        totalItems:number;
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
        startItemIndex:number;
        endItemIndex:number;
        pageCanGoBack:boolean;
        pageCanGoForward:boolean;
    }

    class GridController{
        public externalScope:ng.IScope;
        public gridOptions:IGridOptions;
        private gridElement:JQuery;

        constructor($scope:IGridScope, $element:JQuery, $attrs:ng.IAttributes, $transclude:ng.ITranscludeFunction, private $parse:ng.IParseService){
            this.gridElement = $element;
            var scopeOptionsIdentifier = "gridOptions";

            // initialise the options
            this.gridOptions = <IGridOptions>{
                items:[],
                selectedItems:[],
                filterBy:null,
                filterByFields:{},
                orderBy:null,
                orderByReverse:false,
                pageItems:null,
                currentPage:0,
                totalItems:null
            };
            this.gridOptions.gridColumnDefs = [];
            $scope[scopeOptionsIdentifier] = this.gridOptions;

            this.externalScope = $scope.$parent;
            this.linkScope($scope, scopeOptionsIdentifier, $attrs);
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

        toggleSorting(propertyName:string){
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
        }

        setCellStyle(element:JQuery, columnOptions:IGridColumnOptions){
            if(columnOptions.cellWidth){
                element.css("width", columnOptions.cellWidth);
            }
            if(columnOptions.cellHeight){
                element.css("height", columnOptions.cellHeight);
            }
        }

        toggleItemSelection(item:any){
            var itemIndex = this.gridOptions.selectedItems.indexOf(item);
            if(itemIndex>=0){
                this.gridOptions.selectedItems.splice(itemIndex, 1);
            }
            else{
                this.gridOptions.selectedItems.push(item);
            }
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
                    // initialise from the scope first
                    if(typeof(scope[propName])!="undefined" && scope[propName]!=null)
                        target[propName] = scope[propName];

                    var compiledAttr = this.$parse(attrs[propName]);
                    var dualDataBindingPossible = compiledAttr && compiledAttr.assign; // very fragile, replace it as soon as possible
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
                        items:'=',
                        selectedItems:'=?',
                        filterBy:'=?',
                        filterByFields:'=?',
                        orderBy:'=?',
                        orderByReverse:'=?',
                        pageItems:'=?',
                        currentPage:'=?',
                        totalItems:'=?'
                    },
                    // executed prior to pre-linking phase but after compilation
                    // as we're creating an isolated scope, we need something to link them
                    controller: ["$scope", "$element", "$attrs", "$transclude","$parse", GridController],
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
                        tableHeadRowTemplate.attr(headerDirectiveAttribute,"");
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

                            var footerOpsContainer = $("<div>").addClass(footerOpsContainerCssClass).appendTo(fullTableLengthFooterCell);

                            // insert the global search template
                            $("<div>").attr(globalFilterDirectiveAttribute, "").appendTo(footerOpsContainer);

                            // followed closely by the pager elements
                            $("<div>").attr(pagerDirectiveAttribute, "").appendTo(footerOpsContainer);
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
                                if(instanceElement.children("th").length==0){
                                    if(gridController.gridOptions.items && gridController.gridOptions.items.length>0){
                                        // no columns defined for the header, attempt to identify the properties and populate the columns definition
                                        for(var propName in gridController.gridOptions.items[0]){
                                            // create the th definition and add the column directive, serialised
                                            var headerCellElement = $("<th>").attr(columnDirectiveAttribute, "").attr("field-name", propName).appendTo(instanceElement);
                                            $compile(headerCellElement)(scope);
                                        }
                                    }
                                    else
                                    {
                                        // TODO: watch for items to arrive and re-run the compilation
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
                    require:'^'+tableDirective,
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

                                // prepare the child scope
                                scope.currentGridColumnDef = {
                                    fieldName:tAttrs["fieldName"],
                                    disableFiltering:tAttrs["disableFiltering"]=="true",
                                    disableSorting:tAttrs["disableSorting"]=="true",
                                    cellWidth:tAttrs["cellWidth"],
                                    cellHeight:tAttrs["cellHeight"]
                                };
                                scope.gridOptions = controller.gridOptions;
                                scope.toggleSorting = (propertyName) => controller.toggleSorting(propertyName);
                                scope.filter="";
                                scope.$watch("filter", (newValue:string, oldValue:string) => {
                                   if(newValue!==oldValue){
                                       controller.setFilter(scope.currentGridColumnDef.fieldName, newValue);
                                   }
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

                                    controller.setCellStyle(instanceElement, scope.currentGridColumnDef);
                                    if(instanceElement.text()==""){
                                        //prepopulate
                                        var cellContentsElement = $("<div>").addClass(cellCssClass);

                                        // the column title was not specified, attempt to include it and recompile
                                        $("<span>").addClass(titleCssClass).text(controller.splitByCamelCasing(scope.currentGridColumnDef.fieldName)).appendTo(cellContentsElement);

                                        if(!scope.currentGridColumnDef.disableSorting){
                                            $("<span>").attr(sortDirectiveAttribute,"").appendTo(cellContentsElement);
                                        }

                                        if(!scope.currentGridColumnDef.disableFiltering){
                                            $("<div>").attr(filterColumnDirectiveAttribute,"").appendTo(cellContentsElement);
                                        }

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
                    template : "<div class='"+sortCssClass+"' ng-click='toggleSorting(currentGridColumnDef.fieldName)'>"
                        +"<span "
                        + "ng-class=\"{'"+sortActiveCssClass+"':gridOptions.orderBy==currentGridColumnDef.fieldName,'"+sortInactiveCssClass+"':gridOptions.orderBy!=currentGridColumnDef.fieldName,'"+sortReverseCssClass+"':gridOptions.orderByReverse}\" "
                        + " >"
                        + "</span>"
                        + "</div>",
                    link: function(scope: IGridColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController){
                        //debugger;
                    }
                };
            }
        ])
        .directive(filterColumnDirective, [
            function(){
                return {
                    restrict : 'A',
                    replace:true,
                    template : "<div class='"+filterColumnCssClass+"'>"
                        + "<input class='form-control input-sm' type='text' ng-model='filter'/>"
                        + "</div>"
                };
            }
        ])
        .directive(bodyDirective,[ "$compile",
            function($compile:ng.ICompileService){
                var originalBodyTemplateKey = "trNgOriginalBodyTemplate";
                return {
                    restrict :'A',
                    scope:true,
                    require:'^'+tableDirective,
                    replace:false,
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        // we cannot allow angular to use the body row template just yet
                        var bodyTemplateRow = templateElement.children("tr");
                        templateElement.contents().remove();

                        //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                        return {
                            post: function (scope: IGridBodyScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController) {
                                // set up the scope
                                scope.gridOptions = controller.gridOptions;
                                scope.toggleItemSelection = (item) => controller.toggleItemSelection(item);

                                // find the body row template, which was initially excluded from the compilation
                                // apply the ng-repeat
                                bodyTemplateRow.attr("ng-repeat", "gridItem in gridOptions.items | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse");
                                if(!bodyTemplateRow.attr("ng-click")){
                                    bodyTemplateRow.attr("ng-click", "toggleItemSelection(gridItem)");
                                }
                                bodyTemplateRow.attr("ng-class","{'"+selectedRowCssClass+"':gridOptions.selectedItems.indexOf(gridItem)>=0}");

                                bodyTemplateRow.attr(rowPageItemIndexAttribute, "{{$index}}");
                                angular.forEach(scope.gridOptions.gridColumnDefs, (columnOptions:IGridColumnOptions, index:number) => {
                                    var cellTemplateElement = bodyTemplateRow.children("td:nth-child("+(index+1)+")");
                                    var isBoundColumn = !!cellTemplateElement.attr(columnDirectiveAttribute);
                                    if((isBoundColumn&&!columnOptions.fieldName)||(!isBoundColumn&&columnOptions.fieldName)){
                                        // inconsistencies between column definition and body cell template
                                        var newCellTemplateElement=$("<div>").addClass(cellCssClass);
                                        if(columnOptions.fieldName){
                                            // according to the column options, a model bound cell is needed here
                                            newCellTemplateElement.attr(columnDirectiveAttribute);
                                            newCellTemplateElement.text("{{gridItem."+columnOptions.fieldName+"}}");
                                        }
                                        else{
                                            newCellTemplateElement.text("Invalid column match inside the table body");
                                        }

                                        // wrap it
                                        newCellTemplateElement = $("<td>").append(newCellTemplateElement);
                                        if(cellTemplateElement.length==0)
                                            bodyTemplateRow.append(newCellTemplateElement);
                                        else
                                            cellTemplateElement.before(newCellTemplateElement);

                                        cellTemplateElement = newCellTemplateElement;
                                    }

                                    controller.setCellStyle(cellTemplateElement, columnOptions);
                                });

                                // now we need to compile, but in order for this to work, we need to have the dom in place
                                // also we remove the column directive, it was just used to mark data bound body columns
                                bodyTemplateRow.children("td["+columnDirectiveAttribute+"]").removeAttr(columnDirectiveAttribute);
                                bodyTemplateRow.removeAttr(bodyDirectiveAttribute);
                                compiledInstanceElement.append($compile(bodyTemplateRow)(scope));
                           }
                        }
                    }
                }
            }
        ])
        .directive(globalFilterDirective,[
            function(){
                return {
                    restrict :'A',
                    scope:true,
                    require:'^'+tableDirective,
                    template: '<div class="navbar-form navbar-left"><input class="form-control" type="text" ng-model="gridOptions.filterBy" placeholder="Search"/></div>',
                    replace:true,
                    link:{
                        pre: function (scope: IGridFooterScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController) {
                            scope.gridOptions = controller.gridOptions;
                        }
                    }
                };
            }
        ])
        .directive(pagerDirective,[
            function(){
                var setupScope = (scope:IGridFooterScope, controller:GridController)=>{
                    scope.gridOptions = controller.gridOptions;
                    scope.isPaged = !!scope.gridOptions.pageItems && !!scope.gridOptions.totalItems;
                    scope.startItemIndex = scope.gridOptions.pageItems*scope.gridOptions.currentPage;
                    scope.endItemIndex = scope.startItemIndex + (scope.gridOptions.items?scope.gridOptions.items.length:0);
                    scope.pageCanGoBack = scope.isPaged && scope.gridOptions.currentPage>0;
                    scope.pageCanGoForward = scope.isPaged && scope.endItemIndex<scope.gridOptions.totalItems;
                };

                return {
                    restrict :'A',
                    scope:true,
                    require:'^'+tableDirective,
                    template: '<div class="navbar-left">' +
                        '<button ng-show="pageCanGoBack" ng-click="gridOptions.currentPage=gridOptions.currentPage-1" type="button" class="btn btn-default navbar-btn navbar-left">Prev Page</button>' +
                        '<p class="navbar-text navbar-left" style="white-space: nowrap;">{{startItemIndex}}  - {{endItemIndex}}' +
                            '<span ng-show="isPaged"> out of {{gridOptions.totalItems}} </span>' +
                            ' items displayed' +
                            //' (page {{gridOptions.currentPage}})'+
                        '</p>' +
                        '<button ng-show="pageCanGoForward" ng-click="gridOptions.currentPage=gridOptions.currentPage+1" type="button" class="btn btn-default navbar-btn navbar-left">Next Page</button>' +
                        '</div>',
                    replace:true,
                    link:{
                        pre: function (scope: IGridFooterScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController) {
                            setupScope(scope, controller);
                            scope.$watch("gridOptions.currentPage", (newValue:number, oldValue:number)=>{
                               if(newValue!==oldValue){
                                   setupScope(scope, controller);
                               }
                            });
                        }
                    }
                };
            }
        ]);
}