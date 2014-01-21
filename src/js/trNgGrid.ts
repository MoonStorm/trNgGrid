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

    var columnDirective="trNgGridColumn";
    var columnDirectiveAttribute="tr-ng-grid-column";
    /*var columnIndexAttribute="tr-ng-grid-column-index";
    var columnIndexScopePropName="trNgGridColumnIndex";*/


    var sortDirective="trNgGridColumnSort";
    var sortDirectiveAttribute="tr-ng-grid-column-sort";

    var filterColumnDirective="trNgGridColumnFilter";
    var filterColumnDirectiveAttribute="tr-ng-grid-column-filter";

    var tableCssClass="tr-ng-grid";
    var cellCssClass="tr-ng-cell";
    var titleCssClass="tr-ng-title";
    var sortCssClass="tr-ng-sort btn btn-primary";
    var filterColumnCssClass="tr-ng-column-filter";
    var sortActiveCssClass="tr-ng-sort-active";
    var sortInactiveCssClass="tr-ng-sort-inactive";
    var sortReverseCssClass="tr-ng-sort-reverse";

    interface IGridColumnOptions{
        fieldName:string;
        disableSorting:boolean;
        disableFiltering:boolean;
        cellWidth:string;
        cellHeight:string;
    }

    interface IGridScope extends ng.IScope{
        model:Array<any>;
        selectedItems:Array<any>;
        filterBy:string;
        filterByFields:Object;
        orderBy:string;
        orderByReverse:boolean;
        gridColumnDefs:Array<IGridColumnOptions>;
    }

    interface IGridColumnScope extends ng.IScope{
        currentGridColumnDef:IGridColumnOptions;
        gridOptions:IGridScope;
        toggleSorting: (propertyName:string) => void;
        filter:string;
    }

    interface IGridBodyScope extends ng.IScope{
        gridOptions:IGridScope;
        toggleItemSelection:(item:any)=>void;
    }

    var splitByCamelCasing = (input:string) => {
        var splitInput = input.split(/(?=[A-Z])/);
        if(splitInput.length && splitInput[0].length){
            splitInput[0][0] = splitInput[0][0].toLocaleUpperCase();
        }

        return splitInput.join(" ");
    };

    class GridController{
        public externalScope:ng.IScope;
        public gridOptions:IGridScope;
        constructor($scope:IGridScope, $element:JQuery, $attrs:ng.IAttributes, $transclude:ng.ITranscludeFunction){
            this.gridOptions = $scope;
            this.gridOptions.filterByFields = {};
            this.gridOptions.gridColumnDefs = new Array<IGridColumnOptions>();
            if(!this.gridOptions.selectedItems){
                this.gridOptions.selectedItems = [];
            }

            this.externalScope = $scope.$parent;
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
            debugger;
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
            // make sure we have where to store them
            var itemIndex = this.gridOptions.selectedItems.indexOf(item);
            if(itemIndex>=0){
                this.gridOptions.selectedItems.splice(itemIndex, 1);
            }
            else{
                this.gridOptions.selectedItems.push(item);
            }
        }
    };

    angular.module("trNgGrid", [])
        .directive(tableDirective, [function () {
                return {
                    restrict: 'A',
                    // create an isolated scope, and remember the original scope can be found in the parent
                    scope: {
                        model:'=',
                        filterBy:'=',
                        orderBy:'@',
                        orderByReverse:'@'
                    },
                    // executed prior to pre-linking phase but after compilation
                    // as we're creating an isolated scope, we need something to link them
                    controller: ["$scope", "$element", "$attrs", "$transclude", GridController],
                    // dom manipulation in the compile stage
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        templateElement.addClass(tableCssClass);

                        // investigate the header
                        var tableHeadElement = templateElement.find("thead");
                        if (tableHeadElement.length == 0) {
                            tableHeadElement = $("<thead>").prependTo(templateElement);
                        }
                        var tableHeadRowTemplate = tableHeadElement.find("tr");
                        if(tableHeadRowTemplate.length == 0){
                            tableHeadRowTemplate = $("<tr>").appendTo(tableHeadElement);
                        }
                        tableHeadRowTemplate.attr(headerDirectiveAttribute,"");
                        //discoverColumnDefinitionsFromUi(tableHeadRowTemplate);

                        // investigate the body
                        var tableBodyElement = templateElement.find("tbody");
                        if (tableBodyElement.length === 0) {
                            tableBodyElement = $("<tbody>").appendTo(templateElement);
                        }

                        var tableBodyRowTemplate = tableBodyElement.find("tr");
                        if (tableBodyRowTemplate.length === 0) {
                            tableBodyRowTemplate = $("<tr>").appendTo(tableBodyElement);
                        }
                        tableBodyElement.attr(bodyDirectiveAttribute,"");
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
                                    if(gridController.gridOptions.model && gridController.gridOptions.model.length>0){
                                        // no columns defined for the header, attempt to identify the properties and populate the columns definition
                                        for(var propName in gridController.gridOptions.model[0]){
                                            // create the th definition and add the column directive, serialised
                                            var headerCellElement = $("<th>").attr(columnDirectiveAttribute, "").attr("model", propName).appendTo(instanceElement);
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
                    /*{
                        fieldName:'@',
                        disableSorting:'@',
                        disableFiltering:'@'
                    },*/
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
                                    controller.setCellStyle(instanceElement, scope.currentGridColumnDef);
                                    if(instanceElement.text()==""){
                                        //prepopulate
                                        var cellContentsElement = $("<div>").addClass(cellCssClass);

                                        // the column title was not specified, attempt to include it and recompile
                                        $("<span>").addClass(titleCssClass).text(splitByCamelCasing(scope.currentGridColumnDef.fieldName)).appendTo(cellContentsElement);

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
                return {
                    restrict :'A',
                    scope:true,
                    require:'^'+tableDirective,
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        // we cannot allow angular to use the body row template just yet
                        var templateBodyElementContents = templateElement.contents().remove();

                        //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                        return {
                            post: function (scope: IGridBodyScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller:GridController) {
                                // set up the scope
                                scope.gridOptions = controller.gridOptions;

                                // find the body row template, which was initially excluded from the compilation
                                var bodyTemplateRow = templateBodyElementContents.find("tr").addBack().filter("tr");

                                // apply the ng-repeat
                                bodyTemplateRow.attr("ng-repeat", "gridItem in gridOptions.model | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse");
                                if(!bodyTemplateRow.attr("ng-click")){
                                    bodyTemplateRow.attr("ng-click", "toogleItemSelection(gridItem)");
                                }
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
                                compiledInstanceElement.append(templateBodyElementContents);
                                bodyTemplateRow.children("td["+columnDirectiveAttribute+"]").removeAttr(columnDirectiveAttribute);

                                $compile(bodyTemplateRow)(scope);
                           }
                        }
                    }
                }
            }
        ]);
}