var TrNgGrid;
(function (TrNgGrid) {
    (function (GridSectionType) {
        GridSectionType[GridSectionType["Enforced"] = 0] = "Enforced";
        GridSectionType[GridSectionType["Header"] = 1] = "Header";
        GridSectionType[GridSectionType["Body"] = 2] = "Body";
    })(TrNgGrid.GridSectionType || (TrNgGrid.GridSectionType = {}));
    var GridSectionType = TrNgGrid.GridSectionType;
    var GridRow = (function () {
        function GridRow() {
            this.cells = [];
        }
        GridRow.prototype.registerCell = function (cell) {
            var cellFound = false;
            for (var cellIndex = 0; (cellIndex < this.cells.length) && (!cellFound); cellIndex++) {
                if (this.cells[cellIndex].fieldName === cell.fieldName) {
                    this.cells[cellIndex] = cell;
                    cellFound = true;
                }
            }
            if (!cellFound) {
                this.cells.push(cell);
            }
            return cell;
        };
        GridRow.prototype.unregisterCell = function (cell) {
            for (var cellIndex = 0; cellIndex < this.cells.length; cellIndex++) {
                if (this.cells[cellIndex] === cell) {
                    this.cells.splice(cellIndex, 1);
                    return;
                }
            }
        };
        return GridRow;
    })();
    TrNgGrid.GridRow = GridRow;
    var GridSection = (function () {
        function GridSection() {
            this.rows = [];
        }
        GridSection.prototype.registerRow = function () {
            var row = new GridRow();
            this.rows.push(row);
            return row;
        };
        GridSection.prototype.unregisterRow = function (row) {
            for (var rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
                if (this.rows[rowIndex] === row) {
                    this.rows.splice(rowIndex, 1);
                    return;
                }
            }
        };
        return GridSection;
    })();
    TrNgGrid.GridSection = GridSection;
    var GridLayout = (function () {
        function GridLayout() {
            this.sections = new Array(2 /* Body */ + 1);
        }
        GridLayout.prototype.getSection = function (section) {
            var colSection = this.sections[section];
            if (!colSection) {
                this.sections[section] = colSection = new GridSection();
            }
            return colSection;
        };
        return GridLayout;
    })();
    TrNgGrid.GridLayout = GridLayout;
})(TrNgGrid || (TrNgGrid = {}));
