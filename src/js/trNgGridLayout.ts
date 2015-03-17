module TrNgGrid {
    class TableDirective implements ng.IDirective {
        restrict = 'A';
        scope = {
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
        controller = ["$compile", "$parse", "$timeout", Constants.gridConfigurationService, GridController];

        constructor(private gridConfiguration: IGridConfiguration) {    
        }

        private fixTableStructure(gridElement: ng.IAugmentedJQuery) {

            // make sure the header is present
            var tableHeaderElement = findChildByTagName(gridElement, "thead");
            if (!tableHeaderElement) {
                tableHeaderElement = findChildByTagName(angular.element("<table><thead></thead></table"), "thead");
                gridElement.prepend(tableHeaderElement);
            }
            tableHeaderElement.attr(Constants.sectionDirectiveAttribute, "");

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
            angular.forEach(gridElement.children, (element: HTMLElement) => {
                if (element !== tableHeaderElement[0] || element !== tableBodyElement[0] || element !== tableFooterElement[0]) {
                    angular.element(element).remove();
                    this.gridConfiguration.debugMode && log("Invalid extra element found inside the grid template structure: " + element.tagName);
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

        compile(templateElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes) {
            // fix & add a couple of elements & directives
            this.fixTableStructure(templateElement);

            return {
                pre(isolatedScope: IGridOptions, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, controller: GridController, transcludeFn: ng.ITranscludeFunction) {
                    controller.setGridOptions(isolatedScope);
                }
            };
        }
    }

    export interface IGridSectionScope extends ng.IScope {
        grid: GridController;
        gridOptions: IGridOptions;
        gridLayoutSection: GridLayoutSection;
    }

    class SectionDirective implements ng.IDirective {
        restrict:string = 'A';
        scope = true;
        require = "^" + Constants.tableDirective;

        constructor(private gridConfiguration: IGridConfiguration) {
        }

        private fixGridSection(sectionElement: ng.IAugmentedJQuery, cellTagName: string, standardCellTemplate: string) {
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
                rowElement.attr(Constants.rowDirectiveAttribute, "");

                var cellElements = findChildrenByTagName(rowElement, cellTagName);

                // ensure the placeholder elements are there
                if (cellElements.length === 0 || !cellElements[0].attr(Constants.cellPlaceholderDirectiveAttribute)) {
                    var placeholderTemplate = angular.element(standardCellTemplate);
                    placeholderTemplate.attr("data-ng-repeat", "gridColumnLayout in (gridLayoutRow.cells)");
                    //placeholderTemplate.attr("data-ng-if", "!gridColumnLayout.isDeactivated");
                    placeholderTemplate.attr(Constants.cellPlaceholderDirectiveAttribute, "");

                    rowElement.prepend(placeholderTemplate);
                }

                // ensure the cells have got the right attribute 
                for (var cellIndex = 0; cellIndex < cellElements.length; cellIndex++) {
                    var cellElement = cellElements[cellIndex];

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
                }
            }
        }

        compile(templateElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes){
            // fix the rows inside the section
            var sectionType: GridSectionType;
            var sectionTagName = templateElement.prop("tagName"); 
            switch () {
                case "THEAD":
                    sectionType = GridSectionType.Header;
                    break;
                case "TBODY":
                    sectionType = GridSectionType.Body;
                    break;
                case "TFOOT":
                    sectionType = GridSectionType.Footer;
                    break;
                default:
                    throw "The element is not ;

            }
            debugger;
            this.fixGridSection(templateElement, "th", this.gridConfiguration.templates.headerCellStandard);
            return {
                pre(scope: IGridSectionScope, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, gridController: GridController, transcludeFn: ng.ITranscludeFunction) {
                    scope.grid = gridController;
                    scope.gridOptions = gridController.gridOptions;
                    scope.gridLayoutSection = gridController.gridLayout.getSection(GridSectionType.Header);
                }                
            };
        }
    }

    export interface IGridRowScope extends IGridSectionScope {
        gridLayoutRow: GridLayoutRow;
    }
     
    class RowDirective implements ng.IDirective {
        restrict = 'A';
        scope = true;
        require = "^" + Constants.tableDirective;

        compile($templateElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes) {
            // compile a standard cell and a placeholder
            return {
                pre($scope: IGridRowScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controller: GridController, $transcludeFn: ng.ITranscludeFunction) {
                    $scope.gridLayoutRow = $scope.gridLayoutSection.registerRow();
                    $scope.$on("$destroy",() => {
                        debugger;
                        $scope.gridLayoutSection.unregisterRow($scope.gridLayoutRow);
                    });

                    //$scope.$watch("gridLayoutRow.cells", (newValue: any, oldValue: any) => {
                    //    debugger;
                    //});
                },
                post($scope: IGridRowScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controller: GridController, $transcludeFn: ng.ITranscludeFunction) {
                }
            }
        }   
    }

    export interface IGridColumnScope extends IGridRowScope {
        gridColumnOptions: IGridColumnOptions;
        gridColumnLayout: IGridColumnLayoutOptions;
    }

    gridModule.directive(Constants.tableDirective, [
        Constants.gridConfigurationService,
        (gridConfiguration:IGridConfiguration) => new TableDirective(gridConfiguration)]);
    gridModule.directive(Constants.sectionDirective, [
        Constants.gridConfigurationService,
        (gridConfiguration:IGridConfiguration) => new SectionDirective(gridConfiguration)]);
    gridModule.directive(Constants.rowDirective, [() => new RowDirective()]);

    /*
     * Set up placeholders for the row
     */
    gridModule.directive(Constants.cellPlaceholderDirective, ["$compile", "$interpolate", Constants.gridConfigurationService,
        ($compile: ng.ICompileService, $interpolate:ng.IInterpolateService, gridConfiguration: IGridConfiguration) => {
            // prepare the auto-generated element
            //autoGeneratedCellTemplate.attr(Constants.headerCellDirectiveAttribute, "");
            //autoGeneratedCellTemplate.attr(Constants.dataColumnIsAutoGeneratedAttribute, "true");
            // autoGeneratedCellTemplate.attr("data-field-name", $interpolate.startSymbol() + "gridColumnLayout.fieldName" + $interpolate.endSymbol());

            return {
                restrict: 'A',
                require: [Constants.cellPlaceholderDirective, "^" + Constants.tableDirective],
                controller: [GridColumnController],
                transclude: "element",
                compile($templatedElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes) {
                    return {
                        pre($scope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) {
                            $scope.gridColumnLayout.placeholder = $instanceElement;
                        },
                        post($scope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) {
                            var columnSetupController: GridColumnController = $controllers[0];

                            if ($scope.gridColumnLayout.isAutoGenerated) {
                                columnSetupController.prepareAutoGeneratedColumnScope($scope);

                                var isDestroyed = false;
                                var autoGeneratedCellInstance: ng.IAugmentedJQuery = null;
                                
                                var setupAutoGeneratedCell = () => {
                                    if (autoGeneratedCellInstance) {
                                        gridConfiguration.debugMode && log("Removing auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                        autoGeneratedCellInstance.remove();
                                        autoGeneratedCellInstance = null;
                                    }

                                    if ($scope.gridColumnLayout && $scope.gridColumnOptions) {
                                        gridConfiguration.debugMode && log("Creating auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                        var autoGeneratedCellTemplate = angular.element(gridConfiguration.templates.headerCellStandard);
                                        autoGeneratedCellTemplate.append(angular.element(gridConfiguration.templates.headerCellContentsStandard));
                                        $instanceElement.after(autoGeneratedCellTemplate);
                                        autoGeneratedCellInstance = $compile(autoGeneratedCellTemplate)($scope);
                                    }
                                }

                                $scope.$watchGroup(["gridColumnLayout", "gridColumnOptions"],(newValues: Array<any>) => {
                                    setupAutoGeneratedCell();
                                });

                                $scope.$on("$destroy", () => {
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
        }
    ]);

    /*
     * Ensure the columns settings are extracted from the TH elements, and also ensure the scope is properly set.
     */
    gridModule.directive(Constants.cellDirective, ["$compile", Constants.gridConfigurationService,
        ($compile: ng.ICompileService, gridConfiguration: IGridConfiguration) => {
                return {
                    restrict: 'A',
                    require: [Constants.cellDirective, "^" + Constants.tableDirective],
                    controller: [GridColumnController],
                    scope:{
                        isCustomized: "@" + Constants.dataColumnIsCustomizedField,
                        // isAutoGenerated: "@" + Constants.dataColumnIsAutoGeneratedField, - optimized to be treated inside the placeholders

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
                    // the next few lines are idiotic, but otherwise we hit this stupid bug: https://github.com/angular/angular.js/issues/11304
                    transclude: 'element',
                    replace: true,
                    template: '<td style="display:none"></td>',
                    compile($templateElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes) {
                        return {
                            pre($settingsScope: ng.IScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) {
                            },
                            post($settingsScope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) {
                                var columnSetupController: GridColumnController = $controllers[0];
                                var gridColumnScope = <IGridColumnScope>$settingsScope.$parent.$new();
                                debugger;
                                columnSetupController.prepareColumnSettingsScope(gridColumnScope, $settingsScope);

                                var transcludedCellElement: ng.IAugmentedJQuery = null;
                                var isDestroyed = false;

                                var setupTranscludedElement = () => {
                                    if (transcludedCellElement) {
                                        gridConfiguration.debugMode && log("Removing tanscluded cell for field " + gridColumnScope.gridColumnLayout.fieldName);
                                        transcludedCellElement.remove();
                                        transcludedCellElement = null;
                                    }

                                    if (!isDestroyed && gridColumnScope.gridColumnLayout && gridColumnScope.gridColumnLayout.placeholder && gridColumnScope.gridColumnOptions) {
                                        gridConfiguration.debugMode && log("Transcluding and attaching cell for field " + gridColumnScope.gridColumnLayout.fieldName);
                                        console.log($instanceElement);

                                        // link the element with the placeholder
                                        debugger;
                                        $transcludeFn(gridColumnScope,(newTranscludedCellElement: ng.IAugmentedJQuery) => {
                                            debugger;
                                            transcludedCellElement = newTranscludedCellElement;
                                            gridColumnScope.gridColumnLayout.placeholder.after(transcludedCellElement);

                                            if (!gridColumnScope.gridColumnLayout.isCustomized) {
                                                // add the standard cell contents as well
                                                var standardCellContentsTemplate = angular.element(gridConfiguration.templates.headerCellContentsStandard);
                                                transcludedCellElement.append(standardCellContentsTemplate);
                                                $compile(standardCellContentsTemplate)(gridColumnScope);
                                            }
                                        });
                                    }
                                };

                                gridColumnScope.$watchGroup(["gridColumnLayout", "gridColumnOptions", "gridColumnLayout.placeholder"],(newValues: Array<any>) => {
                                    setupTranscludedElement();
                                });

                                gridColumnScope.$on("$destroy",() => {
                                    debugger;
                                    isDestroyed = true;
                                    setupTranscludedElement();
                                });
                            }
                        };
                    }
                };
            }
        ]);

}