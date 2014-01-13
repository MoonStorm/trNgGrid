/**
* Created by dcristiu on 13/01/14.
*/
/// <reference path="../../d.ts/DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="../../d.ts/DefinitelyTyped/angularjs/angular.d.ts"/>
var TrNgGrid;
(function (TrNgGrid) {
    var ColumnDefinition = (function () {
        function ColumnDefinition(entityPropName) {
            this.entityPropName = entityPropName;
        }
        return ColumnDefinition;
    })();
    TrNgGrid.ColumnDefinition = ColumnDefinition;

    angular.module('trNgGrid', []).directive('trNgGrid', [
        '$compile',
        function ($compile) {
            var columnDefinitions = new Array();

            var setRow = function (rowElement) {
                rowElement.attr("ng-repeat", "entity in model | filter:filterBy | orderBy:orderBy:orderByReverse");
                return rowElement;
            };

            var discoverColumnDefinitionsFromData = function (item) {
                if (!item)
                    return;
                for (var propName in item) {
                    columnDefinitions.push(new ColumnDefinition(propName));
                }
            };

            var discoverColumnDefinitionsFromHeaderRowElement = function (headerElement) {
                angular.forEach(headerElement.find("td"), function (cellElement, cellIndex) {
                    var propName = cellElement.attr("gridColumnModel");
                    var columnDefinition;
                    if (cellIndex >= columnDefinitions.length) {
                        columnDefinition = new TrNgGrid.ColumnDefinition(propName);
                        columnDefinitions.push(columnDefinition);
                    } else {
                        columnDefinition = columnDefinitions[cellIndex];
                        columnDefinition.entityPropName = propName;
                    }
                });
            };

            return {
                transclude: false,
                restrict: 'A',
                // pre-compilation
                template: function (tableElement, tAttrs) {
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
                compile: function (tElement, tAttrs, transclude) {
                    //link function - use for registering DOM listeners(i.e., $watch expressions on the instance scope) as well as instance DOM manipulation
                    return function (scope, tElement, tAttrs) {
                        var tBodyElement = tElement.find("tbody");
                        if (tAttrs["generateCells"]) {
                            var boundData = scope["model"];
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
})(TrNgGrid || (TrNgGrid = {}));
//# sourceMappingURL=trNgGrid.js.map
