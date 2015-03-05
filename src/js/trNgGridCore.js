var TrNgGrid;
(function (TrNgGrid) {
    var unnamedFieldNameCount = 0;
    (function (SelectionMode) {
        SelectionMode[SelectionMode["None"] = 0] = "None";
        SelectionMode[SelectionMode["SingleRow"] = 1] = "SingleRow";
        SelectionMode[SelectionMode["MultiRow"] = 2] = "MultiRow";
        SelectionMode[SelectionMode["MultiRowWithKeyModifiers"] = 3] = "MultiRowWithKeyModifiers";
    })(TrNgGrid.SelectionMode || (TrNgGrid.SelectionMode = {}));
    var SelectionMode = TrNgGrid.SelectionMode;
    (function (GridEntitySection) {
        GridEntitySection[GridEntitySection["Enforced"] = 0] = "Enforced";
        GridEntitySection[GridEntitySection["Header"] = 1] = "Header";
        GridEntitySection[GridEntitySection["Body"] = 2] = "Body";
    })(TrNgGrid.GridEntitySection || (TrNgGrid.GridEntitySection = {}));
    var GridEntitySection = TrNgGrid.GridEntitySection;
    var GridController = (function () {
        function GridController($compile, $parse, $timeout, gridConfiguration) {
            this.$compile = $compile;
            this.$parse = $parse;
            this.$timeout = $timeout;
            this.gridConfiguration = gridConfiguration;
            this.gridSections = new Array(2 /* Body */ + 1);
            this.gridColumns = {};
        }
        GridController.prototype.setOptions = function (gridOptions) {
            var _this = this;
            this.gridOptions = gridOptions;
            if (this.gridOptions.onDataRequired) {
                var retrieveDataCallback = function () {
                    _this.dataRequestPromise = null;
                    _this.gridOptions.immediateDataRetrieval = false;
                    _this.gridOptions.onDataRequired(_this.gridOptions);
                };
                var scheduleDataRetrieval = function () {
                    if (_this.dataRequestPromise) {
                        _this.$timeout.cancel(_this.dataRequestPromise);
                        _this.dataRequestPromise = null;
                    }
                    if (_this.gridOptions.immediateDataRetrieval) {
                        retrieveDataCallback();
                    }
                    else {
                        _this.dataRequestPromise = _this.$timeout(function () {
                            retrieveDataCallback();
                        }, _this.gridOptions.onDataRequiredDelay, true);
                    }
                };
                this.gridOptions.$watch("gridOptions.currentPage", function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scheduleDataRetrieval();
                    }
                });
                this.gridOptions.$watchCollection("[" + "gridOptions.filterBy, " + "gridOptions.filterByFields, " + "gridOptions.orderBy, " + "gridOptions.orderByReverse, " + "gridOptions.pageItems, " + "]", function () {
                    if (_this.gridOptions.currentPage !== 0) {
                        _this.gridOptions.currentPage = 0;
                        return;
                    }
                    scheduleDataRetrieval();
                });
                this.gridOptions.$watch("gridOptions.immediateDataRetrieval", function (newValue) {
                    if (newValue && _this.dataRequestPromise) {
                        _this.$timeout.cancel(_this.dataRequestPromise);
                        retrieveDataCallback();
                    }
                });
            }
            this.gridOptions.$watch("gridOptions.selectionMode", function (newValue, oldValue) {
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
        };
        GridController.prototype.speedUpAsyncDataRetrieval = function ($event) {
            if (!$event || $event.keyCode == 13) {
                this.gridOptions.immediateDataRetrieval = true;
            }
        };
        GridController.prototype.removeColumn = function (section, columnId) {
            if (!columnId.fieldName) {
                return;
            }
            var colSection = section < this.gridSections.length ? this.gridSections[section] : null;
            if (!colSection) {
                return;
            }
            var colSectionRow = columnId.rowIndex < colSection.rows.length ? colSection.rows[columnId.rowIndex] : null;
            if (!colSectionRow) {
                return;
            }
            var colSectionBatch = columnId.batchIndex < colSectionRow.columnBatches.length ? colSectionRow.columnBatches[columnId.batchIndex] : null;
            if (!colSectionBatch) {
                return;
            }
            for (var batchColIndex = 0; batchColIndex < colSectionBatch.columns.length; batchColIndex++) {
                if (colSectionBatch.columns[batchColIndex].identity.fieldName === columnId.fieldName) {
                    colSectionBatch.columns.splice(batchColIndex, 1);
                    return;
                }
            }
        };
        GridController.prototype.setColumn = function (section, columnId, newColumnOptions) {
            columnId.fieldName = columnId.fieldName || ("trNgGridCustomField_" + (unnamedFieldNameCount++));
            var colSection = this.gridSections[section];
            if (!colSection) {
                this.gridSections[section] = colSection = { rows: new Array() };
            }
            while (colSection.rows.length <= columnId.rowIndex) {
                colSection.rows.push({ columnBatches: new Array() });
            }
            var colSectionRow = colSection.rows[columnId.rowIndex];
            while (colSectionRow.columnBatches.length <= columnId.batchIndex) {
                colSectionRow.columnBatches.push({ columns: new Array() });
            }
            var colSectionBatch = colSectionRow.columnBatches[columnId.batchIndex];
            var gridColumnOptions = this.gridColumns[columnId.fieldName];
            if (gridColumnOptions) {
                if (newColumnOptions) {
                    this.gridColumns[columnId.fieldName] = gridColumnOptions = angular.extend(newColumnOptions, this.gridConfiguration.defaultColumnOptions);
                }
            }
            else {
                this.gridColumns[columnId.fieldName] = gridColumnOptions = angular.extend(newColumnOptions || {}, this.gridConfiguration.defaultColumnOptions);
            }
            var gridColumn = null;
            for (var batchColIndex = 0; (batchColIndex < colSectionBatch.columns.length) && (!gridColumn); batchColIndex++) {
                gridColumn = colSectionBatch.columns[batchColIndex];
                if (gridColumn.identity.fieldName !== columnId.fieldName) {
                    gridColumn = null;
                }
            }
            if (!gridColumn) {
                gridColumn = {
                    identity: columnId,
                    options: gridColumnOptions
                };
                colSectionBatch.columns.push(gridColumn);
            }
            else {
                gridColumn.options = gridColumnOptions;
            }
            return gridColumn;
        };
        GridController.prototype.toggleSorting = function (propertyName) {
            if (this.gridOptions.orderBy != propertyName) {
                this.gridOptions.orderBy = propertyName;
            }
            else {
                this.gridOptions.orderByReverse = !this.gridOptions.orderByReverse;
            }
            this.speedUpAsyncDataRetrieval();
        };
        GridController.prototype.getFormattedFieldName = function (fieldName) {
        };
        GridController.prototype.setFilter = function (fieldName, filter) {
        };
        GridController.prototype.toggleItemSelection = function (filteredItems, item, $event) {
            if (this.gridOptions.selectionMode === SelectionMode[0 /* None */])
                return;
            switch (this.gridOptions.selectionMode) {
                case SelectionMode[3 /* MultiRowWithKeyModifiers */]:
                    if (!$event.ctrlKey && !$event.shiftKey && !$event.metaKey) {
                        var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                        this.gridOptions.selectedItems.splice(0);
                        if (itemIndex < 0) {
                            this.gridOptions.selectedItems.push(item);
                        }
                    }
                    else {
                        if ($event.ctrlKey || $event.metaKey) {
                            var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                            if (itemIndex >= 0) {
                                this.gridOptions.selectedItems.splice(itemIndex, 1);
                            }
                            else {
                                this.gridOptions.selectedItems.push(item);
                            }
                        }
                        else if ($event.shiftKey) {
                            if (document.selection && document.selection.empty) {
                                document.selection.empty();
                            }
                            else if (window.getSelection) {
                                var sel = window.getSelection();
                                sel.removeAllRanges();
                            }
                            var firstItemIndex;
                            var lastSelectedItem = this.gridOptions.selectedItems[this.gridOptions.selectedItems.length - 1];
                            for (firstItemIndex = 0; firstItemIndex < filteredItems.length && filteredItems[firstItemIndex].trNgGridDataItem !== lastSelectedItem; firstItemIndex++)
                                ;
                            if (firstItemIndex >= filteredItems.length) {
                                firstItemIndex = 0;
                            }
                            var lastItemIndex;
                            for (lastItemIndex = 0; lastItemIndex < filteredItems.length && filteredItems[lastItemIndex].trNgGridDataItem !== item; lastItemIndex++)
                                ;
                            if (lastItemIndex >= filteredItems.length) {
                                throw "Invalid selection on a key modifier selection mode";
                            }
                            if (lastItemIndex < firstItemIndex) {
                                var tempIndex = firstItemIndex;
                                firstItemIndex = lastItemIndex;
                                lastItemIndex = tempIndex;
                            }
                            for (var currentItemIndex = firstItemIndex; currentItemIndex <= lastItemIndex; currentItemIndex++) {
                                var currentItem = filteredItems[currentItemIndex].trNgGridDataItem;
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
                    }
                    else {
                        this.gridOptions.selectedItems.push(item);
                    }
                    break;
            }
        };
        GridController.prototype.computeFormattedItems = function () {
        };
        GridController.prototype.computeFilteredItems = function () {
        };
        GridController.prototype.setupDisplayItemsArray = function () {
        };
        return GridController;
    })();
    TrNgGrid.GridController = GridController;
    TrNgGrid.gridModule = angular.module(TrNgGrid.Constants.tableDirective, []);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.tableDirective, [
        TrNgGrid.Constants.gridConfigurationService,
        function (gridConfiguration) {
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
                    selectionMode: '@',
                    locale: '@',
                    onDataRequired: '&',
                    onDataRequiredDelay: '=?',
                    fields: '=?'
                },
                controller: ["$compile", "$parse", "$timeout", TrNgGrid.Constants.gridConfigurationService, GridController],
                compile: function (templateElement, tAttrs) {
                    TrNgGrid.fixTableStructure(gridConfiguration, templateElement);
                    return {
                        pre: function (isolatedScope, instanceElement, tAttrs, controller, transcludeFn) {
                            controller.setOptions(isolatedScope);
                        }
                    };
                }
            };
        }
    ]);
})(TrNgGrid || (TrNgGrid = {}));
