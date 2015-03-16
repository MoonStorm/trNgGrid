/// <reference path="../../../typings/angularjs/angular.d.ts"/>
module TrNgGrid {

    /*
     * Processes the result of a scope monitoring operation
     */
    function processMonitorChanges(source: any, propKeys: Array<string>, onChangeDetected: (newData: any) => void) {
        var newData: any = {};
        var sourceIsArrayOfValues = source instanceof Array;
        angular.forEach(propKeys,(propKey: string, index: number) => {
            var propValue = sourceIsArrayOfValues ? source[index] : source[propKey];
            if (propValue !== undefined) {
                if (propValue === "true") {
                    propValue = true;
                }
                else if (propValue === "false") {
                    propValue = false;
                }

                newData[propKey] = propValue;
            }
        });

        onChangeDetected(newData);
    };

    /*
     * Monitors the attributes for changes to the list of properties provided either as an array of strings or an object with fields set
     */
    export function monitorAttributes($interpolate:ng.IInterpolateService, $tAttrs: ng.IAttributes, $scope: ng.IScope, properties: any, onChangeDetected: (newData: any) => void) {
        var propKeys: Array<any>;

        if (properties instanceof Array) {
            propKeys = <Array<String>>properties;
        }
        else {
            propKeys = extractFields(properties);
        }

        var watchArray = new Array<any>(propKeys.length);
        angular.forEach(propKeys,(propKey: string, index: number) => {
            var expression = $tAttrs[propKey];
            // a nice touch would be to remove the interpolated symbols here, if present
            watchArray[index] = expression;
        });

        $scope.$watchGroup(watchArray, (newValues:Array<any>) => processMonitorChanges(newValues,propKeys, onChangeDetected));
    }

    /*
     * Monitors the scope for changes to the list of properties provided either as an array of strings or an object with fields set
     */
    export function monitorScope($scope: ng.IScope, properties: any, onChangeDetected:(newData:any)=>void) {
        var propKeys: Array<any>;

        if (properties instanceof Array) {
            propKeys = <Array<String>>properties;
        }
        else {
            propKeys = extractFields(properties);
        }

        $scope.$watchGroup(propKeys, ()=> processMonitorChanges($scope, propKeys, onChangeDetected));
    }

    export function extractFields(data: any): Array<string> {
        var fields = new Array<string>();
        for (var fieldName in data) {
            fields.push(fieldName);
        }

        return fields;
    }

    export function findChildByTagName(parent: JQuery, childTag: string): ng.IAugmentedJQuery{
        childTag = childTag.toUpperCase();
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName === childTag) {
                return angular.element(childElement);
            }
        }

        return null;
    };

    export function findChildIndex (child: JQuery): number {
        var parent = child.parent();
        var children = parent.children();
        var childIndex = 0;
        for (; childIndex < children.length && children[childIndex] === child[0]; childIndex++);
        return (childIndex >= children.length) ? -1 : childIndex;
    };

    export function findChildrenByTagName(parent: JQuery, childTag: string): Array<ng.IAugmentedJQuery>{
        childTag = childTag.toUpperCase();
        var retChildren:any = new Array();
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName === childTag) {
                retChildren.push(angular.element(childElement));
            }
        }

        return retChildren;
    };

    export function wrapTemplatedCell(templateElement: JQuery, cellTemplateDirective: string) {
        var childrenElements = templateElement.children();
        if (childrenElements.length !== 1 || !angular.element(childrenElements[0]).attr(cellTemplateDirective)) {
            // wrap the children of the custom template cell
            // don't attempt to add the children, there might just be verbatim text in there
            var templateWrapElement = angular.element("<div>" + templateElement.html() + "</div>").attr(cellTemplateDirective, "");
            templateElement.empty();
            templateElement.append(templateWrapElement);
        }
    };

    export function log(message: string) {
        console.log(Constants.tableDirective + "(" + new Date().getTime() + "): " + message);
    };

    // due to angular limitations, the following workarounds are required
    export function createRowElement(): ng.IAugmentedJQuery {
        return findChildByTagName(findChildByTagName(angular.element("<table><tbody><tr></tr></tbody></table>"), "tbody"), "tr");
    }

    export function createCellElement(cellTagName:string): ng.IAugmentedJQuery {
        return findChildByTagName(findChildByTagName(findChildByTagName(angular.element("<table><tbody><tr><"+cellTagName+"></"+cellTagName+"></tr></tbody></table>"), "tbody"), "tr"), cellTagName);
    }

    export function fixGridCell(
        gridConfiguration: IGridConfiguration,
        cellElement: ng.IAugmentedJQuery,
        cellTagName: string,
        cellElementDirectiveAttribute: string): ng.IAugmentedJQuery {

        if (!cellElement) {
            cellElement = createCellElement(cellTagName);
            cellElement.attr(Constants.dataColumnIsAutoGeneratedAttribute, "true");
        }

        cellElement.attr(cellElementDirectiveAttribute, "");
        //cellElement.attr(Constants.dataColumnRowIndexAttribute, rowIndex);
        //cellElement.attr(Constants.dataColumnBatchIndexAttribute, cellIndex);

        var cellChildrenElements = cellElement.children();

        // use a better approach by checking the raw contents
        // be aware trim isn't supported in all browsers
        var isCustomized = cellChildrenElements.length || ((cellElement.html().replace(/^\s+|\s+$/gm, '')));

        if (isCustomized && cellChildrenElements.length === 0) {
            // wrap the text in a div
            var wrappedContent = angular.element("<div>" + cellElement.html() + "</div>");
            cellElement.empty();
            cellElement.append(wrappedContent);
        }

        if (isCustomized) {
            cellElement.attr(Constants.dataColumnIsCustomizedAttribute, "true");
        }

        return cellElement;
    }

    export function fixGridSection(
        gridConfiguration: IGridConfiguration,
        sectionElement: ng.IAugmentedJQuery,
        rowElementDirectiveAttribute:string,
        cellTagName: string,
        cellElementDirectiveAttribute: string) {

        var rowElement: ng.IAugmentedJQuery;
        var rowElements = findChildrenByTagName(sectionElement, "tr");
        if (!rowElements.length) {
            sectionElement.empty();
            rowElement = createRowElement();
            sectionElement.append(rowElement);
            rowElements.push(rowElement);
        }

        for (var rowIndex = 0; rowIndex < rowElements.length; rowIndex++) {
            rowElement = rowElements[rowIndex];
            rowElement.attr(rowElementDirectiveAttribute, "");

            var cellElements = findChildrenByTagName(rowElement, cellTagName);

            // ensure the placeholder elements are there
            if (cellElements.length === 0 || !cellElements[0].attr(Constants.cellPlaceholderDirectiveAttribute)) {
                var placeholderTemplate = angular.element(gridConfiguration.templates.headerCellStandard);
                placeholderTemplate.attr("data-ng-repeat", "gridColumnLayout in (gridLayoutRow.cells)");
                //placeholderTemplate.attr("data-ng-if", "!gridColumnLayout.isDeactivated");
                placeholderTemplate.attr(Constants.cellPlaceholderDirectiveAttribute, "");

                rowElement.prepend(placeholderTemplate);
            }

            // ensure the cells have got the right attribute 
            for (var cellIndex = 0; cellIndex < cellElements.length; cellIndex++) {
                var cellElement = cellElements[cellIndex];

                fixGridCell(gridConfiguration, cellElement, cellTagName, cellElementDirectiveAttribute);
            }
        }
    }

    export function fixTableStructure(
        gridConfiguration: IGridConfiguration,
        gridElement: ng.IAugmentedJQuery) {

        // make sure the header is present
        var tableHeaderElement = findChildByTagName(gridElement, "thead");
        if (!tableHeaderElement) {
            tableHeaderElement = findChildByTagName(angular.element("<table><thead></thead></table"), "thead");
            gridElement.prepend(tableHeaderElement);
        }
        tableHeaderElement.attr(Constants.headerDirectiveAttribute, "");
        fixGridSection(gridConfiguration, tableHeaderElement, Constants.rowDirectiveAttribute, "th", Constants.cellDirectiveAttribute);

        // the footer follows immediately after the header
        var tableFooterElement = findChildByTagName(gridElement, "tfoot");
        if (!tableFooterElement) {
            tableFooterElement = findChildByTagName(angular.element("<table><tfoot></tfoot></table"), "tfoot");
            tableHeaderElement.after(tableFooterElement);
        }
        //tableFooterElement.attr(footerDirectiveAttribute, "");

        // the body is the last
        var tableBodyElement = findChildByTagName(gridElement, "tbody");
        if (!tableBodyElement) {
            tableBodyElement = findChildByTagName(angular.element("<table><tbody></tbody></table"), "tbody");
            tableFooterElement.after(tableBodyElement);
        }
        //tableBodyElement.attr(bodyDirectiveAttribute, "");

        // any other elements are not allowed
        angular.forEach(gridElement.children,(element: HTMLElement) => {
            if (element !== tableHeaderElement[0] || element !== tableBodyElement[0] || element !== tableFooterElement[0]) {
                angular.element(element).remove();
                gridConfiguration.debugMode && log("Invalid extra element found inside the grid template structure: " + element.tagName);
            }
        });

        // block or allow data bindings
        //if (allowDataBindings) {
        //    tableHeaderElement.removeAttr("data-ng-non-bindable");
        //    tableFooterElement.removeAttr("data-ng-non-bindable");
        //    tableBodyElement.removeAttr("data-ng-non-bindable");
        //}
        //else {
        //    tableHeaderElement.attr("data-ng-non-bindable", "");
        //    tableFooterElement.attr("data-ng-non-bindable", "");
        //    tableBodyElement.attr("data-ng-non-bindable", "");
        //}
    }
}