angular.module("trNgGridDemoGlobalCustomizations", ["trNgGrid"]).config(["trNgGridConfigurationProvider", function (gridConfiguration) {
    //*********************************************
    //*                    CSS                    *
    //*********************************************
    // grab the original styles
    var cssStyles = gridConfiguration.styles();
    // append to originals
    cssStyles.bodyCellCssClass += "well well-sm";
    cssStyles.columnSortCssClass += "badge";
    cssStyles.columnTitleCssClass += " text-danger";
    // ... or override
    cssStyles.headerCellCssClass += "list-group-item";
    cssStyles.tableCssClass = "tr-ng-grid table table-condensed well";
    // don't forget to apply them
    gridConfiguration.styles(cssStyles);
    //*********************************************
    //*        Default Column Options             *
    //*********************************************
    gridConfiguration.defaultColumnOptions({
        displayAlign: 'left',
        cellHeight: '6em',
        cellWidth: 'auto'
    });
    //*********************************************
    //*             Templates                     *
    //*********************************************
    gridConfiguration.templates({
        footerPager: '<span class="pull-right"> \
                    <ul class="pagination"> \
                        <li> \
                            <span> \
                                Page: \
                                <select class="form-control" ng-model="gridOptions.currentPage" ng-options="pageNumber as (pageNumber+1) for pageNumber in visiblePageRange"> \
                                </select> \
                            </span> \
                        </li> \
                    </ul> \
                </span>'
    });
    //*********************************************
    //*             Pager Options                 *
    //*********************************************
    gridConfiguration.pagerOptions({
        minifiedPageCountThreshold: 5
    });
    // more styles, templates and options can be found through intellisense or by peeking into trNgGridConfiguration.ts file
}]);
