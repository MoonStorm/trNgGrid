/// <reference path="../../../typings/angularjs/angular.d.ts"/>
module TrNgGrid { 
    export interface IGridStyles {
        tableCssClass: string;
        cellCssClass: string;
        headerCellCssClass: string;
        bodyCellCssClass: string;
        columnTitleCssClass: string;
        columnSortCssClass: string;
        columnFilterCssClass: string;
        columnFilterInputWrapperCssClass: string;
        columnSortActiveCssClass: string;
        columnSortInactiveCssClass: string;
        columnSortReverseOrderCssClass: string;
        columnSortNormalOrderCssClass: string;
        rowSelectedCssClass: string;
        footerCssClass: string;
    }

    export interface IGridLocaleTranslations {
        [key: string]: string;
        localeDateFormat?: string;
    }

    export interface IGridPagerOptions {
        minifiedPageCountThreshold: number;
    }

    export interface IGridTemplates {
        cellHeader: string;
        cellBody: string;
        cellFooter: string;

        columnFilter: string;
        columnSort: string;
        footerGlobalFilter: string;
        footerPager: string;
    }

    export interface IGridConfiguration {
        styles: IGridStyles;
        defaultColumnOptions: IBasicGridColumnOptions;
        translations: { [language: string]: IGridLocaleTranslations };
        pagerOptions: IGridPagerOptions;
        templates: IGridTemplates;
        debugMode: boolean;
    }

    class GridConfigurationDefaultPagerOptions implements IGridPagerOptions {
        minifiedPageCountThreshold: number = 3;
    }

    class GridConfigurationDefaultStyles implements IGridStyles {
        // at the time of coding, table-striped is not working properly with selection
        tableCssClass: string = "tr-ng-grid table table-bordered table-hover";
        cellCssClass: string = "tr-ng-cell";
        headerCellCssClass: string = "tr-ng-cell tr-ng-column-header ";
        bodyCellCssClass: string = "tr-ng-cell";
        columnTitleCssClass: string = "tr-ng-title";
        columnSortCssClass: string = "tr-ng-sort";
        columnFilterCssClass: string = "tr-ng-column-filter";
        columnFilterInputWrapperCssClass: string = "";
        columnSortActiveCssClass: string = "tr-ng-sort-active text-info";
        columnSortInactiveCssClass: string = "tr-ng-sort-inactive text-muted glyphicon glyphicon-chevron-down";
        columnSortReverseOrderCssClass: string = "tr-ng-sort-order-reverse glyphicon glyphicon-chevron-down";
        columnSortNormalOrderCssClass: string = "tr-ng-sort-order-normal glyphicon glyphicon-chevron-up";
        rowSelectedCssClass: string = "active";
        footerCssClass: string = "tr-ng-grid-footer form-inline";
    }

    // it's important to assign all the default column options, so we can match them with the column attributes in the markup
    class GridConfigurationDefaultColumnOptions implements IBasicGridColumnOptions {
        cellWidth: string = null;
        cellHeight: string = null;
        displayAlign: string = "left";
        displayFormat: string = null;
        displayName: string = null;
        filter: string = null;
        enableFiltering: boolean = null;
        enableSorting: boolean = null;
    }

    class GridConfigurationDefaultTemplates implements IGridTemplates {
        cellHeader: string;
        cellBody: string;
        cellFooter: string;

        columnFilter: string;
        columnSort: string;
        footerGlobalFilter: string;
        footerPager: string;

        constructor($interpolateProvider: ng.IInterpolateProvider, gridStyles: IGridStyles) {
            var startNgSymbol = $interpolateProvider.startSymbol();
            var endNgSymbol = $interpolateProvider.endSymbol();

            this.cellHeader =
                '<div class="' + gridStyles.headerCellCssClass + '" ng-switch="isCustomized">'
                + '  <div ng-switch-when="true">'
                + '    <div ng-transclude=""></div>'
                + '  </div>'
                + '  <div ng-switch-default>'
                + '    <div class="' + gridStyles.columnTitleCssClass + '">'
                + '      {{columnTitle |' + TrNgGrid.translateFilter + ':gridOptions.locale}}'
                + '       <div ' + TrNgGrid.columnSortDirectiveAttribute + '=""></div>'
                + '    </div>'
                + '    <div ' + TrNgGrid.columnFilterDirectiveAttribute + '=""></div>'
                + '  </div>'
                + '</div>';

            this.cellBody =
                '<div ng-attr-class="' + gridStyles.bodyCellCssClass + ' text-{{columnOptions.displayAlign}}" ng-switch="isCustomized">'
                + '  <div ng-switch-when="true">'
                + '    <div ng-transclude=""></div>'
                + '  </div>'
                + '  <div ng-switch-default>{{gridDisplayItem[columnOptions.displayFieldName]}}</div>'
                + '</div>';

            this.cellFooter =
                '<div class="' + gridStyles.footerCssClass + '" ng-switch="isCustomized">'
                + '  <div ng-switch-when="true">'
                + '    <div ng-transclude=""></div>'
                + '  </div>'
                + '  <div ng-switch-default>'
                + '    <span ' + TrNgGrid.globalFilterDirectiveAttribute + '=""></span>'
                + '    <span ' + TrNgGrid.pagerDirectiveAttribute + '=""></span>'
                + '  </div>'
                + '</div>';

            this.columnFilter = 
                '<div ng-show="(gridOptions.enableFiltering&&columnOptions.enableFiltering!==false)||columnOptions.enableFiltering" class="' + gridStyles.columnFilterCssClass + '">'
                + ' <div class="' + gridStyles.columnFilterInputWrapperCssClass + '">'
                + '   <input class="form-control input-sm" type="text" ng-model="columnOptions.filter" ng-keypress="speedUpAsyncDataRetrieval($event)"></input>'
                + ' </div>'
                + '</div>';

            this.columnSort = 
                '<div ng-attr-title="{{\'Sort\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}"'
                + ' ng-show="(gridOptions.enableSorting&&columnOptions.enableSorting!==false)||columnOptions.enableSorting"'
                + ' ng-click="toggleSorting(columnOptions.fieldName)"'
                + ' class="' + gridStyles.columnSortCssClass + '" > '
                + '  <div ng-class="{\''
                + gridStyles.columnSortActiveCssClass + '\':gridOptions.orderBy==columnOptions.fieldName,\''
                + gridStyles.columnSortInactiveCssClass + '\':gridOptions.orderBy!=columnOptions.fieldName,\''
                + gridStyles.columnSortNormalOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&!gridOptions.orderByReverse,\''
                + gridStyles.columnSortReverseOrderCssClass + '\':gridOptions.orderBy==columnOptions.fieldName&&gridOptions.orderByReverse}" >'
                + '  </div>'
                + '</div>';

            this.footerGlobalFilter =
                '<span ng-show="gridOptions.enableFiltering" class="pull-left form-group">'
                + '  <input class="form-control" type="text" ng-model="gridOptions.filterBy" ng-keypress="speedUpAsyncDataRetrieval($event)" ng-attr-placeholder="{{\'Search\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}"></input>'
                + '</span>';

            this.footerPager =
                '<span class="pull-right form-group">'
                + ' <ul class="pagination">'
                + '   <li ng-class="{disabled:!pageCanGoBack}" ng-if="extendedControlsActive">'
                + '     <a href="" ng-click="pageCanGoBack&&navigateToPage(0)" ng-attr-title="{{\'First Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">'
                //+ '         <span class="glyphicon glyphicon-fast-backward"></span>' 
                + '         <span>&laquo;</span>'
                + '     </a>'
                + '   </li>'
                + '   <li ng-class="{disabled:!pageCanGoBack}" ng-if="extendedControlsActive">'
                + '     <a href="" ng-click="pageCanGoBack&&navigateToPage(gridOptions.currentPage - 1)" ng-attr-title="{{\'Previous Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">'
                //+ '         <span class="glyphicon glyphicon-step-backward"></span>' 
                + '         <span>&lsaquo;</span>'
                + '     </a>'
                + '   </li>'
                + '   <li ng-if="pageSelectionActive" ng-repeat="pageIndex in pageIndexes track by $index" ng-class="{disabled:pageIndex===null, active:pageIndex===gridOptions.currentPage}">'
                + '      <span ng-if="pageIndex===null">...</span>'
                + '      <a href="" ng-click="navigateToPage(pageIndex)" ng-if="pageIndex!==null" ng-attr-title="{{\'Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">{{pageIndex+1}}</a>'
                + '   </li>'
                + '   <li ng-class="{disabled:!pageCanGoForward}" ng-if="extendedControlsActive">'
                + '     <a href="" ng-click="pageCanGoForward&&navigateToPage(gridOptions.currentPage + 1)" ng-attr-title="{{\'Next Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">'
                //+ '         <span class="glyphicon glyphicon-step-forward"></span>' 
                + '         <span>&rsaquo;</span>'
                + '     </a>'
                + '   </li>'
                + '   <li ng-class="{disabled:!pageCanGoForward}" ng-if="extendedControlsActive">'
                + '     <a href="" ng-click="pageCanGoForward&&navigateToPage(lastPageIndex)" ng-attr-title="{{\'Last Page\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}">'
                //+ '         <span class="glyphicon glyphicon-fast-forward"></span>' 
                + '         <span>&raquo;</span>'
                + '     </a>'
                + '   </li>'
                + '   <li class="disabled" style="white-space: nowrap;">'
                + '     <span ng-hide="totalItemsCount">{{\'No items to display\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}</span>'
                + '     <span ng-show="totalItemsCount">'
                + '       {{startItemIndex+1}} - {{endItemIndex+1}} {{\'displayed\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}'
                + '       <span>, {{totalItemsCount}} {{\'in total\'|' + TrNgGrid.translateFilter + ':gridOptions.locale}}</span>'
                + '     </span > '
                + '   </li>'
                + ' </ul>'
                + '</span>';
        }        
    }

    export class GridConfigurationProvider implements ng.IServiceProvider {
        private gridStyles: IGridStyles;
        private gridDefaultColumnOptions: IBasicGridColumnOptions;
        private gridTranslations: { [language: string]: IGridLocaleTranslations };
        private gridPagerOptions: IGridPagerOptions;
        private gridDebugMode: boolean;
        private gridTemplates: IGridTemplates;

        constructor(private $interpolateProvider: ng.IInterpolateProvider) {
            this.gridTranslations = {};
            this.gridDebugMode = false;
        }

        styles(styles?: IGridStyles) {
            if (styles) {
                this.gridStyles = angular.extend({}, new GridConfigurationDefaultStyles(), styles);
            }

            return this.gridStyles || new GridConfigurationDefaultStyles();
        }

        defaultColumnOptions(columnOptions?: IBasicGridColumnOptions) {
            if (columnOptions) {
                this.gridDefaultColumnOptions = angular.extend({}, new GridConfigurationDefaultColumnOptions(), columnOptions);
            }

            return this.gridDefaultColumnOptions || new GridConfigurationDefaultColumnOptions();
        }

        translations(locale: string, translations?: IGridLocaleTranslations) {
            var localeTranslations: IGridLocaleTranslations = this.gridTranslations[locale] = angular.extend({}, this.gridTranslations[locale], translations);
            return localeTranslations;
        }

        defaultTranslations(translations?: IGridLocaleTranslations) {
            return this.translations(defaultTranslationLocale, translations);
        }

        pagerOptions(pagerOptions?: IGridPagerOptions) {
            if (pagerOptions) {
                this.gridPagerOptions = angular.extend({}, new GridConfigurationDefaultPagerOptions(), pagerOptions);
            }

            return this.gridPagerOptions || new GridConfigurationDefaultPagerOptions();
        }

        templates(templates?: IGridTemplates) {
            if (templates) {
                this.gridTemplates = angular.extend({}, new GridConfigurationDefaultTemplates(this.$interpolateProvider, this.styles()), templates);
            }

            return this.gridTemplates || new GridConfigurationDefaultTemplates(this.$interpolateProvider, this.styles());
        }

        debugMode(debugMode?: boolean) {
            if (debugMode !== undefined) {
                this.gridDebugMode = !!debugMode;
            }

            return this.gridDebugMode;
        }

        $get = [
            (): IGridConfiguration => {
                return {
                    styles: this.styles(),
                    defaultColumnOptions: this.defaultColumnOptions(),
                    translations: this.gridTranslations,
                    pagerOptions: this.pagerOptions(),
                    templates: this.templates(),
                    debugMode: this.debugMode()
                };
            }
        ];

    }

    angular.module(tableDirective)
        .provider(gridConfigurationService, GridConfigurationProvider);
} 