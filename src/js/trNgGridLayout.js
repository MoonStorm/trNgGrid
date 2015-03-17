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
        SectionDirective.prototype.fixGridSection = function (sectionElement, cellTagName, standardCellTemplate) {
            var rowElement;
            var rowElements = TrNgGrid.findChildrenByTagName(sectionElement, "tr");
            if (!rowElements.length) {
                sectionElement.empty();
                rowElement = TrNgGrid.createRowElement();
                sectionElement.append(rowElement);
                rowElements.push(rowElement);
            }
            for (var rowIndex = 0; rowIndex < rowElements.length; rowIndex++) {
                rowElement = rowElements[rowIndex];
                rowElement.attr(TrNgGrid.Constants.rowDirectiveAttribute, "");
                var cellElements = TrNgGrid.findChildrenByTagName(rowElement, cellTagName);
                if (cellElements.length === 0 || !cellElements[0].attr(TrNgGrid.Constants.cellPlaceholderDirectiveAttribute)) {
                    var placeholderTemplate = angular.element(standardCellTemplate);
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
            debugger;
            this.fixGridSection(templateElement, "th", this.gridConfiguration.templates.headerCellStandard);
            return {
                pre: function (scope, instanceElement, tAttrs, gridController, transcludeFn) {
                    scope.grid = gridController;
                    scope.gridOptions = gridController.gridOptions;
                    scope.gridLayoutSection = gridController.gridLayout.getSection(TrNgGrid.GridSectionType.Header);
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
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.tableDirective, [
        TrNgGrid.Constants.gridConfigurationService,
        function (gridConfiguration) { return new TableDirective(gridConfiguration); }
    ]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.sectionDirective, [
        TrNgGrid.Constants.gridConfigurationService,
        function (gridConfiguration) { return new SectionDirective(gridConfiguration); }
    ]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.rowDirective, [function () { return new RowDirective(); }]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.cellPlaceholderDirective, ["$compile", "$interpolate", TrNgGrid.Constants.gridConfigurationService, function ($compile, $interpolate, gridConfiguration) {
        return {
            restrict: 'A',
            require: [TrNgGrid.Constants.cellPlaceholderDirective, "^" + TrNgGrid.Constants.tableDirective],
            controller: [TrNgGrid.GridColumnController],
            transclude: "element",
            compile: function ($templatedElement, $tAttrs) {
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
                                    gridConfiguration.debugMode && TrNgGrid.log("Removing auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                    autoGeneratedCellInstance.remove();
                                    autoGeneratedCellInstance = null;
                                }
                                if ($scope.gridColumnLayout && $scope.gridColumnOptions) {
                                    gridConfiguration.debugMode && TrNgGrid.log("Creating auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                    var autoGeneratedCellTemplate = angular.element(gridConfiguration.templates.headerCellStandard);
                                    autoGeneratedCellTemplate.append(angular.element(gridConfiguration.templates.headerCellContentsStandard));
                                    $instanceElement.after(autoGeneratedCellTemplate);
                                    autoGeneratedCellInstance = $compile(autoGeneratedCellTemplate)($scope);
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
            }
        };
    }]);
    TrNgGrid.gridModule.directive(TrNgGrid.Constants.cellDirective, ["$compile", TrNgGrid.Constants.gridConfigurationService, function ($compile, gridConfiguration) {
        return {
            restrict: 'A',
            require: [TrNgGrid.Constants.cellDirective, "^" + TrNgGrid.Constants.tableDirective],
            controller: [TrNgGrid.GridColumnController],
            scope: {
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
            },
            transclude: 'element',
            replace: true,
            template: '<td style="display:none"></td>',
            compile: function ($templateElement, $tAttrs) {
                return {
                    pre: function ($settingsScope, $instanceElement, $tAttrs, $controllers, $transcludeFn) {
                    },
                    post: function ($settingsScope, $instanceElement, $tAttrs, $controllers, $transcludeFn) {
                        var columnSetupController = $controllers[0];
                        var gridColumnScope = $settingsScope.$parent.$new();
                        debugger;
                        columnSetupController.prepareColumnSettingsScope(gridColumnScope, $settingsScope);
                        var transcludedCellElement = null;
                        var isDestroyed = false;
                        var setupTranscludedElement = function () {
                            if (transcludedCellElement) {
                                gridConfiguration.debugMode && TrNgGrid.log("Removing tanscluded cell for field " + gridColumnScope.gridColumnLayout.fieldName);
                                transcludedCellElement.remove();
                                transcludedCellElement = null;
                            }
                            if (!isDestroyed && gridColumnScope.gridColumnLayout && gridColumnScope.gridColumnLayout.placeholder && gridColumnScope.gridColumnOptions) {
                                gridConfiguration.debugMode && TrNgGrid.log("Transcluding and attaching cell for field " + gridColumnScope.gridColumnLayout.fieldName);
                                console.log($instanceElement);
                                debugger;
                                $transcludeFn(gridColumnScope, function (newTranscludedCellElement) {
                                    debugger;
                                    transcludedCellElement = newTranscludedCellElement;
                                    gridColumnScope.gridColumnLayout.placeholder.after(transcludedCellElement);
                                    if (!gridColumnScope.gridColumnLayout.isCustomized) {
                                        var standardCellContentsTemplate = angular.element(gridConfiguration.templates.headerCellContentsStandard);
                                        transcludedCellElement.append(standardCellContentsTemplate);
                                        $compile(standardCellContentsTemplate)(gridColumnScope);
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
            }
        };
    }]);
})(TrNgGrid || (TrNgGrid = {}));
