module TrNgGrid {
    export interface IGridFooterScope extends IGridSectionScope {
        isCustomized?: boolean;
        isPaged: boolean;
        totalItemsCount: number;
        visibleStartItemIndex: number;
        visibleEndItemIndex: number;
        visiblePageRange: Array<number>;
        pageRangeFullCoverage: boolean;
        lastPage: number;
        navigateToPage: (pageIndex: number) => void;
    }
} 