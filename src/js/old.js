.directive(cellHeaderDirective, [
    gridConfigurationService,
    (gridConfiguration: IGridConfiguration) => {
        var setupColumnTitle = (scope: IGridHeaderColumnScope) => {
            if (scope.columnOptions.displayName) {
                scope.columnTitle = scope.columnOptions.displayName;
    }
else {
                        if (!scope.columnOptions.fieldName) {
                            scope.columnTitle = "[Invalid Field Name]";
                        }
else {
// exclude nested notations
                            var splitFieldName = scope.columnOptions.fieldName.match(/^[^\.\[\]]*/);

// split by camel-casing
splitFieldName = splitFieldName[0].split(/(?=[A-Z])/);
if (splitFieldName.length && splitFieldName[0].length) {
    splitFieldName[0] = splitFieldName[0][0].toLocaleUpperCase() + splitFieldName[0].substr(1);
}
scope.columnTitle = splitFieldName.join(" ");
}
}
};

return {
    restrict: 'A',
    require: '^' + tableDirective,
    scope: {
        fieldName: '@',
        cellWidth: '@',
        cellHeight: '@',
        displayAlign: '@',
        displayFormat: '@',
        displayName: '@',
        filter: '@',
        enableFiltering: '@',
        enableSorting: '@',
        colspan: '@'
    },
    transclude: true,
    compile(templateElement: ng.IAugmentedJQuery) {
        var isCustomized = false;
wrapTemplatedCell(templateElement, cellHeaderTemplateDirectiveAttribute);

return {
    pre: (isolatedScope: IGridHeaderColumnOptionsScope, instanceElement: ng.IAugmentedJQuery, tAttrs: ng.IAttributes, controller: GridController, $transclude: ng.ITranscludeFunction) => {
        // we need a field name
        var fieldName = isolatedScope.fieldName;
if (!fieldName) {
    isolatedScope.fieldName = fieldName = nonItemFieldNameFormat + findChildIndex(instanceElement);
}

controller.columnOptions(fieldName, isolatedScope);
isolatedScope.$on("$destroy", () => controller.removeColumnOptions(fieldName));
// we're not interested in creating an isolated scope just to parse the element attributes,
// so we're gonna have to do this manually

//var columnIndex = parseInt(tAttrs[cellHeaderDirective]);

//// create a clone of the default column options
//var columnOptions: IGridColumnOptions = angular.extend(scope.gridOptions.gridColumnDefs[columnIndex], gridConfiguration.defaultColumnOptions);

//// now match and observe the attributes
//controller.linkAttrs(tAttrs, columnOptions);

//// set up the new scope
//scope.columnOptions = columnOptions;
//scope.isCustomized = isCustomized;
//scope.toggleSorting = (propertyName: string) => {
//    controller.toggleSorting(propertyName);
//};

//// set up the column title
//setupColumnTitle(scope);

//scope.$watch("columnOptions.filter", (newValue: string, oldValue: string) => {
//    if (newValue !== oldValue) {
//        controller.setFilter(columnOptions.fieldName, newValue);
//    }
//});
}
}
}
};
}
])
        .directive(cellHeaderTemplateDirective, [
            gridConfigurationService,
            (gridConfiguration: IGridConfiguration) => {
                return {
                    restrict: 'A',
                    template: gridConfiguration.templates.cellHeader,
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
                        scope.toggleItemSelection = (item: any, $event: ng.IAngularEvent) => {
                            controller.toggleItemSelection(scope.filteredItems, item, $event);
                    };
                    }
                }
            }
};
}
])
        .directive(cellBodyDirective, [
            () => {
                return {
                    restrict: 'A',
                    require: '^' + tableDirective,
                    scope: true,
                    compile: (templateElement: JQuery, tAttrs: Object) => {
                        var isCustomized = false;
                        wrapTemplatedCell(templateElement, cellBodyTemplateDirectiveAttribute);

                        return {
                            pre: (scope: IGridBodyColumnScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController, $transclude: ng.ITranscludeFunction) => {
                                scope.columnOptions = scope.gridOptions.gridColumnDefs[parseInt(tAttrs[cellBodyDirective])];
                        scope.gridItem = scope.gridDisplayItem.$$_gridItem;
                        scope.isCustomized = isCustomized;
                    }
};
}
};
}
])
        .directive(cellBodyTemplateDirective, [
            gridConfigurationService,
            (gridConfiguration: IGridConfiguration) => {
                return {
                    restrict: 'A',
                    template: gridConfiguration.templates.cellBody,
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
                var isCustomized = false;
                wrapTemplatedCell(templateElement, cellFooterTemplateDirectiveAttribute);

                return {
                    pre: (scope: IGridFooterScope, instanceElement: JQuery, tAttrs: ng.IAttributes, controller: GridController, $transclude: ng.ITranscludeFunction) => {
                        scope.isCustomized = isCustomized;
                instanceElement.attr("colspan", scope.gridOptions.gridColumnDefs.length);
            }
};
}
};
}
])
        .directive(cellFooterTemplateDirective, [
            gridConfigurationService,
            (gridConfiguration: IGridConfiguration) => {
                return {
                    restrict: 'A',
                    template: gridConfiguration.templates.cellFooter,
                    transclude: true,
                    replace: true
                };
            }
])
.directive(columnSortDirective, [
    gridConfigurationService,
    (gridConfiguration: IGridConfiguration) => {
        return {
            restrict: 'A',
            replace: true,
            template: gridConfiguration.templates.columnSort
        };
    }
])
.directive(columnFilterDirective, [
    gridConfigurationService,
    (gridConfiguration: IGridConfiguration) => {
        return {
            restrict: 'A',
            replace: true,
            template: gridConfiguration.templates.columnFilter
        };
    }
])
.directive(globalFilterDirective, [
    gridConfigurationService,
    (gridConfiguration: IGridConfiguration) => {
        return {
            restrict: 'A',
            scope: false,
            template: gridConfiguration.templates.footerGlobalFilter
        };
    }
])
.directive(pagerDirective, [
    gridConfigurationService,
    (gridConfiguration: IGridConfiguration) => {
        var setupScope = (scope: IGridFooterScope, controller: GridController) => {

            // do not set scope.gridOptions.totalItems, it might be set from the outside
            scope.totalItemsCount = (typeof (scope.gridOptions.totalItems) != "undefined" && scope.gridOptions.totalItems != null)
            ? scope.gridOptions.totalItems
            : (scope.gridOptions.items ? scope.gridOptions.items.length : 0);

            scope.isPaged = (!!scope.gridOptions.pageItems) && (scope.gridOptions.pageItems < scope.totalItemsCount);
            scope.lastPage = (!scope.totalItemsCount || !scope.isPaged)
            ? 0
            : (Math.floor(scope.totalItemsCount / scope.gridOptions.pageItems) + ((scope.totalItemsCount % scope.gridOptions.pageItems) ? 0 : -1));
            if (scope.gridOptions.currentPage > scope.lastPage) {
                // this will unfortunately trigger another query if in server side data query mode
                scope.gridOptions.currentPage = scope.lastPage;
            }

            scope.visibleStartItemIndex = scope.isPaged ? (scope.gridOptions.pageItems * scope.gridOptions.currentPage) : 0;
            scope.visibleEndItemIndex = scope.isPaged ? (scope.visibleStartItemIndex + scope.gridOptions.pageItems - 1) : scope.totalItemsCount - 1;
            if (scope.visibleEndItemIndex >= scope.totalItemsCount) {
                scope.visibleEndItemIndex = scope.totalItemsCount - 1;
            }
            if (scope.visibleEndItemIndex < scope.visibleStartItemIndex) {
                scope.visibleEndItemIndex = scope.visibleStartItemIndex;
            }

            var pageIndexHalfRange = Math.floor(gridConfiguration.pagerOptions.minifiedPageCountThreshold / 2);
            var lowPageIndex = scope.gridOptions.currentPage - pageIndexHalfRange;
            var highPageIndex = scope.gridOptions.currentPage + pageIndexHalfRange;

            // stick the range to either the low end or high end
            if (lowPageIndex < 0) {
                highPageIndex += -lowPageIndex;
                lowPageIndex = 0;
            }
            else if (highPageIndex > scope.lastPage) {
                lowPageIndex -= highPageIndex - scope.lastPage;
                highPageIndex = scope.lastPage;
            }

            // final fix for the range
            if (lowPageIndex < 0)
                lowPageIndex = 0;
            if (highPageIndex > scope.lastPage)
                highPageIndex = scope.lastPage;

            // give the bindings a bit of help by providing the list of page indexes
            if (!scope.visiblePageRange
                || scope.visiblePageRange.length !== (highPageIndex - lowPageIndex + 1)
                || scope.visiblePageRange[0] !== lowPageIndex
                || scope.visiblePageRange[scope.visiblePageRange.length - 1] !== highPageIndex) {

                scope.visiblePageRange = [];
                for (var currentPageIndex = lowPageIndex; currentPageIndex <= highPageIndex; currentPageIndex++) {
                    scope.visiblePageRange.push(currentPageIndex);
                }
            }

            scope.pageRangeFullCoverage = scope.visiblePageRange.length > scope.lastPage;

            scope.navigateToPage = (pageIndex) => {
                scope.gridOptions.currentPage = pageIndex;
            scope.speedUpAsyncDataRetrieval();
            /*$event.preventDefault();
            $event.stopPropagation();*/
        }

        //scope.switchPageSelection = ($event, pageSelectionActive) => {
        //    scope.pageSelectionActive = pageSelectionActive;
        //    if ($event) {
        //        $event.preventDefault();
        //        $event.stopPropagation();
        //    }
        //}
    };

//ng - model = "gridOptions.currentPage" 

return {
    restrict: 'A',
    scope: true,
    require: '^' + tableDirective,
    template: gridConfiguration.templates.footerPager,
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

linkScope(internalScope: ng.IScope, externalScope: ng.IScope, scopeTargetIdentifier: string, attrs: ng.IAttributes) {
    // this method shouldn't even be here
    // but it is because we want to allow people to either set attributes with either a constant or a watchable variable

    // watch for a resolution to issue #5951 on angular
    // https://github.com/angular/angular.js/issues/5951

    var target = internalScope[scopeTargetIdentifier];

    for (var propName in target) {
        var attributeExists = typeof (attrs[propName]) != "undefined" && attrs[propName] != null;

        if (attributeExists) {
            var isArray = false;

            // initialise from the scope first
            if (typeof (externalScope[propName]) != "undefined" && externalScope[propName] != null) {
                target[propName] = externalScope[propName];
                isArray = target[propName] instanceof Array;
            }

            //allow arrays to be changed: if(!isArray){
            var compiledAttrGetter: ng.ICompiledExpression = null;
            try {
                compiledAttrGetter = this.$parse(attrs[propName]);
            }
            catch (ex) {
                // angular fails to parse literal bindings '@', thanks angular team
            }
            ((propName: string, compiledAttrGetter: ng.ICompiledExpression) => {
                if (!compiledAttrGetter || !compiledAttrGetter.constant) {
                    // watch for a change in value and set it on our internal scope
                    externalScope.$watch(propName, (newValue: any, oldValue: any) => {
                        // debugMode && this.log("Property '" + propName + "' changed on the external scope from " + oldValue + " to " + newValue + ". Mirroring the parameter's value on the grid's internal scope.");
                        target[propName] = newValue;
                    });
                }

                var compiledAttrSetter: (context: any, value: any) => any = (compiledAttrGetter && compiledAttrGetter.assign) ? compiledAttrGetter.assign : null;
                if (compiledAttrSetter) {
                    // a setter exists for the property, which means it's safe to mirror the internal prop on the external scope
                    internalScope.$watch(scopeTargetIdentifier + "." + propName, (newValue: any, oldValue: any) => {
                        try {
                            // debugMode && this.log("Property '" + propName + "' changed on the internal scope from " + oldValue + " to " + newValue + ". Mirroring the parameter's value on the external scope.");
                            externalScope[propName] = newValue;
                            // Update: Don't do this, as you'll never hit the real scope the property was defined on
                            // compiledAttrSetter(externalScope, newValue);
                        }
                        catch (ex) {
                            if (this.gridConfiguration.debugMode) {
                                log("Mirroring the property on the external scope failed with " + ex);
                                throw ex;
                            }
                        }
                    });
                }
            })(propName, compiledAttrGetter);
        }
    }
}