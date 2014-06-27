/// <reference path="../external/typings/jquery/jquery.d.ts"/>
/// <reference path="../external/typings/angularjs/angular.d.ts"/>
"use strict";
var TrNgGrid;
(function (TrNgGrid) {
    (function (SelectionMode) {
        SelectionMode[SelectionMode["None"] = 0] = "None";
        SelectionMode[SelectionMode["SingleRow"] = 1] = "SingleRow";
        SelectionMode[SelectionMode["MultiRow"] = 2] = "MultiRow";
        SelectionMode[SelectionMode["MultiRowWithKeyModifiers"] = 3] = "MultiRowWithKeyModifiers";
    })(TrNgGrid.SelectionMode || (TrNgGrid.SelectionMode = {}));
    var SelectionMode = TrNgGrid.SelectionMode;

    var tableDirective = "trNgGrid";
    TrNgGrid.dataPagingFilter = tableDirective + "DataPagingFilter";
    TrNgGrid.columnTitleDisplayNameFilter = tableDirective + "ColumnTitleDisplayNameFilter";

    var headerDirective = "trNgGridHeader";
    var headerDirectiveAttribute = "tr-ng-grid-header";
    TrNgGrid.columnHeaderTemplateId = headerDirective + ".html";

    var bodyDirective = "trNgGridBody";
    var bodyDirectiveAttribute = "tr-ng-grid-body";

    var footerDirective = "trNgGridFooter";
    var footerDirectiveAttribute = "tr-ng-grid-footer";
    TrNgGrid.footerTemplateId = footerDirective + ".html";

    var globalFilterDirective = "trNgGridGlobalFilter";
    TrNgGrid.globalFilterDirectiveAttribute = "tr-ng-grid-global-filter";
    TrNgGrid.footerGlobalFilterTemplateId = globalFilterDirective + ".html";

    var pagerDirective = "trNgGridPager";
    TrNgGrid.pagerDirectiveAttribute = "tr-ng-grid-pager";
    TrNgGrid.footerPagerTemplateId = pagerDirective + ".html";

    var columnHeaderDirective = "trNgGridColumn";
    var columnHeaderDirectiveAttribute = "tr-ng-grid-column";

    var columnSortDirective = "trNgGridColumnSort";
    TrNgGrid.columnSortDirectiveAttribute = "tr-ng-grid-column-sort";
    TrNgGrid.columnSortTemplateId = columnSortDirective + ".html";

    var columnFilterDirective = "trNgGridColumnFilter";
    TrNgGrid.columnFilterDirectiveAttribute = "tr-ng-grid-column-filter";
    TrNgGrid.columnFilterTemplateId = columnFilterDirective + ".html";

    var rowPageItemIndexAttribute = "tr-ng-grid-row-page-item-index";

    TrNgGrid.tableCssClass = "tr-ng-grid table table-bordered table-hover"; // at the time of coding, table-striped is not working properly with selection
    TrNgGrid.cellCssClass = "tr-ng-cell";
    TrNgGrid.columnContentsCssClass = "tr-ng-column-header " + TrNgGrid.cellCssClass;
    TrNgGrid.columnTitleCssClass = "tr-ng-title";
    TrNgGrid.columnSortCssClass = "tr-ng-sort";
    TrNgGrid.columnFilterCssClass = "tr-ng-column-filter";
    TrNgGrid.columnFilterInputWrapperCssClass = "";
    TrNgGrid.columnSortActiveCssClass = "tr-ng-sort-active text-info";
    TrNgGrid.columnSortInactiveCssClass = "tr-ng-sort-inactive text-muted";
    TrNgGrid.columnSortReverseOrderCssClass = "tr-ng-sort-order-reverse glyphicon glyphicon-chevron-up";
    TrNgGrid.columnSortNormalOrderCssClass = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-down";
    TrNgGrid.rowSelectedCssClass = "active";
    TrNgGrid.footerCssClass = "tr-ng-grid-footer form-inline";

    TrNgGrid.splitByCamelCasing = function (input) {
        var splitInput = input.split(/(?=[A-Z])/);
        if (splitInput.length && splitInput[0].length) {
            splitInput[0] = splitInput[0][0].toLocaleUpperCase() + splitInput[0].substr(1);
        }

        return splitInput.join(" ");
    };

    var GridController = (function () {
        function GridController($compile, $scope, $element, $attrs, $parse, $timeout) {
            var _this = this;
            this.$compile = $compile;
            this.$parse = $parse;
            this.$timeout = $timeout;
            this.gridElement = $element;
            this.internalScope = $scope;

            $scope.TrNgGrid = TrNgGrid;
            this.scheduledRecompilationDereg = null;

            var scopeOptionsIdentifier = "gridOptions";

            // initialise the options
            this.gridOptions = {
                items: [],
                selectedItems: [],
                filterBy: null,
                filterByFields: {},
                orderBy: null,
                orderByReverse: false,
                pageItems: null,
                currentPage: 0,
                totalItems: null,
                enableFiltering: true,
                enableSorting: true,
                enableSelections: true,
                enableMultiRowSelections: true,
                selectionMode: SelectionMode[2 /* MultiRow */],
                onDataRequiredDelay: 1000
            };
            this.gridOptions.onDataRequired = $attrs["onDataRequired"] ? $scope.onDataRequired : null;
            this.gridOptions.gridColumnDefs = [];
            this.internalScope[scopeOptionsIdentifier] = this.gridOptions;

            this.externalScope = this.internalScope.$parent;

            //link the outer scope with the internal one
            this.linkScope(this.internalScope, this.externalScope, scopeOptionsIdentifier, $attrs);

            //set up watchers for some of the special attributes we support
            if (this.gridOptions.onDataRequired) {
                $scope.$watchCollection("[gridOptions.filterBy, " + "gridOptions.filterByFields, " + "gridOptions.orderBy, " + "gridOptions.orderByReverse, " + "gridOptions.currentPage]", function () {
                    if (_this.dataRequestPromise) {
                        _this.$timeout.cancel(_this.dataRequestPromise);
                        _this.dataRequestPromise = null;
                    }

                    // for the time being, Angular is not able to bind only when losing focus, so we'll introduce a delay
                    _this.dataRequestPromise = _this.$timeout(function () {
                        _this.dataRequestPromise = null;
                        _this.gridOptions.onDataRequired(_this.gridOptions);
                    }, _this.gridOptions.onDataRequiredDelay, true);
                });
            }

            // TODO: remove in the future as these settings are deprecated
            this.internalScope.$watch(scopeOptionsIdentifier + ".enableMultiRowSelections", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    // in case the user is not using the selectionMode, we assume he's not aware of it
                    if (newValue) {
                        _this.gridOptions.selectionMode = SelectionMode[2 /* MultiRow */];
                        _this.gridOptions.enableSelections = true;
                    } else if (_this.gridOptions.enableSelections) {
                        _this.gridOptions.selectionMode = SelectionMode[1 /* SingleRow */];
                    }
                }
            });

            // TODO: remove in the future as these settings are deprecated
            this.internalScope.$watch(scopeOptionsIdentifier + ".enableSelections", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    // in case the user is not using the selectionMode, we assume he's not aware of it
                    if (newValue) {
                        if (_this.gridOptions.selectionMode === SelectionMode[0 /* None */]) {
                            _this.gridOptions.selectionMode = SelectionMode[1 /* SingleRow */];
                        }
                    } else {
                        _this.gridOptions.enableMultiRowSelections = false;
                        _this.gridOptions.selectionMode = SelectionMode[0 /* None */];
                    }
                }
            });

            // the new settings
            this.internalScope.$watch(scopeOptionsIdentifier + ".selectionMode", function (newValue, oldValue) {
                /*if (typeof (newValue) === 'string' || newValue instanceof String) {
                var originalNewValue = newValue;
                newValue = SelectionMode[newValue];
                //if (typeof (newValue) == "undefined") {
                //    newValue = this.internalScope.$eval(originalNewValue);
                //    newValue = SelectionMode[newValue];
                //}
                // this.internalScope["selectionMode"] = newValue;
                }*/
                if (newValue !== oldValue) {
                    switch (newValue) {
                        case SelectionMode[0 /* None */]:
                            _this.gridOptions.selectedItems.splice(0);
                            break;
                        case SelectionMode[1 /* SingleRow */]:
                            if (_this.gridOptions.selectedItems.length > 1) {
                                _this.gridOptions.selectedItems.splice(1);
                            }
                            break;
                    }
                }
            });
        }
        GridController.prototype.setColumnOptions = function (columnIndex, columnOptions) {
            if (columnIndex >= this.gridOptions.gridColumnDefs.length) {
                this.gridOptions.gridColumnDefs.push({});
                this.setColumnOptions(columnIndex, columnOptions);
            } else {
                this.gridOptions.gridColumnDefs[columnIndex] = columnOptions;
            }
        };

        GridController.prototype.toggleSorting = function (propertyName) {
            if (this.gridOptions.orderBy != propertyName) {
                // the column has changed
                this.gridOptions.orderBy = propertyName;
            } else {
                // the sort direction has changed
                this.gridOptions.orderByReverse = !this.gridOptions.orderByReverse;
            }
        };

        GridController.prototype.setFilter = function (propertyName, filter) {
            if (!filter) {
                delete (this.gridOptions.filterByFields[propertyName]);
            } else {
                this.gridOptions.filterByFields[propertyName] = filter;
            }

            // in order for someone to successfully listen to changes made to this object, we need to replace it
            this.gridOptions.filterByFields = $.extend({}, this.gridOptions.filterByFields);
        };

        GridController.prototype.toggleItemSelection = function (item, $event) {
            if (this.gridOptions.selectionMode === SelectionMode[0 /* None */])
                return;

            switch (this.gridOptions.selectionMode) {
                case SelectionMode[3 /* MultiRowWithKeyModifiers */]:
                    if (!$event.ctrlKey && !$event.shiftKey && !$event.metaKey) {
                        // if neither key modifiers are pressed, clear the selection and start fresh
                        var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                        this.gridOptions.selectedItems.splice(0);
                        if (itemIndex < 0) {
                            this.gridOptions.selectedItems.push(item);
                        }
                    } else {
                        if ($event.ctrlKey || $event.metaKey) {
                            // the ctrl key deselects or selects the item
                            var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                            if (itemIndex >= 0) {
                                this.gridOptions.selectedItems.splice(itemIndex, 1);
                            } else {
                                this.gridOptions.selectedItems.push(item);
                            }
                        } else if ($event.shiftKey) {
                            // clear undesired selections, if the styles are not applied
                            if (document.selection && document.selection.empty) {
                                document.selection.empty();
                            } else if (window.getSelection) {
                                var sel = window.getSelection();
                                sel.removeAllRanges();
                            }

                            // the shift key will always select items from the last selected item
                            var firstItemIndex = -1;
                            if (this.gridOptions.selectedItems.length > 0) {
                                firstItemIndex = this.gridOptions.items.indexOf(this.gridOptions.selectedItems[this.gridOptions.selectedItems.length - 1]);
                            }
                            if (firstItemIndex < 0) {
                                firstItemIndex = 0;
                            }
                            var lastItemIndex = this.gridOptions.items.indexOf(item);
                            if (lastItemIndex < 0) {
                                throw "Invalid selection on a key modifier selection mode";
                            }
                            if (lastItemIndex < firstItemIndex) {
                                var tempIndex = firstItemIndex;
                                firstItemIndex = lastItemIndex;
                                lastItemIndex = tempIndex;
                            }

                            for (var currentItemIndex = firstItemIndex; currentItemIndex <= lastItemIndex; currentItemIndex++) {
                                var currentItem = this.gridOptions.items[currentItemIndex];
                                if (this.gridOptions.selectedItems.indexOf(currentItem) < 0) {
                                    this.gridOptions.selectedItems.push(currentItem);
                                }
                            }
                        }
                    }
                    break;
                case SelectionMode[1 /* SingleRow */]:
                    var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                    this.gridOptions.selectedItems.splice(0);
                    if (itemIndex < 0) {
                        this.gridOptions.selectedItems.push(item);
                    }
                    break;
                case SelectionMode[2 /* MultiRow */]:
                    var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                    if (itemIndex >= 0) {
                        this.gridOptions.selectedItems.splice(itemIndex, 1);
                    } else {
                        this.gridOptions.selectedItems.push(item);
                    }
                    break;
            }
        };

        GridController.prototype.scheduleRecompilationOnAvailableItems = function () {
            var _this = this;
            if (this.scheduledRecompilationDereg || (this.gridOptions.items && this.gridOptions.items.length))
                // already have one set up
                return;

            this.scheduledRecompilationDereg = this.internalScope.$watch("items.length", function (newLength, oldLength) {
                if (newLength > 0) {
                    // unregister the watch
                    _this.scheduledRecompilationDereg();

                    // recompile
                    _this.$compile(_this.gridElement)(_this.externalScope);
                }
            });
        };

        GridController.prototype.linkScope = function (internalScope, externalScope, scopeTargetIdentifier, attrs) {
            // this method shouldn't even be here
            // but it is because we want to allow people to either set attributes with either a constant or a watchable variable
            // watch for a resolution to issue #5951 on angular
            // https://github.com/angular/angular.js/issues/5951
            var target = internalScope[scopeTargetIdentifier];

            for (var propName in target) {
                var attributeExists = typeof (attrs[propName]) != "undefined" && attrs[propName] != null;

                if (attributeExists) {
                    var isArray = false;

                    // initialise from the scope first
                    if (typeof (internalScope[propName]) != "undefined" && internalScope[propName] != null) {
                        target[propName] = internalScope[propName];
                        isArray = target[propName] instanceof Array;
                    }

                    //allow arrays to be changed: if(!isArray){
                    var compiledAttrGetter = null;
                    try  {
                        compiledAttrGetter = this.$parse(attrs[propName]);
                    } catch (ex) {
                        // angular fails to parse literal bindings '@', thanks angular team
                    }
                    (function (propName, compiledAttrGetter) {
                        if (!compiledAttrGetter || !compiledAttrGetter.constant) {
                            // watch for a change in value and set it on our internal scope
                            internalScope.$watch(propName, function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    target[propName] = newValue;
                                }
                            });
                        }

                        var compiledAttrSetter = (compiledAttrGetter && compiledAttrGetter.assign) ? compiledAttrGetter.assign : null;
                        if (compiledAttrSetter) {
                            // a setter exists on the scope, make sure we watch our internals and copy them over
                            internalScope.$watch(scopeTargetIdentifier + "." + propName, function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    compiledAttrSetter(externalScope, newValue);
                                }
                            });
                        }
                    })(propName, compiledAttrGetter);
                }
            }
        };
        return GridController;
    })();

    angular.module("trNgGrid", []).directive(tableDirective, [function () {
            return {
                restrict: 'A',
                // create an isolated scope, and remember the original scope can be found in the parent
                scope: {
                    items: '=',
                    selectedItems: '=?',
                    filterBy: '=?',
                    filterByFields: '=?',
                    orderBy: '=?',
                    orderByReverse: '=?',
                    pageItems: '=?',
                    currentPage: '=?',
                    totalItems: '=?',
                    enableFiltering: '=?',
                    enableSorting: '=?',
                    enableSelections: '=?',
                    enableMultiRowSelections: '=?',
                    selectionMode: '@',
                    onDataRequired: '&',
                    onDataRequiredDelay: '=?'
                },
                // executed prior to pre-linking phase but after compilation
                // as we're creating an isolated scope, we need something to link them
                controller: ["$compile", "$scope", "$element", "$attrs", "$parse", "$timeout", GridController],
                // dom manipulation in the compile stage
                compile: function (templateElement, tAttrs) {
                    templateElement.addClass(TrNgGrid.tableCssClass);
                    var insertFooterElement = false;
                    var insertHeadElement = false;

                    // make sure the header is present
                    var tableHeadElement = templateElement.children("thead");
                    if (tableHeadElement.length == 0) {
                        tableHeadElement = $("<thead>");
                        insertHeadElement = true;
                    }
                    var tableHeadRowTemplate = tableHeadElement.children("tr");
                    if (tableHeadRowTemplate.length == 0) {
                        tableHeadRowTemplate = $("<tr>").appendTo(tableHeadElement);
                    }
                    tableHeadRowTemplate.attr(headerDirectiveAttribute, "");

                    // help a bit with the attributes
                    tableHeadRowTemplate.children("th[field-name]").attr(columnHeaderDirectiveAttribute, "");

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
                    tableBodyElement.attr(bodyDirectiveAttribute, "");

                    // make sure the footer is present
                    var tableFooterElement = templateElement.children("tfoot");
                    if (tableFooterElement.length == 0) {
                        tableFooterElement = $("<tfoot>");
                        insertFooterElement = true;
                    }
                    var tableFooterRowTemplate = tableFooterElement.children("tr");
                    if (tableFooterRowTemplate.length == 0) {
                        tableFooterRowTemplate = $("<tr>").appendTo(tableFooterElement);
                    }
                    if (tableFooterRowTemplate.children("td").length == 0) {
                        var fullTableLengthFooterCell = $("<td>").attr("colspan", "999").appendTo(tableFooterRowTemplate);

                        var footerOpsContainer = $("<div>").attr(footerDirectiveAttribute, "").appendTo(fullTableLengthFooterCell);
                    }

                    if (insertHeadElement) {
                        templateElement.prepend(tableHeadElement);
                    }

                    if (insertFooterElement) {
                        tableFooterElement.insertBefore(tableBodyElement);
                    }
                }
            };
        }]).directive(headerDirective, [
        "$compile",
        function ($compile) {
            return {
                restrict: 'A',
                scope: false,
                require: '^' + tableDirective,
                compile: function (templateElement, tAttrs) {
                    return {
                        //pre linking function - executed before children get linked (be careful with the dom changes)
                        pre: function (scope, instanceElement, tAttrs, gridController) {
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
                                        var headerCellElement = $("<th>").attr(columnHeaderDirectiveAttribute, "").attr("field-name", columnNames[columnIndex]).appendTo(instanceElement);
                                        $compile(headerCellElement)(scope);
                                    }
                                } else {
                                    // watch for items to arrive and re-run the compilation then
                                    gridController.scheduleRecompilationOnAvailableItems();
                                }
                            }
                        }
                    };
                }
            };
        }
    ]).directive(columnHeaderDirective, [
        "$compile",
        function ($compile) {
            return {
                restrict: 'A',
                // column settings, dual-databinding is not necessary here
                require: '^' + tableDirective,
                scope: {
                    fieldName: '@',
                    displayName: '@',
                    enableFiltering: '@',
                    enableSorting: '@',
                    displayAlign: '@',
                    displayFormat: '@',
                    cellWidth: '@',
                    cellHeight: '@'
                },
                templateUrl: TrNgGrid.columnHeaderTemplateId,
                transclude: true,
                compile: function (templateElement, tAttrs) {
                    var columnIndex;
                    return {
                        //pre linking function - executed before children get linked (be careful with the dom changes)
                        pre: function (scope, instanceElement, tAttrs, controller, $transclude) {
                            var isValid = instanceElement.prop("tagName") == "TH";
                            if (!isValid) {
                                throw "The template has an invalid header column template element. Column templates must be defined on TH elements inside THEAD/TR";
                            }

                            var isCustomized = false;
                            $transclude(function (clonedElement, scope) {
                                /* clone is element containing html that will be transcludded*/
                                isCustomized = clonedElement.children().length > 0;
                            });

                            // set up the scope for the column inside the header
                            // the directive can be present on the header's td elements but also on the body's elements but we extract column information from the header only
                            scope.isCustomized = isCustomized;
                            scope.gridOptions = controller.gridOptions;
                            if (scope.cellWidth) {
                                instanceElement.css("width", scope.cellWidth);
                            }
                            if (scope.cellHeight) {
                                instanceElement.css("height", scope.cellHeight);
                            }

                            /*scope.toggleSorting = (propertyName) => controller.toggleSorting(propertyName);
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
                            });*/
                            columnIndex = instanceElement.parent().children("th").index(instanceElement);
                            if (columnIndex < 0) {
                                return;
                            }
                            controller.setColumnOptions(columnIndex, scope);
                            // instanceElement.removeAttr(columnDirectiveAttribute);
                        }
                    };
                }
            };
        }
    ]).directive(columnSortDirective, [
        function () {
            return {
                restrict: 'A',
                replace: true,
                templateUrl: TrNgGrid.columnSortTemplateId
            };
        }
    ]).directive(columnFilterDirective, [
        function () {
            return {
                restrict: 'A',
                replace: true,
                templateUrl: TrNgGrid.columnFilterTemplateId
            };
        }
    ]).directive(bodyDirective, [
        "$compile",
        function ($compile) {
            return {
                restrict: 'A',
                scope: true,
                require: '^' + tableDirective,
                replace: true,
                compile: function (templateElement, tAttrs) {
                    // we cannot allow angular to use the body row template just yet
                    var bodyOriginalTemplateRow = templateElement.children("tr");
                    templateElement.contents().remove();

                    return {
                        // we receive a reference to a real element that will appear in the DOM, after the controller was created, but before binding setup
                        pre: function (scope, instanceElement, tAttrs, controller) {
                            // set up the scope
                            scope.gridOptions = controller.gridOptions;
                            scope.toggleItemSelection = function (item, $event) {
                                return controller.toggleItemSelection(item, $event);
                            };

                            // we're too early, we've got to wait for the grid column definitions to become available
                            // equality checks described here: http://teropa.info/blog/2014/01/26/the-three-watch-depths-of-angularjs.html
                            scope.$watchCollection("gridOptions.gridColumnDefs", function (newColumnDefs, oldColumnDefs) {
                                // find the body row template, which was initially excluded from the compilation
                                // apply the ng-repeat
                                var ngRepeatAttrValue = "gridItem in gridOptions.items";
                                if (scope.gridOptions.onDataRequired) {
                                    // data is retrieved externally, watchers set up in the controller take care of calling this method
                                } else {
                                    // the grid's internal mechanisms are active
                                    ngRepeatAttrValue += " | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse | " + TrNgGrid.dataPagingFilter + ":gridOptions";
                                }

                                // ng-switch calls the post-linking function to refresh the dom, so we can't mess the original template
                                var bodyTemplateRow = bodyOriginalTemplateRow.clone(true);

                                bodyTemplateRow.attr("ng-repeat", ngRepeatAttrValue);
                                if (!bodyTemplateRow.attr("ng-click")) {
                                    bodyTemplateRow.attr("ng-click", "toggleItemSelection(gridItem, $event)");
                                }
                                bodyTemplateRow.attr("ng-class", "{'" + TrNgGrid.rowSelectedCssClass + "':gridOptions.selectedItems.indexOf(gridItem)>=0}");

                                bodyTemplateRow.attr(rowPageItemIndexAttribute, "{{$index}}");

                                angular.forEach(newColumnDefs, function (columnOptions, index) {
                                    var cellTemplateElement = bodyTemplateRow.children("td:nth-child(" + (index + 1) + ")");
                                    var cellTemplateFieldName = cellTemplateElement.attr("field-name");
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
                                    } else {
                                        // create the content if the td had no children
                                        createInnerCellContents = (cellTemplateElement.text() == "");
                                    }

                                    if (createInnerCellContents) {
                                        var cellContentsElement = $("<div>").addClass(TrNgGrid.cellCssClass);
                                        if (columnOptions.fieldName) {
                                            // according to the column options, a model bound cell is needed here
                                            cellContentsElement.attr("field-name", columnOptions.fieldName);
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
                                        } else {
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
                                instanceElement.contents().remove();
                                instanceElement.append($compile(bodyTemplateRow)(scope));
                                instanceElement.removeAttr(bodyDirectiveAttribute);
                                instanceElement.children("td[" + columnHeaderDirectiveAttribute + "]").removeAttr(columnHeaderDirectiveAttribute);
                            });
                        },
                        //post linking function - executed after all the children have been linked, safe to perform DOM manipulations
                        post: function (scope, compiledInstanceElement, tAttrs, controller) {
                        }
                    };
                }
            };
        }
    ]).directive(footerDirective, [
        function () {
            return {
                restrict: 'A',
                scope: false,
                require: '^' + tableDirective,
                replace: true,
                templateUrl: TrNgGrid.footerTemplateId
            };
        }
    ]).directive(globalFilterDirective, [
        function () {
            return {
                restrict: 'A',
                replace: true,
                scope: true,
                require: '^' + tableDirective,
                templateUrl: TrNgGrid.footerGlobalFilterTemplateId,
                compile: function (templateElement, tAttrs) {
                    //templateElement.attr("ng-show", "gridOptions.enableFiltering");
                    return {
                        pre: function (scope, compiledInstanceElement, tAttrs, controller) {
                            scope.gridOptions = controller.gridOptions;
                        },
                        post: function (scope, instanceElement, tAttrs, controller) {
                        }
                    };
                }
            };
        }
    ]).directive(pagerDirective, [
        function () {
            var setupScope = function (scope, controller) {
                scope.gridOptions = controller.gridOptions;
                scope.isPaged = !!scope.gridOptions.pageItems;

                // do not set scope.gridOptions.totalItems, it might be set from the outside
                scope.totalItemsCount = (typeof (scope.gridOptions.totalItems) != "undefined" && scope.gridOptions.totalItems != null) ? scope.gridOptions.totalItems : (scope.gridOptions.items ? scope.gridOptions.items.length : 0);

                scope.startItemIndex = scope.isPaged ? (scope.gridOptions.pageItems * scope.gridOptions.currentPage) : 0;
                scope.endItemIndex = scope.isPaged ? (scope.startItemIndex + scope.gridOptions.pageItems - 1) : scope.totalItemsCount - 1;
                if (scope.endItemIndex >= scope.totalItemsCount) {
                    scope.endItemIndex = scope.totalItemsCount - 1;
                }
                if (scope.endItemIndex < scope.startItemIndex) {
                    scope.endItemIndex = scope.startItemIndex;
                }
                scope.lastPageIndex = (!scope.totalItemsCount || !scope.isPaged) ? 0 : (Math.floor(scope.totalItemsCount / scope.gridOptions.pageItems) + ((scope.totalItemsCount % scope.gridOptions.pageItems) ? 0 : -1));

                scope.pageIndexes = [];
                for (var pageIndex = 0; pageIndex <= scope.lastPageIndex; pageIndex++) {
                    scope.pageIndexes.push(pageIndex);
                }
                scope.pageSelectionActive = scope.pageIndexes.length > 1;

                scope.pageCanGoBack = scope.isPaged && scope.gridOptions.currentPage > 0;
                scope.pageCanGoForward = scope.isPaged && scope.gridOptions.currentPage < scope.lastPageIndex;

                scope.navigateToPage = function ($event, pageIndex) {
                    scope.gridOptions.currentPage = pageIndex;
                    $event.preventDefault();
                    $event.stopPropagation();
                };

                scope.switchPageSelection = function ($event, pageSelectionActive) {
                    scope.pageSelectionActive = pageSelectionActive;
                    if ($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                    }
                };
            };

            //ng - model = "gridOptions.currentPage"
            return {
                restrict: 'A',
                scope: true,
                require: '^' + tableDirective,
                templateUrl: TrNgGrid.footerPagerTemplateId,
                replace: true,
                link: {
                    pre: function (scope, compiledInstanceElement, tAttrs, controller) {
                        setupScope(scope, controller);
                    },
                    post: function (scope, instanceElement, tAttrs, controller) {
                        scope.$watchCollection("[gridOptions.currentPage, gridOptions.items.length, gridOptions.totalItems, gridOptions.pageItems]", function (newValues, oldValues) {
                            setupScope(scope, controller);
                        });
                    }
                }
            };
        }
    ]).filter(TrNgGrid.dataPagingFilter, function () {
        return function (input, gridOptions) {
            //currentPage?:number, pageItems?:number
            if (input)
                gridOptions.totalItems = input.length;

            if (!gridOptions.pageItems || !input || input.length == 0)
                return input;

            if (!gridOptions.currentPage) {
                gridOptions.currentPage = 0;
            }

            var startIndex = gridOptions.currentPage * gridOptions.pageItems;
            if (startIndex >= input.length) {
                gridOptions.currentPage = 0;
                startIndex = 0;
            }
            var endIndex = gridOptions.currentPage * gridOptions.pageItems + gridOptions.pageItems;

            /*              Update: Not called for server-side paging
            if(startIndex>=input.length){
            // server side paging, ignore the operation
            return input;
            }
            */
            return input.slice(startIndex, endIndex);
        };
    }).filter(TrNgGrid.columnTitleDisplayNameFilter, function () {
        return function (displayName, fieldName) {
            if (typeof (displayName) === "undefined") {
                return TrNgGrid.splitByCamelCasing(fieldName);
            }
            return displayName;
        };
    }).run([
        "$templateCache",
        function ($templateCache) {
            // set up default templates
            $templateCache.put(TrNgGrid.columnHeaderTemplateId, '<div class="' + TrNgGrid.columnContentsCssClass + '">' + '  <div ng-if="!isCustomized">' + '    <div class="' + TrNgGrid.columnTitleCssClass + '">' + '      {{displayName |' + TrNgGrid.columnTitleDisplayNameFilter + ':fieldName}}' + '       <div ' + TrNgGrid.columnSortDirectiveAttribute + ' />' + '    </div>' + '    <div ' + TrNgGrid.columnFilterDirectiveAttribute + '/>' + '  </div>' + '  <div ng-if="isCustomized">' + '    <div ng-transclude/>' + '  </div>' + '</div>');
            $templateCache.put(TrNgGrid.columnFilterTemplateId, "<div ng-show='enableFiltering||gridOptions.enableFiltering' class='" + TrNgGrid.columnFilterCssClass + "'>" + " <div class='" + TrNgGrid.columnFilterInputWrapperCssClass + "'>" + "   <input class='form-control input-sm' type='text' ng-model='filter'/>" + " </div>" + "</div>");
            $templateCache.put(TrNgGrid.columnSortTemplateId, "<div ng-show='enableSorting||gridOptions.enableSorting' ng-click='toggleSorting(fieldName)' title='Sort' class='" + TrNgGrid.columnSortCssClass + "'>" + "  <div ng-class=\"{'" + TrNgGrid.columnSortActiveCssClass + "':gridOptions.orderBy==fieldName,'" + TrNgGrid.columnSortInactiveCssClass + "':gridOptions.orderBy!=fieldName,'" + TrNgGrid.columnSortNormalOrderCssClass + "':gridOptions.orderBy!=fieldName||!gridOptions.orderByReverse,'" + TrNgGrid.columnSortReverseOrderCssClass + "':gridOptions.orderBy==fieldName&&gridOptions.orderByReverse}\" >" + "  </div>" + "</div>");
            $templateCache.put(TrNgGrid.footerTemplateId, '<div class="' + TrNgGrid.footerCssClass + '">' + '  <span ' + TrNgGrid.globalFilterDirectiveAttribute + '=""/>' + '  <span ' + TrNgGrid.pagerDirectiveAttribute + '=""/>' + '</div>');
            $templateCache.put(TrNgGrid.footerGlobalFilterTemplateId, '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">' + '  <input class="form-control" type="text" ng-model="gridOptions.filterBy" placeholder="Search"/>' + '</span>');
            $templateCache.put(TrNgGrid.footerPagerTemplateId, '<span class="pull-right form-group">' + ' <ul class="pagination">' + '   <li ng-show="pageCanGoBack" >' + '     <a href="#" ng-click="navigateToPage($event, 0)" title="First Page">|&lArr;</a>' + '   </li>' + '   <li ng-show="pageCanGoBack" >' + '     <a href="#" ng-click="navigateToPage($event, gridOptions.currentPage - 1)" title="Previous Page">&lArr;</a>' + '   </li>' + '   <li ng-show="pageSelectionActive" style="white-space: nowrap;">' + '     <span>Page: ' + '       <select ng-model="gridOptions.currentPage" ng-options="pageIndex as (pageIndex+1) for pageIndex in pageIndexes"></select>' + '     </span>' + '   </li>' + '   <li class="disabled" style="white-space: nowrap;">' + '     <span ng-hide="totalItemsCount">No items to display</span>' + '     <span ng-show="totalItemsCount" title="Select Page">' + '       {{startItemIndex+1}} - {{endItemIndex+1}} displayed' + '     <span>, {{totalItemsCount}} in total</span>' + '     </span > ' + '   </li>' + '   <li ng-show="pageCanGoForward">' + '     <a href="#" ng-click="navigateToPage($event, gridOptions.currentPage + 1)" title="Next Page">&rArr;</a>' + '   </li>' + '   <li>' + '   <li ng-show="pageCanGoForward">' + '     <a href="#" ng-show="pageCanGoForward" ng-click="navigateToPage($event, lastPageIndex)" title="Last Page">&rArr;|</a>' + '   </li>' + ' </ul>' + '</span>');
        }
    ]);
})(TrNgGrid || (TrNgGrid = {}));
//# sourceMappingURL=trNgGrid.js.map
