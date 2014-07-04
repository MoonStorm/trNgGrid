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

    // it's important to assign all the default column options, so we can match them with the column attributes in the markup
    TrNgGrid.defaultColumnOptions = {
        cellWidth: null,
        cellHeight: null,
        displayAlign: "left",
        displayFormat: null,
        displayName: null,
        filter: null,
        enableFiltering: null,
        enableSorting: null
    };

    var tableDirective = "trNgGrid";
    TrNgGrid.dataPagingFilter = tableDirective + "DataPagingFilter";

    //var headerDirective="trNgGridHeader";
    //var headerDirectiveAttribute = "tr-ng-grid-header";
    var bodyDirective = "trNgGridBody";
    var bodyDirectiveAttribute = "tr-ng-grid-body";

    var fieldNameAttribute = "field-name";
    var isCustomizedAttribute = "is-customized";

    var cellFooterDirective = "trNgGridFooterCell";
    var cellFooterDirectiveAttribute = "tr-ng-grid-footer-cell";
    var cellFooterTemplateDirective = "trNgGridFooterCellTemplate";
    var cellFooterTemplateDirectiveAttribute = "tr-ng-grid-footer-cell-template";
    TrNgGrid.cellFooterTemplateId = cellFooterTemplateDirective + ".html";

    var globalFilterDirective = "trNgGridGlobalFilter";
    TrNgGrid.globalFilterDirectiveAttribute = "tr-ng-grid-global-filter";
    TrNgGrid.footerGlobalFilterTemplateId = globalFilterDirective + ".html";

    var pagerDirective = "trNgGridPager";
    TrNgGrid.pagerDirectiveAttribute = "tr-ng-grid-pager";
    TrNgGrid.footerPagerTemplateId = pagerDirective + ".html";

    var cellHeaderDirective = "trNgGridHeaderCell";
    var cellHeaderDirectiveAttribute = "tr-ng-grid-header-cell";
    var cellHeaderTemplateDirective = "trNgGridHeaderCellTemplate";
    var cellHeaderTemplateDirectiveAttribute = "tr-ng-grid-header-cell-template";
    TrNgGrid.cellHeaderTemplateId = cellHeaderTemplateDirective + ".html";

    var cellBodyDirective = "trNgGridBodyCell";
    var cellBodyDirectiveAttribute = "tr-ng-grid-body-cell";
    var cellBodyTemplateDirective = "trNgGridBodyCellTemplate";
    var cellBodyTemplateDirectiveAttribute = "tr-ng-grid-body-cell-template";
    TrNgGrid.cellBodyTemplateId = cellBodyTemplateDirective + ".html";

    var columnSortDirective = "trNgGridColumnSort";
    TrNgGrid.columnSortDirectiveAttribute = "tr-ng-grid-column-sort";
    TrNgGrid.columnSortTemplateId = columnSortDirective + ".html";

    var columnFilterDirective = "trNgGridColumnFilter";
    TrNgGrid.columnFilterDirectiveAttribute = "tr-ng-grid-column-filter";
    TrNgGrid.columnFilterTemplateId = columnFilterDirective + ".html";

    //var rowPageItemIndexAttribute="tr-ng-grid-row-page-item-index";
    TrNgGrid.tableCssClass = "tr-ng-grid table table-bordered table-hover"; // at the time of coding, table-striped is not working properly with selection
    TrNgGrid.cellCssClass = "tr-ng-cell";
    TrNgGrid.headerCellCssClass = "tr-ng-column-header " + TrNgGrid.cellCssClass;
    TrNgGrid.bodyCellCssClass = TrNgGrid.cellCssClass;
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

    var findChildByTagName = function (parent, childTag) {
        childTag = childTag.toUpperCase();
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName == childTag) {
                return angular.element(childElement);
            }
        }

        return null;
    };

    var findChildrenByTagName = function (parent, childTag) {
        childTag = childTag.toUpperCase();
        var retChildren = [];
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName == childTag) {
                retChildren.push(angular.element(childElement));
            }
        }

        return retChildren;
    };

    /**
    * Combines two sets of cell infos. The first set will take precedence in the checks but the combined items will contain items from the second set if they match.
    */
    var combineGridCellInfos = function (firstSet, secondSet, addExtraItemsFirstSet, addExtraItemsSecondSet) {
        var combinedSet = [];
        var secondTempSet = secondSet.slice(0);
        angular.forEach(firstSet, function (firstSetColumn) {
            // find a correspondence in the second set
            var foundSecondSetColumn = null;
            for (var secondSetColumnIndex = 0; !foundSecondSetColumn && secondSetColumnIndex < secondTempSet.length; secondSetColumnIndex++) {
                foundSecondSetColumn = secondTempSet[secondSetColumnIndex];
                if (foundSecondSetColumn.fieldName === firstSetColumn.fieldName) {
                    secondTempSet.splice(secondSetColumnIndex, 1);
                } else {
                    foundSecondSetColumn = null;
                }
            }

            if (foundSecondSetColumn) {
                combinedSet.push(foundSecondSetColumn);
            } else if (addExtraItemsFirstSet) {
                combinedSet.push(firstSetColumn);
            }
        });

        // add the remaining items from the second set in the combined set
        if (addExtraItemsSecondSet) {
            angular.forEach(secondTempSet, function (secondSetColumn) {
                combinedSet.push(secondSetColumn);
            });
        }

        return combinedSet;
    };

    var wrapTemplatedCell = function (templateElement, tAttrs, isCustomized, cellTemplateDirective) {
        if (isCustomized) {
            var childrenElements = templateElement.children();
            var firstChildElement = angular.element(childrenElements[0]);
            if (childrenElements.length !== 1 || !firstChildElement.attr(cellTemplateDirective)) {
                // wrap the children of the custom template cell
                templateElement.empty();
                var templateWrapElement = angular.element("<div></div>").attr(cellTemplateDirective, "");
                templateElement.append(templateWrapElement);
                angular.forEach(childrenElements, function (childElement) {
                    templateWrapElement.append(angular.element(childElement));
                });
            }
        } else {
            templateElement.empty();
            templateElement.append(angular.element("<div></div>").attr(cellTemplateDirective, ""));
        }
    };

    var TemplatedCell = (function () {
        function TemplatedCell(parent, cellElement) {
            this.parent = parent;
            this.cellElement = cellElement;
            this.fieldName = cellElement.attr(fieldNameAttribute);
            this.isStandardColumn = cellElement.children().length === 0;
        }
        return TemplatedCell;
    })();

    var TemplatedSection = (function () {
        function TemplatedSection(sectionTagName, sectionDirectiveAttribute, rowDirectiveAttribute, cellTagName, cellDirectiveAttribute) {
            this.sectionTagName = sectionTagName;
            this.sectionDirectiveAttribute = sectionDirectiveAttribute;
            this.rowDirectiveAttribute = rowDirectiveAttribute;
            this.cellTagName = cellTagName;
            this.cellDirectiveAttribute = cellDirectiveAttribute;
            this.cellTagName = this.cellTagName.toUpperCase();
            this.cells = null;
        }
        TemplatedSection.prototype.configureSection = function (gridElement, columnDefs) {
            var _this = this;
            // remove the old section element
            //var sectionElement = this.getSectionElement(gridElement, false);
            //if (sectionElement) {
            //    sectionElement.remove();
            //}
            var sectionElement = this.getSectionElement(gridElement, true);
            sectionElement.empty();
            sectionElement.removeAttr("ng-non-bindable");

            // add the elements in order
            var rowElementDefinitions = combineGridCellInfos(columnDefs, this.cells, true, false);

            // grab the templated row
            var templatedRowElement = this.getTemplatedRowElement(sectionElement, true);

            angular.forEach(rowElementDefinitions, function (gridCell, index) {
                var gridCellElement;

                var templatedCell = gridCell;

                // it might not be a templated cell, beware
                if (templatedCell.parent === _this && templatedCell.cellElement) {
                    gridCellElement = templatedCell.cellElement.clone(true);
                } else {
                    gridCellElement = angular.element("<table><" + _this.cellTagName + "></" + _this.cellTagName + "></table>").find(_this.cellTagName);
                }

                // set it up
                if (_this.cellDirectiveAttribute) {
                    gridCellElement.attr(_this.cellDirectiveAttribute, index);
                }
                if (!gridCell.isStandardColumn) {
                    gridCellElement.attr(isCustomizedAttribute, "true");
                }

                if (gridCell.fieldName) {
                    gridCellElement.attr(fieldNameAttribute, gridCell.fieldName);
                }

                gridCellElement.attr("ng-style", "{\'width\':columnOptions.cellWidth,\'height\':columnOptions.cellHeight}");

                // finally add it to the parent
                templatedRowElement.append(gridCellElement);
            });
        };

        TemplatedSection.prototype.extractPartialColumnDefinitions = function () {
            return this.cells;
        };

        TemplatedSection.prototype.discoverCells = function (gridElement) {
            var _this = this;
            this.cells = [];

            var templatedRow = this.getTemplatedRowElement(this.getSectionElement(gridElement, false), false);
            if (templatedRow) {
                angular.forEach(templatedRow.children(), function (childElement, childIndex) {
                    childElement = angular.element(childElement);
                    if (childElement[0].tagName === _this.cellTagName.toUpperCase()) {
                        var templateElement = childElement.clone(true);
                        _this.cells.push(new TemplatedCell(_this, templateElement));
                    }
                });
            }
        };

        TemplatedSection.prototype.getSectionElement = function (gridElement, ensurePresent) {
            var sectionElement = null;
            if (gridElement) {
                sectionElement = findChildByTagName(gridElement, this.sectionTagName);
            }
            if (!sectionElement && ensurePresent) {
                // angular strikes again: https://groups.google.com/forum/#!topic/angular/7poFynsguNw
                sectionElement = angular.element("<table><" + this.sectionTagName + "></" + this.sectionTagName + "></table>").find(this.sectionTagName);
                if (gridElement) {
                    gridElement.append(sectionElement);
                }
            }

            if (ensurePresent && this.sectionDirectiveAttribute) {
                sectionElement.attr(this.sectionDirectiveAttribute, "");
            }
            return sectionElement;
        };

        TemplatedSection.prototype.getTemplatedRowElement = function (sectionElement, ensurePresent) {
            var rowElement = null;
            if (sectionElement) {
                rowElement = findChildByTagName(sectionElement, "tr");
            }
            if (!rowElement && ensurePresent) {
                rowElement = angular.element("<table><tr></tr></table>").find("tr");
                if (sectionElement) {
                    sectionElement.append(rowElement);
                }
            }

            if (ensurePresent && this.rowDirectiveAttribute) {
                rowElement.attr(this.rowDirectiveAttribute, "");
            }
            return rowElement;
        };
        return TemplatedSection;
    })();

    var GridController = (function () {
        function GridController($compile, $isolatedScope, $attrs, $parse, $timeout) {
            var _this = this;
            this.$compile = $compile;
            this.$isolatedScope = $isolatedScope;
            this.$parse = $parse;
            this.$timeout = $timeout;
            // initialise the options
            this.gridOptions = {
                items: [],
                fields: null,
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
            this.gridOptions.onDataRequired = $attrs["onDataRequired"] ? $isolatedScope["onDataRequired"] : null;
            this.gridOptions.gridColumnDefs = [];

            //internalScope[scopeOptionsIdentifier] = this.gridOptions;
            //link the outer scope with the internal one
            var externalScope = $isolatedScope.$parent;

            //this.gridScope = <IGridScope>externalScope.$new();
            this.$isolatedScope.gridOptions = this.gridOptions;
            this.linkScope(this.$isolatedScope, externalScope, "gridOptions", $attrs);

            //set up watchers for some of the special attributes we support
            if (this.gridOptions.onDataRequired) {
                this.$isolatedScope.$watchCollection("[gridOptions.filterBy, " + "gridOptions.filterByFields, " + "gridOptions.orderBy, " + "gridOptions.orderByReverse, " + "gridOptions.currentPage]", function () {
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
            this.$isolatedScope.$watch("gridOptions.enableMultiRowSelections", function (newValue, oldValue) {
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
            this.$isolatedScope.$watch("gridOptions.enableSelections", function (newValue, oldValue) {
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
            this.$isolatedScope.$watch("gridOptions.selectionMode", function (newValue, oldValue) {
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
            var originalOptions = this.gridOptions.gridColumnDefs[columnIndex];
            if (!originalOptions) {
                throw "Invalid grid column options found for column index " + columnIndex + ". Please report this error.";
            }

            // copy a couple of options onto the incoming set of options
            columnOptions = angular.extend(columnOptions, originalOptions);

            // replace the original options
            this.gridOptions.gridColumnDefs[columnIndex] = columnOptions;
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
            this.gridOptions.filterByFields = angular.extend({}, this.gridOptions.filterByFields);
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

        GridController.prototype.discoverTemplates = function (gridElement) {
            this.templatedHeader = new TemplatedSection("thead", null, null, "th", cellHeaderDirectiveAttribute);
            this.templatedBody = new TemplatedSection("tbody", bodyDirectiveAttribute, null, "td", cellBodyDirectiveAttribute);
            this.templatedFooter = new TemplatedSection("tfoot", null, null, "td", cellFooterDirectiveAttribute);

            this.templatedHeader.discoverCells(gridElement);
            this.templatedFooter.discoverCells(gridElement);
            this.templatedBody.discoverCells(gridElement);
        };

        GridController.prototype.configureTableStructure = function (parentScope, gridElement, bypassFieldWatcherRegistration) {
            var _this = this;
            var scope = parentScope.$new();
            gridElement.empty();

            // make sure we're no longer watching items for column defs
            if (this.columnDefsItemsWatcherDeregistration) {
                this.columnDefsItemsWatcherDeregistration();
                this.columnDefsItemsWatcherDeregistration = null;
            }

            // watch for a change in field values
            if (!bypassFieldWatcherRegistration) {
                // don't be tempted to use watchcollection, it always returns same values which can't be compared
                // https://github.com/angular/angular.js/issues/2621
                // which causes us the recompile even if we don't have to
                this.$isolatedScope.$watch("gridOptions.fields", function (newValue, oldValue) {
                    if (!angular.equals(newValue, oldValue)) {
                        scope.$destroy();
                        _this.configureTableStructure(parentScope, gridElement, true);
                    }
                }, true);
            }

            // prepare a partial list of column definitions
            var templatedHeaderPartialGridColumnDefs = this.templatedHeader.extractPartialColumnDefinitions();
            var templatedBodyPartialGridColumnDefs = this.templatedBody.extractPartialColumnDefinitions();
            var templatedFooterPartialGridColumnDefs = this.templatedFooter.extractPartialColumnDefinitions();

            var finalPartialGridColumnDefs = [];
            var fieldsEnforced = this.gridOptions.fields;
            if (fieldsEnforced) {
                // the fields bound to the options will take precedence
                angular.forEach(this.gridOptions.fields, function (fieldName) {
                    if (fieldName) {
                        finalPartialGridColumnDefs.push({
                            isStandardColumn: true,
                            fieldName: fieldName
                        });
                    }
                });

                finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedHeaderPartialGridColumnDefs, true, false);
                finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedBodyPartialGridColumnDefs, true, false);
            } else {
                // check for the header markup
                if (templatedHeaderPartialGridColumnDefs.length > 0) {
                    // header and body will be used for fishing out the field names
                    finalPartialGridColumnDefs = combineGridCellInfos(templatedHeaderPartialGridColumnDefs, templatedBodyPartialGridColumnDefs, true, true);
                } else {
                    // the object itself will provide the field names
                    if (!this.gridOptions.items || this.gridOptions.items.length == 0) {
                        // register our interest for when we do have something to look at
                        this.columnDefsItemsWatcherDeregistration = this.$isolatedScope.$watch("gridOptions.items.length", function (newValue, oldValue) {
                            if (newValue) {
                                scope.$destroy();
                                _this.configureTableStructure(parentScope, gridElement, true);
                            }
                        });
                        return;
                    }

                    for (var propName in this.gridOptions.items[0]) {
                        // exclude the library properties
                        if (!propName.match(/^[_\$]/g)) {
                            finalPartialGridColumnDefs.push({
                                isStandardColumn: true,
                                fieldName: propName
                            });
                        }
                    }

                    // combine with the body template
                    finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedBodyPartialGridColumnDefs, true, true);
                }
            }

            // it's time to make final tweaks to the instances and recompile
            if (templatedFooterPartialGridColumnDefs.length == 0) {
                templatedFooterPartialGridColumnDefs.push({ isStandardColumn: true });
            }
            this.gridOptions.gridColumnDefs = finalPartialGridColumnDefs;
            this.templatedHeader.configureSection(gridElement, finalPartialGridColumnDefs);
            this.templatedFooter.configureSection(gridElement, templatedFooterPartialGridColumnDefs);
            this.templatedBody.configureSection(gridElement, finalPartialGridColumnDefs);

            // transclusion with templates opens a big can of worms
            // it's best to prepare it here instead
            var bodyElement = this.templatedBody.getSectionElement(gridElement);
            var headerElement = this.templatedHeader.getSectionElement(gridElement);
            var footerElement = this.templatedFooter.getSectionElement(gridElement);
            var templatedBodyRowElement = this.templatedBody.getTemplatedRowElement(bodyElement);
            var templatedHeaderRowElement = this.templatedHeader.getTemplatedRowElement(headerElement);

            bodyElement.attr(bodyDirectiveAttribute, "");
            templatedBodyRowElement.attr("ng-click", "toggleItemSelection(gridItem, $event)");

            //TODO: when server-side get is active (scope.gridOptions.onDataRequired), the filtering through the standard filters should be disabled
            templatedBodyRowElement.attr("ng-repeat", "gridItem in gridOptions.items | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse | " + TrNgGrid.dataPagingFilter + ":gridOptions");
            templatedBodyRowElement.attr("ng-class", "{'" + TrNgGrid.rowSelectedCssClass + "':gridOptions.selectedItems.indexOf(gridItem)>=0}");

            //var gridScope = angular.element(gridElement).scope();
            this.$compile(headerElement)(scope);
            this.$compile(footerElement)(scope);
            this.$compile(bodyElement)(scope);
        };

        GridController.prototype.linkAttrs = function (tAttrs, localStorage) {
            var propSetter = function (propName, propValue) {
                if (typeof (propValue) === "undefined")
                    return;

                switch (propValue) {
                    case "true":
                        propValue = true;
                        break;
                    case "false":
                        propValue = false;
                        break;
                }
                localStorage[propName] = propValue;
            };

            for (var propName in localStorage) {
                propSetter(propName, tAttrs[propName]);

                // watch for changes
                (function (propName) {
                    tAttrs.$observe(propName, function (value) {
                        return propSetter(propName, value);
                    });
                })(propName);
            }
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
                                target[propName] = newValue;
                            });
                        }

                        var compiledAttrSetter = (compiledAttrGetter && compiledAttrGetter.assign) ? compiledAttrGetter.assign : null;
                        if (compiledAttrSetter) {
                            // a setter exists on the scope, make sure we watch our internals and copy them over
                            internalScope.$watch(scopeTargetIdentifier + "." + propName, function (newValue, oldValue) {
                                compiledAttrSetter(externalScope, newValue);
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
                    onDataRequiredDelay: '=?',
                    fields: '=?'
                },
                template: function (templateElement, tAttrs) {
                    templateElement.addClass(TrNgGrid.tableCssClass);

                    // at this stage, no elements can be bound
                    angular.forEach(templateElement.children(), function (childElement) {
                        childElement = angular.element(childElement);
                        childElement.attr("ng-non-bindable", "");
                    });
                },
                controller: ["$compile", "$scope", "$attrs", "$parse", "$timeout", GridController],
                compile: function (templateElement, tAttrs) {
                    return {
                        pre: function (isolatedScope, instanceElement, tAttrs, controller, transcludeFn) {
                            controller.discoverTemplates(instanceElement);
                        },
                        post: function (isolatedScope, instanceElement, tAttrs, controller, transcludeFn) {
                            var gridScope = instanceElement.scope();
                            controller.configureTableStructure(gridScope, instanceElement);
                        }
                    };
                }
            };
        }]).directive(cellHeaderDirective, [
        function () {
            var setupColumnTitle = function (scope) {
                if (scope.columnOptions.displayName) {
                    scope.columnTitle = scope.$eval(scope.columnOptions.displayName);
                } else {
                    if (!scope.columnOptions.fieldName) {
                        scope.columnTitle = "[Invalid Field Name]";
                        return;
                    } else {
                        scope.columnTitle = TrNgGrid.splitByCamelCasing(scope.columnOptions.fieldName);
                    }
                }
            };

            return {
                restrict: 'A',
                require: '^' + tableDirective,
                scope: true,
                compile: function (templateElement, tAttrs) {
                    var isCustomized = tAttrs['isCustomized'] == 'true';
                    wrapTemplatedCell(templateElement, tAttrs, isCustomized, cellHeaderTemplateDirectiveAttribute);

                    return {
                        // we receive a reference to a real element that will appear in the DOM, after the controller was created, but before binding setup
                        pre: function (scope, instanceElement, tAttrs, controller, $transclude) {
                            // we're not interested in creating an isolated scope just to parse the element attributes,
                            // so we're gonna have to do this manually
                            // create a clone of the default column options
                            var columnOptions = angular.extend({}, TrNgGrid.defaultColumnOptions);
                            columnOptions.fieldName = "unknown";

                            // now match and observe the attributes
                            controller.linkAttrs(tAttrs, columnOptions);

                            // set up the new scope
                            scope.TrNgGrid = TrNgGrid;
                            scope.gridOptions = controller.gridOptions;
                            scope.gridOptions.gridColumnDefs[parseInt(tAttrs[cellHeaderDirective])] = columnOptions;
                            scope.columnOptions = columnOptions;
                            scope.isCustomized = isCustomized;
                            scope.toggleSorting = function (propertyName) {
                                controller.toggleSorting(propertyName);
                            };

                            // set up the column title
                            setupColumnTitle(scope);

                            scope.$watch("columnOptions.filter", function (newValue, oldValue) {
                                if (newValue !== oldValue) {
                                    controller.setFilter(columnOptions.fieldName, newValue);
                                }
                            });
                        }
                    };
                }
            };
        }
    ]).directive(cellHeaderTemplateDirective, [
        function () {
            return {
                restrict: 'A',
                templateUrl: TrNgGrid.cellHeaderTemplateId,
                transclude: true,
                replace: true
            };
        }
    ]).directive(bodyDirective, [
        function () {
            return {
                restrict: 'A',
                require: '^' + tableDirective,
                scope: true,
                compile: function (templateElement, tAttrs) {
                    return {
                        pre: function (scope, compiledInstanceElement, tAttrs, controller) {
                            scope.TrNgGrid = TrNgGrid;
                            scope.gridOptions = controller.gridOptions;
                            scope.toggleItemSelection = function (item, $event) {
                                controller.toggleItemSelection(item, $event);
                            };
                        }
                    };
                }
            };
        }
    ]).directive(cellBodyDirective, [
        function () {
            var setupCellData = function (scope) {
                var cellContentsElementText = "gridItem." + scope.columnOptions.fieldName;
                if (scope.columnOptions.displayFormat) {
                    // add the display filter
                    if (scope.columnOptions.displayFormat[0] != '|' && scope.columnOptions.displayFormat[0] != '.') {
                        cellContentsElementText += " | "; // assume an angular filter by default
                    }
                    cellContentsElementText += scope.columnOptions.displayFormat;
                }

                //cellContentsElementText += "}}";
                scope.cellData = scope.$eval(cellContentsElementText);
            };

            return {
                restrict: 'A',
                require: '^' + tableDirective,
                scope: true,
                compile: function (templateElement, tAttrs) {
                    var isCustomized = tAttrs['isCustomized'] == 'true';
                    wrapTemplatedCell(templateElement, tAttrs, isCustomized, cellBodyTemplateDirectiveAttribute);

                    return {
                        pre: function (scope, instanceElement, tAttrs, controller, $transclude) {
                            scope.TrNgGrid = TrNgGrid;
                            scope.columnOptions = controller.gridOptions.gridColumnDefs[parseInt(tAttrs[cellBodyDirective])];
                            scope.isCustomized = isCustomized;
                            setupCellData(scope);
                        }
                    };
                }
            };
        }
    ]).directive(cellBodyTemplateDirective, [
        function () {
            return {
                restrict: 'A',
                templateUrl: TrNgGrid.cellBodyTemplateId,
                transclude: true,
                replace: true
            };
        }
    ]).directive(cellFooterDirective, [
        function () {
            return {
                restrict: 'A',
                require: '^' + tableDirective,
                scope: true,
                compile: function (templateElement, tAttrs) {
                    var isCustomized = tAttrs['isCustomized'] == 'true';
                    wrapTemplatedCell(templateElement, tAttrs, isCustomized, cellFooterTemplateDirectiveAttribute);

                    return {
                        pre: function (scope, instanceElement, tAttrs, controller, $transclude) {
                            scope.TrNgGrid = TrNgGrid;
                            scope.gridOptions = controller.gridOptions;
                            scope.isCustomized = isCustomized;
                            instanceElement.attr("colspan", controller.gridOptions.gridColumnDefs.length);
                        }
                    };
                }
            };
        }
    ]).directive(cellFooterTemplateDirective, [
        function () {
            return {
                restrict: 'A',
                templateUrl: TrNgGrid.cellFooterTemplateId,
                transclude: true,
                replace: true
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
    ]).directive(globalFilterDirective, [
        function () {
            return {
                restrict: 'A',
                scope: false,
                templateUrl: TrNgGrid.footerGlobalFilterTemplateId
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
                compile: function (templateElement, tAttrs) {
                    return {
                        pre: function (scope, compiledInstanceElement, tAttrs, controller) {
                            setupScope(scope, controller);
                        },
                        post: function (scope, instanceElement, tAttrs, controller) {
                            scope.$watchCollection("[gridOptions.currentPage, gridOptions.items.length, gridOptions.totalItems, gridOptions.pageItems]", function (newValues, oldValues) {
                                setupScope(scope, controller);
                            });
                        }
                    };
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
    }).run([
        "$templateCache",
        function ($templateCache) {
            // set up default templates
            $templateCache.put(TrNgGrid.cellHeaderTemplateId, '<div class="' + TrNgGrid.headerCellCssClass + '" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>' + '    <div class="' + TrNgGrid.columnTitleCssClass + '">' + '      {{columnTitle}}' + '       <div ' + TrNgGrid.columnSortDirectiveAttribute + '=""></div>' + '    </div>' + '    <div ' + TrNgGrid.columnFilterDirectiveAttribute + '=""></div>' + '  </div>' + '</div>');

            //$templateCache.put(TrNgGrid.cellHeaderCustomTemplateId,
            //    '<div class="' + TrNgGrid.headerCellCssClass + '">'
            //    + '<div ng-transclude=""></div>'
            //    + '</div>'
            //    );
            /*$templateCache.put(TrNgGrid.bodyTemplateId,
            '<tbody>'
            + ' <tr'
            + '  ng-repeat="gridItem in gridOptions.items"'// | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse | ' + dataPagingFilter + ':gridOptions"'
            + '  ng-click="toggleItemSelection(gridItem, $event)"'
            + '  ng-class="{\'' + TrNgGrid.rowSelectedCssClass + '\':gridOptions.selectedItems.indexOf(gridItem)>=0}">'
            + '</tr>'
            + '</tbody>'
            );*/
            $templateCache.put(TrNgGrid.cellBodyTemplateId, '<div ng-attr-class="' + TrNgGrid.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>{{cellData}}</div>' + '</div>');

            //$templateCache.put(TrNgGrid.cellBodyCustomTemplateId,
            //    '<div ng-attr-class="' + TrNgGrid.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}">'
            //    + '<div ng-transclude=""></div>'
            //    + '</div>'
            //    );
            $templateCache.put(TrNgGrid.columnFilterTemplateId, '<div ng-show="gridOptions.enableFiltering||columnOptions.enableFiltering" class="' + TrNgGrid.columnFilterCssClass + '">' + ' <div class="' + TrNgGrid.columnFilterInputWrapperCssClass + '">' + '   <input class="form-control input-sm" type="text" ng-model="columnOptions.filter"></input>' + ' </div>' + '</div>');
            $templateCache.put(TrNgGrid.columnSortTemplateId, '<div title="Sort"' + ' ng-show="gridOptions.enableSorting||columnOptions.enableSorting"' + ' ng-click="toggleSorting(columnOptions.fieldName)"' + ' class="' + TrNgGrid.columnSortCssClass + '" > ' + '  <div ng-class="{\'' + TrNgGrid.columnSortActiveCssClass + '\':gridOptions.orderBy==columnOptions.fieldName,\'' + TrNgGrid.columnSortInactiveCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName,\'' + TrNgGrid.columnSortNormalOrderCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName||!gridOptions.orderByReverse,\'' + TrNgGrid.columnSortReverseOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&gridOptions.orderByReverse}" >' + '  </div>' + '</div>');
            $templateCache.put(TrNgGrid.cellFooterTemplateId, '<div class="' + TrNgGrid.footerCssClass + '" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>' + '    <span ' + TrNgGrid.globalFilterDirectiveAttribute + '=""></span>' + '    <span ' + TrNgGrid.pagerDirectiveAttribute + '=""></span>' + '  </div>' + '</div>');
            $templateCache.put(TrNgGrid.footerGlobalFilterTemplateId, '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">' + '  <input class="form-control" type="text" ng-model="gridOptions.filterBy" placeholder="Search"></input>' + '</span>');
            $templateCache.put(TrNgGrid.footerPagerTemplateId, '<span class="pull-right form-group">' + ' <ul class="pagination">' + '   <li ng-show="pageCanGoBack" >' + '     <a href="" ng-click="navigateToPage($event, 0)" title="First Page">|&lArr;</a>' + '   </li>' + '   <li ng-show="pageCanGoBack" >' + '     <a href="" ng-click="navigateToPage($event, gridOptions.currentPage - 1)" title="Previous Page">&lArr;</a>' + '   </li>' + '   <li ng-show="pageSelectionActive" style="white-space: nowrap;">' + '     <span>Page: ' + '       <select ng-model="gridOptions.currentPage" ng-options="pageIndex as (pageIndex+1) for pageIndex in pageIndexes"></select>' + '     </span>' + '   </li>' + '   <li class="disabled" style="white-space: nowrap;">' + '     <span ng-hide="totalItemsCount">No items to display</span>' + '     <span ng-show="totalItemsCount" title="Select Page">' + '       {{startItemIndex+1}} - {{endItemIndex+1}} displayed' + '       <span>, {{totalItemsCount}} in total</span>' + '     </span > ' + '   </li>' + '   <li ng-show="pageCanGoForward">' + '     <a href="" ng-click="navigateToPage($event, gridOptions.currentPage + 1)" title="Next Page">&rArr;</a>' + '   </li>' + '   <li ng-show="pageCanGoForward">' + '     <a href="" ng-show="pageCanGoForward" ng-click="navigateToPage($event, lastPageIndex)" title="Last Page">&rArr;|</a>' + '   </li>' + ' </ul>' + '</span>');
        }
    ]);
})(TrNgGrid || (TrNgGrid = {}));
//# sourceMappingURL=trNgGrid.js.map
