/// <reference path="../external/typings/angularjs/angular.d.ts"/>
"use strict";
module TrNgGrid{
    export enum SelectionMode {
        None,
        SingleRow,
        MultiRow,
        MultiRowWithKeyModifiers
    }

    export declare var defaultColumnOptions: IBasicGridColumnOptions;
    export declare var translations: { [textId: string]: string };

    export declare var columnSortDirectiveAttribute: string;
    export declare var columnFilterDirectiveAttribute: string;
    export declare var globalFilterDirectiveAttribute: string;
    export declare var pagerDirectiveAttribute: string;

    export declare var dataPagingFilter: string;
    export declare var translateFilter: string;

    export declare var tableCssClass: string;
    export declare var cellCssClass: string;
    export declare var headerCellCssClass: string;
    export declare var bodyCellCssClass: string;
    export declare var columnTitleCssClass: string;
    export declare var columnSortCssClass: string;
    export declare var columnFilterCssClass: string;
    export declare var columnFilterInputWrapperCssClass: string;
    export declare var columnSortActiveCssClass: string;
    export declare var columnSortInactiveCssClass: string; 
    export declare var columnSortReverseOrderCssClass: string;
    export declare var columnSortNormalOrderCssClass: string;
    export declare var rowSelectedCssClass: string; 
    export declare var footerCssClass: string;

    export declare var cellHeaderTemplateId:string;
    export declare var cellBodyTemplateId: string;
    export declare var columnFilterTemplateId: string;
    export declare var columnSortTemplateId:string;
    export declare var cellFooterTemplateId: string;
    export declare var footerPagerTemplateId: string;
    export declare var footerGlobalFilterTemplateId: string;

    export declare var splitByCamelCasing: (input: string) => string;

    // it's important to assign all the default column options, so we can match them with the column attributes in the markup
    defaultColumnOptions = {
        cellWidth: null,
        cellHeight: null,
        displayAlign: null,
        displayFormat: null,
        displayName: null,
        filter: null,
        enableFiltering: null,
        enableSorting:null
    };

    translations = {};

    var tableDirective = "trNgGrid";
    dataPagingFilter = tableDirective + "DataPagingFilter";
    translateFilter = tableDirective + "Translate";

    //var headerDirective="trNgGridHeader";
    //var headerDirectiveAttribute = "tr-ng-grid-header";

    var bodyDirective="trNgGridBody";
    var bodyDirectiveAttribute = "tr-ng-grid-body";

    var fieldNameAttribute = "field-name";
    var isCustomizedAttribute = "is-customized";

    var cellFooterDirective="trNgGridFooterCell";
    var cellFooterDirectiveAttribute = "tr-ng-grid-footer-cell";
    var cellFooterTemplateDirective = "trNgGridFooterCellTemplate";
    var cellFooterTemplateDirectiveAttribute = "tr-ng-grid-footer-cell-template";
    cellFooterTemplateId = cellFooterTemplateDirective + ".html";

    var globalFilterDirective="trNgGridGlobalFilter";
    globalFilterDirectiveAttribute = "tr-ng-grid-global-filter";
    footerGlobalFilterTemplateId = globalFilterDirective + ".html";

    var pagerDirective="trNgGridPager";
    pagerDirectiveAttribute = "tr-ng-grid-pager";
    footerPagerTemplateId = pagerDirective + ".html";

    var cellHeaderDirective="trNgGridHeaderCell";
    var cellHeaderDirectiveAttribute = "tr-ng-grid-header-cell";
    var cellHeaderTemplateDirective = "trNgGridHeaderCellTemplate";
    var cellHeaderTemplateDirectiveAttribute = "tr-ng-grid-header-cell-template";
    cellHeaderTemplateId = cellHeaderTemplateDirective + ".html";

    var cellBodyDirective = "trNgGridBodyCell";
    var cellBodyDirectiveAttribute = "tr-ng-grid-body-cell";
    var cellBodyTemplateDirective = "trNgGridBodyCellTemplate";
    var cellBodyTemplateDirectiveAttribute = "tr-ng-grid-body-cell-template";
    cellBodyTemplateId = cellBodyTemplateDirective + ".html";

    var columnSortDirective="trNgGridColumnSort";
    columnSortDirectiveAttribute="tr-ng-grid-column-sort";
    columnSortTemplateId = columnSortDirective + ".html";

    var columnFilterDirective="trNgGridColumnFilter";
    columnFilterDirectiveAttribute = "tr-ng-grid-column-filter";
    columnFilterTemplateId = columnFilterDirective+".html";

    //var rowPageItemIndexAttribute="tr-ng-grid-row-page-item-index";

    tableCssClass="tr-ng-grid table table-bordered table-hover"; // at the time of coding, table-striped is not working properly with selection
    cellCssClass = "tr-ng-cell";
    headerCellCssClass = "tr-ng-column-header " + cellCssClass;
    bodyCellCssClass = cellCssClass;
    columnTitleCssClass="tr-ng-title"; 
    columnSortCssClass="tr-ng-sort";
    columnFilterCssClass="tr-ng-column-filter";
    columnFilterInputWrapperCssClass ="";
    columnSortActiveCssClass ="tr-ng-sort-active text-info";
    columnSortInactiveCssClass ="tr-ng-sort-inactive text-muted";
    columnSortReverseOrderCssClass ="tr-ng-sort-order-reverse glyphicon glyphicon-chevron-up";
    columnSortNormalOrderCssClass = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-down";
    rowSelectedCssClass="active";
    footerCssClass="tr-ng-grid-footer form-inline";

    export interface IGridColumn {
        isStandardColumn: boolean;
        fieldName?: string;
    }

    export interface IBasicGridColumnOptions {
        displayName?: string;
        displayAlign?: string;
        displayFormat?: string;
        enableSorting?: boolean;
        enableFiltering?: boolean;
        cellWidth?: string;
        cellHeight?: string;
        filter?: string;
    }

    export interface IGridColumnOptions extends IGridColumn, IBasicGridColumnOptions{
    }

    interface IGridOptions{
        items: Array<any>;
        fields: Array<string>;
        selectedItems:Array<any>;
        filterBy:string;
        filterByFields:Object;
        orderBy:string;
        orderByReverse:boolean;
        pageItems:number;
        currentPage:number;
        totalItems:number;
        enableFiltering:boolean;
        enableSorting:boolean;
        enableSelections:boolean;
        enableMultiRowSelections: boolean;
        selectionMode: string;
        onDataRequired:(gridOptions:IGridOptions)=>void;
        onDataRequiredDelay:number;
        gridColumnDefs: Array<IGridColumnOptions>;
    }

    interface IGridScope extends ng.IScope{
        TrNgGrid: any; // useful for binding to static vars on the TrNgGrid type
        gridOptions: IGridOptions;
    }

    interface IGridFooterScope extends IGridScope {
        isCustomized?: boolean;
    }

    interface IGridColumnScope extends IGridScope{
        columnOptions: IGridColumnOptions;
        isCustomized?: boolean;
    }

    interface IGridHeaderColumnScope extends IGridColumnScope {
        columnTitle: string;
        toggleSorting: (propertyName: string) => void;
    }

    interface IGridBodyScope extends IGridScope {
        toggleItemSelection: (item: any, $event: ng.IAngularEvent) => void;
    }

    interface IGridBodyColumnScope extends IGridColumnScope{
        isCustomized?: boolean;
        columnDefinitionIndex: number;
        cellData: any;
    }

    interface IGridFooterScope extends IGridScope{
        isPaged:boolean;
        totalItemsCount:number;
        startItemIndex: number;
        lastPageIndex: number;
        pageIndexes: Array<number>;
        endItemIndex:number;
        pageCanGoBack:boolean;
        pageCanGoForward: boolean;
        pageSelectionActive: boolean;
        switchPageSelection: ($event: ng.IAngularEvent, pageSelectionActive: boolean) => void;
        navigateToPage:($event:ng.IAngularEvent, pageIndex:number)=>void;
    }

    splitByCamelCasing = (input) => {
        var splitInput = input.split(/(?=[A-Z])/);
        if (splitInput.length && splitInput[0].length) {
            splitInput[0] = splitInput[0][0].toLocaleUpperCase() + splitInput[0].substr(1);
        }

        return splitInput.join(" ");
    };

    var findChildByTagName = (parent: JQuery, childTag: string): JQuery=> {
        childTag = childTag.toUpperCase();
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName == childTag) {
                return angular.element(childElement);
            }
        }

        return null;
    }

    var findChildrenByTagName = (parent: JQuery, childTag: string): Array<JQuery> => {
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
    var combineGridCellInfos = <T extends IGridColumn>(
        firstSet: Array<T>,
        secondSet: Array<T>,
        addExtraItemsFirstSet?:boolean,
        addExtraItemsSecondSet?: boolean): Array<T> => {

        var combinedSet: Array<T> = [];
        var secondTempSet = secondSet.slice(0);
        angular.forEach(firstSet, (firstSetColumn:T) => {
            // find a correspondence in the second set
            var foundSecondSetColumn: T = null;
            for (var secondSetColumnIndex = 0; !foundSecondSetColumn && secondSetColumnIndex < secondTempSet.length; secondSetColumnIndex++) {
                foundSecondSetColumn = secondTempSet[secondSetColumnIndex];
                if (foundSecondSetColumn.fieldName === firstSetColumn.fieldName) {
                    secondTempSet.splice(secondSetColumnIndex, 1);
                }
                else {
                    foundSecondSetColumn = null;
                }
            }

            if (foundSecondSetColumn) {
                combinedSet.push(foundSecondSetColumn);
            }
            else if(addExtraItemsFirstSet){
                combinedSet.push(firstSetColumn);
            }
        });

        // add the remaining items from the second set in the combined set
        if (addExtraItemsSecondSet) {
            angular.forEach(secondTempSet, (secondSetColumn: T) => {
                combinedSet.push(secondSetColumn);
            });
        }

        return combinedSet;
    };

    var wrapTemplatedCell = (templateElement: JQuery, tAttrs: Object, isCustomized: boolean, cellTemplateDirective:string) => {
        if (isCustomized) {
            var childrenElements = templateElement.children();
            var firstChildElement = angular.element(childrenElements[0]);
            if (childrenElements.length !== 1 || !firstChildElement.attr(cellTemplateDirective)) {
                // wrap the children of the custom template cell
                templateElement.empty();
                var templateWrapElement = angular.element("<div></div>").attr(cellTemplateDirective, "");
                templateElement.append(templateWrapElement);
                angular.forEach(childrenElements, (childElement: JQuery) => {
                    templateWrapElement.append(angular.element(childElement));
                });
            }
        }
        else {
            templateElement.empty();
            templateElement.append(angular.element("<div></div>").attr(cellTemplateDirective, ""));
        }
    }


    class TemplatedCell implements IGridColumn {
        public fieldName: string;
        public isStandardColumn: boolean;

        constructor(public parent:TemplatedSection, public cellElement: JQuery) {
            this.fieldName = cellElement.attr(fieldNameAttribute);
            this.isStandardColumn = cellElement.children().length === 0;
        }
    }

    class TemplatedSection {
        public cells: Array<TemplatedCell>;

        constructor(
            private sectionTagName: string,
            private sectionDirectiveAttribute: string,
            private rowDirectiveAttribute: string,
            private cellTagName:string,
            private cellDirectiveAttribute:string){
            this.cellTagName = this.cellTagName.toUpperCase();
            this.cells = null;
        }

        public configureSection(gridElement: JQuery, columnDefs: Array<IGridColumnOptions>):JQuery {
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

            angular.forEach(rowElementDefinitions, (gridCell: IGridColumn, index: number) => {
                var gridCellElement: JQuery;

                var templatedCell = <TemplatedCell>gridCell;

                // it might not be a templated cell, beware
                if (templatedCell.parent === this && templatedCell.cellElement) {
                    gridCellElement = templatedCell.cellElement.clone(true);
                }
                else {
                    gridCellElement = angular.element("<table><" + this.cellTagName + "></"+this.cellTagName+"></table>").find(this.cellTagName);
                }

                // set it up
                if (this.cellDirectiveAttribute) {
                    gridCellElement.attr(this.cellDirectiveAttribute, index);
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

            return sectionElement;
        }

        public extractPartialColumnDefinitions(): Array<IGridColumn> {
            return this.cells;
        }

        public discoverCells(gridElement: JQuery) {
            this.cells = [];

            var templatedRow = this.getTemplatedRowElement(this.getSectionElement(gridElement, false), false);
            if (templatedRow) {
                angular.forEach(templatedRow.children(), (childElement: JQuery, childIndex: number) => {
                    childElement = angular.element(childElement);
                    if (childElement[0].tagName === this.cellTagName.toUpperCase()) {
                        var templateElement = childElement.clone(true);
                        this.cells.push(new TemplatedCell(this, templateElement));
                    }
                });
            }
        }

        public getSectionElement(gridElement?: JQuery, ensurePresent?: boolean): JQuery {
            var sectionElement: JQuery = null;
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
        }

        public getTemplatedRowElement(sectionElement?:JQuery, ensurePresent?: boolean): JQuery {
            var rowElement: JQuery = null;
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
        }
    }

    class GridController{
        //private gridScope: IGridScope;
        public gridOptions: IGridOptions;
        private templatedHeader: TemplatedSection;
        private templatedBody: TemplatedSection;
        private templatedFooter: TemplatedSection;
        //private gridElement:ng.IAugmentedJQuery;
        private columnDefsItemsWatcherDeregistration:Function;
        private columnDefsFieldsWatcherDeregistration: Function;
        private dataRequestPromise: ng.IPromise<any>;

        constructor(
            private $compile:ng.ICompileService,
            private $isolatedScope:IGridScope,            
            $attrs:ng.IAttributes,
            private $parse:ng.IParseService,
            private $timeout: ng.ITimeoutService) {

            // initialise the options
            this.gridOptions = <IGridOptions>{
                items: [],
                fields: null,
                selectedItems:[],
                filterBy:null,
                filterByFields:{},
                orderBy:null,
                orderByReverse:false,
                pageItems:null,
                currentPage:0,
                totalItems:null,
                enableFiltering:true,
                enableSorting:true,
                enableSelections:true, //deprecated
                enableMultiRowSelections: true, // deprecated
                selectionMode:SelectionMode[SelectionMode.MultiRow],
                onDataRequiredDelay:1000
            };
            this.gridOptions.onDataRequired = $attrs["onDataRequired"]?$isolatedScope["onDataRequired"]:null;
            this.gridOptions.gridColumnDefs = [];
            //internalScope[scopeOptionsIdentifier] = this.gridOptions;


            //link the outer scope with the internal one
            var externalScope = $isolatedScope.$parent;
            //this.gridScope = <IGridScope>externalScope.$new();
            this.$isolatedScope.gridOptions = this.gridOptions;
            this.linkScope(this.$isolatedScope, externalScope, "gridOptions", $attrs);

            //set up watchers for some of the special attributes we support

            if(this.gridOptions.onDataRequired){
                this.$isolatedScope.$watchCollection("[gridOptions.filterBy, " +
                    "gridOptions.filterByFields, " +
                    "gridOptions.orderBy, " +
                    "gridOptions.orderByReverse, " +
                    "gridOptions.currentPage]",()=>{

                    if(this.dataRequestPromise){
                        this.$timeout.cancel(this.dataRequestPromise);
                        this.dataRequestPromise = null;
                    }

                    // for the time being, Angular is not able to bind only when losing focus, so we'll introduce a delay
                    this.dataRequestPromise = this.$timeout(()=>{
                        this.dataRequestPromise = null;
                        this.gridOptions.onDataRequired(this.gridOptions);
                    },this.gridOptions.onDataRequiredDelay, true);
                });
            }

            // TODO: remove in the future as these settings are deprecated
            this.$isolatedScope.$watch("gridOptions.enableMultiRowSelections", (newValue: boolean, oldValue: boolean) => {
                if (newValue !== oldValue) {
                    // in case the user is not using the selectionMode, we assume he's not aware of it
                    if (newValue) {
                        this.gridOptions.selectionMode = SelectionMode[SelectionMode.MultiRow];
                        this.gridOptions.enableSelections = true;
                    }
                    else if (this.gridOptions.enableSelections){
                        this.gridOptions.selectionMode = SelectionMode[SelectionMode.SingleRow];
                    }
                }
            });

            // TODO: remove in the future as these settings are deprecated
            this.$isolatedScope.$watch("gridOptions.enableSelections", (newValue: boolean, oldValue: boolean) => {
                if(newValue!==oldValue){
                    // in case the user is not using the selectionMode, we assume he's not aware of it
                    if (newValue) {
                        if (this.gridOptions.selectionMode === SelectionMode[SelectionMode.None]) {
                            this.gridOptions.selectionMode = SelectionMode[SelectionMode.SingleRow];
                        }
                    }
                    else {
                        this.gridOptions.enableMultiRowSelections = false;
                        this.gridOptions.selectionMode = SelectionMode[SelectionMode.None];
                    }
                }
            });

            // the new settings
            this.$isolatedScope.$watch("gridOptions.selectionMode", (newValue: any, oldValue: SelectionMode) => {
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

        setColumnOptions(columnIndex: number, columnOptions: IGridColumnOptions): void {
            var originalOptions = this.gridOptions.gridColumnDefs[columnIndex];
            if (!originalOptions) {
                throw "Invalid grid column options found for column index " + columnIndex + ". Please report this error."
            }

            // copy a couple of options onto the incoming set of options
            columnOptions = angular.extend(columnOptions, originalOptions);

            // replace the original options 
            this.gridOptions.gridColumnDefs[columnIndex] = columnOptions;            
        }

        toggleSorting(propertyName: string) {
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

            // in order for someone to successfully listen to changes made to this object, we need to replace it
            this.gridOptions.filterByFields = angular.extend({}, this.gridOptions.filterByFields);
        }

        toggleItemSelection(item: any, $event: ng.IAngularEvent) {
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
                            var firstItemIndex = -1;
                            if (this.gridOptions.selectedItems.length > 0) {
                                firstItemIndex = this.gridOptions.items.indexOf(this.gridOptions.selectedItems[this.gridOptions.selectedItems.length - 1]);
                            }
                            if (firstItemIndex < 0) {
                                firstItemIndex = 0;
                            }
                            var lastItemIndex = this.gridOptions.items.indexOf(item);
                            if (lastItemIndex < 0) {
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
                                var currentItem = this.gridOptions.items[currentItemIndex];
                                if(this.gridOptions.selectedItems.indexOf(currentItem) < 0){
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

        discoverTemplates(gridElement: JQuery) {
            this.templatedHeader = new TemplatedSection("thead", null, null, "th", cellHeaderDirectiveAttribute);
            this.templatedBody = new TemplatedSection("tbody", bodyDirectiveAttribute, null, "td", cellBodyDirectiveAttribute);
            this.templatedFooter = new TemplatedSection("tfoot", null, null, "td", cellFooterDirectiveAttribute);

            this.templatedHeader.discoverCells(gridElement);
            this.templatedFooter.discoverCells(gridElement);
            this.templatedBody.discoverCells(gridElement);
        }

        configureTableStructure(parentScope: ng.IScope, gridElement: ng.IAugmentedJQuery) {
            var scope = parentScope.$new();  
            gridElement.empty();

            // make sure we're no longer watching for column defs
            if (this.columnDefsItemsWatcherDeregistration) {
                this.columnDefsItemsWatcherDeregistration();
                this.columnDefsItemsWatcherDeregistration = null;
            }
            if (this.columnDefsFieldsWatcherDeregistration) {
                this.columnDefsFieldsWatcherDeregistration();
                this.columnDefsFieldsWatcherDeregistration = null;
            }

            // watch for a change in field values
            // don't be tempted to use watchcollection, it always returns same values which can't be compared
            // https://github.com/angular/angular.js/issues/2621
            // which causes us the recompile even if we don't have to
            this.columnDefsFieldsWatcherDeregistration = this.$isolatedScope.$watch("gridOptions.fields", (newValue: Array<any>, oldValue: Array<any>) => {
                if (!angular.equals(newValue, oldValue)) {
                    scope.$destroy();
                    this.configureTableStructure(parentScope, gridElement);
                }
            }, true);

            // prepare a partial list of column definitions
            var templatedHeaderPartialGridColumnDefs = this.templatedHeader.extractPartialColumnDefinitions();
            var templatedBodyPartialGridColumnDefs = this.templatedBody.extractPartialColumnDefinitions();
            var templatedFooterPartialGridColumnDefs = this.templatedFooter.extractPartialColumnDefinitions();

            var finalPartialGridColumnDefs: Array<IGridColumnOptions> = [];
            var fieldsEnforced = this.gridOptions.fields;
            if (fieldsEnforced) {
                // the fields bound to the options will take precedence
                angular.forEach(this.gridOptions.fields, (fieldName: string) => {
                    if (fieldName) {
                        finalPartialGridColumnDefs.push({
                            isStandardColumn: true,
                            fieldName: fieldName
                        });
                    }
                });

                finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedHeaderPartialGridColumnDefs, true, false);
                finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedBodyPartialGridColumnDefs, true, false);
            }
            else {
                // check for the header markup
                if (templatedHeaderPartialGridColumnDefs.length > 0) {
                    // header and body will be used for fishing out the field names
                    finalPartialGridColumnDefs = combineGridCellInfos(templatedHeaderPartialGridColumnDefs, templatedBodyPartialGridColumnDefs, true, true);
                }
                else {
                    // the object itself will provide the field names
                    if (!this.gridOptions.items || this.gridOptions.items.length == 0) {
                        // register our interest for when we do have something to look at
                        this.columnDefsItemsWatcherDeregistration = this.$isolatedScope.$watch("gridOptions.items.length", (newValue: number, oldValue: number) => {
                            if (newValue) {
                                scope.$destroy();
                                this.configureTableStructure(parentScope, gridElement);
                            }
                        });
                        return;
                    }

                    // extract the field names
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
            var headerElement = this.templatedHeader.configureSection(gridElement, finalPartialGridColumnDefs);
            var footerElement = this.templatedFooter.configureSection(gridElement, templatedFooterPartialGridColumnDefs);
            var bodyElement = this.templatedBody.configureSection(gridElement, finalPartialGridColumnDefs);             
            
            var templatedBodyRowElement = this.templatedBody.getTemplatedRowElement(bodyElement);
            var templatedHeaderRowElement = this.templatedHeader.getTemplatedRowElement(headerElement);

            bodyElement.attr(bodyDirectiveAttribute, "");
            templatedBodyRowElement.attr("ng-click", "toggleItemSelection(gridItem, $event)");
            // when server-side get is active (scope.gridOptions.onDataRequired), the filtering through the standard filters should be disabled
            if (this.gridOptions.onDataRequired) {
                templatedBodyRowElement.attr("ng-repeat", "gridItem in gridOptions.items");
            }
            else {
                templatedBodyRowElement.attr("ng-repeat", "gridItem in gridOptions.items | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse | " + dataPagingFilter + ":gridOptions");
            }
            templatedBodyRowElement.attr("ng-class", "{'" + TrNgGrid.rowSelectedCssClass + "':gridOptions.selectedItems.indexOf(gridItem)>=0}");

            headerElement.replaceWith(this.$compile(headerElement)(scope)); 
            footerElement.replaceWith(this.$compile(footerElement)(scope));
            bodyElement.replaceWith(this.$compile(bodyElement)(scope));
        }

        linkAttrs(tAttrs: ng.IAttributes, localStorage: any) {
            var propSetter = (propName: string, propValue: any) => {                
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
            }

            for (var propName in localStorage) {
                propSetter(propName, tAttrs[propName]);

                // watch for changes
                ((propName: string) => {
                    tAttrs.$observe(propName, (value: any) => propSetter(propName, value));
                })(propName);
            }
        }

        linkScope(internalScope:ng.IScope, externalScope:ng.IScope, scopeTargetIdentifier:string, attrs:ng.IAttributes){
            // this method shouldn't even be here
            // but it is because we want to allow people to either set attributes with either a constant or a watchable variable

            // watch for a resolution to issue #5951 on angular
            // https://github.com/angular/angular.js/issues/5951

            var target = internalScope[scopeTargetIdentifier];

            for(var propName in target){
                var attributeExists = typeof (attrs[propName]) != "undefined" && attrs[propName] != null;

                if(attributeExists){
                    var isArray = false;

                    // initialise from the scope first
                    if (typeof (internalScope[propName]) != "undefined" && internalScope[propName]!=null){
                        target[propName] = internalScope[propName];
                        isArray=target[propName] instanceof Array;
                    }

                    //allow arrays to be changed: if(!isArray){
                    var compiledAttrGetter: ng.ICompiledExpression = null;
                    try {
                        compiledAttrGetter = this.$parse(attrs[propName]);
                    }
                    catch(ex)
                    {
                        // angular fails to parse literal bindings '@', thanks angular team
                    }
                    ((propName: string, compiledAttrGetter: ng.ICompiledExpression) => {
                        if (!compiledAttrGetter || !compiledAttrGetter.constant) {
                            // watch for a change in value and set it on our internal scope
                            internalScope.$watch(propName, (newValue: any, oldValue: any) => {
                                target[propName] = newValue;
                            });
                        }

                        var compiledAttrSetter:(context: any, value: any)=> any = (compiledAttrGetter && compiledAttrGetter.assign) ? compiledAttrGetter.assign : null;
                        if (compiledAttrSetter) {
                            // a setter exists on the scope, make sure we watch our internals and copy them over
                            internalScope.$watch(scopeTargetIdentifier + "." + propName, (newValue: any, oldValue: any) => {
                                compiledAttrSetter(externalScope, newValue);
                            });
                        }
                    })(propName,compiledAttrGetter);
                }
            }
        }
    }

    angular.module("trNgGrid", [])
        .directive(tableDirective, [
            () => {
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
                        enableSelections: '=?', // deprecated
                        enableMultiRowSelections: '=?', // deprecated
                        selectionMode: '@',
                        onDataRequired: '&',
                        onDataRequiredDelay: '=?',
                        fields: '=?'
                    },
                    template: (templateElement: JQuery, tAttrs: Object) => {
                        templateElement.addClass(tableCssClass);

                        // at this stage, no elements can be bound
                        angular.forEach(templateElement.children(), (childElement: JQuery) => {
                            childElement = angular.element(childElement);
                            childElement.attr("ng-non-bindable", "");
                        });
                    },
                    controller: ["$compile", "$scope", "$attrs", "$parse", "$timeout", GridController],
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                    return {
                            pre: (isolatedScope: ng.IScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController, transcludeFn: ng.ITranscludeFunction) => {
                                controller.discoverTemplates(instanceElement);
                            },
                            post: (isolatedScope: ng.IScope, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, controller: GridController, transcludeFn: ng.ITranscludeFunction) => {
                                var gridScope = instanceElement.scope();
                                controller.configureTableStructure(gridScope, instanceElement);
                            }
                        }
                }
                };
            }])
        .directive(cellHeaderDirective, [
            () => {
                var setupColumnTitle = (scope: IGridHeaderColumnScope) => {
                    if (scope.columnOptions.displayName) {
                        scope.columnTitle = scope.$eval(scope.columnOptions.displayName);
                    }
                    else {
                        if (!scope.columnOptions.fieldName) {
                            scope.columnTitle = "[Invalid Field Name]";
                            return;
                        }
                        else {
                            scope.columnTitle = TrNgGrid.splitByCamelCasing(scope.columnOptions.fieldName);
                        }
                    }
                };

                return {
                    restrict: 'A',
                    require: '^' + tableDirective,
                    scope: true,
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                        var isCustomized = tAttrs['isCustomized'] == 'true';
                        wrapTemplatedCell(templateElement, tAttrs, isCustomized, cellHeaderTemplateDirectiveAttribute);

                        return {
                            // we receive a reference to a real element that will appear in the DOM, after the controller was created, but before binding setup
                            pre: (scope: IGridHeaderColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController, $transclude: ng.ITranscludeFunction) => {
                                // we're not interested in creating an isolated scope just to parse the element attributes,
                                // so we're gonna have to do this manually

                                // create a clone of the default column options
                                var columnOptions: IGridColumnOptions = angular.extend({}, defaultColumnOptions);
                                columnOptions.fieldName = "unknown";

                                // now match and observe the attributes
                                controller.linkAttrs(tAttrs, columnOptions);

                                // set up the new scope
                                scope.TrNgGrid = TrNgGrid;
                                scope.gridOptions = controller.gridOptions;
                                scope.gridOptions.gridColumnDefs[parseInt(tAttrs[cellHeaderDirective])] = columnOptions;
                                scope.columnOptions = columnOptions;
                                scope.isCustomized = isCustomized;
                                scope.toggleSorting = (propertyName: string) => {
                                    controller.toggleSorting(propertyName);
                                };

                                // set up the column title
                                setupColumnTitle(scope);

                                scope.$watch("columnOptions.filter", (newValue: string, oldValue: string) => {
                                    if (newValue !== oldValue) {
                                        controller.setFilter(columnOptions.fieldName, newValue);
                                    }
                                });
                            }
                        }
                    }
                };
            }
        ])
        .directive(cellHeaderTemplateDirective, [
            () => {
                return {
                    restrict: 'A',
                    templateUrl: cellHeaderTemplateId,
                    transclude: true,
                    replace: true,
                };
            }
        ])
        .directive(bodyDirective, [
            () => {
                return {
                    restrict: 'A',
                    require: '^' + tableDirective,
                    scope: true,
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                        return {
                            pre: function (scope: IGridBodyScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController) {
                                scope.TrNgGrid = TrNgGrid;
                                scope.gridOptions = controller.gridOptions;
                                scope.toggleItemSelection = (item: any, $event: ng.IAngularEvent) => {
                                    controller.toggleItemSelection(item, $event);
                                };
                            }
                        }
                    }
                };
            }
        ])
        .directive(cellBodyDirective, [
            () => {
                var setupCellData = (scope: IGridBodyColumnScope) => {
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
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                        var isCustomized = tAttrs['isCustomized'] == 'true';
                        wrapTemplatedCell(templateElement, tAttrs, isCustomized, cellBodyTemplateDirectiveAttribute);

                        return {
                            pre: (scope: IGridBodyColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController, $transclude: ng.ITranscludeFunction) => {
                                scope.TrNgGrid = TrNgGrid;
                                scope.columnOptions = controller.gridOptions.gridColumnDefs[parseInt(tAttrs[cellBodyDirective])];
                                scope.isCustomized = isCustomized;
                                setupCellData(scope);
                            }
                        };
                    }
                };
            }
        ])
        .directive(cellBodyTemplateDirective, [
            () => {
                return {
                    restrict: 'A',
                    templateUrl: cellBodyTemplateId,
                    transclude: true,
                    replace: true
                };
            }
        ])
        .directive(cellFooterDirective, [
            () => {
                return {
                    restrict: 'A',
                    require: '^' + tableDirective,
                    scope: true,
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                        var isCustomized = tAttrs['isCustomized'] == 'true';
                        wrapTemplatedCell(templateElement, tAttrs, isCustomized, cellFooterTemplateDirectiveAttribute);

                        return {
                            pre: (scope: IGridFooterScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController, $transclude: ng.ITranscludeFunction) => {
                                scope.TrNgGrid = TrNgGrid;
                                scope.gridOptions = controller.gridOptions;
                                scope.isCustomized = isCustomized;
                                instanceElement.attr("colspan", controller.gridOptions.gridColumnDefs.length);
                            }
                        };
                    }
                };
            }
        ])
        .directive(cellFooterTemplateDirective, [
            () => {
                return {
                    restrict: 'A',
                    templateUrl: cellFooterTemplateId,
                    transclude: true,
                    replace: true
                };
            }
        ])
        .directive(columnSortDirective, [
            function () {
                return {
                    restrict: 'A',
                    replace: true,
                    templateUrl: columnSortTemplateId
                };
            }
        ])
        .directive(columnFilterDirective, [
            function () {
                return {
                    restrict: 'A',
                    replace: true,
                    templateUrl: columnFilterTemplateId
                };
            }
        ])
        .directive(globalFilterDirective, [
            function () {
                return {
                    restrict: 'A',
                    scope: false,
                    templateUrl: footerGlobalFilterTemplateId,
                };
            }
        ])
        .directive(pagerDirective, [
            function () {
                var setupScope = (scope: IGridFooterScope, controller: GridController) => {
                    scope.gridOptions = controller.gridOptions;
                    scope.isPaged = !!scope.gridOptions.pageItems;

                    // do not set scope.gridOptions.totalItems, it might be set from the outside
                    scope.totalItemsCount = (typeof (scope.gridOptions.totalItems) != "undefined" && scope.gridOptions.totalItems != null)
                    ? scope.gridOptions.totalItems
                    : (scope.gridOptions.items ? scope.gridOptions.items.length : 0);

                    scope.startItemIndex = scope.isPaged ? (scope.gridOptions.pageItems * scope.gridOptions.currentPage) : 0;
                    scope.endItemIndex = scope.isPaged ? (scope.startItemIndex + scope.gridOptions.pageItems - 1) : scope.totalItemsCount - 1;
                    if (scope.endItemIndex >= scope.totalItemsCount) {
                        scope.endItemIndex = scope.totalItemsCount - 1;
                    }
                    if (scope.endItemIndex < scope.startItemIndex) {
                        scope.endItemIndex = scope.startItemIndex;
                    }
                    scope.lastPageIndex = (!scope.totalItemsCount || !scope.isPaged)
                    ? 0
                    : (Math.floor(scope.totalItemsCount / scope.gridOptions.pageItems) + ((scope.totalItemsCount % scope.gridOptions.pageItems) ? 0 : -1));

                    scope.pageIndexes = [];
                    for (var pageIndex = 0; pageIndex <= scope.lastPageIndex; pageIndex++) {
                        scope.pageIndexes.push(pageIndex);
                    }
                    scope.pageSelectionActive = scope.pageIndexes.length > 1;

                    scope.pageCanGoBack = scope.isPaged && scope.gridOptions.currentPage > 0;
                    scope.pageCanGoForward = scope.isPaged && scope.gridOptions.currentPage < scope.lastPageIndex;

                    scope.navigateToPage = ($event, pageIndex) => {
                        scope.gridOptions.currentPage = pageIndex;
                        $event.preventDefault();
                        $event.stopPropagation();
                    }

                    scope.switchPageSelection = ($event, pageSelectionActive) => {
                        scope.pageSelectionActive = pageSelectionActive;
                        if ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();
                        }
                    }
                };

                //ng - model = "gridOptions.currentPage" 

                return {
                    restrict: 'A',
                    scope: true,
                    require: '^' + tableDirective,
                    templateUrl: footerPagerTemplateId,
                    replace: true,
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                        return {
                            pre: function (scope: IGridFooterScope, compiledInstanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController) {
                                setupScope(scope, controller);
                            },
                            post: function (scope: IGridFooterScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController) {
                                scope.$watchCollection("[gridOptions.currentPage, gridOptions.items.length, gridOptions.totalItems, gridOptions.pageItems]", (newValues: Array<any>, oldValues: Array<any>) => {
                                    setupScope(scope, controller);
                                });
                            }
                        };
                    }
                };
            }
        ])
    /*.filter("testFilter", () => {
        return (input: Array<any>) => {
            debugger;
        };
    })*/
        .filter(dataPagingFilter, () => {
            return (input: Array<any>, gridOptions: IGridOptions) => {
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
        })
        .filter(translateFilter, ["$filter", ($filter: ng.IFilterService) => {
            return (inputTextId: string) => {
                // check for a filter directive
                var translatedText: string;
                try {
                    var externalTranslationFilter = $filter("translate");
                    if (externalTranslationFilter) {
                        translatedText = externalTranslationFilter(inputTextId);
                    }
                }
                catch (ex) {
                }

                if (!translatedText) {
                    translatedText = translations[inputTextId];
                }

                if (!translatedText) {
                    translatedText = inputTextId;
                }

                return translatedText;
            };
        }])
        .run(["$templateCache",
            function ($templateCache: ng.ITemplateCacheService) {
                // set up default templates
                $templateCache.put(TrNgGrid.cellHeaderTemplateId,
                    '<div class="' + TrNgGrid.headerCellCssClass + '" ng-switch="isCustomized">'
                    + '  <div ng-switch-when="true">'
                    + '    <div ng-transclude=""></div>'
                    + '  </div>'
                    + '  <div ng-switch-default>'
                    + '    <div class="' + TrNgGrid.columnTitleCssClass + '">'
                    + '      {{columnTitle}}'
                    + '       <div ' + TrNgGrid.columnSortDirectiveAttribute + '=""></div>'
                    + '    </div>'
                    + '    <div ' + TrNgGrid.columnFilterDirectiveAttribute + '=""></div>'
                    + '  </div>'
                    + '</div>'
                    );
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
                $templateCache.put(TrNgGrid.cellBodyTemplateId,
                    '<div ng-attr-class="' + TrNgGrid.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}" ng-switch="isCustomized">'
                    + '  <div ng-switch-when="true">'
                    + '    <div ng-transclude=""></div>'
                    + '  </div>'
                    + '  <div ng-switch-default>{{cellData}}</div>'
                    + '</div>'
                    );
                //$templateCache.put(TrNgGrid.cellBodyCustomTemplateId,
                //    '<div ng-attr-class="' + TrNgGrid.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}">'
                //    + '<div ng-transclude=""></div>'
                //    + '</div>'
                //    );
                $templateCache.put(TrNgGrid.columnFilterTemplateId,
                    '<div ng-show="gridOptions.enableFiltering||columnOptions.enableFiltering" class="' + TrNgGrid.columnFilterCssClass + '">'
                    + ' <div class="' + TrNgGrid.columnFilterInputWrapperCssClass + '">'
                    + '   <input class="form-control input-sm" type="text" ng-model="columnOptions.filter"></input>'
                    + ' </div>'
                    + '</div>');
                $templateCache.put(TrNgGrid.columnSortTemplateId,
                    '<div title="Sort"'
                    + ' ng-show="gridOptions.enableSorting||columnOptions.enableSorting"'
                    + ' ng-click="toggleSorting(columnOptions.fieldName)"'
                    + ' class="' + TrNgGrid.columnSortCssClass + '" > '
                    + '  <div ng-class="{\''
                    + TrNgGrid.columnSortActiveCssClass + '\':gridOptions.orderBy==columnOptions.fieldName,\''
                    + TrNgGrid.columnSortInactiveCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName,\''
                    + TrNgGrid.columnSortNormalOrderCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName||!gridOptions.orderByReverse,\''
                    + TrNgGrid.columnSortReverseOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&gridOptions.orderByReverse}" >'
                    + '  </div>'
                    + '</div>');
                $templateCache.put(TrNgGrid.cellFooterTemplateId,
                    '<div class="' + TrNgGrid.footerCssClass + '" ng-switch="isCustomized">'
                    + '  <div ng-switch-when="true">'
                    + '    <div ng-transclude=""></div>'
                    + '  </div>'
                    + '  <div ng-switch-default>'
                    + '    <span ' + TrNgGrid.globalFilterDirectiveAttribute + '=""></span>'
                    + '    <span ' + TrNgGrid.pagerDirectiveAttribute + '=""></span>'
                    + '  </div>'
                    + '</div>');
                $templateCache.put(TrNgGrid.footerGlobalFilterTemplateId,
                    '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">'
                    + '  <input class="form-control" type="text" ng-model="gridOptions.filterBy" ng-attr-placeholder="{{\'trNgGrid_Search\'|' + TrNgGrid.translateFilter + '}}"></input>'
                    + '</span>');
                $templateCache.put(TrNgGrid.footerPagerTemplateId,
                    '<span class="pull-right form-group">'
                    + ' <ul class="pagination">'
                    + '   <li ng-show="pageCanGoBack" >'
                    + '     <a href="" ng-click="navigateToPage($event, 0)" title="First Page">|&lArr;</a>'
                    + '   </li>'
                    + '   <li ng-show="pageCanGoBack" >'
                    + '     <a href="" ng-click="navigateToPage($event, gridOptions.currentPage - 1)" title="Previous Page">&lArr;</a>'
                    + '   </li>'
                    + '   <li ng-show="pageSelectionActive" style="white-space: nowrap;">'
                    + '     <span>Page: '
                    + '       <select ng-model="gridOptions.currentPage" ng-options="pageIndex as (pageIndex+1) for pageIndex in pageIndexes"></select>'
                    + '     </span>'
                    + '   </li>'
                    + '   <li class="disabled" style="white-space: nowrap;">'
                    + '     <span ng-hide="totalItemsCount">No items to display</span>'
                    + '     <span ng-show="totalItemsCount" title="Select Page">'
                    + '       {{startItemIndex+1}} - {{endItemIndex+1}} displayed'
                    + '       <span>, {{totalItemsCount}} in total</span>'
                    + '     </span > '
                    + '   </li>'
                    + '   <li ng-show="pageCanGoForward">'
                    + '     <a href="" ng-click="navigateToPage($event, gridOptions.currentPage + 1)" title="Next Page">&rArr;</a>'
                    + '   </li>'
                    + '   <li ng-show="pageCanGoForward">'
                    + '     <a href="" ng-show="pageCanGoForward" ng-click="navigateToPage($event, lastPageIndex)" title="Last Page">&rArr;|</a>'
                    + '   </li>'
                    + ' </ul>'
                    + '</span>');
            }
        ])
        .run(function () {
            TrNgGrid.defaultColumnOptions.displayAlign = 'left';
            TrNgGrid.translations["trNgGrid_Search"] = "Search";
        });
}