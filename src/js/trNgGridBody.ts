module TrNgGrid {
    export interface IGridBodyScope extends IGridScope {
        toggleItemSelection: (item: any, $event: ng.IAngularEvent) => void;
    }

    export interface IGridBodyColumnScope extends IGridColumnScope, IGridDataComputationScope {
        isCustomized?: boolean;
        columnDefinitionIndex: number;
        gridDisplayItem: IGridDisplayItem;
    }
} 