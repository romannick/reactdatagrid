/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  CSSProperties,
  RefObject,
  SyntheticEvent,
  useEffect,
  useRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import cleanProps from '../../../packages/react-clean-props';
import shallowequal, { equalReturnKey } from '../../../packages/shallowequal';

import join from '../../../packages/join';
import clamp from '../../../utils/clamp';

import Cell from '../Cell';
import renderCellsMaybeLocked from './renderCellsMaybeLocked';
import adjustCellProps from './adjustCellProps';
import { CellProps, CellInstance } from '../Cell/CellProps';
import { TypeComputedColumn, TypeDataSource } from '../../../types';

import { RowProps, EnhancedRowProps } from './RowProps';
import usePrevious from '../../../hooks/usePrevious';
// import diff from '../../../packages/shallow-changes';

const CLASS_NAME = 'InovuaReactDataGrid__row';
// const rowClean = (p: any) => {
//   const result = { ...p };

//   delete result.activeRowRef;
//   return result;
// };

const skipSelect = (event: SyntheticEvent) => {
  (event.nativeEvent as any).skipSelect = true;
};

const getValueForPivotColumn = (item: any, path: string[]) => {
  return path.reduce((acc, field, index) => {
    if (!acc || acc[field] == null) {
      return null;
    }
    if (index === path.length - 1) {
      return acc[field];
    }

    return acc[field].pivotSummary || acc[field].values;
  }, item);
};

const getValueForPivotColumnSummary = (
  item: any,
  {
    pivotSummaryPath: path,
  }: {
    pivotSummaryPath: { value: string; field: string }[];
    pivotGrandSummaryColumn?: any;
  }
) => {
  let i = 0;
  let root = item;
  let current: any;

  while ((current = path[i]) && root) {
    if (!root.pivotSummary) {
      return null;
    }
    root = root.pivotSummary[current.value];
    i++;
  }

  if (root && root.pivotColumnSummary) {
    return root.pivotColumnSummary[path[path.length - 1].field];
  }

  return null;
};

const DataGridRow = React.forwardRef((props: RowProps, ref: any) => {
  const cells = useRef<CellInstance[]>([]);
  const cellRef = useCallback<(c: CellInstance | null | undefined) => void>(
    (c: CellInstance | null | undefined) => {
      if (!c) {
        return;
      }
      cells.current.push(c);
    },
    []
  );
  const domRef = useRef<RefObject<HTMLElement>>(null);
  const columnRenderStartIndex = useRef<number>(0);
  const hasBorderTop = useRef<boolean>(false);
  const hasBorderBottom = useRef<boolean>(false);
  const maxRowspan = useRef<number>(1);
  const scrollingInProgress = useRef<boolean>(false);
  const scrollingDirection = useRef<'horizontal' | 'vertical'>('vertical');

  const cleanupCells = useCallback(() => {
    cells.current = cells.current.filter(Boolean);

    return cells.current;
  }, []);

  const getCells = useCallback(() => {
    return cells.current;
  }, []);

  const prevColumnRenderCount = usePrevious(
    props.columnRenderCount,
    props.columnRenderCount
  );

  if (props.columnRenderCount < prevColumnRenderCount!) {
    cleanupCells();

    // getCells().forEach((cell: any) => {
    //   if (cell.getProps().computedLocked) {
    //     return;
    //   }
    //   // cell.setStateProps(null);
    // });
  }

  const getDOMNode = useCallback(() => {
    return domRef.current;
  }, []);

  const setActiveRowRef = () => {
    props.activeRowRef.current = {
      instance: {
        hasBorderBottom: hasBorderBottom.current,
        hasBorderTop: hasBorderTop.current,
        props,
      },
      node: getDOMNode(),
    };
  };

  if (props.active) {
    setActiveRowRef();
  }

  useEffect(() => {
    if (props.columnRenderStartIndex) {
      setColumnRenderStartIndex(props.columnRenderStartIndex);
    }

    return () => {
      cells.current = [];
    };
  }, []);

  const prevRowIndex = usePrevious(props.rowIndex, props.rowIndex);
  const prevEditing = usePrevious(props.editing, props.editing);
  const prevActive = usePrevious(props.active, props.active);

  useEffect(() => {
    if (props.groupProps && props.rowIndex !== prevRowIndex) {
      // when the grid is scrolled both horiz & vertically
      // and we scroll back up to a group row (with colspan)
      // then we need to recompute visible rows, since the cell with colspan
      // may otherwise be out of view - but still need to be visible
      // due to the colspan it has
      fixForColspan();
    }

    if (props.editing !== prevEditing) {
      updateEditCell();
    }

    if (!prevActive && props.active) {
      setActiveRowRef();
    }
  });

  const onCellUnmount = useCallback(
    (_cellProps: CellProps, cell: CellInstance) => {
      if (cells.current) {
        cells.current = cells.current.filter((c: any) => c !== cell);
      }
    },
    []
  );

  const orderCells = useCallback(() => {
    const cells = cleanupCells();

    const sortedProps = cells
      .map((c: any) => c.getProps())
      .sort((p1, p2) => p1.index - p2.index);

    cells.sort(
      (cell1: any, cell2: any) =>
        cell1.props.renderIndex - cell2.props.renderIndex
    );

    cells.forEach((c: any, i: number) => {
      c.setStateProps(sortedProps[i]);
    });
  }, [cleanupCells]);

  const updateEditCell = useCallback(() => {
    const cells = getCells();
    const { editColumnIndex } = props;

    for (let i = 0, len = cells.length, cell: any; i < len; i++) {
      cell = cells[i];

      if (getCellIndex(cell) === editColumnIndex) {
        setCellIndex(cell, editColumnIndex!);
      }

      if (cell.getProps().inEdit) {
        // if there was another cell in edit, make it update correctly
        setCellIndex(cell, getCellIndex(cell));
      }
    }
  }, [props.editColumnIndex]);

  const fixForColspan = useCallback(() => {
    if (props.computedHasColSpan) {
      setColumnRenderStartIndex(columnRenderStartIndex.current);
    }
  }, [props.computedHasColSpan]);

  const setScrolling = useCallback(
    (scrolling: boolean | 'vertical' | 'horizontal') => {
      const node: HTMLDivElement | null = (getDOMNode() ||
        domRef.current) as HTMLDivElement | null;

      let scrollingDir = scrollingDirection.current;
      if (scrolling !== false) {
        scrollingDirection.current = scrolling as 'vertical' | 'horizontal';
      }

      const oldScrollingInProgress = scrollingInProgress.current;

      scrollingDirection.current = scrollingDir;
      scrollingInProgress.current = scrolling ? true : false;

      if (!node) {
        return;
      }

      if (oldScrollingInProgress !== scrollingInProgress.current) {
        const className = `${CLASS_NAME}--scrolling`;

        if (scrollingInProgress.current) {
          node.classList.add(className);
        } else {
          node.classList.remove(className);
        }
      }
      return;
    },
    []
  );

  const renderRowDetails = useCallback((rowDetailsInfo: any) => {
    if (props.computedRenderRowDetails) {
      return props.computedRenderRowDetails(rowDetailsInfo);
    }

    return 'Please specify `renderRowDetails`';
  }, []);

  const onContextMenu = useCallback(
    (event: MouseEvent) => {
      const { passedProps, onRowContextMenu } = props;

      if (onRowContextMenu) {
        onRowContextMenu(props, event);
      }

      if (passedProps && passedProps.onContextMenu) {
        passedProps.onContextMenu(event, props);
      }
    },
    [props.passedProps, props.passedProps.onContextMenu, props.onRowContextMenu]
  );

  const setCellIndex = useCallback(
    (cell: CellInstance, index: number, cellProps?: CellProps) => {
      cellProps =
        cellProps ||
        (props.computedHasColSpan
          ? getPropsForCells().slice(index, index + 1)[0]
          : getPropsForCells(index, index)[0]);
      cell.setStateProps(cellProps);
    },
    [props.computedHasColSpan]
  );

  const getCellIndex = useCallback((cell: any) => {
    return cell.getProps().computedVisibleIndex;
  }, []);

  const sortCells = useCallback((cells: any[]) => {
    return cells.sort(
      (cell1: any, cell2: any) => getCellIndex(cell1) - getCellIndex(cell2)
    );
  }, []);

  const getCellAt = useCallback((index: number) => {
    return getCells().filter(
      (c: any) => c.getProps().computedVisibleIndex === index
    )[0];
  }, []);

  const getCellById = useCallback((id: string | number) => {
    return getCells().filter((c: any) => c.getProps().id === id)[0];
  }, []);

  const getSortedCells = useCallback(() => {
    return sortCells(getCells().slice());
  }, []);

  const getGaps = useCallback(
    (startIndex: number, endIndex: number): number[] => {
      const visibleCellPositions: { [key: number]: boolean } = {};

      const sortedCells = getSortedCells();

      sortedCells.forEach((cell: any) => {
        const cellProps = cell.getProps();
        if (cellProps.computedLocked) {
          return;
        }
        const { computedVisibleIndex, computedColspan, groupProps } = cellProps;
        if (groupProps && computedVisibleIndex <= groupProps.depth + 1) {
          return;
        }

        visibleCellPositions[computedVisibleIndex] = true;

        if (computedColspan) {
          for (var i = 0; i < computedColspan; i++) {
            visibleCellPositions[computedVisibleIndex + i] = true;
          }
        }
      });

      const gaps = [];

      for (; startIndex <= endIndex; startIndex++) {
        if (!visibleCellPositions[startIndex]) {
          gaps.push(startIndex);
        }
      }

      return gaps;
    },
    []
  );

  const getVirtualizeColumns = useCallback((): boolean => {
    return props.virtualizeColumns;
    return scrollingDirection.current !== 'horizontal'
      ? props.virtualizeColumns
      : false;
  }, [props.virtualizeColumns]);

  const toggleRowExpand = useCallback(
    (rowIndex?: number) => {
      if (typeof rowIndex !== 'number') {
        rowIndex = props.realIndex;
      }
      props.toggleRowExpand(rowIndex!);
    },
    [props.realIndex, props.toggleRowExpand]
  );

  const toggleNodeExpand = useCallback(
    (rowIndex?: number) => {
      if (typeof rowIndex !== 'number') {
        rowIndex = props.realIndex;
      }
      props.toggleNodeExpand(rowIndex!);
    },
    [props.realIndex, props.toggleNodeExpand]
  );

  const loadNodeAsync = useCallback(() => {
    props.loadNodeAsync?.(props.data);
  }, [props.loadNodeAsync, props.data]);

  const isRowExpandable = useCallback(
    (rowIndex?: number) => {
      if (typeof rowIndex !== 'number') {
        rowIndex = props.realIndex;
      }
      return props.isRowExpandableAt(rowIndex!);
    },
    [props.realIndex, props.isRowExpandableAt]
  );

  const setRowExpanded = useCallback(
    (expanded: number | boolean, _?: boolean) => {
      let rowIndex = props.realIndex;
      let _expanded: boolean = expanded as boolean;
      if (typeof expanded === 'number') {
        rowIndex = expanded;
        _expanded = _ as boolean;
      }
      props.setRowExpanded(rowIndex!, _expanded);
    },
    [props.realIndex, props.setRowExpanded]
  );

  const getCurrentGaps = () => {};

  const setColumnRenderStartIndex = useCallback(
    (columnStartIndex: number) => {
      if (columnRenderStartIndex.current === columnStartIndex) {
        return;
      }
      columnRenderStartIndex.current = columnStartIndex;

      if (getVirtualizeColumns() === false) {
        return;
      }

      let newCellProps: CellProps[];
      let renderRange: {
        start: number;
        end: number;
      } | null;

      let cellPropsAt: (index: number) => CellProps;

      if (props.computedHasColSpan) {
        newCellProps = getPropsForCells();
        renderRange = getColumnRenderRange(newCellProps);

        cellPropsAt = (index: number) => newCellProps[index];
      } else {
        renderRange = getColumnRenderRange();
        newCellProps = getPropsForCells(
          renderRange?.start,
          (renderRange?.end || 0) + 1
        );

        cellPropsAt = (index: number) =>
          newCellProps.filter(
            cellProps => cellProps.computedVisibleIndex === index
          )[0];
      }

      if (!renderRange) {
        return;
      }

      const { start, end } = renderRange;
      const gaps = getGaps(start, end);

      if (!gaps.length) {
        return;
      }
      const gapsMap = gaps.reduce((acc, gapIndex) => {
        acc[gapIndex] = true;
        return acc;
      }, {} as { [key: number]: boolean });

      const tempCellMap: Record<number, boolean> = {};

      const calls: [CellInstance, number][] = [];

      getCells().forEach((cell: any) => {
        const cellProps = cell.getProps();
        const {
          groupProps,
          computedVisibleIndex: cellIndex,
          computedColspan,
          computedLocked,
        } = cellProps;

        if (computedLocked) {
          return;
        }
        if (
          !props.groupColumn &&
          groupProps &&
          cellIndex <= groupProps.depth + 1
        ) {
          // don't reuse those cells
          return;
        }

        let outside =
          cellIndex < start || cellIndex > end || cellIndex === undefined;
        if (outside && computedColspan) {
          var endCellIndex = cellIndex + (computedColspan - 1);
          outside =
            (cellIndex < start && endCellIndex < start) || cellIndex > end;
        }
        const outOfView =
          outside || tempCellMap[cellIndex] || gapsMap[cellIndex];
        tempCellMap[cellIndex] = true;
        let newIndex;

        if (outOfView && gaps.length) {
          newIndex = gaps[gaps.length - 1];
          calls.push([cell, newIndex]);

          gaps.length -= 1;
        }
      });

      calls.forEach(call => {
        const cell = call[0];
        const newIndex = call[1];

        setCellIndex(cell, newIndex, cellPropsAt(newIndex));
      });
    },
    [
      props.columnRenderStartIndex,
      props.computedHasColSpan,
      props.columnRenderCount,
      props.virtualizeColumns,
    ]
  );

  const propsRef = useRef(props);
  propsRef.current = props;

  const lastDataSource = usePrevious<TypeDataSource>(
    propsRef.current.dataSourceArray,
    propsRef.current.dataSourceArray
  );
  const lastColumns = usePrevious<TypeDataSource>(
    propsRef.current.columns,
    propsRef.current.columns
  );

  const getPropsForCells = (
    startIndex?: number,
    endIndex?: number
  ): CellProps[] => {
    // if (startIndex !== undefined || endIndex !== undefined) {
    //   console.warn(
    //     'Calling getPropsForCells with start/end index is deprecated. Use .slice instead'
    //   );
    // }
    const props = propsRef.current;
    const initialColumns = props.columns;
    let columns = initialColumns;

    const {
      hasLockedStart,
      data,
      onGroupToggle,
      computedPivot,
      rowHeight,
      remoteRowIndex,
      initialRowHeight,
      lastLockedStartIndex,
      lastLockedEndIndex,
      lastUnlockedIndex,
      minRowHeight,
      realIndex,

      showHorizontalCellBorders,
      showVerticalCellBorders,
      empty,
      treeColumn,
      groupColumn,
      totalDataCount,
      depth,
      dataSourceArray,
      computedGroupBy,
      groupProps,
      summaryProps,
      indexInGroup,
      firstUnlockedIndex,
      firstLockedEndIndex,
      selectAll,
      deselectAll,
      columnUserSelect,
      multiSelect,
      selection,
      setRowSelected,
      computedRowExpandEnabled,
      rtl,
      last: lastRow,
      computedCellSelection,
      lastNonEmpty,
      maxVisibleRows,
      onCellClick,
      editStartEvent,
      naturalRowHeight,
      renderNodeTool,
      computedTreeEnabled,
      expanded: rowExpanded,
      expandGroupTitle,
      expandColumn: expandColumnFn,
      onCellSelectionDraggerMouseDown,
      onCellMouseDown,
      onCellEnter,
      computedCellMultiSelectionEnabled,
      getCellSelectionKey,
      lastCellInRange,
      computedRowspans,
      renderIndex,
      nativeScroll,
      onDragRowMouseDown,
      theme,
      onContextMenu,
      setActiveIndex,
      renderTreeCollapseTool,
      renderTreeExpandTool,
      renderGroupCollapseTool,
      renderGroupExpandTool,
      renderTreeLoadingTool,
      onColumnMouseEnter,
      onColumnMouseLeave,
      columnIndexHovered,
      computedEnableColumnHover,
      columnHoverClassName,
      enableColumnAutosize,
      renderRowDetailsExpandIcon,
      renderRowDetailsCollapsedIcon,
      disabledRow,
    } = props;

    const dataSourceChange = !shallowequal(
      lastDataSource,
      props.dataSourceArray
    );
    const columnsChange = !shallowequal(lastColumns, props.columns);

    const expandColumnId: string | undefined = expandColumnFn
      ? expandColumnFn({ data })
      : undefined;

    const virtualizeColumns = getVirtualizeColumns();

    const visibleColumnCount = columns.length;

    const expandColumnIndex = expandColumnId
      ? columns.filter(c => c.id === expandColumnId)[0]?.computedVisibleIndex
      : undefined;

    if (startIndex !== undefined) {
      columns = columns.slice(
        startIndex,
        endIndex ? endIndex + 1 : startIndex + 1
      );
    }
    startIndex = startIndex || 0;

    let hasBorderTopVar: boolean | number | undefined = false;
    let hasBorderBottomVar: boolean | number | undefined = false;

    const hiddenCells: any = {};
    const belongsToColspan: any = {};
    const columnsTillColspanStart: any = {};

    const lastInGroup = indexInGroup == props.groupCount - 1;

    const activeCell =
      props.computedActiveCell && getCellSelectionKey
        ? getCellSelectionKey(...props.computedActiveCell)
        : null;
    const lastInRange = lastCellInRange || activeCell || null;

    let maxRowspanVar = 1;

    const cellPropsArray = columns.map((column, xindex) => {
      let theColumnIndex = xindex + startIndex!;
      const columnProps: any = column;

      const { name, computedVisibleIndex } = columnProps;

      let value = data ? data[name!] : null;
      const rowIndex = realIndex;

      if (groupProps && data && data.groupColumnSummary) {
        value = data.groupColumnSummary[name!];
      }
      if (groupProps && data && column.groupColumn) {
        // this is the first column, the group column in a pivot grid
        // so make group cells have the group value
        value = data.value;
      }
      if (columnProps.pivotColumnPath) {
        // this is a pivot column
        value = data.pivotSummary
          ? getValueForPivotColumn(
              data.pivotSummary,
              columnProps.pivotColumnPath
            )
          : value;
      }

      if (columnProps.pivotGrandSummaryColumn) {
      } else {
        if (columnProps.pivotSummaryPath) {
          value = data.pivotSummary
            ? getValueForPivotColumnSummary(data, {
                pivotSummaryPath: columnProps.pivotSummaryPath,
                pivotGrandSummaryColumn: columnProps.pivotGrandSummaryColumn,
              })
            : value;
        }
      }

      const defaults: { userSelect?: boolean } = {};
      if (columnUserSelect !== undefined) {
        defaults.userSelect = columnUserSelect;
      }
      const groupTitleCell =
        !groupColumn &&
        groupProps &&
        groupProps.depth + 1 == computedVisibleIndex;

      const groupExpandCell =
        !groupColumn && groupProps && groupProps.depth == computedVisibleIndex;

      let hidden = groupProps
        ? expandGroupTitle && !groupColumn
          ? computedVisibleIndex > groupProps.depth + 1
          : false
        : false;

      if (
        expandColumnIndex != null &&
        computedVisibleIndex > expandColumnIndex
      ) {
        hidden = true;
      }
      const cellProps: CellProps = {
        ...defaults,
        ...columnProps,
        remoteRowIndex,
        indexInColumns: theColumnIndex,
        depth,
        expandColumnIndex,
        expandColumn: expandColumnIndex === computedVisibleIndex,
        editStartEvent,
        onCellClick,
        computedRowspan: computedRowspans ? computedRowspans[column.id] : 1,
        groupNestingSize: props.groupNestingSize,
        treeNestingSize: props.treeNestingSize,
        data,
        naturalRowHeight,
        totalDataCount,
        onCellSelectionDraggerMouseDown,
        onCellMouseDown,
        onCellEnter,
        rtl,
        computedPivot,
        selectAll,
        deselectAll,
        selection,
        renderNodeTool,

        onDragRowMouseDown,

        multiSelect,
        treeColumn:
          treeColumn !== undefined ? treeColumn === columnProps.id : false,
        setRowSelected,
        setRowExpanded: computedRowExpandEnabled ? setRowExpanded : null,
        toggleRowExpand: computedRowExpandEnabled ? toggleRowExpand : null,
        toggleNodeExpand: computedTreeEnabled ? toggleNodeExpand : null,
        loadNodeAsync: computedTreeEnabled ? loadNodeAsync : null,
        rowActive: props.active,
        rowSelected: props.selected,
        rowExpanded,
        rowIndex,
        rowHeight,
        groupColumnVisible: !!groupColumn,
        minRowHeight,
        groupProps,
        summaryProps,
        empty,
        computedGroupBy,
        nativeScroll,
        computedCellMultiSelectionEnabled,
        lastRowInGroup: lastInGroup,
        columnIndex: computedVisibleIndex,
        first: computedVisibleIndex == 0,
        last: computedVisibleIndex == visibleColumnCount - 1,
        value,
        virtualizeColumns,
        hasLockedStart,
        rowIndexInGroup: indexInGroup,
        rowRenderIndex: renderIndex,
        hidden,

        groupTitleCell,
        groupExpandCell,
        isRowExpandable: computedRowExpandEnabled ? isRowExpandable : null,
        tryRowCellEdit: tryRowCellEdit,
        tryNextRowEdit: tryNextRowEdit,
        onGroupToggle,
        initialRowHeight: rowExpanded ? initialRowHeight : rowHeight,
        theme,
        onContextMenu,
        setActiveIndex,
        renderTreeCollapseTool,
        renderTreeExpandTool,
        renderGroupCollapseTool,
        renderGroupExpandTool,
        renderTreeLoadingTool,
        onColumnMouseEnter,
        onColumnMouseLeave,
        columnIndexHovered,
        computedEnableColumnHover,
        columnHoverClassName,
        renderRowDetailsExpandIcon,
        renderRowDetailsCollapsedIcon,
        disabledRow,
        dataSourceChange,
        columnsChange,
      };

      if (computedCellSelection && getCellSelectionKey) {
        cellProps.cellSelected =
          computedCellSelection[
            getCellSelectionKey(rowIndex, computedVisibleIndex)
          ];
        if (cellProps.cellSelected) {
          cellProps.hasRightSelectedSibling = cellProps.last
            ? false
            : computedCellSelection[
                getCellSelectionKey(rowIndex, computedVisibleIndex + 1)
              ];
          cellProps.hasLeftSelectedSibling = cellProps.first
            ? false
            : computedCellSelection[
                getCellSelectionKey(rowIndex, computedVisibleIndex - 1)
              ];
          cellProps.hasTopSelectedSibling =
            computedCellSelection[
              getCellSelectionKey(rowIndex! - 1, computedVisibleIndex)
            ];
          cellProps.hasBottomSelectedSibling =
            computedCellSelection[
              getCellSelectionKey(rowIndex! + 1, computedVisibleIndex)
            ];
        }
      }

      if (getCellSelectionKey && (activeCell || lastInRange)) {
        const cellKey = getCellSelectionKey(rowIndex, computedVisibleIndex);
        if (activeCell && activeCell === cellKey) {
          cellProps.cellActive = true;
        }
        if (lastInRange && lastInRange === cellKey) {
          cellProps.lastInRange = true;
        }
      }

      if (
        cellProps.visibilityTransitionDuration ||
        cellProps.showTransitionDuration ||
        cellProps.hideTransitionDuration
      ) {
        (cellProps as any).onTransitionEnd = onTransitionEnd(
          cellProps,
          columnProps
        );
      }

      if (props.editing && props.editColumnIndex === cellProps.columnIndex) {
        cellProps.inEdit = true;
        cellProps.editValue = props.editValue;
      }

      if (
        (virtualizeColumns && !cellProps.computedLocked) ||
        enableColumnAutosize ||
        props.editable ||
        cellProps.computedEditable
      ) {
        cellProps.cellRef = cellRef;
        cellProps.onUnmount = onCellUnmount;
      }

      const { computedLocked, colspan } = cellProps;

      const lockedStart = computedLocked === 'start';
      const lockedEnd = computedLocked === 'end';
      const unlocked = !computedLocked;

      let computedColspan = 1;

      if (typeof colspan === 'function') {
        computedColspan = cellProps.computedColspan = Math.max(
          1,
          colspan({
            remoteRowIndex,
            dataSourceArray,
            data: cellProps.data,
            value: cellProps.value,
            rowIndex: cellProps.rowIndex,
            column,
            columns,
            empty,
          })
        );

        if (lockedStart) {
          computedColspan = clamp(
            computedColspan,
            1,
            Math.max(lastLockedStartIndex! - computedVisibleIndex + 1, 1)
          );
        }
        if (lockedEnd) {
          computedColspan = clamp(
            computedColspan,
            1,
            Math.max(lastLockedEndIndex! - computedVisibleIndex + 1, 1)
          );
        }
        if (unlocked) {
          computedColspan = clamp(
            computedColspan,
            1,
            Math.max(lastUnlockedIndex! - computedVisibleIndex + 1, 1)
          );
        }
        if (computedColspan > 1) {
          cellProps.computedWidth = columns
            .slice(theColumnIndex, theColumnIndex + computedColspan)
            .reduce((sum, col) => {
              if (col.id !== column.id) {
                hiddenCells[col.id] = true;

                if (column.computedLocked === col.computedLocked) {
                  belongsToColspan[col.id] = column.id;
                  columnsTillColspanStart[col.id] =
                    col.computedVisibleIndex - column.computedVisibleIndex;
                }
              }
              return sum + col.computedWidth;
            }, 0);
        }
      }

      cellProps.lastInSection = lockedStart
        ? computedVisibleIndex + computedColspan - 1 === firstUnlockedIndex - 1
        : lockedEnd
        ? computedVisibleIndex + computedColspan - 1 === visibleColumnCount - 1
        : computedVisibleIndex + computedColspan - 1 ===
          firstLockedEndIndex - 1;

      cellProps.firstInSection = lockedStart
        ? computedVisibleIndex === 0
        : lockedEnd
        ? computedVisibleIndex === firstLockedEndIndex
        : computedVisibleIndex === firstUnlockedIndex;

      if (computedGroupBy && !groupColumn && !!cellProps.depth) {
        cellProps.noBackground = computedVisibleIndex < cellProps.depth;
      }
      if (hiddenCells[column.id]) {
        cellProps.hidden = true;
      }
      if (belongsToColspan[column.id]) {
        cellProps.computedColspanedBy = belongsToColspan[column.id];
        cellProps.computedColspanToStart = columnsTillColspanStart[column.id];
      }

      if ((groupProps && !groupColumn) || expandColumnIndex != null) {
        adjustCellProps(cellProps, props);
      }

      if (cellProps.hidden) {
        cellProps.last = false;
        cellProps.lastInSection = false;
      } else {
        cellProps.showBorderLeft =
          showVerticalCellBorders && computedVisibleIndex > 0;
        cellProps.showBorderBottom = showHorizontalCellBorders;

        if (!showVerticalCellBorders && computedGroupBy) {
          cellProps.showBorderLeft =
            computedVisibleIndex > 0 &&
            computedVisibleIndex <= computedGroupBy.length;
        }

        if (computedGroupBy) {
          if (!cellProps.groupProps) {
            cellProps.showBorderBottom = groupColumn
              ? showHorizontalCellBorders
              : computedVisibleIndex >= computedGroupBy.length &&
                showHorizontalCellBorders;

            // look behind for a summary
            const summaryBefore =
              indexInGroup === 0 && !groupColumn
                ? dataSourceArray[rowIndex! - indexInGroup]
                : null;
            if (
              summaryBefore &&
              summaryBefore.__summary &&
              computedVisibleIndex >= computedGroupBy.length
            ) {
              cellProps.showBorderBottom = false;
            }
          }

          if (!empty) {
            if (
              !groupColumn &&
              (computedVisibleIndex < computedGroupBy.length || lastInGroup)
            ) {
              cellProps.showBorderBottom = rowExpanded;
            }

            if (cellProps.groupProps) {
              cellProps.showBorderBottom = cellProps.groupProps.collapsed
                ? !!groupColumn
                : groupColumn
                ? true
                : computedVisibleIndex > cellProps.groupProps.depth! &&
                  cellProps.groupProps.depth! >= computedGroupBy.length;

              cellProps.showBorderTop =
                groupTitleCell ||
                groupExpandCell ||
                (!expandGroupTitle && !groupColumn);
            } else if (indexInGroup === 0 && !groupColumn) {
              cellProps.showBorderTop =
                computedVisibleIndex >= computedGroupBy.length;
            }

            if (lastNonEmpty && !lastRow && showHorizontalCellBorders) {
              cellProps.showBorderBottom =
                computedVisibleIndex >=
                (cellProps.groupProps
                  ? cellProps.groupProps.depth!
                  : computedGroupBy.length);
            }
          } else if (rowIndex! > 0 && showHorizontalCellBorders) {
            if (rowIndex === totalDataCount) {
              cellProps.showBorderBottom =
                computedVisibleIndex >= computedGroupBy.length;
            } else {
              cellProps.showBorderBottom = computedGroupBy
                ? computedVisibleIndex >= computedGroupBy.length
                : true;
            }
          }
        }

        if (lastRow) {
          cellProps.showBorderBottom =
            rowIndex! < maxVisibleRows! - 1 || rowExpanded;
        }

        if (lockedStart && cellProps.lastInSection) {
          // the last cell in lock start should have a right border
          cellProps.showBorderRight = true;
        }
        if (lockedEnd && computedVisibleIndex === firstLockedEndIndex) {
          // the first cell in the lock end group should have a left border
          cellProps.showBorderLeft = true;
        }

        if (
          cellProps.groupProps &&
          computedVisibleIndex >= cellProps.groupProps.depth! + 1 &&
          !groupColumn &&
          props.expandGroupTitle
        ) {
          cellProps.showBorderLeft = false;
        }

        if (cellProps.summaryProps) {
          cellProps.showBorderBottom = lastRow;

          cellProps.showBorderTop =
            computedVisibleIndex > cellProps.summaryProps.depth;

          if (cellProps.summaryProps.position == 'start') {
            cellProps.showBorderTop =
              computedVisibleIndex >= cellProps.summaryProps.depth;

            cellProps.showBorderBottom = false;
          }

          cellProps.showBorderLeft = showVerticalCellBorders
            ? true
            : computedVisibleIndex <= cellProps.summaryProps.depth;

          if (
            computedVisibleIndex > cellProps.summaryProps.depth &&
            computedVisibleIndex <= computedGroupBy!.length &&
            !groupColumn
          ) {
            cellProps.showBorderLeft = false;
          }

          if (computedVisibleIndex === 0) {
            cellProps.showBorderLeft = false;
          }

          cellProps.noBackground = !groupColumn;
        }

        // the first cell in unlocked group should have no left border, if there are locked start cols
        if (firstUnlockedIndex === computedVisibleIndex && hasLockedStart) {
          cellProps.showBorderLeft = false;
        }

        if (cellProps.groupSpacerColumn && rowExpanded) {
          cellProps.showBorderBottom = false;
        }

        // only show borders for visible cells
        if (cellProps.last) {
          cellProps.showBorderRight = true;
        }

        const prevColumn = columns[theColumnIndex - 1];
        const nextColumn = columns[theColumnIndex + 1];

        if (
          nextColumn &&
          nextColumn.prevBorderRight !== undefined &&
          !(lockedStart && cellProps.lastInSection)
        ) {
          cellProps.showBorderRight = nextColumn.prevBorderRight;
        }

        if (prevColumn && prevColumn.nextBorderLeft !== undefined) {
          cellProps.showBorderLeft = prevColumn.nextBorderLeft;
        }

        if (columnProps.showBorderRight !== undefined) {
          cellProps.showBorderRight = columnProps.showBorderRight;
        }
        if (columnProps.showBorderLeft !== undefined) {
          cellProps.showBorderLeft = columnProps.showBorderLeft;
        }
      }

      if (cellProps.computedEditable) {
        cellProps.onEditStopForRow = onCellStopEdit;
        cellProps.onEditStartForRow = onCellStartEdit;
        cellProps.onEditCancelForRow = onCellEditCancel;
        cellProps.onEditValueChangeForRow = onCellEditValueChange;
        cellProps.onEditCompleteForRow = onCellEditComplete;
      }

      hasBorderBottomVar = hasBorderBottomVar || cellProps.showBorderBottom;
      hasBorderTopVar = hasBorderTopVar || cellProps.showBorderTop;

      return cellProps;
    });

    maxRowspan.current = maxRowspanVar;

    if (props.computedEnableRowspan) {
      props.setRowSpan && props.setRowSpan(maxRowspan.current);
    }

    hasBorderTop.current = hasBorderTopVar;
    hasBorderBottom.current = hasBorderBottomVar;

    return cellPropsArray;
  };

  const onCellStopEdit = useCallback(
    (value: any, cellProps: CellProps) => {
      if (props.onEditStop) {
        props.onEditStop({
          value,
          data: cellProps.data,
          rowId: props.getItemId(cellProps.data),
          columnId: cellProps.id!,
          columnIndex: cellProps.computedVisibleIndex!,
          rowIndex: cellProps.rowIndex!,
          cellProps,
        });
      }
    },
    [props.onEditStop]
  );

  const onCellStartEdit = useCallback(
    (value: any, cellProps: CellProps) => {
      if (props.onEditStart) {
        props.onEditStart({
          data: cellProps.data,
          value,
          rowId: props.getItemId(cellProps.data),
          columnId: cellProps.id!,
          columnIndex: cellProps.computedVisibleIndex!,
          rowIndex: cellProps.rowIndex!,
          cellProps,
        });
      }
    },
    [props.onEditStart]
  );

  const onCellEditCancel = useCallback(
    (cellProps: CellProps) => {
      if (props.onEditCancel) {
        props.onEditCancel({
          data: cellProps.data,
          rowId: props.getItemId(cellProps.data),
          columnIndex: cellProps.computedVisibleIndex!,
          columnId: cellProps.id!,
          rowIndex: cellProps.rowIndex!,
          cellProps,
        });
      }
    },
    [props.onEditCancel]
  );

  const onCellEditValueChange = useCallback(
    (value: any, cellProps: CellProps) => {
      if (props.onEditValueChange) {
        props.onEditValueChange({
          value,
          data: cellProps.data,
          rowId: props.getItemId(cellProps.data),
          columnId: cellProps.id!,
          columnIndex: cellProps.computedVisibleIndex!,
          rowIndex: cellProps.rowIndex!,
          cellProps,
        });
      }
    },
    [props.onEditValueChange]
  );

  const onCellEditComplete = useCallback(
    (value: any, cellProps: CellProps) => {
      if (props.onEditComplete) {
        props.onEditComplete({
          value,
          data: cellProps.data,
          rowId: props.getItemId(cellProps.data),
          columnId: cellProps.id!,
          columnIndex: cellProps.computedVisibleIndex!,
          rowIndex: cellProps.rowIndex!,
          cellProps,
        });
      }
    },
    [props.onEditComplete]
  );

  const tryRowCellEdit = useCallback(
    (editIndex: number, dir: -1 | 0 | 1 = 0, isEnterNavigation: boolean) => {
      const cols = props.columns;
      let col;
      let colIndex;

      if (!dir) {
        dir = 1;
      }
      dir = dir == 1 ? 1 : -1;
      let currentIndex = dir == 1 ? 0 : cols.length - 1;

      const foundCols: TypeComputedColumn[] = [];

      while (cols[currentIndex]) {
        col = cols[currentIndex];

        if (col.editable || (props.editable && col.editable !== false)) {
          colIndex = col.computedVisibleIndex;
          if (colIndex == editIndex) {
            foundCols.push(col);
          } else {
            if (dir < 0) {
              if (colIndex < editIndex) {
                foundCols.push(col);
              }
            } else if (dir > 0) {
              if (colIndex > editIndex) {
                foundCols.push(col);
              }
            }
          }
        }
        currentIndex += dir;
      }

      if (!foundCols.length) {
        tryNextRowEdit(
          dir,
          isEnterNavigation ? editIndex : dir > 0 ? 0 : props.columns.length - 1
        );
        return Promise.reject(null);
      }

      foundCols.sort((a: any, b: any) => {
        // if dir > 0, sort asc, otherwise, desc
        return dir > 0 ? a - b : b - a;
      });

      // let retries: any = {};

      return new Promise((resolve, reject) => {
        const startEdit = (cols: any, index = 0) => {
          props.currentEditCompletePromise.current
            .then(() => {
              const errBack = () => {
                isEnterNavigation
                  ? tryNextRowEdit(dir, editIndex, true)
                  : startEdit(cols, index + 1);
              };

              const col = cols[index];
              if (!col) {
                tryNextRowEdit(
                  dir,
                  isEnterNavigation
                    ? editIndex
                    : dir > 0
                    ? 0
                    : props.columns.length - 1
                );
                return reject('column not found');
              }

              const cell = getCellById(col.id);
              if (!cell) {
                // if (retries[col.id]) {
                //   return reject('column not found');
                // }
                // retries[col.id] = true;

                if (props.scrollToColumn) {
                  props.scrollToColumn(col.id, undefined, () => {
                    setTimeout(() => {
                      startEdit(cols, index);
                    }, 20);
                  });
                }
                return;
              }

              setTimeout(() => {
                return (
                  cell.startEdit &&
                  cell
                    .startEdit(undefined, errBack)
                    .then(resolve)
                    .catch(errBack)
                );
              }, 0);
            })
            .catch((error: any) => reject(error));

          return;
        };

        startEdit(foundCols, 0);
      });
    },
    [
      props.columns,
      props.editable,
      props.currentEditCompletePromise,
      props.rowIndex,
      props.scrollToColumn,
    ]
  );

  const tryNextRowEdit = useCallback(
    (dir: 1 | 0 | -1, columnIndex: any, isEnterNavigation?: boolean) => {
      if (props.scrollToIndexIfNeeded) {
        props.scrollToIndexIfNeeded(
          props.rowIndex + 2 * dir,
          { direction: dir == -1 ? 'top' : 'bottom' },
          () => {
            if (props.tryNextRowEdit) {
              props.tryNextRowEdit(
                props.rowIndex + dir,
                dir,
                columnIndex,
                isEnterNavigation
              );
            }
          }
        );
      }
    },
    [props.rowIndex, props.scrollToIndexIfNeeded, props.tryNextRowEdit]
  );

  const onTransitionEnd = useCallback(
    (cellProps: CellProps, columnProps: any, e?: any) => {
      e.stopPropagation();

      if (columnProps.onTransitionEnd) {
        columnProps.onTransitionEnd(e);
      }

      if (props.onTransitionEnd) {
        props.onTransitionEnd(e, cellProps);
      }
    },
    [props.onTransitionEnd]
  );

  const getColumnRenderRange = useCallback(
    (
      cellProps?: CellProps[]
    ): {
      start: number;
      end: number;
    } | null => {
      const virtualizeColumns = getVirtualizeColumns();

      if (!virtualizeColumns) {
        return null;
      }

      const minStartIndex = props.lockedStartColumns.length
        ? props.lockedStartColumns.length
        : props.groupProps && !props.groupColumn //when there is a groupColumn, start virtualization from there
        ? props.groupProps.depth + 2
        : 0;
      const maxEndIndex =
        props.columns.length - props.lockedEndColumns.length - 1;

      let columnStartIndex =
        columnRenderStartIndex.current == null
          ? props.columnRenderStartIndex || 0
          : columnRenderStartIndex.current;

      columnStartIndex = Math.max(columnStartIndex, minStartIndex);

      const fixStartIndexForColspan = () => {
        if (cellProps) {
          while (cellProps[columnStartIndex].computedColspanedBy) {
            columnStartIndex--;
          }
        }
      };

      if (props.columnRenderCount != null) {
        let columnRenderEndIndex = columnStartIndex + props.columnRenderCount;
        columnRenderEndIndex = Math.min(columnRenderEndIndex, maxEndIndex);

        if (
          columnRenderEndIndex - props.columnRenderCount !=
          columnStartIndex
        ) {
          columnStartIndex = Math.max(
            columnRenderEndIndex - props.columnRenderCount,
            minStartIndex
          );
        }

        if (columnRenderEndIndex < 0) {
          return {
            start: 0,
            end: 0,
          };
        }

        fixStartIndexForColspan();

        return { start: columnStartIndex, end: columnRenderEndIndex };
      }

      return null;
    },
    [
      props.virtualizeColumns,
      props.columnRenderCount,
      props.lockedStartColumns,
      props.lockedEndColumns,
      props.groupColumn,
      props.groupProps,
      props.columnRenderStartIndex,
      props.columns,
    ]
  );

  const expandRangeWithColspan = useCallback(
    (
      range: { start: number; end: number },
      cellProps: CellProps[]
    ): { start: number; end: number } => {
      let extraNeededColumns = cellProps.reduce(
        (total: number, cellProps: CellProps) => {
          return (
            total +
            (cellProps.computedColspan! > 1
              ? cellProps.computedColspan! - 1
              : 0)
          );
        },
        0
      );

      if (!extraNeededColumns) {
        return range;
      }

      if (range.start < props.firstUnlockedIndex) {
        range.start = props.firstUnlockedIndex;
      }
      if (range.start > extraNeededColumns) {
        range.start -= extraNeededColumns;

        return range;
      }

      extraNeededColumns -= range.start;
      range.start = 0;

      if (extraNeededColumns) {
        range.end += extraNeededColumns;
      }

      return range;
    },
    []
  );

  const renderRowInstance = (_: any, __: any, style: any) => {
    const {
      scrollLeft,
      hasLockedStart,
      hasLockedEnd,
      lockedStartColumns,
      lockedEndColumns,
      computedHasColSpan,
      groupProps,
      columns,
    } = props;
    const virtualizeColumns = getVirtualizeColumns();

    let cellProps: CellProps[];

    if (!virtualizeColumns) {
      cellProps = getPropsForCells();
    } else {
      let lockedStartCellProps: CellProps[] = [];
      let lockedEndCellProps: CellProps[] = [];
      let groupCellProps: CellProps[] = [];

      let renderRange: {
        start: number;
        end: number;
      };

      if (computedHasColSpan) {
        cellProps = getPropsForCells();

        if (hasLockedStart) {
          lockedStartCellProps = cellProps.slice(0, lockedStartColumns.length);
        } else if (groupProps) {
          groupCellProps = cellProps.slice(0, groupProps.depth + 2);
        }

        if (hasLockedEnd) {
          lockedEndCellProps = cellProps.slice(
            columns.length - lockedEndColumns.length,
            columns.length
          );
        }

        renderRange = getColumnRenderRange(cellProps)!;
        if (renderRange) {
          renderRange = expandRangeWithColspan(renderRange, cellProps);
          cellProps = cellProps.slice(renderRange.start, renderRange.end + 1);
        }
      } else {
        renderRange = getColumnRenderRange()!;

        cellProps = getPropsForCells(renderRange?.start, renderRange?.end || 0);
        if (hasLockedStart) {
          lockedStartCellProps = getPropsForCells(
            0,
            lockedStartColumns.length - 1
          );
        } else if (groupProps) {
          groupCellProps = getPropsForCells(0, groupProps.depth + 2 - 1);
        }
        if (hasLockedEnd) {
          lockedEndCellProps = getPropsForCells(
            lockedEndColumns[0].computedVisibleIndex,
            columns.length - 1
          );
        }
      }

      if (hasLockedStart) {
        cellProps = [...lockedStartCellProps, ...cellProps];
      } else if (groupProps) {
        cellProps = [...groupCellProps, ...cellProps];
      }
      if (hasLockedEnd) {
        cellProps.push(...lockedEndCellProps);
      }
    }

    const result = cellProps.map((cProps, index) => {
      let cell;
      let key: number | string = index;

      if (!virtualizeColumns) {
        key = cProps.id || index;
      }

      if (props.cellFactory) {
        cell = props.cellFactory(cProps);
      }

      if (cell === undefined) {
        cell = (
          <Cell
            {...cProps}
            timestamp={Date.now()}
            cellRef={cProps.cellRef ? cProps.cellRef : null}
            key={key}
          />
        );
      }

      return cell;
    });

    return renderCellsMaybeLocked(result, props, scrollLeft, undefined, style);
  };

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (props.computedTreeEnabled && props.expandOnMouseDown) {
        toggleNodeExpand(props.rowIndex);
      }
      if (props.onClick) {
        props.onClick(event, props);
      }
      if (props.passedProps && props.passedProps.onClick) {
        props.passedProps.onClick(event, props);
      }
    },
    [
      props.passedProps,
      props.computedTreeEnabled,
      props.rowIndex,
      props.expandOnMouseDown,
      props.onClick,
    ]
  );

  const onMouseDown = useCallback(
    (event: MouseEvent) => {
      if (props.onMouseDown) {
        props.onMouseDown(event, props);
      }
    },
    [props.onMouseDown]
  );

  useImperativeHandle(ref, () => {
    return {
      onCellUnmount,
      cleanupCells,
      getDOMNode,
      orderCells,
      updateEditCell,
      fixForColspan,
      setScrolling,
      renderRowDetails,
      onContextMenu,
      setCellIndex,
      getCellIndex,
      sortCells,
      getCellAt,
      getCellById,
      getCells,
      getSortedCells,
      getGaps,
      getVirtualizeColumns,
      toggleRowExpand,
      toggleNodeExpand,
      loadNodeAsync,
      isRowExpandable,
      setRowExpanded,
      setColumnRenderStartIndex,
      getPropsForCells,
      onCellStopEdit,
      onCellStartEdit,
      onCellEditCancel,
      onCellEditValueChange,
      onCellEditComplete,
      tryRowCellEdit,
      tryNextRowEdit,
      onTransitionEnd,
      getColumnRenderRange,
      expandRangeWithColspan,
      renderRow,
      onClick,
      onMouseDown,
      getCurrentGaps,
      rowProps,
      domRef: domRef,
      props,
    };
  });

  const {
    rowHeight,
    initialRowHeight,
    maxRowHeight,
    groupNestingSize,
    summaryProps,
    data,
    id,
    columns,
    minWidth,
    maxWidth,
    rowStyle,
    scrollbars,
    renderRow,
    computedRowExpandEnabled,
    even,
    odd,
    active,
    selected,
    expanded,
    passedProps,
    realIndex,
    remoteRowIndex,
    nativeScroll,
    indexInGroup,
    naturalRowHeight,
    rowDetailsStyle,
    renderDetailsGrid,
    last,
    empty,
    computedPivot,
    computedShowZebraRows,
    rowDetailsWidth,

    availableWidth,
    groupProps,
    groupColumn,
    dataSourceArray,
    onRenderRow,
    shouldRenderCollapsedRowDetails,
    editing,
    rtl,
    sticky,
    hasLockedEnd,
    hasLockedStart,
    showHorizontalCellBorders,
    disabledRow,
    rowspanZIndex,
  } = props;

  let { rowClassName } = props;
  const virtualizeColumns = getVirtualizeColumns();

  const lastInGroup = indexInGroup == props.groupCount - 1;

  const hasRowSpan =
    props.computedRowspans &&
    Object.keys(props.computedRowspans)
      .map((name: string) => {
        const rowspan = props.computedRowspans[name];

        return rowspan > 1;
      })
      .find((rowSpan: boolean) => rowSpan === true);

  let className = join(
    props.className,
    CLASS_NAME,
    scrollingInProgress.current && `${CLASS_NAME}--scrolling`,
    empty && `${CLASS_NAME}--empty`,
    editing && `${CLASS_NAME}--editing`,
    `${CLASS_NAME}--direction-${rtl ? 'rtl' : 'ltr'}`,
    computedShowZebraRows &&
      even &&
      (!groupProps || computedPivot) &&
      `${CLASS_NAME}--even`,
    computedShowZebraRows &&
      odd &&
      (!groupProps || computedPivot) &&
      `${CLASS_NAME}--odd`,
    !computedShowZebraRows && !groupProps && `${CLASS_NAME}--no-zebra`,
    groupProps && `${CLASS_NAME}--group-row`,
    summaryProps && `${CLASS_NAME}--summary-row`,
    summaryProps && `${CLASS_NAME}--summary-position-${summaryProps.position}`,
    groupProps && groupProps.collapsed && `${CLASS_NAME}--collapsed`,
    selected && `${CLASS_NAME}--selected`,
    expanded && `${CLASS_NAME}--expanded`,
    hasLockedStart
      ? `${CLASS_NAME}--has-locked-start`
      : `${CLASS_NAME}--no-locked-start`,
    hasLockedEnd
      ? `${CLASS_NAME}--has-locked-end`
      : `${CLASS_NAME}--no-locked-end`,
    showHorizontalCellBorders && `${CLASS_NAME}--show-horizontal-borders`,
    active && `${CLASS_NAME}--active`,
    virtualizeColumns && `${CLASS_NAME}--virtualize-columns`,
    rowHeight && `${CLASS_NAME}--rowheight`,
    naturalRowHeight && `${CLASS_NAME}--natural-rowheight`,
    realIndex == 0 && `${CLASS_NAME}--first`,
    last && `${CLASS_NAME}--last`,
    indexInGroup == 0 && `${CLASS_NAME}--first-in-group`,
    lastInGroup && `${CLASS_NAME}--last-in-group`,
    // hasRowSpan ? `${CLASS_NAME}--has-rowspan` : '',
    disabledRow ? `${CLASS_NAME}--disabled` : ''
  );

  if (passedProps) {
    className = join(className, selected && passedProps.selectedClassName);
  }

  let style = {
    ...props.style,
    height: naturalRowHeight ? null : rowHeight,
    width: props.width,
    minWidth,
    direction: 'ltr',
  };

  if (hasRowSpan) {
    style.zIndex = rowspanZIndex;
  }

  if (maxWidth != null) {
    style.maxWidth = maxWidth;
  }

  if (maxRowHeight != null) {
    style.maxHeight = maxRowHeight;
  }

  if (rowStyle) {
    if (typeof rowStyle === 'function') {
      const rowStyleResult = rowStyle({ data, props, style });
      if (rowStyleResult !== undefined) {
        style = { ...style, ...rowStyleResult };
      }
    } else {
      style = { ...style, ...rowStyle };
    }
  }

  if (rowClassName) {
    if (typeof rowClassName === 'function') {
      rowClassName = rowClassName({ data, props, className });
    }
    if (rowClassName && typeof rowClassName == 'string') {
      className = join(className, rowClassName);
    }
  }

  const rowProps: EnhancedRowProps = {
    ...props,
    className,
    style,
    ref: domRef,
    ...passedProps,
    // passedProps should not overwrite the following methods
    // onEvent prop will be called also
    onClick: !disabledRow ? onClick : null,
    // onMouseDown: onMouseDown,
    onContextMenu: !disabledRow ? onContextMenu : null,
  };

  rowProps.children = [
    <div
      key="cellWrap"
      className="InovuaReactDataGrid__row-cell-wrap InovuaReactDataGrid__row-hover-target"
      style={{
        width: props.width,
        height: (naturalRowHeight ? null : rowHeight) as number,
        position: 'absolute',
        top: 0,
        left: rtl ? -(props.emptyScrollOffset || 0) : 0,
      }}
    >
      {renderRowInstance(data, columns, style)}
    </div>,
  ];

  const groupDepth = groupColumn
    ? 0
    : data && data.__group
    ? data.depth - 1
    : data && data.__summary
    ? rowProps.summaryProps.depth
    : props.depth || 0;

  const activeBordersDiv = sticky ? (
    <div
      key="active-row-borders"
      className={join(
        `${CLASS_NAME}-active-borders`,
        hasBorderTop.current && `${CLASS_NAME}-active-borders--has-border-top`,
        hasBorderBottom.current &&
          `${CLASS_NAME}-actived-borders--has-border-bottom`
      )}
    />
  ) : null;

  const shouldRender = expanded || shouldRenderCollapsedRowDetails;
  if (computedRowExpandEnabled && shouldRender && !data.__group) {
    const rowDetailsInfo = {
      data,
      rtl,
      isRowExpandable: isRowExpandable,
      rowIndex: realIndex,
      remoteRowIndex,
      rowId: props.getItemId(data),
      rowExpanded: expanded,
      id,
      rowSelected: selected,
      rowActive: active,
      toggleRowExpand: toggleRowExpand,
      setRowExpanded: setRowExpanded,
      dataSource: dataSourceArray,
    };

    let detailsStyle: CSSProperties = {
      position: 'absolute',
      height: rowHeight - initialRowHeight,
      overflow: renderDetailsGrid ? 'visible' : 'auto',
      top: initialRowHeight,
    };
    if (rtl) {
      detailsStyle.direction = 'rtl';
    }
    if (rowDetailsWidth == 'max-viewport-width') {
      detailsStyle.width = Math.min(
        availableWidth,
        (props.width || maxWidth) as number
      );
    }
    if (rowDetailsWidth === 'min-viewport-width') {
      detailsStyle.width = Math.max(
        availableWidth,
        (props.width || maxWidth) as number
      );
    }
    if (rowDetailsWidth === 'viewport-width') {
      detailsStyle.width = availableWidth;
    }
    if (groupDepth) {
      detailsStyle[rtl ? 'paddingRight' : 'paddingLeft'] =
        (groupNestingSize || 0) * groupDepth;
    }
    detailsStyle[rtl ? 'right' : 'left'] = 0;
    if (isNaN(detailsStyle.width as number)) {
      delete detailsStyle.width;
    }
    if (!expanded) {
      detailsStyle.display = 'none';
    }

    if (
      rowProps.memorizedScrollLeft &&
      rowDetailsWidth !== 'min-viewport-width'
    ) {
      const scrollLeftMax =
        rowProps.getScrollLeftMax && rowProps.getScrollLeftMax();
      const scrollLeft = !rtl
        ? rowProps.memorizedScrollLeft
        : -(scrollLeftMax - rowProps.memorizedScrollLeft);
      detailsStyle.transform = `translate3d(${scrollLeft}px, 0px, 0px)`;
    }

    if (rowDetailsStyle) {
      if (typeof rowDetailsStyle === 'function') {
        let styleResult = rowDetailsStyle(detailsStyle, rowDetailsInfo);
        if (styleResult !== undefined) {
          detailsStyle = styleResult;
        }
      } else {
        detailsStyle = { ...detailsStyle, ...rowDetailsStyle };
      }
    }

    let showBorderBottom = !lastInGroup || last;
    if (nativeScroll && last && expanded) {
      showBorderBottom = false;
    }

    rowProps.children.push(
      <div
        key="rowDetails"
        style={detailsStyle}
        onClick={skipSelect}
        className={join(
          `${CLASS_NAME}-details`,
          `${CLASS_NAME}-details--${rowDetailsWidth}`,
          renderDetailsGrid ? `${CLASS_NAME}-details--details-grid` : null,
          !nativeScroll ||
            (nativeScroll && scrollbars && !scrollbars!.vertical) ||
            availableWidth > minWidth!
            ? `${CLASS_NAME}-details--show-border-right`
            : null,
          showBorderBottom ? `${CLASS_NAME}-details--show-border-bottom` : ''
        )}
      >
        {renderRowDetails(rowDetailsInfo)}
      </div>,

      <div
        className={`${CLASS_NAME}-details-special-bottom-border`}
        key="row-details-special-bottom-border"
        style={{
          [rtl ? 'right' : 'left']: (groupDepth || 0) * groupNestingSize,
        }}
      />,
      groupDepth
        ? [...new Array(groupDepth)].map((_, index) => (
            <div
              key={index}
              className={`${CLASS_NAME}-details-border`}
              style={{
                height: '100%',
                position: 'absolute',
                [rtl ? 'right' : 'left']: (index + 1) * groupNestingSize,
                top: 0,
              }}
            />
          ))
        : null,

      rowDetailsWidth != 'max-viewport-width' ? (
        <div
          key="rowDetailsBorder"
          style={{
            top: initialRowHeight - 1,
            width: availableWidth,
            [rtl ? 'right' : 'left']: (groupDepth || 0) * groupNestingSize,
          }}
          className={`${CLASS_NAME}-details-special-top-border`}
        />
      ) : null
    );
  }

  if (sticky) {
    if (activeBordersDiv) {
      rowProps.children.push(
        <div
          key="active-row-borders"
          className={`InovuaReactDataGrid__row-active-borders-wrapper`}
          style={{
            // height: initialRowHeight,
            height: '100%', //initialRowHeight,
            position: 'absolute',

            top: 0,
            [rtl ? 'right' : 'left']: (groupNestingSize || 0) * groupDepth,
            width: availableWidth - (groupNestingSize || 0) * groupDepth,
            pointerEvents: 'none',
          }}
        >
          {activeBordersDiv}
        </div>
      );
    }
  }

  let row;
  if (renderRow) {
    row = renderRow!(rowProps);
  }

  if (onRenderRow) {
    onRenderRow!(rowProps);
  }

  if (row === undefined) {
    row = (
      <div
        {...cleanProps(rowProps, DataGridRow.propTypes)}
        id={null}
        data={null}
        value={null}
      />
    );
  }

  return row;
});

const emptyFn = () => {};

DataGridRow.defaultProps = {
  onClick: emptyFn,
  onMouseEnter: emptyFn,
  onMouseLeave: emptyFn,
  onMouseDown: emptyFn,
  columnRenderStartIndex: 0,
  showAllGroupCells: false,
};

DataGridRow.propTypes = {
  rowActive: PropTypes.bool,
  rowSelected: PropTypes.bool,
  availableWidth: PropTypes.number,
  computedGroupBy: PropTypes.array,
  expandGroupTitle: PropTypes.bool,
  expandColumn: PropTypes.any,
  getCellSelectionKey: PropTypes.func,
  depth: PropTypes.number,
  columns: PropTypes.array,
  columnsMap: PropTypes.shape({}),
  active: PropTypes.bool,
  computedActiveCell: PropTypes.any,
  cellFactory: PropTypes.func,
  computedCellMultiSelectionEnabled: PropTypes.bool,
  computedCellSelection: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  columnRenderCount: PropTypes.number,
  columnRenderStartIndex: PropTypes.number,
  columnUserSelect: PropTypes.bool,
  deselectAll: PropTypes.func,
  empty: PropTypes.bool,
  even: PropTypes.bool,
  firstLockedEndIndex: PropTypes.number,
  firstLockedStartIndex: PropTypes.number,
  firstUnlockedIndex: PropTypes.number,
  flex: PropTypes.number,
  groupCount: PropTypes.number,
  groupNestingSize: PropTypes.number,
  treeNestingSize: PropTypes.number,
  groupProps: PropTypes.object,
  summaryProps: PropTypes.object,
  hasLockedEnd: PropTypes.bool,
  hasLockedStart: PropTypes.bool,
  indexInGroup: PropTypes.number,
  last: PropTypes.bool,
  lastCellInRange: PropTypes.any,
  lastNonEmpty: PropTypes.bool,
  lastRowInGroup: PropTypes.bool,
  lockedEndColumns: PropTypes.array,
  lockedStartColumns: PropTypes.array,
  maxRowHeight: PropTypes.number,
  minRowHeight: PropTypes.number,
  maxVisibleRows: PropTypes.number,
  minWidth: PropTypes.number,
  multiSelect: PropTypes.bool,
  odd: PropTypes.bool,
  onArrowDown: PropTypes.func,
  onArrowUp: PropTypes.func,
  onCellClick: PropTypes.func,
  onCellEnter: PropTypes.func,
  onCellMouseDown: PropTypes.func,
  onCellSelectionDraggerMouseDown: PropTypes.func,
  onRowContextMenu: PropTypes.func,
  passedProps: PropTypes.object,
  realIndex: PropTypes.number,
  renderIndex: PropTypes.number,
  renderRow: PropTypes.func,
  onRenderRow: PropTypes.func,
  rowHeight: PropTypes.number,
  rowExpandHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  initialRowHeight: PropTypes.number,
  defaultRowHeight: PropTypes.number,
  emptyScrollOffset: PropTypes.number,
  rowIndex: PropTypes.number,
  remoteRowIndex: PropTypes.number,
  rowIndexInGroup: PropTypes.bool,
  rowStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  scrollLeft: PropTypes.number,
  selectAll: PropTypes.func,
  selected: PropTypes.bool,
  expanded: PropTypes.bool,
  selection: PropTypes.any,
  computedRowExpandEnabled: PropTypes.bool,
  computedTreeEnabled: PropTypes.bool,
  computedRenderRowDetails: PropTypes.func,
  isRowExpandableAt: PropTypes.func,
  setRowSelected: PropTypes.func,
  setRowExpanded: PropTypes.func,
  toggleRowExpand: PropTypes.func,
  toggleNodeExpand: PropTypes.func,
  expandOnMouseDown: PropTypes.bool,
  loadNodeAsync: PropTypes.func,
  showAllGroupCells: PropTypes.bool,
  computedShowCellBorders: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  showHorizontalCellBorders: PropTypes.bool,
  showVerticalCellBorders: PropTypes.bool,
  totalColumnCount: PropTypes.number,
  totalComputedWidth: PropTypes.number,
  totalDataCount: PropTypes.number,
  totalLockedEndWidth: PropTypes.number,
  totalLockedStartWidth: PropTypes.number,
  totalUnlockedWidth: PropTypes.number,
  unlockedColumns: PropTypes.array,
  virtualizeColumns: PropTypes.bool,

  nativeScroll: PropTypes.bool,
  shouldRenderCollapsedRowDetails: PropTypes.bool,
  rowDetailsStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),

  dataSourceArray: PropTypes.array,
  getItemId: PropTypes.func.isRequired,

  editable: PropTypes.bool,
  editing: PropTypes.bool,
  editValue: PropTypes.any,
  editRowIndex: PropTypes.number,
  editColumnIndex: PropTypes.number,
  editColumnId: PropTypes.any,

  naturalRowHeight: PropTypes.bool,
  renderDetailsGrid: PropTypes.func,

  scrollToColumn: PropTypes.func,
  scrollToIndexIfNeeded: PropTypes.func,
  renderNodeTool: PropTypes.func,
  computedEnableRowspan: PropTypes.bool,
  setRowSpan: PropTypes.func,
  treeColumn: PropTypes.string,
  scrollbars: PropTypes.shape({
    horizontal: PropTypes.bool,
    vertical: PropTypes.bool,
  }),

  rtl: PropTypes.bool,
  computedPivot: PropTypes.array,
  groupColumnSummaries: PropTypes.any,
  groupSummary: PropTypes.any,
  groupColumn: PropTypes.any,
  lastUnlockedIndex: PropTypes.number,
  lastLockedEndIndex: PropTypes.number,
  lastLockedStartIndex: PropTypes.number,
  computedShowZebraRows: PropTypes.bool,
  computedRowspans: PropTypes.any,
  editStartEvent: PropTypes.string,
  onGroupToggle: PropTypes.func,
  onEditStop: PropTypes.func,
  onEditStart: PropTypes.func,
  onEditCancel: PropTypes.func,
  onEditValueChange: PropTypes.func,
  onEditComplete: PropTypes.func,
  onFilterValueChange: PropTypes.func,
  tryNextRowEdit: PropTypes.func,
  getScrollLeftMax: PropTypes.func,
  activeRowRef: PropTypes.any,
  sticky: PropTypes.bool,
  edition: PropTypes.string,
  computedLicenseValid: PropTypes.bool,
  parentGroupDataArray: PropTypes.any,
  rowDetailsWidth: PropTypes.oneOf([
    'max-viewport-width',
    'min-viewport-width',
    'viewport-width',
  ]),
  memorizedScrollLeft: PropTypes.number,
  computedHasColSpan: PropTypes.bool,
  onRowReorder: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  onDragRowMouseDown: PropTypes.func,
  renderLockedStartCells: PropTypes.func,
  renderLockedEndCells: PropTypes.func,
  setActiveIndex: PropTypes.func,
  renderTreeCollapseTool: PropTypes.func,
  renderTreeExpandTool: PropTypes.func,
  renderTreeLoadingTool: PropTypes.func,
  currentEditCompletePromise: PropTypes.any,
  enableColumnAutosize: PropTypes.bool,
  columnHoverClassName: PropTypes.string,
  computedEnableColumnHover: PropTypes.bool,
  onColumnMouseEnter: PropTypes.func,
  onColumnMouseLeave: PropTypes.func,
  columnIndexHovered: PropTypes.number,
  renderRowDetailsExpandIcon: PropTypes.func,
  renderRowDetailsCollapsedIcon: PropTypes.func,
  renderGroupCollapseTool: PropTypes.func,
  renderGroupExpandTool: PropTypes.func,
  disabledRow: PropTypes.bool,
  rowspanZIndex: PropTypes.number,
} as any;

export default React.memo(
  DataGridRow,
  (prevProps: RowProps, nextProps: RowProps): boolean => {
    let areEqual = equalReturnKey(prevProps, nextProps, {
      computedActiveCell: 1,
      computedActiveIndex: 1,
      columnRenderStartIndex: 1,
      activeRowRef: 1,
      active: 1,
      onKeyDown: 1,
      onFocus: 1,
      setRowSpan: 1,
      passedProps: 1,
      computedRowspans: 1,
      lockedStartColumns: 1,
      selection: 1,
      lockedEndColumns: 1,
      unlockedColumns: 1,
      maxVisibleRows: 1,
      onClick: 1,
      style: 1,
      loadNodeAsync: 1,
      scrollToIndexIfNeeded: 1,
      onColumnMouseEnter: 1,
      onColumnMouseLeave: 1,
      // computedCellSelection: 1,
      getCellSelectionKey: 1,
    });

    if (areEqual.result) {
      if (prevProps.computedActiveCell != nextProps.computedActiveCell) {
        const [oldRowIndex] = prevProps.computedActiveCell || [];
        const [newRowIndex] = nextProps.computedActiveCell || [];

        if (
          oldRowIndex === nextProps.rowIndex ||
          newRowIndex === nextProps.rowIndex
        ) {
          return false;
        }
      }
    }

    if (!areEqual.result) {
      // const theDiff = diff(rowClean(nextProps), rowClean(prevProps));
      // console.log(
      //   'UPDATE ROW (HOOKS)',
      //   nextProps.rowIndex,
      //   areEqual.key,
      //   //   // prevProps[areEqual.key!],
      //   //   // nextProps[areEqual.key!],
      //   theDiff,
      //   theDiff.updated.map((prop: any) => {
      //     return { prop, old: prevProps[prop], new: nextProps[prop] };
      //   })
      // );
      return false;
    }

    if (prevProps.active !== nextProps.active) {
      return false;
    }
    if (JSON.stringify(prevProps.style) !== JSON.stringify(nextProps.style)) {
      return false;
    }

    let prevActiveCellRow, prevActiveColumn;
    let activeCellRow, activeColumn;
    if (prevProps.computedActiveCell) {
      [prevActiveCellRow, prevActiveColumn] = prevProps.computedActiveCell;
    }
    if (nextProps.computedActiveCell) {
      [activeCellRow, activeColumn] = nextProps.computedActiveCell;
    }

    if (activeCellRow !== prevActiveCellRow) {
      if (
        nextProps.rowIndex === activeCellRow ||
        nextProps.rowIndex === prevActiveCellRow
      ) {
        return false;
      }
    } else {
      if (
        nextProps.rowIndex === activeCellRow &&
        activeColumn !== prevActiveColumn
      ) {
        return false;
      }
    }

    return true;
  }
);
