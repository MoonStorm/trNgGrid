var TrNgGrid;
(function (TrNgGrid) {
    function processMonitorChanges(source, propKeys, onChangeDetected) {
        var newData = {};
        var sourceIsArrayOfValues = source instanceof Array;
        angular.forEach(propKeys, function (propKey, index) {
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
    }
    ;
    function monitorAttributes($interpolate, $tAttrs, $scope, properties, onChangeDetected) {
        var propKeys;
        if (properties instanceof Array) {
            propKeys = properties;
        }
        else {
            propKeys = extractFields(properties);
        }
        var watchArray = new Array(propKeys.length);
        angular.forEach(propKeys, function (propKey, index) {
            var expression = $tAttrs[propKey];
            watchArray[index] = expression;
        });
        $scope.$watchGroup(watchArray, function (newValues) { return processMonitorChanges(newValues, propKeys, onChangeDetected); });
    }
    TrNgGrid.monitorAttributes = monitorAttributes;
    function monitorScope($scope, properties, onChangeDetected) {
        var propKeys;
        if (properties instanceof Array) {
            propKeys = properties;
        }
        else {
            propKeys = extractFields(properties);
        }
        $scope.$watchGroup(propKeys, function () { return processMonitorChanges($scope, propKeys, onChangeDetected); });
    }
    TrNgGrid.monitorScope = monitorScope;
    function extractFields(data) {
        var fields = new Array();
        for (var fieldName in data) {
            fields.push(fieldName);
        }
        return fields;
    }
    TrNgGrid.extractFields = extractFields;
    function findChildByTagName(parent, childTag) {
        childTag = childTag.toUpperCase();
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName === childTag) {
                return angular.element(childElement);
            }
        }
        return null;
    }
    TrNgGrid.findChildByTagName = findChildByTagName;
    ;
    function findChildIndex(child) {
        var parent = child.parent();
        var children = parent.children();
        var childIndex = 0;
        for (; childIndex < children.length && children[childIndex] === child[0]; childIndex++)
            ;
        return (childIndex >= children.length) ? -1 : childIndex;
    }
    TrNgGrid.findChildIndex = findChildIndex;
    ;
    function findChildrenByTagName(parent, childTag) {
        childTag = childTag.toUpperCase();
        var retChildren = new Array();
        var children = parent.children();
        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var childElement = children[childIndex];
            if (childElement.tagName === childTag) {
                retChildren.push(angular.element(childElement));
            }
        }
        return retChildren;
    }
    TrNgGrid.findChildrenByTagName = findChildrenByTagName;
    ;
    function wrapTemplatedCell(templateElement, cellTemplateDirective) {
        var childrenElements = templateElement.children();
        if (childrenElements.length !== 1 || !angular.element(childrenElements[0]).attr(cellTemplateDirective)) {
            var templateWrapElement = angular.element("<div>" + templateElement.html() + "</div>").attr(cellTemplateDirective, "");
            templateElement.empty();
            templateElement.append(templateWrapElement);
        }
    }
    TrNgGrid.wrapTemplatedCell = wrapTemplatedCell;
    ;
    function log(message) {
        console.log(TrNgGrid.Constants.tableDirective + "(" + new Date().getTime() + "): " + message);
    }
    TrNgGrid.log = log;
    ;
    function createRowElement() {
        return findChildByTagName(findChildByTagName(angular.element("<table><tbody><tr></tr></tbody></table>"), "tbody"), "tr");
    }
    TrNgGrid.createRowElement = createRowElement;
    function createCellElement(cellTagName) {
        return findChildByTagName(findChildByTagName(findChildByTagName(angular.element("<table><tbody><tr><" + cellTagName + "></" + cellTagName + "></tr></tbody></table>"), "tbody"), "tr"), cellTagName);
    }
    TrNgGrid.createCellElement = createCellElement;
    function getStandardCellTemplate(gridConfiguration, sectionType) {
        var elementTemplate;
        switch (sectionType) {
            case TrNgGrid.GridSectionType.Header:
                elementTemplate = gridConfiguration.templates.headerCellStandard;
                break;
            case TrNgGrid.GridSectionType.Body:
                elementTemplate = gridConfiguration.templates.bodyCellStandard;
                break;
            case TrNgGrid.GridSectionType.Footer:
                elementTemplate = gridConfiguration.templates.footerCellStandard;
                break;
            default:
                throw "Unknown standard template for section cell " + sectionType;
        }
        return angular.element(elementTemplate);
    }
    TrNgGrid.getStandardCellTemplate = getStandardCellTemplate;
    function getStandardCellContentsTemplate(gridConfiguration, sectionType) {
        var elementTemplate;
        switch (sectionType) {
            case TrNgGrid.GridSectionType.Header:
                elementTemplate = gridConfiguration.templates.headerCellContentsStandard;
                break;
            case TrNgGrid.GridSectionType.Body:
                elementTemplate = gridConfiguration.templates.bodyCellContentsStandard;
                break;
            case TrNgGrid.GridSectionType.Footer:
                elementTemplate = gridConfiguration.templates.footerCellContentsStandard;
                break;
            default:
                throw "Unknown standard contents template for section cell" + sectionType;
        }
        return angular.element(elementTemplate);
    }
    TrNgGrid.getStandardCellContentsTemplate = getStandardCellContentsTemplate;
})(TrNgGrid || (TrNgGrid = {}));
