/// <reference path="../../../typings/angularjs/angular.d.ts"/>
var TrNgGrid;
(function (TrNgGrid) {
    var GridConfigurationDefaultPagerOptions = (function () {
        function GridConfigurationDefaultPagerOptions() {
            this.minifiedPageCountThreshold = 3;
        }
        return GridConfigurationDefaultPagerOptions;
    })();
    var GridConfigurationDefaultStyles = (function () {
        function GridConfigurationDefaultStyles() {
            // at the time of coding, table-striped is not working properly with selection
            this.tableCssClass = "tr-ng-grid table table-bordered table-hover";
            this.cellCssClass = "tr-ng-cell";
            this.headerCellCssClass = "tr-ng-cell tr-ng-column-header ";
            this.bodyCellCssClass = "tr-ng-cell";
            this.columnTitleCssClass = "tr-ng-title";
            this.columnSortCssClass = "tr-ng-sort";
            this.columnFilterCssClass = "tr-ng-column-filter";
            this.columnFilterInputWrapperCssClass = "";
            this.columnSortActiveCssClass = "tr-ng-sort-active text-info";
            this.columnSortInactiveCssClass = "tr-ng-sort-inactive text-muted glyphicon glyphicon-chevron-down";
            this.columnSortReverseOrderCssClass = "tr-ng-sort-order-reverse glyphicon glyphicon-chevron-down";
            this.columnSortNormalOrderCssClass = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-up";
            this.rowSelectedCssClass = "active";
            this.footerCssClass = "tr-ng-grid-footer form-inline";
        }
        return GridConfigurationDefaultStyles;
    })();
    // it's important to assign all the default column options, so we can match them with the column attributes in the markup
    var GridConfigurationDefaultColumnOptions = (function () {
        function GridConfigurationDefaultColumnOptions() {
            this.cellWidth = null;
            this.cellHeight = null;
            this.displayAlign = "left";
            this.displayFormat = null;
            this.displayName = null;
            this.filter = null;
            this.enableFiltering = null;
            this.enableSorting = null;
        }
        return GridConfigurationDefaultColumnOptions;
    })();
    var GridConfigurationDefaultTemplates = (function () {
        function GridConfigurationDefaultTemplates($interpolateProvider, gridStyles) {
            var startNgSymbol = $interpolateProvider.startSymbol();
            var endNgSymbol = $interpolateProvider.endSymbol();
            this.cellHeader = '<div class="' + gridStyles.headerCellCssClass + '" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>' + '    <div class="' + gridStyles.columnTitleCssClass + '">' + '      {{columnTitle |' + TrNgGrid.translateFilter + ':gridOptions.locale}}' + '       <div ' + TrNgGrid.columnSortDirectiveAttribute + '=""></div>' + '    </div>' + '    <div ' + TrNgGrid.columnFilterDirectiveAttribute + '=""></div>' + '  </div>' + '</div>';
            this.cellBody = '<div ng-attr-class="' + gridStyles.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>{{gridDisplayItem[columnOptions.displayFieldName]}}</div>' + '</div>';
            this.cellFooter = '<div class="' + gridStyles.footerCssClass + '" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>' + '    <span ' + TrNgGrid.globalFilterDirectiveAttribute + '=""></span>' + '    <span ' + TrNgGrid.pagerDirectiveAttribute + '=""></span>' + '  </div>' + '</div>';
            this.columnFilter = '<div ng-show="(gridOptions.enableFiltering&&columnOptions.enableFiltering!==false)||columnOptions.enableFiltering" class="' + gridStyles.columnFilterCssClass + '">' + ' <div class="' + gridStyles.columnFilterInputWrapperCssClass + '">' + '   <input class="form-control input-sm" type="text" ng-model="columnOptions.filter" ng-keypress="speedUpAsyncDataRetrieval($event)"></input>' + ' </div>' + '</div>';
            this.columnSort = '<div ng-attr-title="{{\'Sort\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}"' + ' ng-show="(gridOptions.enableSorting&&columnOptions.enableSorting!==false)||columnOptions.enableSorting"' + ' ng-click="toggleSorting(columnOptions.fieldName)"' + ' class="' + gridStyles.columnSortCssClass + '" > ' + '  <div ng-class="{\'' + gridStyles.columnSortActiveCssClass + '\':gridOptions.orderBy==columnOptions.fieldName,\'' + gridStyles.columnSortInactiveCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName,\'' + gridStyles.columnSortNormalOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&!gridOptions.orderByReverse,\'' + gridStyles.columnSortReverseOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&gridOptions.orderByReverse}" >' + '  </div>' + '</div>';
            this.footerGlobalFilter = '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">' + '  <input class="form-control" type="text" ng-model="gridOptions.filterBy" ng-keypress="speedUpAsyncDataRetrieval($event)" ng-attr-placeholder="{{\'Search\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}"></input>' + '</span>';
            this.footerPager = '<span class="pull-right form-group">' + ' <ul class="pagination">' + '   <li ng-class="{disabled:!pageCanGoBack}" ng-if="extendedControlsActive">' + '     <a href="" ng-click="pageCanGoBack&&navigateToPage(0)" ng-attr-title="{{\'First Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">' + '         <span>&laquo;</span>' + '     </a>' + '   </li>' + '   <li ng-class="{disabled:!pageCanGoBack}" ng-if="extendedControlsActive">' + '     <a href="" ng-click="pageCanGoBack&&navigateToPage(gridOptions.currentPage - 1)" ng-attr-title="{{\'Previous Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">' + '         <span>&lsaquo;</span>' + '     </a>' + '   </li>' + '   <li ng-if="pageSelectionActive" ng-repeat="pageIndex in pageIndexes track by $index" ng-class="{disabled:pageIndex===null, active:pageIndex===gridOptions.currentPage}">' + '      <span ng-if="pageIndex===null">...</span>' + '      <a href="" ng-click="navigateToPage(pageIndex)" ng-if="pageIndex!==null" ng-attr-title="{{\'Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">{{pageIndex+1}}</a>' + '   </li>' + '   <li ng-class="{disabled:!pageCanGoForward}" ng-if="extendedControlsActive">' + '     <a href="" ng-click="pageCanGoForward&&navigateToPage(gridOptions.currentPage + 1)" ng-attr-title="{{\'Next Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">' + '         <span>&rsaquo;</span>' + '     </a>' + '   </li>' + '   <li ng-class="{disabled:!pageCanGoForward}" ng-if="extendedControlsActive">' + '     <a href="" ng-click="pageCanGoForward&&navigateToPage(lastPageIndex)" ng-attr-title="{{\'Last Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">' + '         <span>&raquo;</span>' + '     </a>' + '   </li>' + '   <li class="disabled" style="white-space: nowrap;">' + '     <span ng-hide="totalItemsCount">{{\'No items to display\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}</span>' + '     <span ng-show="totalItemsCount">' + '       {{startItemIndex+1}} - {{endItemIndex+1}} {{\'displayed\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}' + '       <span>, {{totalItemsCount}} {{\'in total\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}</span>' + '     </span > ' + '   </li>' + ' </ul>' + '</span>';
        }
        return GridConfigurationDefaultTemplates;
    })();
    var GridConfigurationProvider = (function () {
        function GridConfigurationProvider($interpolateProvider) {
            var _this = this;
            this.$interpolateProvider = $interpolateProvider;
            this.$get = [
                function () {
                    return {
                        styles: _this.styles(),
                        defaultColumnOptions: _this.defaultColumnOptions(),
                        translations: _this.gridTranslations,
                        pagerOptions: _this.pagerOptions(),
                        templates: _this.templates(),
                        debugMode: _this.debugMode()
                    };
                }
            ];
            this.gridTranslations = {};
            this.gridDebugMode = false;
        }
        GridConfigurationProvider.prototype.styles = function (styles) {
            if (styles) {
                this.gridStyles = angular.extend({}, new GridConfigurationDefaultStyles(), styles);
            }
            return this.gridStyles || new GridConfigurationDefaultStyles();
        };
        GridConfigurationProvider.prototype.defaultColumnOptions = function (columnOptions) {
            if (columnOptions) {
                this.gridDefaultColumnOptions = angular.extend({}, new GridConfigurationDefaultColumnOptions(), columnOptions);
            }
            return this.gridDefaultColumnOptions || new GridConfigurationDefaultColumnOptions();
        };
        GridConfigurationProvider.prototype.translations = function (locale, translations) {
            var localeTranslations = this.gridTranslations[locale] = angular.extend({}, this.gridTranslations[locale], translations);
            return localeTranslations;
        };
        GridConfigurationProvider.prototype.defaultTranslations = function (translations) {
            return this.translations(TrNgGrid.defaultTranslationLocale, translations);
        };
        GridConfigurationProvider.prototype.pagerOptions = function (pagerOptions) {
            if (pagerOptions) {
                this.gridPagerOptions = angular.extend({}, new GridConfigurationDefaultPagerOptions(), pagerOptions);
            }
            return this.gridPagerOptions || new GridConfigurationDefaultPagerOptions();
        };
        GridConfigurationProvider.prototype.templates = function (templates) {
            if (templates) {
                this.gridTemplates = angular.extend({}, new GridConfigurationDefaultTemplates(this.$interpolateProvider, this.styles()), templates);
            }
            return this.gridTemplates || new GridConfigurationDefaultTemplates(this.$interpolateProvider, this.styles());
        };
        GridConfigurationProvider.prototype.debugMode = function (debugMode) {
            if (debugMode !== undefined) {
                this.gridDebugMode = !!debugMode;
            }
            return this.gridDebugMode;
        };
        return GridConfigurationProvider;
    })();
    TrNgGrid.GridConfigurationProvider = GridConfigurationProvider;
    angular.module(TrNgGrid.tableDirective).provider(TrNgGrid.gridConfigurationService, GridConfigurationProvider);
})(TrNgGrid || (TrNgGrid = {}));
