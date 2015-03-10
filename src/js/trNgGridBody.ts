module TrNgGrid {
    export interface IGridBodyScope extends IGridSectionScope {
        toggleItemSelection: (item: any, $event: ng.IAngularEvent) => void;
    }

    export interface IGridBodyColumnScope extends IGridColumnScope {
        isCustomized?: boolean;
        columnDefinitionIndex: number;
        gridDisplayItem: IGridDisplayItem;
    }
} 