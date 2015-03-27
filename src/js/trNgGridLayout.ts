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
        controller = ["$compile", "$parse", "$timeout", Constants.gridConfigurationService, Constants.gridLoggingService, GridController];

        constructor(private gridConfiguration: IGridConfiguration, private loggingService:LoggingService) {    
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
            tableBodyElement.attr(Constants.sectionDirectiveAttribute, "");

            // any other elements are not allowed
            angular.forEach(gridElement.children, (element: HTMLElement) => {
                if (element !== tableHeaderElement[0] || element !== tableBodyElement[0] || element !== tableFooterElement[0]) {
                    angular.element(element).remove();
                    this.gridConfiguration.debugMode && this.loggingService.log("Invalid extra element found inside the grid template structure: ", element);
                }
            });
        }

        compile(templateElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes) {
            // fix & add a couple of elements & directives
            this.fixTableStructure(templateElement);
            templateElement.addClass(this.gridConfiguration.styles.tableCssClass);

            return {
                pre: (isolatedScope: IGridOptions, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, controller: GridController, transcludeFn: ng.ITranscludeFunction) => {
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

        private fixGridSection(sectionElement: ng.IAugmentedJQuery, sectionType: GridSectionType) {
            var rowElement: ng.IAugmentedJQuery;
            var rowElements = findChildrenByTagName(sectionElement, "tr");
            if (!rowElements.length) {
                sectionElement.empty();
                rowElement = createRowElement();
                sectionElement.append(rowElement);
                rowElements.push(rowElement);
            }

            var cellTagName = sectionType === GridSectionType.Header ? "th" : "td";
            var standardCellTemplate = getStandardCellTemplate(this.gridConfiguration, sectionType);

            for (var rowIndex = 0; rowIndex < rowElements.length; rowIndex++) {
                rowElement = rowElements[rowIndex];

                if (sectionType === GridSectionType.Body) {
                    if (rowIndex === 0 && rowElements.length > 1) {
                        rowElement.attr("data-ng-repeat-start", "gridDisplayItem in gridDisplayItems");
                    }
                    else if (rowIndex === rowElements.length - 1) {
                        if (rowElements.length > 1) {
                            rowElement.attr("data-ng-repeat-end", "");
                        }
                        else {
                            rowElement.attr("data-ng-repeat", "gridDisplayItem in gridDisplayItems");
                        }
                    }
                }

                rowElement.attr(Constants.rowDirectiveAttribute, "");

                var cellElements = findChildrenByTagName(rowElement, cellTagName);

                // ensure the placeholder elements are there
                if (cellElements.length === 0 || !cellElements[0].attr(Constants.cellPlaceholderDirectiveAttribute)) {
                    var placeholderTemplate = standardCellTemplate;
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

                    cellElement.attr(Constants.cellDirectiveAttribute, "true");
                }
            }
        }

        compile(templateElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes){
            // fix the rows inside the section
            var sectionType: GridSectionType;
            var sectionTagName = templateElement.prop("tagName"); 
            switch (sectionTagName) {
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
                    throw "The section element "+sectionTagName+" is not recognized as a valid TABLE element";
            }
            this.fixGridSection(templateElement, sectionType);
            return {
                pre: (scope: IGridSectionScope, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, gridController: GridController, transcludeFn: ng.ITranscludeFunction) => {
                    scope.grid = gridController;
                    scope.gridOptions = gridController.gridOptions;
                    scope.gridLayoutSection = gridController.gridLayout.getSection(sectionType);
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
            return {
                pre: ($scope: IGridRowScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controller: GridController, $transcludeFn: ng.ITranscludeFunction) => {
                    $scope.gridLayoutRow = $scope.gridLayoutSection.registerRow();
                    $scope.$on("$destroy",() => {
                        debugger;
                        $scope.gridLayoutSection.unregisterRow($scope.gridLayoutRow);
                    });
                },
                post: ($scope: IGridRowScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controller: GridController, $transcludeFn: ng.ITranscludeFunction) => {
                }
            }
        }   
    }

    export interface IGridColumnScope extends IGridRowScope {
        gridColumnOptions: IGridColumnOptions;
        gridColumnLayout: IGridColumnLayoutOptions;
    }

    class CellPlaceholderDirective implements ng.IDirective {
        restrict= 'A';
        require = [Constants.cellPlaceholderDirective, "^" + Constants.tableDirective];
        controller = [GridColumnController];
        transclude = "element";

        constructor(private $compile: ng.ICompileService, private gridConfiguration: IGridConfiguration, private loggingService:LoggingService) {
        }

        compile($templatedElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes) {
            return {
                pre:($scope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) => {
                    $scope.gridColumnLayout.placeholder = $instanceElement;

                    var columnSetupController: GridColumnController = $controllers[0];
                    if ($scope.gridColumnLayout.isAutoGenerated) {
                        columnSetupController.prepareAutoGeneratedColumnScope($scope);

                        var isDestroyed = false;
                        var autoGeneratedCellInstance: ng.IAugmentedJQuery = null;

                        var setupAutoGeneratedCell = () => {
                            if (autoGeneratedCellInstance) {
                                this.gridConfiguration.debugMode && this.loggingService.log("Removing auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                autoGeneratedCellInstance.remove();
                                autoGeneratedCellInstance = null;
                            }

                            if ($scope.gridColumnLayout && $scope.gridColumnOptions) {
                                this.gridConfiguration.debugMode && this.loggingService.log("Creating auto-generated cell for field " + $scope.gridColumnLayout.fieldName);
                                var autoGeneratedCellTemplate = getStandardCellTemplate(this.gridConfiguration, $scope.gridLayoutSection.gridSectionType);
                                autoGeneratedCellTemplate.append(getStandardCellContentsTemplate(this.gridConfiguration, $scope.gridLayoutSection.gridSectionType));
                                $instanceElement.after(autoGeneratedCellTemplate);
                                autoGeneratedCellInstance = this.$compile(autoGeneratedCellTemplate)($scope);
                            }
                        }

                        $scope.$watchGroup(["gridColumnLayout", "gridColumnOptions"],(newValues: Array<any>) => {
                            setupAutoGeneratedCell();
                        });

                        $scope.$on("$destroy",() => {
                            debugger;
                            isDestroyed = true;
                            setupAutoGeneratedCell();
                            $scope.gridColumnLayout.placeholder = null;
                        });
                    }
                },
                post: ($scope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) => {
                }
            };
        }        
    }

    class CellDirective implements ng.IDirective {
        restrict =  'A';
        require = [Constants.cellDirective, "^" + Constants.tableDirective];
        controller = [GridColumnController];
        scope = {
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
        };
        transclude = 'element';
        
        // the next few lines are idiotic, but otherwise we hit this stupid bug: https://github.com/angular/angular.js/issues/11304
        replace = true;
        template = '<td style="display:none"></td>'; // fix for earlier versions of angular

        constructor(private $compile: ng.ICompileService, private gridConfiguration: IGridConfiguration, private loggingService:LoggingService) {            
        }

        compile($templateElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes) {
            var gridColumnScope: IGridColumnScope;

            return {
                pre: ($settingsScope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) => {
                    var columnSetupController: GridColumnController = $controllers[0];
                    gridColumnScope = <IGridColumnScope>$settingsScope.$parent.$new();
                    columnSetupController.prepareColumnSettingsScope(gridColumnScope, $settingsScope);
                },
                post: ($settingsScope: IGridColumnScope, $instanceElement: ng.IAugmentedJQuery, $tAttrs: ng.IAttributes, $controllers: Array<any>, $transcludeFn: ng.ITranscludeFunction) => {
                    var transcludedCellElement: ng.IAugmentedJQuery = null;
                    var isDestroyed = false;

                    var setupTranscludedElement = () => {
                        if (transcludedCellElement) {
                            this.gridConfiguration.debugMode && this.loggingService.log("Removing tanscluded cell for field ", gridColumnScope.gridColumnLayout.fieldName);
                            transcludedCellElement.remove();
                            transcludedCellElement = null;
                        }

                        if (!isDestroyed && gridColumnScope.gridColumnLayout && gridColumnScope.gridColumnLayout.placeholder && gridColumnScope.gridColumnOptions) {
                            this.gridConfiguration.debugMode && this.loggingService.log("Transcluding and attaching cell for field ", gridColumnScope.gridColumnLayout.fieldName);

                            // link the element with the placeholder
                            $transcludeFn(gridColumnScope,(newTranscludedCellElement: ng.IAugmentedJQuery) => {
                                transcludedCellElement = newTranscludedCellElement;
                                gridColumnScope.gridColumnLayout.placeholder.after(transcludedCellElement);

                                if (!gridColumnScope.gridColumnLayout.isCustomized) {
                                    // add the standard cell contents as well
                                    var standardCellContentsTemplate = angular.element(getStandardCellContentsTemplate(this.gridConfiguration, gridColumnScope.gridLayoutSection.gridSectionType));
                                    transcludedCellElement.append(standardCellContentsTemplate);
                                    this.$compile(standardCellContentsTemplate)(gridColumnScope);
                                }
                            });
                        }
                    };

                    gridColumnScope.$watchGroup(["gridColumnLayout", "gridColumnOptions", "gridColumnLayout.placeholder"],(newValues: Array<any>) => {
                        setupTranscludedElement();
                    });

                    $settingsScope.$on("$destroy",() => {
                        debugger;
                        isDestroyed = true;
                        setupTranscludedElement();
                        gridColumnScope.$destroy();
                    });
                }
            };
        }
    }

    gridModule.directive(Constants.tableDirective, [
        Constants.gridConfigurationService, Constants.gridLoggingService,
        (gridConfiguration:IGridConfiguration, loggingService:LoggingService) => new TableDirective(gridConfiguration, loggingService)]);
    gridModule.directive(Constants.sectionDirective, [
        Constants.gridConfigurationService,
        (gridConfiguration:IGridConfiguration) => new SectionDirective(gridConfiguration)]);
    gridModule.directive(Constants.rowDirective, [() => new RowDirective()]);
    gridModule.directive(Constants.cellPlaceholderDirective, [
        "$compile", Constants.gridConfigurationService, Constants.gridLoggingService,
        ($compile: ng.ICompileService, gridConfiguration: IGridConfiguration, loggingService:LoggingService) => new CellPlaceholderDirective($compile, gridConfiguration, loggingService)
    ]);
    gridModule.directive(Constants.cellDirective, [
        "$compile", Constants.gridConfigurationService, Constants.gridLoggingService,
        ($compile: ng.ICompileService, gridConfiguration: IGridConfiguration, loggingService:LoggingService) => new CellDirective($compile, gridConfiguration, loggingService)]);
}