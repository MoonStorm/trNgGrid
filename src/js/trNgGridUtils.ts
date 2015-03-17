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

    export function getStandardCellTemplate(gridConfiguration: IGridConfiguration, sectionType: GridSectionType): ng.IAugmentedJQuery {
        var elementTemplate:string;
        switch(sectionType) {
            case GridSectionType.Header:
                elementTemplate = gridConfiguration.templates.headerCellStandard;
                break;
            case GridSectionType.Body:
                elementTemplate = gridConfiguration.templates.bodyCellStandard;
                break;
            case GridSectionType.Footer:
                elementTemplate = gridConfiguration.templates.footerCellStandard;
                break;
            default:
                throw "Unknown standard template for section cell " + sectionType;
        }

        return angular.element(elementTemplate);
    }

    export function getStandardCellContentsTemplate(gridConfiguration: IGridConfiguration, sectionType: GridSectionType): ng.IAugmentedJQuery {
        var elementTemplate: string;
        switch (sectionType) {
            case GridSectionType.Header:
                elementTemplate = gridConfiguration.templates.headerCellContentsStandard;
                break;
            case GridSectionType.Body:
                elementTemplate = gridConfiguration.templates.bodyCellContentsStandard;
                break;
            case GridSectionType.Footer:
                elementTemplate = gridConfiguration.templates.footerCellContentsStandard;
                break;
            default:
                throw "Unknown standard contents template for section cell" + sectionType;
        }

        return angular.element(elementTemplate);
    }
}