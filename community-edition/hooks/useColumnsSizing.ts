/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MutableRefObject } from 'react';
import {
  TypeComputedColumn,
  TypeComputedProps,
  TypeDataGridProps,
} from '../types';
import getScrollbarWidth from '../packages/getScrollbarWidth';
import { id as checkboxColumnId } from '../normalizeColumns/defaultCheckColumnId';
import { id as rowReorderColumnId } from '../normalizeColumns/defaultRowReorderColumnId';
import { id as rowIndexColumnId } from '../normalizeColumns/defaultRowIndexColumnId';
import { id as rowExapandColumnId } from '../normalizeColumns/defaultRowExpandColumnId';

const EMPTY_OBJECT = {};

const removeItemFromArray = <T>(array: T[], obj: T) => {
  const index: number = array.indexOf(obj);

  if (index >= 0) {
    array.splice(index, 1);
  }
};

const getColumnsWidths = (columns: TypeComputedColumn[]) => {
  return columns.reduce((width: number, column: any) => {
    return width + column.computedWidth;
  }, 0);
};

const checkForSpecialColumns = (id: string) => {
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

const useColumnsSizing = (
  _props: TypeDataGridProps,
  _computedProps: TypeComputedProps,
  computedPropsRef: MutableRefObject<TypeComputedProps>
) => {
  const computeColumnSizesToFit = (gridWidth: number) => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
      return;
    }

    const visibleColumns: TypeComputedColumn[] = computedProps.visibleColumns;

    if (gridWidth <= 0 || !visibleColumns.length) {
      return;
    }

    const columnsToSize: TypeComputedColumn[] = [];
    const columnsNotToSize: TypeComputedColumn[] = [];

    visibleColumns.forEach((column: TypeComputedColumn) => {
      if (column.resizable === false) {
        columnsNotToSize.push(column);
      } else {
        columnsToSize.push(column);
      }
    });

    const columnsToResize = columnsToSize.slice(0);
    let finished: boolean = false;

    const updateColumnsNotToSize = (column: TypeComputedColumn): void => {
      removeItemFromArray(columnsToResize, column);
      columnsNotToSize.push(column);
    };

    const newColumnSizes: { [key: string]: number } = {};

    while (!finished) {
      finished = true;
      const availableSpace: number =
        gridWidth - getColumnsWidths(columnsNotToSize);

      const scale: number = availableSpace / getColumnsWidths(columnsToResize);
      let spaceForLastColumn: number = availableSpace;

      for (let i = columnsToResize.length - 1; i >= 0; i--) {
        const column: TypeComputedColumn = columnsToResize[i];

        const minWidth: number | undefined = column.computedMinWidth;
        const maxWidth: number | undefined = column.computedMaxWidth;
        let newWidth: number = Math.round(column.computedWidth * scale);

        if (minWidth && newWidth < minWidth) {
          newWidth = minWidth;
          updateColumnsNotToSize(column);
          finished = false;
        } else if (maxWidth && newWidth > maxWidth) {
          newWidth = maxWidth;
          updateColumnsNotToSize(column);
          finished = false;
        } else if (i === 0) {
          newWidth = spaceForLastColumn;
        }

        const columnId: string = column.id;
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

    let newReservedViewportWidth: number = computedProps.reservedViewportWidth;
    const columnFlexes = computedProps.columnFlexes;

    (computedProps as any).computeColumnSizes(
      newColumnSizes || {},
      columnFlexes || {},
      newReservedViewportWidth,
      {
        getColumnBy: computedProps.getColumnBy,
        onColumnResize: computedProps.initialProps.onColumnResize,
        onBatchColumnResize: computedProps.initialProps.onBatchColumnResize,
        columnSizes: computedProps.columnSizes,
        setColumnSizes: computedProps.setColumnSizes,
        setColumnFlexes: computedProps.setColumnFlexes,
      }
    );
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

  const computeColumnSizesAuto = (
    columns: TypeComputedColumn[],
    callback: (column: TypeComputedColumn) => boolean
  ) => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
      return;
    }

    if (!columns.length) {
      return;
    }

    columns.forEach((column: TypeComputedColumn) => {
      if (column.resizable === false || checkForSpecialColumns(column.id)) {
        // do nothing
      } else {
        callback(column);
      }
    });
  };

  const getCellForColumn = (column: TypeComputedColumn | any, row: any) => {
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

    cells.forEach((cell: any) => {
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

  const getCellsForColumn = (column: TypeComputedColumn) => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
      return;
    }

    const result: any[] = [];

    if (computedProps.getRows) {
      (computedProps.getRows() as any).forEach((rowInstance: any) => {
        const row = rowInstance.row;
        const cell = getCellForColumn(column, row);
        result.push(cell);
      });
    }

    return result;
  };

  const cloneIntoDummyContainer = (cell: any, dummyContainer: any) => {
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
    cellContent = [...cellClone.children].find((cell: any) => {
      const className = isHeader
        ? 'InovuaReactDataGrid__column-header__content'
        : 'InovuaReactDataGrid__cell__content';

      return cell.classList.contains(className);
    });

    if (cellContent) {
      cellContent.style.width = 'fit-content';
    } else {
      cellClone.style.width = 'fit-content';
    }

    const cloneRow = document.createElement('div');

    const cloneRowClassList = cloneRow.classList;

    if (isHeader) {
      cloneRowClassList.add(headerClassName);
      cloneRow.style.position = 'static';
    } else {
      cloneRowClassList.add(rowClassName);
    }

    let rowElement = cell.parentElement;

    while (rowElement) {
      const isRow = [rowClassName, headerClassName].some((cls: string) =>
        rowElement.classList.contains(cls)
      );

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

  const computeOptimizedWidth = (
    column: TypeComputedColumn | any,
    skipHeader: boolean
  ): number => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
      return -1;
    }

    const cells = getCellsForColumn(column);

    if (!cells || !cells.length) {
      return -1;
    }

    if (!skipHeader) {
      let headerCell: any;
      const header: any = computedProps.getHeader!();
      const headerCells = header.getCells();
      headerCells.find((cell: any) => {
        const cellProps = cell.props;
        if (cellProps.id === column.id) {
          headerCell = cell.getDOMNode();
        }
      });

      if (
        headerCell &&
        headerCell.classList.contains(
          'InovuaReactDataGrid__column-header__resize-wrapper'
        )
      ) {
        headerCell = [...headerCell.children].find((cell: any) =>
          cell.classList.contains('InovuaReactDataGrid__column-header')
        );
      }

      cells.push(headerCell);
    }

    return addCellsToContainer(cells, skipHeader);
  };

  const addCellsToContainer = (cells: any[], skipHeader: boolean): number => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
      return -1;
    }

    const dummyContainer = document.createElement('span');
    dummyContainer.style.position = 'fixed';

    const vl = computedProps.getVirtualList();
    const container = vl.getContainerNode();
    container.appendChild(dummyContainer);

    cells!.forEach(cell => cloneIntoDummyContainer(cell, dummyContainer));

    let dummyContainerWidth = dummyContainer.offsetWidth;
    if (!skipHeader) {
      dummyContainerWidth += 3;
    } else {
      dummyContainerWidth += 1;
    }

    container.removeChild(dummyContainer);

    return dummyContainerWidth;
  };

  const normaliseWidth = (
    column: TypeComputedColumn,
    width: number
  ): number => {
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

  const setColumnsSizesAuto = ({
    columnIds,
    skipHeader,
  }: {
    columnIds?: string[];
    skipHeader?: boolean;
  } = EMPTY_OBJECT) => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
      return;
    }

    const { enableColumnAutosize } = computedProps;

    if (!enableColumnAutosize) {
      showWarning('setColumnsSizesAuto');
      return;
    }

    const shouldSkipHeader: boolean =
      skipHeader != null ? skipHeader : computedProps.skipHeaderOnAutoSize!;

    let allIds: string[] = [];
    let columns: TypeComputedColumn[] = [];
    if (columnIds !== undefined) {
      if (Array.isArray(columnIds)) {
        allIds = columnIds;
      }
    }

    for (let i = 0; i < allIds.length; i++) {
      const id = allIds[i];
      const column: any = computedProps.getColumnBy(id);
      columns.push(column);
    }

    if (columns && columns.length === 0) {
      columns = computedProps.visibleColumns;
    }

    if (!columns || columns.length === 0) {
      return;
    }

    let columnsToSize: TypeComputedColumn[] = [];
    let counter: number = -1;

    const newColumnSizes: { [key: string]: number } = {};

    while (counter !== 0) {
      counter = 0;
      computeColumnSizesAuto(columns, (column: TypeComputedColumn): boolean => {
        if (columnsToSize.indexOf(column) >= 0) {
          return false;
        }

        const optimizedWidth = computeOptimizedWidth(column, shouldSkipHeader);

        if (optimizedWidth > 0) {
          const newWidth = normaliseWidth(column, optimizedWidth);
          const columnId: string = column.id;
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

    let newReservedViewportWidth: number = computedProps.reservedViewportWidth;
    const columnFlexes = computedProps.columnFlexes;

    (computedProps as any).computeColumnSizes(
      newColumnSizes || {},
      columnFlexes || {},
      newReservedViewportWidth,
      {
        getColumnBy: computedProps.getColumnBy,
        onColumnResize: computedProps.initialProps.onColumnResize,
        onBatchColumnResize: computedProps.initialProps.onBatchColumnResize,
        columnSizes: computedProps.columnSizes,
        setColumnSizes: computedProps.setColumnSizes,
        setColumnFlexes: computedProps.setColumnFlexes,
      }
    );
  };

  const setColumnSizeAuto = (id: string, skipHeader?: boolean): void => {
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

  const showWarning = (method: string) => {
    return console.error(
      `In order for ${method} to work, the 'enableColumnAutosize' prop should be 'true'.`
    );
  };

  return {
    setColumnSizesToFit,
    setColumnsSizesAuto,
    setColumnSizeAuto,
  };
};

export default useColumnsSizing;
