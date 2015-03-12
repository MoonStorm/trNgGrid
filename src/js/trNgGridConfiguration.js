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
            this.tableCssClass = "tr-ng-grid table table-bordered table-hover ";
            this.cellCssClass = "tr-ng-cell ";
            this.headerCellCssClass = "tr-ng-cell tr-ng-column-header ";
            this.bodyCellCssClass = "tr-ng-cell ";
            this.columnTitleCssClass = "tr-ng-title ";
            this.columnSortCssClass = "tr-ng-sort pull-right pull-top ";
            this.columnFilterInputWrapperCssClass = " ";
            this.columnFilterCssClass = "tr-ng-column-filter ";
            this.columnSortActiveCssClass = "tr-ng-sort-active text-info ";
            this.columnSortInactiveCssClass = "tr-ng-sort-inactive text-muted glyphicon glyphicon-chevron-down ";
            this.columnSortReverseOrderCssClass = "tr-ng-sort-order-reverse glyphicon glyphicon-chevron-down ";
            this.columnSortNormalOrderCssClass = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-up ";
            this.rowSelectedCssClass = "active ";
            this.footerCssClass = "tr-ng-grid-footer form-inline ";
        }
        return GridConfigurationDefaultStyles;
    })();
    var GridConfigurationDefaultColumnOptions = (function () {
        function GridConfigurationDefaultColumnOptions() {
            this.cellWidth = undefined;
            this.cellHeight = undefined;
            this.displayAlign = "left";
            this.displayFormat = undefined;
            this.displayName = undefined;
            this.filter = undefined;
            this.enableFiltering = true;
            this.enableSorting = true;
        }
        return GridConfigurationDefaultColumnOptions;
    })();
    TrNgGrid.GridConfigurationDefaultColumnOptions = GridConfigurationDefaultColumnOptions;
    var GridConfigurationDefaultTemplates = (function () {
        function GridConfigurationDefaultTemplates($interpolateProvider, gridStyles) {
            var startNgSymbol = $interpolateProvider.startSymbol();
            var endNgSymbol = $interpolateProvider.endSymbol();
            this.headerCellStandard = '<th></th>';
            this.headerCellContentsStandard = '<div class="' + gridStyles.headerCellCssClass + '" >' + '  <div ' + TrNgGrid.Constants.columnSortDirectiveAttribute + '=""></div>' + '  <a ' + gridStyles.columnTitleCssClass + '"' + '     href="" ng-click="((gridOptions.enableSorting&&gridColumnOptions.enableSorting!==false)||gridColumnOptions.enableSorting)&&toggleSorting(gridColumnOptions.fieldName)">' + '      ' + startNgSymbol + 'gridColumnOptions.columnTitle |' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale' + endNgSymbol + '  </a>' + '  <div ' + TrNgGrid.Constants.columnFilterDirectiveAttribute + '=""></div>' + '</div>';
            this.bodyCellStandard = '<div ng-attr-class="' + gridStyles.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>{{gridDisplayItem[columnOptions.displayFieldName]}}</div>' + '</div>';
            this.footerCellStandard = '<div class="' + gridStyles.footerCssClass + '" ng-switch="isCustomized">' + '  <div ng-switch-when="true">' + '    <div ng-transclude=""></div>' + '  </div>' + '  <div ng-switch-default>' + '    <span ' + TrNgGrid.Constants.globalFilterDirectiveAttribute + '=""></span>' + '    <span ' + TrNgGrid.Constants.pagerDirectiveAttribute + '=""></span>' + '  </div>' + '</div>';
            this.columnFilter = '<div ng-show="(gridOptions.enableFiltering&&columnOptions.enableFiltering!==false)||columnOptions.enableFiltering" class="' + gridStyles.columnFilterCssClass + '">' + ' <div class="' + gridStyles.columnFilterInputWrapperCssClass + '">' + '   <input class="form-control input-sm" type="text" ng-model="columnOptions.filter" ng-keypress="speedUpAsyncDataRetrieval($event)"></input>' + ' </div>' + '</div>';
            this.columnSort = '<a href="" ng-attr-title="{{\'Sort\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}"' + ' ng-show="(gridOptions.enableSorting&&columnOptions.enableSorting!==false)||columnOptions.enableSorting"' + ' ng-click="toggleSorting(columnOptions.fieldName)"' + ' class="' + gridStyles.columnSortCssClass + '" > ' + '  <span ng-class="{\'' + gridStyles.columnSortActiveCssClass + '\':gridOptions.orderBy==columnOptions.fieldName,\'' + gridStyles.columnSortInactiveCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName,\'' + gridStyles.columnSortNormalOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&!gridOptions.orderByReverse,\'' + gridStyles.columnSortReverseOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&gridOptions.orderByReverse}" >' + '  </span>' + '</a>';
            this.footerGlobalFilter = '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">' + '  <input class="form-control" type="text" ng-model="gridOptions.filterBy" ng-keypress="speedUpAsyncDataRetrieval($event)" ng-attr-placeholder="{{\'Search\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}"></input>' + '</span>';
            this.footerPager = '<span class="pull-right form-group">' + ' <ul class="pagination">' + '   <li ng-class="{disabled:gridOptions.currentPage==0}" ng-if="isPaged&&!pageRangeFullCoverage">' + '     <a href="" ng-click="gridOptions.currentPage!=0&&navigateToPage(0)" ng-attr-title="{{\'First Page\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}">' + '         <span>&laquo;</span>' + '     </a>' + '   </li>' + '   <li ng-class="{disabled:gridOptions.currentPage==0}" ng-if="isPaged&&!pageRangeFullCoverage">' + '     <a href="" ng-click="gridOptions.currentPage!=0&&navigateToPage(gridOptions.currentPage - 1)" ng-attr-title="{{\'Previous Page\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}">' + '         <span>&lsaquo;</span>' + '     </a>' + '   </li>' + '   <li ng-if="isPaged&&!pageRangeFullCoverage&&visiblePageRange[0]!=0"class="disabled">' + '      <span>...</span>' + '   </li>' + '   <li ng-if="isPaged" ng-repeat="pageIndex in visiblePageRange track by $index" ng-class="{active:pageIndex===gridOptions.currentPage}">' + '      <a href="" ng-click="navigateToPage(pageIndex)" ng-attr-title="{{\'Page\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}">{{pageIndex+1}}</a>' + '   </li>' + '   <li ng-if="isPaged&&!pageRangeFullCoverage&&visiblePageRange[visiblePageRange.length-1]!=lastPage" class="disabled">' + '      <span>...</span>' + '   </li>' + '   <li ng-class="{disabled:gridOptions.currentPage==lastPage}" ng-if="isPaged&&!pageRangeFullCoverage">' + '     <a href="" ng-click="gridOptions.currentPage!=lastPage&&navigateToPage(gridOptions.currentPage + 1)" ng-attr-title="{{\'Next Page\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}">' + '         <span>&rsaquo;</span>' + '     </a>' + '   </li>' + '   <li ng-class="{disabled:gridOptions.currentPage==lastPage}" ng-if="isPaged&&!pageRangeFullCoverage">' + '     <a href="" ng-click="gridOptions.currentPage!=lastPage&&navigateToPage(lastPage)" ng-attr-title="{{\'Last Page\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}">' + '         <span>&raquo;</span>' + '     </a>' + '   </li>' + '   <li class="disabled" style="white-space: nowrap;">' + '     <span ng-hide="totalItemsCount">{{\'No items to display\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}</span>' + '     <span ng-show="totalItemsCount">' + '       {{visibleStartItemIndex+1}} - {{visibleEndItemIndex+1}} {{\'displayed\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}' + '       <span>, {{totalItemsCount}} {{\'in total\'|' + TrNgGrid.Constants.translateFilter + ':gridOptions.locale}}</span>' + '     </span > ' + '   </li>' + ' </ul>' + '</span>';
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
            this.gridDebugMode = true;
        }
        GridConfigurationProvider.prototype.styles = function (styles) {
            if (styles) {
                this.gridStyles = angular.extend({}, new GridConfigurationDefaultStyles(), styles);
            }
            return angular.extend({}, this.gridStyles || new GridConfigurationDefaultStyles());
        };
        GridConfigurationProvider.prototype.defaultColumnOptions = function (columnOptions) {
            if (columnOptions) {
                this.gridDefaultColumnOptions = angular.extend({}, new GridConfigurationDefaultColumnOptions(), columnOptions);
            }
            return angular.extend({}, this.gridDefaultColumnOptions || new GridConfigurationDefaultColumnOptions());
        };
        GridConfigurationProvider.prototype.translations = function (locale, translations) {
            var localeTranslations = this.gridTranslations[locale] = angular.extend({}, this.gridTranslations[locale], translations);
            return angular.extend({}, localeTranslations);
        };
        GridConfigurationProvider.prototype.defaultTranslations = function (translations) {
            return this.translations(TrNgGrid.Constants.defaultTranslationLocale, translations);
        };
        GridConfigurationProvider.prototype.pagerOptions = function (pagerOptions) {
            if (pagerOptions) {
                this.gridPagerOptions = angular.extend({}, new GridConfigurationDefaultPagerOptions(), pagerOptions);
            }
            return angular.extend({}, this.gridPagerOptions || new GridConfigurationDefaultPagerOptions());
        };
        GridConfigurationProvider.prototype.templates = function (templates) {
            if (templates) {
                this.gridTemplates = angular.extend({}, new GridConfigurationDefaultTemplates(this.$interpolateProvider, this.styles()), templates);
            }
            return angular.extend({}, this.gridTemplates || new GridConfigurationDefaultTemplates(this.$interpolateProvider, this.styles()));
        };
        GridConfigurationProvider.prototype.debugMode = function (debugMode) {
            if (debugMode !== undefined) {
                this.gridDebugMode = !!debugMode;
            }
            return this.gridDebugMode;
        };
        return GridConfigurationProvider;
    })();
    TrNgGrid.gridModule.provider(TrNgGrid.Constants.gridConfigurationService, GridConfigurationProvider);
})(TrNgGrid || (TrNgGrid = {}));
