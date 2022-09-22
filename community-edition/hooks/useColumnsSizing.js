/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import getScrollbarWidth from '../packages/getScrollbarWidth';
import { id as checkboxColumnId } from '../normalizeColumns/defaultCheckColumnId';
import { id as rowReorderColumnId } from '../normalizeColumns/defaultRowReorderColumnId';
import { id as rowIndexColumnId } from '../normalizeColumns/defaultRowIndexColumnId';
import { id as rowExapandColumnId } from '../normalizeColumns/defaultRowExpandColumnId';
const EMPTY_OBJECT = {};
const removeItemFromArray = (array, obj) => {
    const index = array.indexOf(obj);
    if (index >= 0) {
        array.splice(index, 1);
    }
};
const getColumnsWidths = (columns) => {
    return columns.reduce((width, column) => {
        return width + column.computedWidth;
    }, 0);
};
const checkForSpecialColumns = (id) => {
    const specialColumns = [
        checkboxColumnId,
        rowReorderColumnId,
        rowIndexColumnId,
        rowExapandColumnId,
    ];
    if (specialColumns.indexOf(id) === -1) {
        return false;
    }
    return true;
};
const useColumnsSizing = (_props, _computedProps, computedPropsRef) => {
    const computeColumnSizesToFit = (gridWidth) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        const visibleColumns = computedProps.visibleColumns;
        if (gridWidth <= 0 || !visibleColumns.length) {
            return;
        }
        const columnsToSize = [];
        const columnsNotToSize = [];
        visibleColumns.forEach((column) => {
            if (column.resizable === false) {
                columnsNotToSize.push(column);
            }
            else {
                columnsToSize.push(column);
            }
        });
        const columnsToResize = columnsToSize.slice(0);
        let finished = false;
        const updateColumnsNotToSize = (column) => {
            removeItemFromArray(columnsToResize, column);
            columnsNotToSize.push(column);
        };
        const newColumnSizes = {};
        while (!finished) {
            finished = true;
            const availableSpace = gridWidth - getColumnsWidths(columnsNotToSize);
            const scale = availableSpace / getColumnsWidths(columnsToResize);
            let spaceForLastColumn = availableSpace;
            for (let i = columnsToResize.length - 1; i >= 0; i--) {
                const column = columnsToResize[i];
                const minWidth = column.computedMinWidth;
                const maxWidth = column.computedMaxWidth;
                let newWidth = Math.round(column.computedWidth * scale);
                if (minWidth && newWidth < minWidth) {
                    newWidth = minWidth;
                    updateColumnsNotToSize(column);
                    finished = false;
                }
                else if (maxWidth && newWidth > maxWidth) {
                    newWidth = maxWidth;
                    updateColumnsNotToSize(column);
                    finished = false;
                }
                else if (i === 0) {
                    newWidth = spaceForLastColumn;
                }
                const columnId = column.id;
                Object.assign(newColumnSizes, { [columnId]: newWidth });
                spaceForLastColumn -= newWidth;
            }
        }
        if (computedProps.virtualizeColumns) {
            const bodyRef = computedProps.bodyRef.current;
            const columnLayout = bodyRef.columnLayout;
            const headerLayout = columnLayout.headerLayout;
            const header = headerLayout.header;
            setTimeout(() => {
                header.updateColumns();
            }, 10);
        }
        let newReservedViewportWidth = computedProps.reservedViewportWidth;
        const columnFlexes = computedProps.columnFlexes;
        computedProps.computeColumnSizes(newColumnSizes || {}, columnFlexes || {}, newReservedViewportWidth, {
            getColumnBy: computedProps.getColumnBy,
            onColumnResize: computedProps.initialProps.onColumnResize,
            onBatchColumnResize: computedProps.initialProps.onBatchColumnResize,
            columnSizes: computedProps.columnSizes,
            setColumnSizes: computedProps.setColumnSizes,
            setColumnFlexes: computedProps.setColumnFlexes,
        });
    };
    const checkForAvaibleWidth = () => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        const scrollbars = computedProps.scrollbars;
        const hasVerticalScrollbar = scrollbars.vertical;
        const scrollbarWidth = hasVerticalScrollbar ? getScrollbarWidth() : 0;
        const computedAvailableWidth = computedProps.availableWidth || 0;
        const availableWidth = computedAvailableWidth - scrollbarWidth;
        if (availableWidth > 0) {
            computeColumnSizesToFit(availableWidth);
        }
    };
    const computeColumnSizesAuto = (columns, callback) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        if (!columns.length) {
            return;
        }
        columns.forEach((column) => {
            if (column.resizable === false || checkForSpecialColumns(column.id)) {
                // do nothing
            }
            else {
                callback(column);
            }
        });
    };
    const getCellForColumn = (column, row) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        let result;
        const columnId = column.id;
        const cells = row.getCells();
        if (!cells.length) {
            return;
        }
        cells.forEach((cell) => {
            const cellProps = cell.props;
            const cellId = cellProps.id;
            if (columnId === cellId) {
                result = cell.domRef
                    ? cell.domRef.current
                    : cell.getDOMNode
                        ? cell.getDOMNode()
                        : null;
            }
        });
        return result;
    };
    const getCellsForColumn = (column) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        const result = [];
        if (computedProps.getRows) {
            computedProps.getRows().forEach((rowInstance) => {
                const row = rowInstance.row;
                const cell = getCellForColumn(column, row);
                result.push(cell);
            });
        }
        return result;
    };
    const cloneIntoDummyContainer = (cell, dummyContainer) => {
        const cellClone = cell && cell.cloneNode(true);
        if (!cellClone) {
            return;
        }
        cellClone.style.width = '';
        cellClone.style.minWidth = '';
        cellClone.style.maxWidth = '';
        cellClone.style.position = 'static';
        cellClone.style.left = '';
        const rowClassName = 'InovuaReactDataGrid__row';
        const headerClassName = 'InovuaReactDataGrid__header';
        const headerCellClassName = 'InovuaReactDataGrid__column-header';
        const isHeader = cellClone.classList.contains(headerCellClassName);
        let cellContent;
        cellContent = [...cellClone.children].find((cell) => {
            const className = isHeader
                ? 'InovuaReactDataGrid__column-header__content'
                : 'InovuaReactDataGrid__cell__content';
            return cell.classList.contains(className);
        });
        if (cellContent) {
            cellContent.style.width = 'fit-content';
        }
        else {
            cellClone.style.width = 'fit-content';
        }
        const cloneRow = document.createElement('div');
        const cloneRowClassList = cloneRow.classList;
        if (isHeader) {
            cloneRowClassList.add(headerClassName);
            cloneRow.style.position = 'static';
        }
        else {
            cloneRowClassList.add(rowClassName);
        }
        let rowElement = cell.parentElement;
        while (rowElement) {
            const isRow = [rowClassName, headerClassName].some((cls) => rowElement.classList.contains(cls));
            if (isRow) {
                for (let i = 0; i < rowElement.classList.length; i++) {
                    const item = rowElement.classList[i];
                    cloneRowClassList.add(item);
                }
                break;
            }
            rowElement = rowElement.parentElement;
        }
        cloneRow.appendChild(cellClone);
        dummyContainer.appendChild(cloneRow);
    };
    const computeOptimizedWidth = (column, skipHeader) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return -1;
        }
        const cells = getCellsForColumn(column);
        if (!cells || !cells.length) {
            return -1;
        }
        if (!skipHeader) {
            let headerCell;
            const header = computedProps.getHeader();
            const headerCells = header.getCells();
            headerCells.find((cell) => {
                const cellProps = cell.props;
                if (cellProps.id === column.id) {
                    headerCell = cell.getDOMNode();
                }
            });
            if (headerCell &&
                headerCell.classList.contains('InovuaReactDataGrid__column-header__resize-wrapper')) {
                headerCell = [...headerCell.children].find((cell) => cell.classList.contains('InovuaReactDataGrid__column-header'));
            }
            cells.push(headerCell);
        }
        return addCellsToContainer(cells, skipHeader);
    };
    const addCellsToContainer = (cells, skipHeader) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return -1;
        }
        const dummyContainer = document.createElement('span');
        dummyContainer.style.position = 'fixed';
        const vl = computedProps.getVirtualList();
        const container = vl.getContainerNode();
        container.appendChild(dummyContainer);
        cells.forEach(cell => cloneIntoDummyContainer(cell, dummyContainer));
        let dummyContainerWidth = dummyContainer.offsetWidth;
        if (!skipHeader) {
            dummyContainerWidth += 3;
        }
        else {
            dummyContainerWidth += 1;
        }
        container.removeChild(dummyContainer);
        return dummyContainerWidth;
    };
    const normaliseWidth = (column, width) => {
        const minWidth = column.minWidth;
        const maxWidth = column.maxWidth;
        if (minWidth && width < minWidth) {
            width = minWidth;
        }
        if (maxWidth && width > maxWidth) {
            width = maxWidth;
        }
        return width;
    };
    const setColumnSizesToFit = () => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        const { enableColumnAutosize } = computedProps;
        if (!enableColumnAutosize) {
            showWarning('setColumnSizesToFit');
            return;
        }
        checkForAvaibleWidth();
    };
    const setColumnsSizesAuto = ({ columnIds, skipHeader, } = EMPTY_OBJECT) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        const { enableColumnAutosize } = computedProps;
        if (!enableColumnAutosize) {
            showWarning('setColumnsSizesAuto');
            return;
        }
        const shouldSkipHeader = skipHeader != null ? skipHeader : computedProps.skipHeaderOnAutoSize;
        let allIds = [];
        let columns = [];
        if (columnIds !== undefined) {
            if (Array.isArray(columnIds)) {
                allIds = columnIds;
            }
        }
        for (let i = 0; i < allIds.length; i++) {
            const id = allIds[i];
            const column = computedProps.getColumnBy(id);
            columns.push(column);
        }
        if (columns && columns.length === 0) {
            columns = computedProps.visibleColumns;
        }
        if (!columns || columns.length === 0) {
            return;
        }
        let columnsToSize = [];
        let counter = -1;
        const newColumnSizes = {};
        while (counter !== 0) {
            counter = 0;
            computeColumnSizesAuto(columns, (column) => {
                if (columnsToSize.indexOf(column) >= 0) {
                    return false;
                }
                const optimizedWidth = computeOptimizedWidth(column, shouldSkipHeader);
                if (optimizedWidth > 0) {
                    const newWidth = normaliseWidth(column, optimizedWidth);
                    const columnId = column.id;
                    columnsToSize.push(column);
                    Object.assign(newColumnSizes, { [columnId]: newWidth });
                    counter++;
                }
                return true;
            });
        }
        if (computedProps.virtualizeColumns) {
            const bodyRef = computedProps.bodyRef.current;
            const columnLayout = bodyRef.columnLayout;
            const headerLayout = columnLayout.headerLayout;
            const header = headerLayout.header;
            setTimeout(() => {
                header.updateColumns();
            }, 10);
        }
        let newReservedViewportWidth = computedProps.reservedViewportWidth;
        const columnFlexes = computedProps.columnFlexes;
        computedProps.computeColumnSizes(newColumnSizes || {}, columnFlexes || {}, newReservedViewportWidth, {
            getColumnBy: computedProps.getColumnBy,
            onColumnResize: computedProps.initialProps.onColumnResize,
            onBatchColumnResize: computedProps.initialProps.onBatchColumnResize,
            columnSizes: computedProps.columnSizes,
            setColumnSizes: computedProps.setColumnSizes,
            setColumnFlexes: computedProps.setColumnFlexes,
        });
    };
    const setColumnSizeAuto = (id, skipHeader) => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        const { enableColumnAutosize } = computedProps;
        if (!enableColumnAutosize) {
            showWarning('setColumnSizeAuto');
            return;
        }
        if (id) {
            setColumnsSizesAuto({ columnIds: [id], skipHeader });
        }
        return;
    };
    const showWarning = (method) => {
        return console.error(`In order for ${method} to work, the 'enableColumnAutosize' prop should be 'true'.`);
    };
    return {
        setColumnSizesToFit,
        setColumnsSizesAuto,
        setColumnSizeAuto,
    };
};
export default useColumnsSizing;
