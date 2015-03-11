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
    var IGridRow = (function () {
        function IGridRow() {
        }
        return IGridRow;
    })();
    TrNgGrid.IGridRow = IGridRow;
    var GridController = (function () {
        function GridController($compile, $parse, $timeout, gridConfiguration) {
            this.$compile = $compile;
            this.$parse = $parse;
            this.$timeout = $timeout;
            this.gridConfiguration = gridConfiguration;
            this.nonFieldNameTagIndex = 0;
            this.nonFieldNameFormat = "$$_trNgGridCustom_";
            this.gridColumns = {};
        }
        GridController.prototype.setGridOptions = function (gridOptions) {
            var _this = this;
            this.gridOptions = gridOptions;
            this.gridLayout = new TrNgGrid.GridLayout(this.gridConfiguration, this.gridOptions);
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
                this.gridOptions.$watch("currentPage", function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scheduleDataRetrieval();
                    }
                });
                this.gridOptions.$watchCollection("[" + "filterBy, " + "filterByFields, " + "orderBy, " + "orderByReverse, " + "pageItems, " + "]", function () {
                    if (_this.gridOptions.currentPage !== 0) {
                        _this.gridOptions.currentPage = 0;
                        return;
                    }
                    scheduleDataRetrieval();
                });
                this.gridOptions.$watch("immediateDataRetrieval", function (newValue) {
                    if (newValue && _this.dataRequestPromise) {
                        _this.$timeout.cancel(_this.dataRequestPromise);
                        retrieveDataCallback();
                    }
                });
            }
            this.gridOptions.$watch("selectionMode", function (newValue, oldValue) {
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
        GridController.prototype.setColumnOptions = function (columnOptions) {
            columnOptions.isLinkedToField = (!!columnOptions.fieldName) || (columnOptions.fieldName.indexOf(this.nonFieldNameFormat) < 0);
            if (!columnOptions.fieldName) {
                columnOptions.fieldName = this.nonFieldNameFormat + (this.nonFieldNameTagIndex++);
            }
            columnOptions.displayItemFieldName = columnOptions.fieldName.replace(/[^a-zA-Z]/g, "_");
            if (columnOptions.displayName) {
                columnOptions.columnTitle = columnOptions.displayName;
            }
            else if (columnOptions.isLinkedToField) {
                var rawTitle = columnOptions.fieldName.replace(/^([^\a-zA-Z]*)([\a-zA-Z]*)(.*)/g, "$2");
                var splitTitleName = rawTitle.split(/(?=[A-Z])/);
                if (splitTitleName.length && splitTitleName[0].length) {
                    splitTitleName[0] = splitTitleName[0][0].toLocaleUpperCase() + splitTitleName[0].substr(1);
                }
                columnOptions.columnTitle = splitTitleName.join(" ");
            }
            else {
                columnOptions.columnTitle = "";
            }
            this.gridColumns[columnOptions.fieldName] = columnOptions;
        };
        GridController.prototype.speedUpAsyncDataRetrieval = function ($event) {
            if (!$event || $event.keyCode == 13) {
                this.gridOptions.immediateDataRetrieval = true;
            }
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
                            for (firstItemIndex = 0; firstItemIndex < filteredItems.length && filteredItems[firstItemIndex].$$_gridItem !== lastSelectedItem; firstItemIndex++)
                                ;
                            if (firstItemIndex >= filteredItems.length) {
                                firstItemIndex = 0;
                            }
                            var lastItemIndex;
                            for (lastItemIndex = 0; lastItemIndex < filteredItems.length && filteredItems[lastItemIndex].$$_gridItem !== item; lastItemIndex++)
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
                                var currentItem = filteredItems[currentItemIndex].$$_gridItem;
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
                            controller.setGridOptions(isolatedScope);
                        }
                    };
                }
            };
        }
    ]);
})(TrNgGrid || (TrNgGrid = {}));
