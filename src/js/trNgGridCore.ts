module TrNgGrid {
    var unnamedFieldNameCount = 0;

    export enum SelectionMode {
        None,
        SingleRow,
        MultiRow,
        MultiRowWithKeyModifiers
    }

    export interface IGridOptions extends ng.IScope {
        immediateDataRetrieval: boolean;
        items: Array<any>;
        fields: Array<string>;
        locale: string;
        selectedItems: Array<any>;
        filterBy: string;
        filterByFields: Object;
        orderBy: string;
        orderByReverse: boolean;
        pageItems: number;
        currentPage: number;
        totalItems: number;
        enableFiltering: boolean;
        enableSorting: boolean;
        selectionMode: string;
        onDataRequired: (gridOptions: IGridOptions) => void;
        onDataRequiredDelay: number;
    }

    export interface IGridDisplayItem {
        $$_gridItem: any;
    }


    export interface IGridColumns {
        [field: string]: IGridColumnOptions;
    }

    /*
     * Holds details about a row inside a section of a grid.
     */
    export class IGridRow {
        columns: Array<IGridColumnOptions>;
    }

    export class GridController {
        public gridOptions: IGridOptions;
        public gridLayout: GridLayout;

        private columnDefsItemsWatcherDeregistration: Function;
        private columnDefsFieldsWatcherDeregistration: Function;
        private dataRequestPromise: ng.IPromise<any>;

        constructor(
            private $compile: ng.ICompileService,
            private $parse: ng.IParseService,
            private $timeout: ng.ITimeoutService,
            private gridConfiguration: IGridConfiguration) {

            this.gridLayout = new GridLayout();
        }

        setOptions(gridOptions: IGridOptions) {
            this.gridOptions = gridOptions;

            //set up watchers for some of the special attributes we support
            if (this.gridOptions.onDataRequired) {
                var retrieveDataCallback = () => {
                    this.dataRequestPromise = null;
                    this.gridOptions.immediateDataRetrieval = false;
                    this.gridOptions.onDataRequired(this.gridOptions);
                };

                var scheduleDataRetrieval = () => {
                    if (this.dataRequestPromise) {
                        this.$timeout.cancel(this.dataRequestPromise);
                        this.dataRequestPromise = null;
                    }

                    if (this.gridOptions.immediateDataRetrieval) {
                        retrieveDataCallback();
                    }
                    else {
                        this.dataRequestPromise = this.$timeout(() => {
                            retrieveDataCallback();
                        }, this.gridOptions.onDataRequiredDelay, true);
                    }
                };


                this.gridOptions.$watch("gridOptions.currentPage", (newValue: number, oldValue: number) => {
                    if (newValue !== oldValue) {
                        scheduleDataRetrieval();
                    }
                });

                this.gridOptions.$watchCollection("[" +
                    "gridOptions.filterBy, " +
                    "gridOptions.filterByFields, " +
                    "gridOptions.orderBy, " +
                    "gridOptions.orderByReverse, " +
                    "gridOptions.pageItems, " +
                    "]", () => {
                        // everything will reset the page index, with the exception of a page index change
                        if (this.gridOptions.currentPage !== 0) {
                            this.gridOptions.currentPage = 0;
                            // the page index watch will activate, exit for now to avoid duplicate data requests
                            return;
                        }

                        scheduleDataRetrieval();
                    });

                this.gridOptions.$watch("gridOptions.immediateDataRetrieval", (newValue: boolean) => {
                    if (newValue && this.dataRequestPromise) {
                        this.$timeout.cancel(this.dataRequestPromise);
                        retrieveDataCallback();
                    }
                });
            }

            this.gridOptions.$watch("gridOptions.selectionMode", (newValue: any, oldValue: SelectionMode) => {
                if (newValue !== oldValue) {
                    // when this value is changing we need to handle the selectedItems
                    switch (newValue) {
                        case SelectionMode[SelectionMode.None]:
                            this.gridOptions.selectedItems.splice(0);
                            break;
                        case SelectionMode[SelectionMode.SingleRow]:
                            if (this.gridOptions.selectedItems.length > 1) {
                                this.gridOptions.selectedItems.splice(1);
                            }
                            break;
                    }
                }
            });
        }

        speedUpAsyncDataRetrieval($event?: ng.IAngularEvent) {
            if (!$event || $event.keyCode == 13) {
                this.gridOptions.immediateDataRetrieval = true;
            }
        }

        toggleSorting(propertyName: string) {
            if (this.gridOptions.orderBy != propertyName) {
                // the column has changed
                this.gridOptions.orderBy = propertyName;
            }
            else {
                // the sort direction has changed
                this.gridOptions.orderByReverse = !this.gridOptions.orderByReverse;
            }

            this.speedUpAsyncDataRetrieval();
        }

        getFormattedFieldName(fieldName: string) {
        }

        setFilter(fieldName: string, filter: string) {
            //if (!filter) {
            //    delete (this.gridOptions.filterByFields[fieldName]);
            //}
            //else {
            //    this.gridOptions.filterByFields[fieldName] = filter;
            //}

            //// in order for someone to successfully listen to changes made to this object, we need to replace it
            //this.gridOptions.filterByFields = angular.extend({}, this.gridOptions.filterByFields);
        }

        toggleItemSelection(filteredItems: Array<IGridDisplayItem>, item: any, $event: ng.IAngularEvent) {
            if (this.gridOptions.selectionMode === SelectionMode[SelectionMode.None])
                return;

            switch (this.gridOptions.selectionMode) {
                case SelectionMode[SelectionMode.MultiRowWithKeyModifiers]:
                    if (!$event.ctrlKey && !$event.shiftKey && !$event.metaKey) {
                        // if neither key modifiers are pressed, clear the selection and start fresh
                        var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                        this.gridOptions.selectedItems.splice(0);
                        if (itemIndex < 0) {
                            this.gridOptions.selectedItems.push(item);
                        }
                    }
                    else {
                        if ($event.ctrlKey || $event.metaKey) {
                            // the ctrl key deselects or selects the item
                            var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                            if (itemIndex >= 0) {
                                this.gridOptions.selectedItems.splice(itemIndex, 1);
                            }
                            else {
                                this.gridOptions.selectedItems.push(item);
                            }
                        }
                        else if ($event.shiftKey) {
                            // clear undesired selections, if the styles are not applied
                            if (document.selection && document.selection.empty) {
                                document.selection.empty();
                            } else if (window.getSelection) {
                                var sel = window.getSelection();
                                sel.removeAllRanges();
                            }

                            // the shift key will always select items from the last selected item
                            var firstItemIndex: number;
                            var lastSelectedItem = this.gridOptions.selectedItems[this.gridOptions.selectedItems.length - 1];
                            for (firstItemIndex = 0; firstItemIndex < filteredItems.length && filteredItems[firstItemIndex].$$_gridItem !== lastSelectedItem; firstItemIndex++);
                            if (firstItemIndex >= filteredItems.length) {
                                firstItemIndex = 0;
                            }

                            var lastItemIndex: number;
                            for (lastItemIndex = 0; lastItemIndex < filteredItems.length && filteredItems[lastItemIndex].$$_gridItem !== item; lastItemIndex++);
                            if (lastItemIndex >= filteredItems.length) {
                                // this is an error
                                throw "Invalid selection on a key modifier selection mode";
                            }
                            if (lastItemIndex < firstItemIndex) {
                                var tempIndex = firstItemIndex;
                                firstItemIndex = lastItemIndex;
                                lastItemIndex = tempIndex;
                            }

                            // now select everything in between. remember that a shift modifier can never be used for de-selecting items
                            for (var currentItemIndex = firstItemIndex; currentItemIndex <= lastItemIndex; currentItemIndex++) {
                                var currentItem = filteredItems[currentItemIndex].$$_gridItem;
                                if (this.gridOptions.selectedItems.indexOf(currentItem) < 0) {
                                    this.gridOptions.selectedItems.push(currentItem);
                                }
                            }
                        }
                    }
                    break;
                case SelectionMode[SelectionMode.SingleRow]:
                    var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                    this.gridOptions.selectedItems.splice(0);
                    if (itemIndex < 0) {
                        this.gridOptions.selectedItems.push(item);
                    }
                    break;
                case SelectionMode[SelectionMode.MultiRow]:
                    var itemIndex = this.gridOptions.selectedItems.indexOf(item);
                    if (itemIndex >= 0) {
                        this.gridOptions.selectedItems.splice(itemIndex, 1);
                    }
                    else {
                        this.gridOptions.selectedItems.push(item);
                    }
                    break;
            }
        }

        computeFormattedItems() {
        //    var input = scope.gridOptions.items || <Array<any>>[];
        //    this.gridConfiguration.debugMode && log("formatting items of length " + input.length);
        //    var formattedItems: Array<IGridDisplayItem> = scope.formattedItems = (scope.formattedItems || <Array<IGridDisplayItem>>[]);
        //    if (scope.gridOptions.onDataRequired) {
        //        scope.filteredItems = formattedItems;
        //    }
        //    else {
        //        scope.requiresReFilteringTrigger = !scope.requiresReFilteringTrigger;
        //    }
        //    var gridColumnDefs = this.gridColumnOptions;

        //    for (var inputIndex = 0; inputIndex < input.length; inputIndex++) {
        //        var gridItem = input[inputIndex];
        //        var outputItem: IGridDisplayItem;
        //        // crate a temporary scope for holding a gridItem as we enumerate through the items
        //        var localEvalVars = { gridItem: gridItem };

        //        // check for removed items, try to keep the item instances intact
        //        while (formattedItems.length > input.length && (outputItem = formattedItems[inputIndex]).trNgGridDataItem !== gridItem) {
        //            formattedItems.splice(inputIndex, 1);
        //        }

        //        if (inputIndex < formattedItems.length) {
        //            outputItem = formattedItems[inputIndex];
        //            if (outputItem.trNgGridDataItem !== gridItem) {
        //                outputItem = { trNgGridDataItem: gridItem };
        //                formattedItems[inputIndex] = outputItem;
        //            }
        //        }
        //        else {
        //            outputItem = { trNgGridDataItem: gridItem };
        //            formattedItems.push(outputItem);
        //        }
        //        for (var fieldName in this.gridColumnOptions) {
        //            try {
        //            var gridColumnDef = this.gridColumnOptions[fieldName];
        //                if (fieldName) {
        //                    var displayFormat = gridColumnDef.displayFormat;
        //                    if (displayFormat) {
        //                        if (displayFormat[0] != "." && displayFormat[0] != "|") {
        //                            // angular filter
        //                            displayFormat = " | " + displayFormat;
        //                        }

        //                        // apply the format
        //                        outputItem[gridColumnDef.displayFieldName] = scope.$eval("gridItem." + fieldName + displayFormat, localEvalVars);
        //                    }
        //                    else {
        //                        outputItem[gridColumnDef.displayFieldName] = scope.$eval("gridItem." + fieldName, localEvalVars);
        //                    }
        //                }
        //            }
        //            catch (ex) {
        //                this.gridConfiguration.debugMode && log("Field evaluation failed for <" + fieldName + "> with error " + ex);
        //            }
        //        }
        //    }

        //    // remove any extra elements from the formatted list
        //    if (formattedItems.length > input.length) {
        //        formattedItems.splice(input.length, formattedItems.length - input.length);
        //    }
        }

        computeFilteredItems() {
            //scope.filterByDisplayFields = {};
            //if (scope.gridOptions.filterByFields) {
            //    for (var fieldName in scope.gridOptions.filterByFields) {
            //        scope.filterByDisplayFields[this.getFormattedFieldName(fieldName)] = scope.gridOptions.filterByFields[fieldName];
            //    }
            //}
            //this.gridConfiguration.debugMode && log("filtering items of length " + (scope.formattedItems ? scope.formattedItems.length : 0));
            //scope.filteredItems = scope.$eval("formattedItems | filter:gridOptions.filterBy | filter:filterByDisplayFields | " + sortFilter + ":gridOptions | " + dataPagingFilter + ":gridOptions");
            ////debugger;
        }

        setupDisplayItemsArray() {
            //var watchExpression = "[gridOptions.items,gridOptions.gridColumnDefs.length";
            ////TODO: this needs fixing
            //for (var fieldName in this.gridColumnOptions) {
            //    var gridColumnDef = this.gridColumnOptions[fieldName];
            //    if (gridColumnDef.displayFormat && gridColumnDef.displayFormat[0] != '.') {
            //        // watch the parameters
            //        var displayfilters = gridColumnDef.displayFormat.split('|');
            //        angular.forEach(displayfilters, (displayFilter: string) => {
            //            var displayFilterParams = displayFilter.split(':');
            //            if (displayFilterParams.length > 1) {
            //                angular.forEach(displayFilterParams.slice(1), (displayFilterParam: string) => {
            //                    displayFilterParam = displayFilterParam.trim();
            //                    if (displayFilterParam && displayFilterParam !== "gridItem" && displayFilterParam !== "gridDisplayItem") {
            //                        watchExpression += "," + displayFilterParam;
            //                    }
            //                });
            //            }
            //        });
            //    }                
            //}

            //watchExpression += "]";
            //this.gridConfiguration.debugMode && log("re-formatting is set to watch for changes in " + watchExpression);
            //scope.$watch(watchExpression, () => this.computeFormattedItems(scope), true);

            //if (!scope.gridOptions.onDataRequired) {
            //    watchExpression = "["
            //    + "requiresReFilteringTrigger, gridOptions.filterBy, gridOptions.filterByFields, gridOptions.orderBy, gridOptions.orderByReverse, gridOptions.currentPage, gridOptions.pageItems"
            //    + "]";
            //    scope.$watch(watchExpression, (newValue: Array<any>, oldValue: Array<any>) => {
            //        this.computeFilteredItems(scope);
            //    }, true);
            //}
        }
    }

    export var gridModule = angular.module(Constants.tableDirective, []);

    gridModule.directive(Constants.tableDirective, [
            Constants.gridConfigurationService,
            (gridConfiguration: IGridConfiguration) => {
                return {
                    restrict: 'A',

                    // only an isolated scope ensures two-way binding
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
                    controller: ["$compile", "$parse", "$timeout", Constants.gridConfigurationService, GridController],
                    compile: (templateElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes) => {
                        // fix & add a couple of elements & directives
                        fixTableStructure(gridConfiguration, templateElement);

                        return{
                            pre(isolatedScope: IGridOptions, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, controller: GridController, transcludeFn: ng.ITranscludeFunction) {
                                controller.setOptions(isolatedScope);
                            }
                        };
                    }
                };
            }
        ]);
}