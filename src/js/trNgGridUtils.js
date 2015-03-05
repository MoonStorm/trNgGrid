var TrNgGrid;
(function (TrNgGrid) {
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
    function fixGridCell(gridConfiguration, cellElement, cellTagName, cellElementDirectiveAttribute, rowIndex, cellIndex) {
        if (!cellElement) {
            cellElement = createCellElement(cellTagName);
            cellElement.attr(TrNgGrid.Constants.dataColumnIsAutoGeneratedAttribute, "true");
        }
        cellElement.attr(cellElementDirectiveAttribute, "");
        cellElement.attr(TrNgGrid.Constants.dataColumnRowIndexAttribute, rowIndex);
        cellElement.attr(TrNgGrid.Constants.dataColumnBatchIndexAttribute, cellIndex);
        var cellChildrenElements = cellElement.children();
        var isCustomized = cellChildrenElements.length || ((cellElement.html().replace(/^\s+|\s+$/gm, '')));
        if (isCustomized && cellChildrenElements.length === 0) {
            var wrappedContent = angular.element("<div>" + cellElement.html() + "</div>");
            cellElement.empty();
            cellElement.append(wrappedContent);
        }
        if (isCustomized) {
            cellElement.attr(TrNgGrid.Constants.dataColumnIsCustomizedAttribute, "true");
        }
        return cellElement;
    }
    TrNgGrid.fixGridCell = fixGridCell;
    function fixGridSection(gridConfiguration, sectionElement, cellTagName, cellElementDirectiveAttribute) {
        var rowElement;
        var rowElements = findChildrenByTagName(sectionElement, "tr");
        if (!rowElements.length) {
            sectionElement.empty();
            rowElement = createRowElement();
            sectionElement.append(rowElement);
            rowElements.push(rowElement);
        }
        for (var rowIndex = 0; rowIndex < rowElements.length; rowIndex++) {
            rowElement = rowElements[rowIndex];
            var cellElement;
            var weavedAutoElement;
            var cellElements = findChildrenByTagName(rowElement, "th");
            if (cellElements.length > 0 && cellElements[0].attr(TrNgGrid.Constants.dataColumnIsAutoGeneratedAttribute)) {
            }
            else {
                weavedAutoElement = fixGridCell(gridConfiguration, null, cellTagName, cellElementDirectiveAttribute, rowIndex, 0);
                rowElement.prepend(weavedAutoElement);
                for (var cellIndex = 0; cellIndex < cellElements.length; cellIndex++) {
                    cellElement = cellElements[cellIndex];
                    cellElement = fixGridCell(gridConfiguration, cellElement, cellTagName, cellElementDirectiveAttribute, rowIndex, (cellIndex << 1) + 1);
                    weavedAutoElement = fixGridCell(gridConfiguration, null, cellTagName, cellElementDirectiveAttribute, rowIndex, (cellIndex + 1) << 1);
                    cellElement.after(weavedAutoElement);
                }
            }
        }
    }
    TrNgGrid.fixGridSection = fixGridSection;
    function fixTableStructure(gridConfiguration, gridElement) {
        var tableHeaderElement = findChildByTagName(gridElement, "thead");
        if (!tableHeaderElement) {
            tableHeaderElement = findChildByTagName(angular.element("<table><thead></thead></table"), "thead");
            gridElement.prepend(tableHeaderElement);
        }
        tableHeaderElement.attr(TrNgGrid.Constants.headerDirectiveAttribute, "");
        fixGridSection(gridConfiguration, tableHeaderElement, "th", TrNgGrid.Constants.cellHeaderDirectiveAttribute);
        var tableFooterElement = findChildByTagName(gridElement, "tfoot");
        if (!tableFooterElement) {
            tableFooterElement = findChildByTagName(angular.element("<table><tfoot></tfoot></table"), "tfoot");
            tableHeaderElement.after(tableFooterElement);
        }
        var tableBodyElement = findChildByTagName(gridElement, "tbody");
        if (!tableBodyElement) {
            tableBodyElement = findChildByTagName(angular.element("<table><tbody></tbody></table"), "tbody");
            tableFooterElement.after(tableBodyElement);
        }
        angular.forEach(gridElement.children, function (element) {
            if (element !== tableHeaderElement[0] || element !== tableBodyElement[0] || element !== tableFooterElement[0]) {
                angular.element(element).remove();
                gridConfiguration.debugMode && log("Invalid extra element found inside the grid template structure: " + element.tagName);
            }
        });
    }
    TrNgGrid.fixTableStructure = fixTableStructure;
})(TrNgGrid || (TrNgGrid = {}));
