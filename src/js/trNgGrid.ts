/**
 * Created by dcristiu on 13/01/14.
 */

/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>

module TrNgGrid{
    export class ColumnDefinition{
        constructor(entityPropName:string){
            this.entityPropName = entityPropName;
        }

        entityPropName: string;
    }

    angular.module('trNgGrid', [])
        .directive('trNgGrid', ['$compile',
        function ($compile: ng.ICompileService) {
            var columnDefinitions = new Array<ColumnDefinition>();

            var setRow = (rowElement: JQuery) => {
                rowElement.attr("ng-repeat", "entity in model | filter:filterBy | orderBy:orderBy:orderByReverse");
                return rowElement;
            };

            var discoverColumnDefinitionsFromData = (item: any) => {
                if (!item)
                    return;
                for (var propName in item) {
                    columnDefinitions.push(new ColumnDefinition(propName));
                }
            };

            var discoverColumnDefinitionsFromHeaderRowElement = (headerElement:JQuery) =>{
                angular.forEach(headerElement.find("td"), (cellElement:JQuery, cellIndex:number)=>{
                    var propName = cellElement.attr("gridColumnModel");
                    var columnDefinition:ColumnDefinition;
                    if(cellIndex>=columnDefinitions.length){
                        columnDefinition = new TrNgGrid.ColumnDefinition(propName);
                        columnDefinitions.push(columnDefinition);
                    }
                    else{
                        columnDefinition = columnDefinitions[cellIndex];
                        columnDefinition.entityPropName = propName;
                    }
                });
            }

            return {
                transclude: false,
                restrict: 'A',
                // pre-compilation
                template: function (tableElement: JQuery, tAttrs: ng.IAttributes) {
                    var generateHeaderCells = false;
                    var generateBodyCells = false;

                    // investigate the header
                    var tableHeadElement = tableElement.find("thead");
                    if (tableHeadElement.length == 0) {
                        generateHeaderCells = true;
                        tableHeadElement = $("<thead>").appendTo(tableElement);
                    }
                    var tableHeadCells = tableHeadElement.find("td");
                    if (tableHeadCells.length == 0) {
                        generateHeaderCells = true;
                    }

                    // investigate the body
                    var tableBodyElement = tableElement.find("tbody");
                    if (tableBodyElement.length === 0) {
                        tableBodyElement = $("<tbody>").appendTo(tableElement);
                    }

                    var tableBodyRowTemplate = tableBodyElement.find("tr");
                    if (tableBodyRowTemplate.length === 0) {
                        generateBodyCells = true;
                        tableBodyRowTemplate = $("<tr>").appendTo(tableBodyElement);
                    }
                    var tableBodyCells = tableBodyElement.find("td");
                    if (tableBodyCells.length == 0) {
                        generateBodyCells = true;
                    }
                },
                // dom manipulation in the compile stage, angular directives ignored
                compile: function (tElement: JQuery, tAttrs: Object, transclude: (transclusionScope: ng.IScope, cloneLinkingFn:(tClonedElement:JQuery)=>void)=>void) {
                    //link function - use for registering DOM listeners(i.e., $watch expressions on the instance scope) as well as instance DOM manipulation
                    return function (scope: ng.IScope, tElement: JQuery, tAttrs: ng.IAttributes) {
                        var tBodyElement = tElement.find("tbody");
                        if (tAttrs["generateCells"]) {
                            var boundData = <Array<any>>scope["model"];
                            if (boundData.length > 0) {
                                var boundDataItem = boundData[0];

                                var rowTemplate = setRow($("<tr>"));
                                var columns = [];
                                for (var propName in boundDataItem) {
                                    columns.push(propName);
                                    $("<td>").text("{{entity." + propName + "}}").appendTo(rowTemplate);
                                }
                                tBodyElement.append(rowTemplate);
                                rowTemplate.replaceWith($compile(rowTemplate)(scope));
                            }
                        }
                        //console.log(tElement[0].outerHTML);
                    };
                },
                scope: {
                    model: '=',
                    filterBy: '=',
                    orderBy: '=',
                    orderByReverse: '='
                }
            };
    }]);
}