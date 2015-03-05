/**
 * Combines two sets of cell infos. The first set will take precedence in the checks but the combined items will contain items from the second set if they match.
 */
var combineGridCellInfos = <T extends IGridColumn>(
    firstSet: Array<T>,
    secondSet: Array<T>,
    addExtraFieldItemsSecondSet?: boolean,
    addExtraNonFieldItemsSecondSet?: boolean): Array<T> => {

    var combinedSet: Array<T> = [];
    var secondTempSet = secondSet.slice(0);
    angular.forEach(firstSet, (firstSetColumn: T) => {
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
        else {
            combinedSet.push(firstSetColumn);
        }
    });

    // add the remaining items from the second set in the combined set
    if (addExtraFieldItemsSecondSet || addExtraNonFieldItemsSecondSet) {
        angular.forEach(secondTempSet, (secondSetColumn: T) => {
            if ((addExtraFieldItemsSecondSet && secondSetColumn.fieldName) || (addExtraNonFieldItemsSecondSet && !secondSetColumn.fieldName)) {
                combinedSet.push(secondSetColumn);
            }
        });
    }

    return combinedSet;
};
 


    class TemplatedCell implements IGridColumn {
        public fieldName: string;
        public isStandardColumn: boolean;

        constructor(public parent: TemplatedSection, public cellElement: JQuery) {
            this.fieldName = cellElement.attr(fieldNameAttribute);
            // var customContent = cellElement.children();
            // this.isStandardColumn = customContent.length === 0;

            var cellChildrenElements = cellElement.children();

            // use a better approach by checking the raw contents
            // be aware trim isn't supported in all browsers
            this.isStandardColumn = cellChildrenElements.length === 0 && (!(cellElement.html().replace(/^\s+|\s+$/gm, '')));
        }
    }

    class TemplatedSection {
        public cells: Array<TemplatedCell>;

        constructor(
            private sectionTagName: string,
            private sectionDirectiveAttribute: string,
            private rowDirectiveAttribute: string,
            private cellTagName: string,
            private cellDirectiveAttribute: string) {
                this.cellTagName = this.cellTagName.toUpperCase();
                this.cells = null;
            }

        public configureSection(gridElement: JQuery, columnDefs: Array<IGridColumnOptions>): JQuery {
            var sectionElement = this.getSectionElement(gridElement, true);
            sectionElement.empty();
            sectionElement.removeAttr("ng-non-bindable");

            // add the elements in order
            var rowElementDefinitions = combineGridCellInfos(columnDefs, this.cells, false, false);

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
                    gridCellElement = angular.element("<table><" + this.cellTagName + "></" + this.cellTagName + "></table>").find(this.cellTagName);
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

    public getTemplatedRowElement(sectionElement?: JQuery, ensurePresent?: boolean): JQuery {
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


    discoverTemplates(gridElement: JQuery) {
        this.templatedHeader = new TemplatedSection("thead", null, null, "th", cellHeaderDirectiveAttribute);
        this.templatedBody = new TemplatedSection("tbody", bodyDirectiveAttribute, null, "td", cellBodyDirectiveAttribute);
        this.templatedFooter = new TemplatedSection("tfoot", null, null, "td", cellFooterDirectiveAttribute);

        this.templatedHeader.discoverCells(gridElement);
        this.templatedFooter.discoverCells(gridElement);
        this.templatedBody.discoverCells(gridElement);
    }

    configureTableStructure(parentScope: ng.IScope, gridElement: ng.IAugmentedJQuery, oldScope?: ng.IScope) {
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
        this.columnDefsFieldsWatcherDeregistration = scope.$watch("gridOptions.fields", (newValue: Array<any>, oldValue: Array<any>) => {
            if (!angular.equals(newValue, oldValue)) {
                this.configureTableStructure(parentScope, gridElement, scope);
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

        finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedHeaderPartialGridColumnDefs, false, true);
        finalPartialGridColumnDefs = combineGridCellInfos(finalPartialGridColumnDefs, templatedBodyPartialGridColumnDefs, false, true);
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
                this.columnDefsItemsWatcherDeregistration = scope.$watch("gridOptions.items.length", (newValue: number, oldValue: number) => {
                    if (newValue) {
                        this.configureTableStructure(parentScope, gridElement, scope);
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

    // compute the formatted field names
    angular.forEach(finalPartialGridColumnDefs, (columnDefs: IGridColumnOptions) => {
        if (columnDefs.fieldName) {
            columnDefs.displayFieldName = this.getFormattedFieldName(columnDefs.fieldName);
        }
    });

    this.gridOptions.gridColumnDefs = finalPartialGridColumnDefs;
    var headerElement = this.templatedHeader.configureSection(gridElement, finalPartialGridColumnDefs);
    var footerElement = this.templatedFooter.configureSection(gridElement, templatedFooterPartialGridColumnDefs);
    var bodyElement = this.templatedBody.configureSection(gridElement, finalPartialGridColumnDefs);

    var templatedBodyRowElement = this.templatedBody.getTemplatedRowElement(bodyElement);
    var templatedHeaderRowElement = this.templatedHeader.getTemplatedRowElement(headerElement);

    bodyElement.attr(bodyDirectiveAttribute, "");
    templatedBodyRowElement.attr("ng-click", "toggleItemSelection(gridItem, $event)");
    // when server-side get is active (scope.gridOptions.onDataRequired), the filtering through the standard filters should be disabled
    /*if (this.gridOptions.onDataRequired) {
        templatedBodyRowElement.attr("ng-repeat", "gridItem in gridOptions.items");
    }
    else {
        templatedBodyRowElement.attr("ng-repeat", "gridItem in gridOptions.items | filter:gridOptions.filterBy | filter:gridOptions.filterByFields | orderBy:gridOptions.orderBy:gridOptions.orderByReverse | " + dataPagingFilter + ":gridOptions");
    }*/
    templatedBodyRowElement.attr("ng-repeat", "gridDisplayItem in filteredItems");
    templatedBodyRowElement.attr("ng-init", "gridItem=gridDisplayItem.$$_gridItem");
    templatedBodyRowElement.attr("ng-class", "{'" + this.gridConfiguration.styles.rowSelectedCssClass + "':gridOptions.selectedItems.indexOf(gridItem)>=0}");

    headerElement.replaceWith(this.$compile(headerElement)(scope));
    footerElement.replaceWith(this.$compile(footerElement)(scope));
    bodyElement.replaceWith(this.$compile(bodyElement)(scope));

    if (oldScope) {
        // an Angular bug is preventing us to destroy a scope inside the digest cycle
        this.$timeout(() => oldScope.$destroy());
    }
    }

