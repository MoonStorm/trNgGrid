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

    var sortDirective="trNgGridColumnSort";
    var sortDirectiveAttribute="tr-ng-grid-column-sort";

    var tableCssClass="tr-ng-grid";
    var cellCssClass="tr-ng-cell";
    var titleCssClass="tr-ng-title";
    var sortCssClass="tr-ng-sort";
    var sortActiveCssClass="tr-ng-sort-active";
    var sortInactiveCssClass="tr-ng-sort-inactive";
    var sortReverseCssClass="tr-ng-sort-reverse";

    interface IGridOptions{
        model:Array<any>;
        filterBy:string;
        orderBy:string;
        orderByReverse:boolean;
    }

    interface IGridColumnOptions{
        model:string;
        disableSorting:boolean;
        disableFiltering:boolean;
    }

    interface IGridScope extends ng.IScope{
        gridOptions:IGridOptions;
        columnOptions:Array<IGridColumnOptions>;
        toggleSorting(modelBinding);
    }

    interface ITemplateGridScope extends IGridOptions{
    }

    interface IGridColumnScope extends IGridScope{
        currentColumnOptions:IGridColumnOptions;
    }

    var splitByCamelCasing = (input:string) => {
        var splitInput = input.split(/(?=[A-Z])/);
        if(splitInput.length && splitInput[0].length){
            splitInput[0][0] = splitInput[0][0].toLocaleUpperCase();
        }

        return splitInput.join(" ");
    };

    angular.module("trNgGrid", [])
        .directive(tableDirective, ["$compile",
            function ($compile: ng.ICompileService) {
                return {
                    restrict: 'A',
                    transclude: 'element',
                    scope: {
                        model:'=',
                        filterBy:'=',
                        orderBy:'='
                    },
                    // pre-compilation
                    template: function (tableElement: JQuery, tAttrs: ng.IAttributes) {
                        tableElement.addClass(tableCssClass);

                        // investigate the header
                        var tableHeadElement = tableElement.find("thead");
                        if (tableHeadElement.length == 0) {
                            tableHeadElement = $("<thead>").prependTo(tableElement);
                        }
                        var tableHeadRowTemplate = tableHeadElement.find("tr");
                        if(tableHeadRowTemplate.length == 0){
                            tableHeadRowTemplate = $("<tr>").appendTo(tableHeadElement);
                        }
                        tableHeadRowTemplate.attr(headerDirectiveAttribute,"");
                        //discoverColumnDefinitionsFromUi(tableHeadRowTemplate);

                        // investigate the body
                        var tableBodyElement = tableElement.find("tbody");
                        if (tableBodyElement.length === 0) {
                            tableBodyElement = $("<tbody>").appendTo(tableElement);
                        }

                        var tableBodyRowTemplate = tableBodyElement.find("tr");
                        if (tableBodyRowTemplate.length === 0) {
                            tableBodyRowTemplate = $("<tr>").appendTo(tableBodyElement);
                        }
                        tableBodyRowTemplate.attr(bodyDirectiveAttribute,"");
                    },
                    // dom manipulation in the compile stage, angular directives ignored
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        //link function - use for registering DOM listeners(i.e., $watch expressions on the instance scope) as well as instance DOM manipulation
                        return{
                            // call before children are linked
                            pre:function (scope: any, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:any, transclude: (transclusionScope: ng.IScope, cloneLinkingFn:(tClonedElement:JQuery)=>void)=>void) {
                                var templateScope = <ITemplateGridScope>scope;
                                var gridScope = <IGridScope>scope;
                                gridScope.gridOptions = <IGridOptions>{};
                                gridScope.gridOptions.filterBy = templateScope.filterBy;
                                gridScope.gridOptions.model = templateScope.model;
                                gridScope.gridOptions.orderBy = templateScope.orderBy;
                                gridScope.gridOptions.orderByReverse = templateScope.orderByReverse;

                                gridScope.columnOptions = new Array<IGridColumnOptions>();
                                if(!gridScope.toggleSorting){
                                    gridScope.toggleSorting=(modelBinding)=>{
                                        if(scope.gridOptions.orderBy==modelBinding){
                                            scope.gridOptions.orderByReverse=!scope.gridOptions.orderByReverse;
                                        }
                                        else{
                                            scope.gridOptions.orderBy = modelBinding;
                                        }
                                    }
                                }
                                transclude(gridScope, (clonedElement)=>{
                                    instanceElement.replaceWith(clonedElement);
                                    $compile(clonedElement)(gridScope);
                                });
                            },
                            post:function (scope: IGridScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:any, transclude: (transclusionScope: ng.IScope, cloneLinkingFn:(tClonedElement:JQuery)=>void)=>void) {
                            }
                        };
                    }
                };
            }])
        .directive(headerDirective,["$compile",
            function($compile:ng.ICompileService){
                return {
                    restrict: 'A',
                    scope:false,
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        return{
                            //pre linking function - executed before children get linked (be careful with the dom changes)
                            pre:function (scope: IGridScope, instanceElement: JQuery, tAttrs: ng.IAttributes) {
                                if(instanceElement.children("th").length==0){
                                    if(scope.gridOptions.model && scope.gridOptions.model.length>0){
                                        // no columns defined for the header, attempt to identify the properties and populate the columns definition
                                        for(var propName in scope.gridOptions.model[0]){
                                            var columnDefinition = <IGridColumnOptions>{};
                                            columnDefinition.model = propName;
                                            var headerCellElement = $("<th>").attr(columnDirectiveAttribute, angular.toJson(columnDefinition, false)).appendTo(instanceElement);
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
                    scope:true,
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        return{
                            //pre linking function, prepare a few things
                            pre: function(scope: IGridColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:any, transclude: (transclusionScope: ng.IScope, cloneLinkingFn:(tClonedElement:JQuery)=>void)=>void){
                                var isValid = instanceElement.parent().prop("tagName")=="TR";
                                var isHeaderColumn = isValid && instanceElement.parent().prop("tagName")=="TR" && instanceElement.parent().parent().prop("tagName")=="THEAD";
                                isValid=isValid&&(isHeaderColumn || instanceElement.parent().prop("tagName")=="TR" && instanceElement.parent().parent().prop("tagName")=="TBODY");

                                if(!isValid){
                                    throw "The template has an invalid header column template element. Column templates must be defined on TD elements inside THEAD/TR";
                                }

                                if(isHeaderColumn){
                                    // set up the scope for the column inside the header
                                    // the directive can be present on the header's td elements but also on the body's elements but we extract column information from the header only
                                    scope.currentColumnOptions = scope.$eval(tAttrs[columnDirective]);

                                    var columnIndex = instanceElement.parent().children("th").index(instanceElement);
                                    if(columnIndex<0)
                                        return;

                                    if(columnIndex>=scope.columnOptions.length){
                                        scope.columnOptions.push(scope.currentColumnOptions);
                                    }
                                    else{
                                        scope.columnOptions[columnIndex] = scope.currentColumnOptions;
                                    }
                                }
                            },
                            //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                            post: function (scope: IGridColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller:any, transclude: (transclusionScope: ng.IScope, cloneLinkingFn:(tClonedElement:JQuery)=>void)=>void) {
                                if(scope.currentColumnOptions){
                                    // we're inside the header
                                    if(instanceElement.text()==""){
                                        var cellContentsElement = $("<div>").addClass(cellCssClass);

                                        // the column title was not specified, attempt to include it and recompile
                                        $("<span>").addClass(titleCssClass).text(splitByCamelCasing(scope.currentColumnOptions.model)).appendTo(cellContentsElement);

                                        if(!scope.currentColumnOptions.disableSorting){
                                            $("<span>").attr(sortDirectiveAttribute,"").appendTo(cellContentsElement);
                                        }

                                        // if tempted to compile the current header cell, think again
                                        // even if this can work by removing the directive attribute, the inner directives will fail to work properly
                                        instanceElement.append(cellContentsElement);
                                        $compile(cellContentsElement)(scope);
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
                var directiveDef = {
                    restrict : 'A',
                    replace:true,
                    scope :  false,
                    template : "<div class='"+sortCssClass+"' ng-click='toggleSorting(currentColumnOptions.model)'>"
                        +"<span "
                        + "ng-class=\"{'"+sortActiveCssClass+"':gridOptions.orderBy==currentColumnOptions.model,'"+sortInactiveCssClass+"':gridOptions.orderBy!=currentColumnOptions.model,'"+sortReverseCssClass+"':gridOptions.orderByReverse}\" "
                        + " >"
                        + "&nbsp;"
                        + "</span>"
                        + "</div>",
                    compile: function(instanceElement: JQuery, tAttrs: ng.IAttributes) {
                        return function(scope: IGridColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes) {
                            //tAttrs.$set(sortDirective, null);
                            //debugger;
/*
                            scope.toggleSorting=()=>{
                                console.log("scope method called");
                                debugger;
                                (<IGridColumnScope>scope.$parent).toggleSorting();
                            };
*/
                        };
                    }
                };
                console.log(directiveDef.template);
                return directiveDef;
            }
        ])
        .directive(bodyDirective,[ "$compile",
            function($compile:ng.ICompileService){
                return {
                    restrict :'A',
                    compile: function(templateElement: JQuery, tAttrs: Object) {
                        //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                        return {
                            post: function (scope: IGridScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller:any, transcludeFn:(scope:ng.IScope, cloneFn:(originalElement:JQuery)=>any)=>any) {
                                // transclusion fails here
                                // transcludeFn(scope, (clonedOriginalElement:JQuery)=>{
                                // });
                                templateElement.attr("ng-repeat","item in gridOptions.model | filter:gridOptions.filterBy | orderBy:gridOptions.orderBy:gridOptions.orderByReverse");
                                templateElement.removeAttr(bodyDirectiveAttribute);
                                angular.forEach(scope.columnOptions, (columnOptions:IGridColumnOptions, index:number) => {
                                    var cellTemplateElement = templateElement.children("td:nth-child("+(index+1)+")");
                                    var isBoundColumn = !!cellTemplateElement.attr(columnDirectiveAttribute);
                                    if((isBoundColumn&&!columnOptions.model)||(!isBoundColumn&&columnOptions.model)){
                                        // inconsistencies between column definition and body cell template
                                        var newCellTemplateElement=$("<td>");
                                        if(columnOptions.model){
                                            // according to the column options, a model bound cell is needed here
                                            newCellTemplateElement.attr(columnDirectiveAttribute);
                                            newCellTemplateElement.text("{{item."+columnOptions.model+"}}");
                                        }
                                        else{
                                            newCellTemplateElement.text("Invalid column match inside the table body");
                                        }

                                        if(cellTemplateElement.length==0)
                                            templateElement.append(newCellTemplateElement);
                                        else
                                            cellTemplateElement.before(newCellTemplateElement);

                                    }
                                });

                                // now we need to compile, but in order for this to work, we need to replace elements first
                                compiledInstanceElement.replaceWith(templateElement);
                                $compile(templateElement)(scope);
                           }
                        }
                    }
                }
            }
        ]);
}