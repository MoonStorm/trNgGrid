var TrNgGrid;
(function (TrNgGrid) {
    var TableDirective = (function () {
        function TableDirective(gridConfiguration) {
            this.gridConfiguration = gridConfiguration;
            this.restrict = 'A';
            this.scope = {
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
            };
            this.controller = ["$compile", "$parse", "$timeout", TrNgGrid.Constants.gridConfigurationService, TrNgGrid.GridController];
        }
        TableDirective.prototype.fixTableStructure = function (gridElement) {
            var _this = this;
            var tableHeaderElement = TrNgGrid.findChildByTagName(gridElement, "thead");
            if (!tableHeaderElement) {
                tableHeaderElement = TrNgGrid.findChildByTagName(angular.element("<table><thead></thead></table"), "thead");
                gridElement.prepend(tableHeaderElement);
            }
            tableHeaderElement.attr(TrNgGrid.Constants.sectionDirectiveAttribute, "");
            var tableFooterElement = TrNgGrid.findChildByTagName(gridElement, "tfoot");
            if (!tableFooterElement) {
                tableFooterElement = TrNgGrid.findChildByTagName(angular.element("<table><tfoot></tfoot></table"), "tfoot");
                tableHeaderElement.after(tableFooterElement);
            }
            var tableBodyElement = TrNgGrid.findChildByTagName(gridElement, "tbody");
            if (!tableBodyElement) {
                tableBodyElement = TrNgGrid.findChildByTagName(angular.element("<table><tbody></tbody></table"), "tbody");
                tableFooterElement.after(tableBodyElement);
            }
            angular.forEach(gridElement.children, function (element) {
                if (element !== tableHeaderElement[0] || element !== tableBodyElement[0] || element !== tableFooterElement[0]) {
                    angular.element(element).remove();
                    _this.gridConfiguration.debugMode && TrNgGrid.log("Invalid extra element found inside the grid template structure: " + element.tagName);
                }
            });
        };
        TableDirective.prototype.compile = function (templateElement, tAttrs) {
            this.fixTableStructure(templateElement);
            return {
                pre: function (isolatedScope, instanceElement, tAttrs, controller, transcludeFn) {
                    controller.setGridOptions(isolatedScope);
                }
            };
        };
        return TableDirective;
    })();
    var SectionDirective = (function () {
        function SectionDirective(gridConfiguration) {
            this.gridConfiguration = gridConfiguration;
            this.restrict = 'A';
            this.scope = true;
            this.require = "^" + TrNgGrid.Constants.tableDirective;
        }
        SectionDirective.prototype.fixGridSection = function (sectionElement, sectionType) {
            var rowElement;
            var rowElements = TrNgGrid.findChildrenByTagName(sectionElement, "tr");
            if (!rowElements.length) {
                sectionElement.empty();
                rowElement = TrNgGrid.createRowElement();
                sectionElement.append(rowElement);
                rowElements.push(rowElement);
            }
            var cellTagName = sectionType === TrNgGrid.GridSectionType.Header ? "th" : "td";
            var standardCellTemplate = TrNgGrid.getStandardCellTemplate(this.gridConfiguration, sectionType);
            for (var rowIndex = 0; rowIndex < rowElements.length; rowIndex++) {
                rowElement = rowElements[rowIndex];
                rowElement.attr(TrNgGrid.Constants.rowDirectiveAttribute, "");
                var cellElements = TrNgGrid.findChildrenByTagName(rowElement, cellTagName);
                if (cellElements.length === 0 || !cellElements[0].attr(TrNgGrid.Constants.cellPlaceholderDirectiveAttribute)) {
                    var placeholderTemplate = standardCellTemplate;
                    placeholderTemplate.attr("data-ng-repeat", "gridColumnLayout in (gridLayoutRow.cells)");
                    placeholderTemplate.attr(TrNgGrid.Constants.cellPlaceholderDirectiveAttribute, "");
                    rowElement.prepend(placeholderTemplate);
                }
                for (var cellIndex = 0; cellIndex < cellElements.length; cellIndex++) {
                    var cellElement = cellElements[cellIndex];
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
                }
            }
        };
        SectionDirective.prototype.compile = function (templateElement, tAttrs) {
            var sectionType;
            var sectionTagName = templateElement.prop("tagName");
            switch (sectionTagName) {
                case "THEAD":
                    sectionType = TrNgGrid.GridSectionType.Header;
                    break;
                case "TBODY":
                    sectionType = TrNgGrid.GridSectionType.Body;
                    break;
                case "TFOOT":
                    sectionType = TrNgGrid.GridSectionType.Footer;
                    break;
                default:
                    throw "The section element " + sectionTagName + " is not recognized as a valid TABLE element";
            }
            this.fixGridSection(templateElement, sectionType);
            return {
                pre: function (scope, instanceElement, tAttrs, gridController, transcludeFn) {
                    scope.grid = gridController;
                    scope.gridOptions = gridController.gridOptions;
                    scope.gridLayoutSection = gridController.gridLayout.getSection(sectionType);
                }
            };
        };
        return SectionDirective;
    })();
    var RowDirective = (function () {
        function RowDirective() {
            this.restrict = 'A';
            this.scope = true;
            this.require = "^" + TrNgGrid.Constants.tableDirective;
        }
        RowDirective.prototype.compile = function ($templateElement, $tAttrs) {
            return {
                pre: function ($scope, $instanceElement, $tAttrs, $controller, $transcludeFn) {
                    $scope.gridLayoutRow = $scope.gridLayoutSection.registerRow();
                    $scope.$on("$destroy", function () {
                        debugger;
                        $scope.gridLayoutSection.unregisterRow($scope.gridLayoutRow);
                    });
                },
                post: function ($scope, $instanceElement, $tAttrs, $controller, $transcludeFn) {
                }
            };
        };
        return RowDirective;
    })();
    var CellPlaceholderDirective = (function () {
        function CellPlaceholderDirective($compile, gridConfiguration) {
            this.$compile = $compile;
            this.gridConfiguration = gridConfiguration;
            this.restrict = 'A';
            this.require = [TrNgGrid.Constants.cellPlaceholderDirective, "^" + TrNgGrid.Constants.tableDirective];
            this.controller = [TrNgGrid.GridColumnController];
            this.transclude = "element";
        }
        CellPlaceholderDirective.prototype.compile = function ($templatedElement, $tAttrs) {
            var _this = this;
            return {
                pre: function ($scope, $instanceElement, $tAttrs, $controllers, $transcludeFn) {
                    $scope.gridColumnLayout.placeholder = $instanceElement;
                },
                post: function ($scope, $instanceElement, $tAttrs, $controllers, $transcludeFn) {
                    var columnSetupController = $controllers[0];
                    if ($scope.gridColumnLayout.isAutoGenerated) {
                        columnSetupController.prepareAutoGeneratedColumnScope($scope);
                        var isDestroyed = false;
                        var autoGeneratedCellInstance = null;
                        var setupAutoGeneratedCell = function () {
                            if (autoGeneratedCellInstance) {
                                _this.gridConfiguration.debugMode && TrNgGrid.log("Removing auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                autoGeneratedCellInstance.remove();
                                autoGeneratedCellInstance = null;
                            }
                            if ($scope.gridColumnLayout && $scope.gridColumnOptions) {
                                _this.gridConfiguration.debugMode && TrNgGrid.log("Creating auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                var autoGeneratedCellTemplate = TrNgGrid.getStandardCellTemplate(_this.gridConfiguration, $scope.gridLayoutSection.gridSectionType);
                                autoGeneratedCellTemplate.append(TrNgGrid.getStandardCellContentsTemplate(_this.gridConfiguration, $scope.gridLayoutSection.gridSectionType));
                                $instanceElement.after(autoGeneratedCellTemplate);
                                autoGeneratedCellInstance = _this.$compile(autoGeneratedCellTemplate)($scope);
                            }
                        };
                        $scope.$watchGroup(["gridColumnLayout", "gridColumnOptions"], function (newValues) {
                            setupAutoGeneratedCell();
                        });
                        $scope.$on("$destroy", function () {
                            debugger;
                            isDestroyed = true;
                            setupAutoGeneratedCell();
                            $scope.gridColumnLayout.placeholder = null;
                        });
                    }
                }
            };
        };
        return CellPlaceholderDirective;
    })();
    var CellDirective = (function () {
        function CellDirective($compile, gridConfiguration) {
            this.$compile = $compile;
            this.gridConfiguration = gridConfiguration;
            this.restrict = 'A';
            this.require = [TrNgGrid.Constants.cellDirective, "^" + TrNgGrid.Constants.tableDirective];
            this.controller = [TrNgGrid.GridColumnController];
            this.scope = {
                isCustomized: "@" + TrNgGrid.Constants.dataColumnIsCustomizedField,
                fieldName: "@",
                displayName: "@",
                displayAlign: "@",
                displayFormat: "@",
                enableSorting: "@",
                enableFiltering: "@",
                cellWidth: "@",
                cellHeight: "@",
                filter: "@",
                colspan: "@"
            };
            this.transclude = 'element';
            this.replace = true;
            this.template = '<td style="display:none"></td>';
        }
        CellDirective.prototype.compile = function ($templateElement, $tAttrs) {
            var _this = this;
            return {
                pre: function ($settingsScope, $instanceElement, $tAttrs, $controllers, $transcludeFn) {
                },
                post: function ($settingsScope, $instanceElement, $tAttrs, $controllers, $transcludeFn) {
                    var columnSetupController = $controllers[0];
                    var gridColumnScope = $settingsScope.$parent.$new();
                    columnSetupController.prepareColumnSettingsScope(gridColumnScope, $settingsScope);
                    var transcludedCellElement = null;
                    var isDestroyed = false;
                    var setupTranscludedElement = function () {
                        if (transcludedCellElement) {
                            _this.gridConfiguration.debugMode && TrNgGrid.log("Removing tanscluded cell for field " + gridColumnScope.gridColumnLayout.fieldName);
                            transcludedCellElement.remove();
                            transcludedCellElement = null;
                        }
                        if (!isDestroyed && gridColumnScope.gridColumnLayout && gridColumnScope.gridColumnLayout.placeholder && gridColumnScope.gridColumnOptions) {
                            _this.gridConfiguration.debugMode && TrNgGrid.log("Transcluding and attaching cell for field " + gridColumnScope.gridColumnLayout.fieldName);
                            console.log($instanceElement);
                            $transcludeFn(gridColumnScope, function (newTranscludedCellElement) {
                                transcludedCellElement = newTranscludedCellElement;
                                gridColumnScope.gridColumnLayout.placeholder.after(transcludedCellElement);
                                if (!gridColumnScope.gridColumnLayout.isCustomized) {
                                    var standardCellContentsTemplate = angular.element(TrNgGrid.getStandardCellContentsTemplate(_this.gridConfiguration, gridColumnScope.gridLayoutSection.gridSectionType));
                                    transcludedCellElement.append(standardCellContentsTemplate);
                                    _this.$compile(standardCellContentsTemplate)(gridColumnScope);
                                }
                            });
                        }
                    };
                    gridColumnScope.$watchGroup(["gridColumnLayout", "gridColumnOptions", "gridColumnLayout.placeholder"], function (newValues) {
                        setupTranscludedElement();
                    });
                    gridColumnScope.$on("$destroy", function () {
                        debugger;
                        isDestroyed = true;
                        setupTranscludedElement();
                    });
                }
            };
        };
        return CellDirective;
    })();
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.tableDirective, [
        TrNgGrid.Constants.gridConfigurationService,
        function (gridConfiguration) { return new TableDirective(gridConfiguration); }
    ]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.sectionDirective, [
        TrNgGrid.Constants.gridConfigurationService,
        function (gridConfiguration) { return new SectionDirective(gridConfiguration); }
    ]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.rowDirective, [function () { return new RowDirective(); }]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.cellPlaceholderDirective, [
        "$compile",
        TrNgGrid.Constants.gridConfigurationService,
        function ($compile, gridConfiguration) { return new CellPlaceholderDirective($compile, gridConfiguration); }
    ]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.cellDirective, ["$compile", TrNgGrid.Constants.gridConfigurationService, function ($compile, gridConfiguration) { return new CellDirective($compile, gridConfiguration); }]);
})(TrNgGrid || (TrNgGrid = {}));
