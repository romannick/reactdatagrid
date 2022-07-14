/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  RefObject,
  ReactNode,
  CSSProperties,
  cloneElement,
  ReactElement,
} from 'react';
import PropTypes from 'prop-types';
import Region from '../../../packages/region';

import shallowequal, { equalReturnKey } from '../../../packages/shallowequal';

import RENDER_HEADER from './renderHeader';
import groupTool from './renderGroupTool';
import nodeTool from './renderNodeTool';

import sealedObjectFactory from '../../../utils/sealedObjectFactory';
import join from '../../../packages/join';
import isFocusable from '../../../utils/isFocusable';
import bemFactory from '../../../bemFactory';
import renderSortTool from './renderSortTool';

import { id as REORDER_COLUMN_ID } from '../../../normalizeColumns/defaultRowReorderColumnId';
import TextEditor from './editors/Text';
import Renderable from '../../../types/TypeRenderable';
import {
  EnhancedCellProps,
  CellRenderObject,
  CellProps,
  CellInstance,
  TypeState,
} from './CellProps';
// import { setupResizeObserver } from '../../../utils/setupResizeObserver';
// import diff from '../../../packages/shallow-changes';

const cellBem = bemFactory('InovuaReactDataGrid__cell');
const headerBem = bemFactory('InovuaReactDataGrid__column-header');

const emptyObject = Object.freeze ? Object.freeze({}) : {};

const emptyFn = () => {};

const CELL_RENDER_OBJECT: CellRenderObject = sealedObjectFactory({
  empty: null,
  value: null,
  data: null,
  columnIndex: null,
  rowIndex: null,
  remoteRowIndex: null,
  rowIndexInGroup: null,
  nodeProps: null,
  rowSelected: null,
  rowExpanded: null,
  treeColumn: null,
  setRowSelected: null,
  setRowExpanded: null,
  isRowExpandable: null,
  toggleRowExpand: null,
  toggleNodeExpand: null,
  loadNodeAsync: null,
  toggleGroup: null,
  cellProps: null,
  totalDataCount: null,
  rendersInlineEditor: null,
  renderRowDetailsExpandIcon: null,
  renderRowDetailsCollapsedIcon: null,
  renderRowDetailsMoreIcon: null,
});

const CELL_RENDER_SECOND_OBJ = sealedObjectFactory({
  cellProps: null,
  column: null,
  headerProps: null,
});

const wrapInContent = (value: Renderable) => (
  <div
    key="content"
    className="InovuaReactDataGrid__cell__content"
    children={value}
  />
);

function InovuaDataGridCell(props: CellProps) {
  const domRef: RefObject<unknown> = useRef(null);
  const isCancelled = useRef<boolean>(false);
  const sortTimeoutId: any = useRef(null);
  const lastEditCompleteTimestamp = useRef<number>(0);
  const unmounted = useRef<boolean>(false);
  const cleanupResizeObserver = useRef<any>(null);
  const callbackRef = useRef<any>(undefined);

  const [theState, setState] = useState<TypeState>({ props });

  const useInitialProps =
    !theState.props || props.timestamp > theState.props.timestamp;
  const state = useInitialProps
    ? { ...theState, props, left: props.left || 0 }
    : theState;

  const latestPropsRef = useRef(state.props);
  latestPropsRef.current = state.props;

  const getProps = useCallback(() => {
    return latestPropsRef.current!;
  }, []);

  const updateState = useCallback(
    (newState: TypeState, callback?: Function) => {
      callbackRef.current = callback;

      setState(newState);
    },
    []
  );

  const updateProps = useCallback(
    (props: CellProps & { fromState?: boolean }, callback?: any) => {
      props.timestamp = Date.now();
      const newState = { props };

      updateState(newState, callback);
    },
    []
  );

  const setStateProps = useCallback(
    (stateProps: CellProps) => {
      if (unmounted.current) {
        return;
      }
      const newProps = Object.assign(
        {},
        InovuaDataGridCell.defaultProps,
        stateProps
      );

      if (!shallowequal(newProps, getProps(), { timestamp: 1 })) {
        updateProps(newProps);
      }
    },
    [getProps]
  );

  useEffect(() => {
    const callback = callbackRef.current;
    if (callback && typeof callback === 'function') {
      callback();
    }
    callbackRef.current = null;
  }, [state]);

  useEffect(() => {
    if (props.onMount) {
      props.onMount(props, cellInstance);
    }

    props.cellRef?.(cellInstance);

    // if (props.naturalRowHeight) {
    //   const node = getDOMNode();
    //   cleanupResizeObserver.current = setupResizeObserver(node, size => {
    //     props.onResize?.({
    //       cell: cellInstance,
    //       props: getProps(),
    //       size,
    //     });
    //   });
    // }

    return () => {
      if (cleanupResizeObserver.current) {
        const cleanupResizeObserverFn: any = cleanupResizeObserver.current;
        cleanupResizeObserverFn();
      }
      if (props.onUnmount) {
        props.onUnmount(props, cellInstance);
      }

      unmounted.current = true;
    };
  }, []);

  const getDOMNode = useCallback(() => {
    return domRef.current;
  }, []);

  const onUpdate = useCallback(() => {
    if (props.onUpdate) {
      props.onUpdate(getProps(), cellInstance);
    }
  }, [props.onUpdate]);

  const setDragging = useCallback(
    (dragging: boolean, callback?: Function) => {
      const newState: {
        dragging?: boolean;
        right?: number;
        left?: number;
        top?: number;
      } = { dragging };
      if (!dragging) {
        newState.top = 0;
        if (props.rtl) {
          newState.right = 0;
        } else {
          newState.left = 0;
        }
      }
      updateState(newState, callback);
    },
    [props.rtl]
  );

  const setLeft = useCallback((left: number) => {
    updateState({ left });
  }, []);

  const setRight = useCallback((right: number) => {
    updateState({ right });
  }, []);

  const setTop = useCallback((top: number) => {
    updateState({ top });
  }, []);

  const setHeight = useCallback((height: number) => {
    updateState({ height });
  }, []);

  const setWidth = useCallback((width: number) => {
    updateState({ width });
  }, []);

  const prepareStyle = (thisProps: CellProps) => {
    const {
      maxWidth,
      minRowHeight,
      computedLocked,
      computedWidth,
      computedOffset,
      rowHeight,
      initialRowHeight,
      naturalRowHeight,
      headerCell,
      hidden,
      rtl,
      inTransition,
      inShowTransition,
      computedRowspan,
      zIndex,
    } = thisProps;

    const style: any = {};

    if (typeof thisProps.style === 'function') {
      if (!headerCell) {
        Object.assign(style, thisProps.style(thisProps));
      }
    } else {
      Object.assign(style, thisProps.style);
    }

    style.width = computedWidth;
    style.minWidth = computedWidth;

    if (minRowHeight) {
      style.minHeight = minRowHeight;
    }

    if (headerCell) {
      style.maxWidth = computedWidth;
    }

    if (maxWidth) {
      style.maxWidth = maxWidth;
    }

    if (!headerCell) {
      if (rowHeight && !naturalRowHeight) {
        style.height = rowHeight;
      }

      if (naturalRowHeight) {
        style.minHeight = minRowHeight;
      } else {
        if (initialRowHeight) {
          style.height = initialRowHeight;
        }
        if (rowHeight && computedRowspan! > 1) {
          style.height = (initialRowHeight || rowHeight) * computedRowspan!;
        }
      }
    }

    if (hidden) {
      style.display = 'none';
    }

    if (!headerCell && !computedLocked) {
      // style.position = naturalRowHeight ? 'relative' : 'absolute';
      style.position = naturalRowHeight ? 'relative' : 'absolute';
      style.top = 0;
      if (!naturalRowHeight) {
        if (rtl) {
          style.right = computedOffset;
        } else {
          style.left = computedOffset;
        }
      }
    }

    if (state && state.dragging) {
      if (rtl) {
        style.right = state.right || 0;
      } else {
        style.left = state.left || 0;
      }
      style.top = state.top || 0;
      style.height = state.height || '';

      if (!thisProps.computedResizable && thisProps.computedFilterable) {
        if (rtl) {
          style.right = 0;
        } else {
          style.left = 0;
        }
        style.top = 0;
      }
      style.position = 'absolute';
      style.zIndex = 100;
    }

    if (zIndex) {
      style.zIndex = zIndex;
    }

    if (computedWidth === 0) {
      style.paddingLeft = 0;
      style.paddingRight = 0;
    }

    if (inTransition) {
      let duration: boolean | number | undefined = inShowTransition
        ? thisProps.showTransitionDuration
        : thisProps.hideTransitionDuration;

      duration = duration || thisProps.visibilityTransitionDuration;

      style.transitionDuration =
        typeof duration == 'number' ? `${duration}ms` : duration;
    }

    return style;
  };

  const prepareClassName = (thisProps: CellProps) => {
    const {
      groupCell: isGroupCell,
      groupTitleCell,
      groupExpandCell,
      headerCell: isHeaderCell,
      headerCellDefaultClassName,
      cellDefaultClassName,
      computedGroupBy,
      depth,
      computedVisibleIndex,
      headerCell,
      headerEllipsis,
      groupProps,
      hidden,
      showBorderRight,
      showBorderTop,
      showBorderBottom,
      showBorderLeft,
      firstInSection,
      lastInSection,
      noBackground,
      computedLocked,
      computedWidth,
      inTransition,
      rowSelected,
      computedRowspan,
      cellSelected,
      cellActive,
      groupSpacerColumn,
      computedPivot,
      computedResizable,
      groupColumnVisible,
      computedFilterable,
      rtl,
      inEdit,
      columnIndex,
      columnIndexHovered,
      columnHoverClassName,
    } = thisProps;

    let { userSelect, headerUserSelect } = thisProps;

    if (typeof userSelect === 'boolean') {
      userSelect = userSelect ? 'text' : 'none';
    }
    if (typeof headerUserSelect === 'boolean') {
      headerUserSelect = headerUserSelect ? 'text' : 'none';
    }

    const nested =
      depth != null &&
      computedVisibleIndex == 0 &&
      !headerCell &&
      !groupColumnVisible;

    const baseClassName = isHeaderCell
      ? headerCellDefaultClassName
      : cellDefaultClassName;

    const commonClassName = join(
      !computedLocked && `${baseClassName}--unlocked`,
      computedLocked && `${baseClassName}--locked`,
      computedLocked && `${baseClassName}--locked-${computedLocked}`
    );

    const last =
      thisProps.last ||
      thisProps.computedVisibleIndex == thisProps.computedVisibleCount! - 1;

    const propsClassName =
      typeof thisProps.className === 'function'
        ? thisProps.className(thisProps)
        : thisProps.className;

    let className = join(
      propsClassName,
      baseClassName,
      commonClassName,
      !isHeaderCell && thisProps.cellClassName,
      (nested || hidden) && `${baseClassName}--no-padding`,
      hidden && `${baseClassName}--hidden`,
      `${baseClassName}--direction-${rtl ? 'rtl' : 'ltr'}`,
      computedRowspan! > 1 && `${baseClassName}--rowspan`,
      inTransition && `${baseClassName}--transition`,
      inTransition && computedWidth && `${baseClassName}--showing`,
      inTransition && !computedWidth && `${baseClassName}--hiding`,
      computedWidth === 0 && `${baseClassName}--no-size`,
      nested && `${baseClassName}--stretch`,
      (isHeaderCell && headerUserSelect == null) || !isHeaderCell
        ? userSelect && `${baseClassName}--user-select-${userSelect}`
        : null,
      groupExpandCell && `${baseClassName}--group-expand-cell`,
      groupTitleCell && `${baseClassName}--group-title-cell`,
      rowSelected && `${baseClassName}--selected`,
      groupProps && `${baseClassName}--group-cell`,
      computedPivot && `${baseClassName}--pivot-enabled`,
      groupSpacerColumn && `${baseClassName}--group-column-cell`,
      inEdit && `${baseClassName}--in-edit`,
      cellSelected && `${baseClassName}--cell-selected`,
      cellActive && `${baseClassName}--cell-active`,
      thisProps.textAlign &&
        (isHeaderCell ? !thisProps.headerAlign : true) &&
        `${baseClassName}--align-${thisProps.textAlign}`,
      thisProps.textVerticalAlign &&
        (isHeaderCell ? !thisProps.headerVerticalAlign : true) &&
        `${baseClassName}--vertical-align-${thisProps.textVerticalAlign}`,
      thisProps.virtualizeColumns && `${baseClassName}--virtualize-columns`,
      thisProps.computedVisibleIndex === 0 && `${baseClassName}--first`,
      thisProps.rowIndexInGroup === 0 && `${baseClassName}--first-row-in-group`,
      last && `${baseClassName}--last`,
      showBorderLeft &&
        computedWidth !== 0 &&
        (!isHeaderCell || !(computedResizable || computedFilterable)) &&
        `${baseClassName}--show-border-${rtl ? 'right' : 'left'}`,
      firstInSection && `${baseClassName}--first-in-section`,
      lastInSection && `${baseClassName}--last-in-section`,
      showBorderRight &&
        computedWidth !== 0 &&
        (!isHeaderCell || !(computedResizable || computedFilterable)) &&
        `${baseClassName}--show-border-${rtl ? 'left' : 'right'}`,
      showBorderTop && `${baseClassName}--show-border-top`,
      showBorderBottom && `${baseClassName}--show-border-bottom`,
      noBackground && `${baseClassName}--no-background`,
      columnIndex === columnIndexHovered
        ? columnHoverClassName
          ? join(`${baseClassName}--over`, columnHoverClassName)
          : `${baseClassName}--over`
        : ''
    );

    if (cellSelected) {
      className = join(
        className,
        thisProps.hasTopSelectedSibling &&
          `${baseClassName}--cell-has-top-selected-sibling`,
        thisProps.hasBottomSelectedSibling &&
          `${baseClassName}--cell-has-bottom-selected-sibling`,
        thisProps.hasLeftSelectedSibling &&
          `${baseClassName}--cell-has-${
            rtl ? 'right' : 'left'
          }-selected-sibling`,
        thisProps.hasRightSelectedSibling &&
          `${baseClassName}--cell-has-${
            rtl ? 'left' : 'right'
          }-selected-sibling`
      );
    }

    if (isHeaderCell) {
      className = join(
        className,
        commonClassName,
        thisProps.headerClassName,
        thisProps.titleClassName,
        state && state.dragging && `${baseClassName}--dragging`,
        state && state.left && `${baseClassName}--reordered`,
        thisProps.computedSortable && `${baseClassName}--sortable`,
        headerUserSelect && `${baseClassName}--user-select-${headerUserSelect}`,
        last && !headerEllipsis && `${baseClassName}--overflow-hidden`,
        `${baseClassName}--align-${thisProps.headerAlign || 'start'}`,
        thisProps.group
          ? `${baseClassName}--has-group`
          : `${baseClassName}--has-no-group`,
        thisProps.headerVerticalAlign &&
          `${baseClassName}--vertical-align-${thisProps.headerVerticalAlign}`,
        thisProps.computedResizable
          ? `${baseClassName}--resizable`
          : `${baseClassName}--unresizable`,
        thisProps.computedLockable
          ? `${baseClassName}--lockable`
          : `${baseClassName}--unlockable`,
        thisProps.lastInGroup && `${baseClassName}--last-in-group`
      );
    } else {
      className = join(
        className,
        (groupProps
          ? groupProps.depth == computedVisibleIndex
          : computedGroupBy
          ? computedGroupBy.length === computedVisibleIndex
          : computedVisibleIndex === 0) &&
          `${baseClassName}--active-row-left-border`
      );
    }

    if (isGroupCell) {
      className = join(className, 'InovuaReactDataGrid__group-cell');
    }

    return className;
  };

  const getInitialIndex = useCallback(() => {
    return props.computedVisibleIndex;
  }, [props.computedVisibleIndex]);

  const getcomputedVisibleIndex = useCallback(() => {
    return getProps().computedVisibleIndex;
  }, []);

  const renderNodeTool = (thisProps: CellProps): ReactElement | undefined => {
    const {
      data,
      renderTreeCollapseTool,
      renderTreeExpandTool,
      renderTreeLoadingTool,
    } = thisProps;
    const nodeProps = data.__nodeProps || emptyObject;

    const leafNode = nodeProps.leafNode;
    const loading = nodeProps.loading;
    const expanded = nodeProps.expanded;
    const collapsed = !expanded;

    const style: CSSProperties = {
      [props.rtl ? 'marginRight' : 'marginLeft']:
        (nodeProps.depth || 0) * thisProps.treeNestingSize!,
    };

    if (props.rtl && collapsed) {
      style.transform = 'rotate(180deg)';
    }
    const element: any = nodeTool(
      {
        render: thisProps.renderNodeTool,
        nodeExpanded: expanded,
        nodeCollapsed: collapsed,
        nodeLoading: loading,
        leafNode: leafNode,
        nodeProps,
        node: data,
        rtl: props.rtl,
        size: 20,
        style,
        toggleNodeExpand: thisProps.toggleNodeExpand,
        renderTreeCollapseTool,
        renderTreeExpandTool,
        renderTreeLoadingTool,
      },
      thisProps
    );

    if (!element) {
      return;
    }

    return cloneElement(element, { key: 'nodeTool' });
  };

  const getInitialDOMProps = useCallback((): object => {
    const thisProps: CellProps = getProps();

    let domProps = thisProps.domProps;
    let specificDomProps = thisProps.headerCell
      ? thisProps.headerDOMProps
      : thisProps.cellDOMProps;

    if (typeof domProps == 'function') {
      domProps = domProps(thisProps);
    }
    if (typeof specificDomProps == 'function') {
      specificDomProps = specificDomProps(thisProps);
    }

    return Object.assign({}, domProps, specificDomProps);
  }, [
    getProps,
    props.domProps,
    props.headerCell,
    props.headerDOMProps,
    props.cellDOMProps,
  ]);

  const renderEditor = (_props?: CellProps) => {
    const thisProps: CellProps = getProps();

    const editorProps = {
      nativeScroll: thisProps.nativeScroll,
      ...thisProps.editorProps,
      editorProps: thisProps.editorProps,
      cell: cellInstance,
      cellProps: thisProps,
      value: thisProps.editValue,
      theme: thisProps.theme,
      rtl: thisProps.rtl,

      autoFocus: true,

      onChange: onEditValueChange,
      onComplete: onEditorComplete,
      onCancel: onEditorCancel,

      onEnterNavigation: onEditorEnterNavigation,
      onTabNavigation: onEditorTabNavigation,
      gotoNext: gotoNextEditor,
      gotoPrev: gotoPrevEditor,

      key: 'editor',

      onClick: onEditorClick,
    };

    const Editor = thisProps.editor;
    if (Editor) {
      return <Editor {...editorProps} />;
    }

    if (thisProps.renderEditor) {
      return thisProps.renderEditor(
        editorProps,
        editorProps.cellProps,
        cellInstance
      );
    }

    return <TextEditor {...editorProps} />;
  };

  const isInEdit = useCallback(() => {
    return getProps().inEdit;
  }, [props.inEdit]);

  const getEditable = useCallback(
    (editValue: string, thisProps: CellProps = getProps()) => {
      if (thisProps.groupSpacerColumn || thisProps.groupProps) {
        return Promise.resolve(false);
      }
      const { computedEditable: editable } = thisProps;

      if (typeof editable === 'function') {
        return Promise.resolve(editable(editValue, thisProps));
      }

      return Promise.resolve(editable);
    },
    [props.groupSpacerColumn, props.groupProps, props.computedEditable]
  );

  const onEditorTabLeave = (_direction: -1 | null | 1) => {};

  const gotoNextEditor = useCallback(() => {
    return (
      props.tryRowCellEdit &&
      props.tryRowCellEdit(getProps().computedVisibleIndex! + 1, +1)
    );
  }, [props.tryRowCellEdit, props.computedVisibleIndex]);

  const gotoPrevEditor = useCallback(() => {
    props.tryRowCellEdit &&
      props.tryRowCellEdit(getProps().computedVisibleIndex! - 1, -1);
  }, [props.tryRowCellEdit, props.computedVisibleIndex]);

  const onEditorEnterNavigation = useCallback(
    (complete: boolean, dir: number) => {
      const thisProps = getProps();
      if (typeof dir !== 'number') {
        dir = 0;
      }

      const newIndex = props.rowIndex! + dir;
      if (!complete) {
        stopEdit();
        if (newIndex != props.rowIndex) {
          props.tryNextRowEdit &&
            props.tryNextRowEdit(dir, props.columnIndex!, true);
        }
      } else {
        onEditorComplete();
        if (newIndex != thisProps.rowIndex) {
          props.tryNextRowEdit &&
            props.tryNextRowEdit(dir, thisProps.columnIndex!, true);
        }
      }
    },
    [props.tryNextRowEdit, props.rowIndex, props.columnIndex]
  );

  const onEditorTabNavigation = useCallback(
    (complete: boolean, dir: number) => {
      const thisProps = getProps();
      if (typeof dir !== 'number') {
        dir = 0;
      }

      const newIndex = thisProps.computedVisibleIndex! + dir;
      if (!complete) {
        stopEdit();
        if (newIndex != thisProps.computedVisibleIndex) {
          props.tryRowCellEdit && props.tryRowCellEdit(newIndex, dir);
        }
      } else {
        onEditorComplete();
        if (newIndex != thisProps.computedVisibleIndex) {
          props.tryRowCellEdit && props.tryRowCellEdit(newIndex, dir);
        }
      }
    },
    [props.computedVisibleIndex]
  );

  const onEditorClick = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  const onEditorCancel = useCallback(() => {
    cancelEdit();
  }, []);

  const startEdit = useCallback(
    (
      editValue?: any,
      errBack?: (...args: any[]) => any
    ): Promise<void> | Promise<boolean | undefined> => {
      const thisProps: CellProps = getProps();

      isCancelled.current = false;

      const editValuePromise =
        editValue === undefined
          ? getEditStartValue(thisProps)
          : Promise.resolve(editValue);

      return (
        editValuePromise
          .then(editValue => {
            return getEditable(editValue, thisProps).then(editable => {
              if (!editable) {
                return Promise.reject(editable);
              }

              if (thisProps.onEditStart) {
                thisProps.onEditStart(editValue, thisProps);
              }
              if (thisProps.onEditStartForRow) {
                thisProps.onEditStartForRow(editValue, thisProps);
              }
              return editValue;
            });
          })
          // in order to not show console.error message in console
          .catch(errBack || (_err => {}))
      );
    },
    [props.onEditStart, props.onEditStartForRow]
  );

  const stopEdit = useCallback(
    (editValue: string = getCurrentEditValue()) => {
      const thisProps: CellProps = getProps();
      if (props.onEditStop) {
        props.onEditStop(editValue, thisProps);
      }
      if (props.onEditStopForRow) {
        props.onEditStopForRow(editValue, thisProps);
      }
    },
    [props.onEditStop, props.onEditStopForRow]
  );

  const cancelEdit = useCallback(() => {
    isCancelled.current = true;
    stopEdit();
    const thisProps = getProps();

    if (props.onEditCancel) {
      props.onEditCancel(thisProps);
    }
    if (props.onEditCancelForRow) {
      props.onEditCancelForRow(thisProps);
    }
  }, [props.onEditCancel, props.onEditCancelForRow]);

  const onEditorComplete = useCallback(() => {
    const now = Date.now();

    if (
      lastEditCompleteTimestamp.current &&
      now - lastEditCompleteTimestamp.current < 50
    ) {
      return;
    }

    lastEditCompleteTimestamp.current = now;

    if (!isCancelled.current) {
      completeEdit();
    }

    isCancelled.current = false;
  }, []);

  const getEditCompleteValue = useCallback(
    (value = getCurrentEditValue()) => {
      if (props.getEditCompleteValue) {
        return props.getEditCompleteValue(value, getProps());
      }

      return value;
    },
    [props.getEditCompleteValue, props.editValue]
  );

  const completeEdit = useCallback(
    (completeValue = getEditCompleteValue()) => {
      const thisProps = getProps();
      debugger;

      stopEdit();

      if (props.onEditComplete) {
        props.onEditComplete(completeValue, thisProps);
      }
      if (props.onEditCompleteForRow) {
        props.onEditCompleteForRow(completeValue, thisProps);
      }
    },
    [props.onEditComplete, props.onEditCompleteForRow, getEditCompleteValue]
  );

  const getCurrentEditValue = () => {
    const editValue = getProps().editValue;
    return editValue;
  };

  const onFilterValueChange = useCallback(
    (filterValue: string) => {
      const thisProps = getProps();

      if (thisProps.onFilterValueChange) {
        thisProps.onFilterValueChange(filterValue, thisProps);
      }
    },
    [props.onFilterValueChange]
  );

  const onEditValueChange = useCallback(
    (e: any) => {
      const value = e && e.target ? e.target.value : e;
      const thisProps = getProps();

      if (props.onEditValueChange) {
        props.onEditValueChange(value, thisProps);
      }

      if (props.onEditValueChangeForRow) {
        props.onEditValueChangeForRow(value, thisProps);
      }
    },
    [props.onEditValueChange, props.onEditValueChangeForRow]
  );

  const renderSelectionBox = useCallback(
    (_props?: CellProps) => {
      const thisProps = getProps();
      const {
        inTransition,
        inShowTransition,
        cellSelected,
        cellActive,
      } = thisProps;

      if (!cellSelected && !cellActive) {
        return null;
      }

      const style: CSSProperties | any = {};

      if (inTransition) {
        let duration: number | boolean | undefined = inShowTransition
          ? props.showTransitionDuration
          : props.hideTransitionDuration;

        duration = duration || props.visibilityTransitionDuration;

        style.transitionDuration =
          typeof duration == 'number' ? `${duration}ms` : duration;
      }

      return (
        <div
          key="selectionBox"
          style={style}
          className="InovuaReactDataGrid__cell__selection"
        >
          {props.lastInRange && props.computedCellMultiSelectionEnabled && (
            <div
              className={`InovuaReactDataGrid__cell__selection-dragger InovuaReactDataGrid__cell__selection-dragger--direction-${
                props.rtl ? 'rtl' : 'ltr'
              }`}
              onMouseDown={onCellSelectionDraggerMouseDown}
            />
          )}
        </div>
      );
    },
    [
      props.computedCellMultiSelectionEnabled,
      props.lastInRange,
      props.rtl,
      props.inTransition,
      props.inShowTransition,
      props.cellSelected,
      props.cellActive,
      props.showTransitionDuration,
      props.hideTransitionDuration,
      props.visibilityTransitionDuration,
    ]
  );

  const onHeaderCellFocus = useCallback(
    (event: MouseEvent) => {
      const thisProps = getProps();

      if (thisProps.onFocus) {
        thisProps.onFocus(event, thisProps);
      }

      const initialProps: any = getInitialDOMProps();

      if (initialProps.onFocus) {
        initialProps.onFocus(event, thisProps);
      }
    },
    [props.onFocus, getInitialDOMProps]
  );

  const onColumnHoverMouseEnter = useCallback(
    (thisProps: CellProps) => {
      if (
        thisProps.groupProps ||
        thisProps.groupSpacerColumn ||
        thisProps.isRowDetailsCell ||
        thisProps.isCheckboxColumn
      ) {
        return;
      }

      if (thisProps.onColumnMouseEnter) {
        thisProps.onColumnMouseEnter(thisProps);
      }
    },
    [
      props.groupProps,
      props.groupSpacerColumn,
      props.isRowDetailsCell,
      props.isCheckboxColumn,
      props.onColumnMouseEnter,
    ]
  );

  const onColumnHoverMouseLeave = useCallback(
    (thisProps: CellProps) => {
      if (
        thisProps.groupProps ||
        thisProps.groupSpacerColumn ||
        thisProps.isRowDetailsCell ||
        thisProps.isCheckboxColumn
      ) {
        return;
      }

      if (thisProps.onColumnMouseLeave) {
        thisProps.onColumnMouseLeave(thisProps);
      }
    },
    [
      props.groupProps,
      props.groupSpacerColumn,
      props.isRowDetailsCell,
      props.isCheckboxColumn,
      props.onColumnMouseLeave,
    ]
  );

  const onCellEnterHandle = useCallback(
    (event: MouseEvent) => {
      const thisProps = getProps();
      const initialProps: any = getInitialDOMProps();

      if (thisProps.onCellEnter) {
        thisProps.onCellEnter(event, thisProps);
      }
      if (thisProps.computedEnableColumnHover) {
        onColumnHoverMouseEnter(thisProps);
      }

      if (initialProps.onMouseEnter) {
        initialProps.onMouseEnter(event, thisProps);
      }
    },
    [props.onCellEnter, props.computedEnableColumnHover, getInitialDOMProps]
  );

  const onCellLeave = useCallback(
    (event: MouseEvent) => {
      const thisProps = getProps();
      const initialProps: any = getInitialDOMProps();

      if (thisProps.onCellLeave) {
        thisProps.onCellLeave(event, thisProps);
      }
      if (thisProps.computedEnableColumnHover) {
        onColumnHoverMouseLeave(thisProps);
      }

      if (initialProps.onMouseLeave) {
        initialProps.onMouseLeave(event, thisProps);
      }
    },
    [props.onCellLeave, props.computedEnableColumnHover, getInitialDOMProps]
  );

  const onCellSelectionDraggerMouseDown = useCallback(
    (event: any) => {
      event.preventDefault();
      event.stopPropagation();
      // in order for onCellMouseDown not to be triggered
      // as well since the dragger has a bit different behavior
      if (props.onCellSelectionDraggerMouseDown) {
        props.onCellSelectionDraggerMouseDown(event, getProps());
      }
    },
    [props.onCellSelectionDraggerMouseDown]
  );

  const prepareHeaderCellProps = useCallback(
    (cellProps: EnhancedCellProps) => {
      const thisProps: CellProps = getProps();
      const { children, computedSortInfo } = cellProps;
      const { computedSortable } = thisProps;

      const sortTools = computedSortable
        ? getSortTools(
            computedSortInfo ? computedSortInfo.dir : null,
            cellProps
          )
        : null;

      if (sortTools) {
        cellProps.children = [
          children && children.props
            ? cloneElement(children, { key: 'content' })
            : children,
          sortTools,
        ];
        if (
          thisProps.headerAlign === 'end' ||
          (!thisProps.headerAlign && thisProps.textAlign == 'end')
        ) {
          // make sort tool come first
          cellProps.children.reverse();
        }
      }

      if (cellProps.renderHeader) {
        if (!Array.isArray(cellProps.children)) {
          cellProps.children = [cellProps.children];
        }
        cellProps.children = cellProps.renderHeader(cellProps);
      }

      if (computedSortInfo && computedSortInfo.dir) {
        const dirName = computedSortInfo.dir === 1 ? 'asc' : 'desc';

        cellProps.className = join(
          cellProps.className,
          `${thisProps.headerCellDefaultClassName}--sort-${dirName}`
        );
      }
      cellProps.onResizeMouseDown = onResizeMouseDown.bind(
        cellInstance,
        cellProps
      );
      cellProps.onResizeTouchStart = onResizeTouchStart.bind(
        cellInstance,
        cellProps
      );

      return cellProps;
    },
    [
      props.computedSortable,
      props.headerAlign,
      props.textAlign,
      props.headerCellDefaultClassName,
    ]
  );

  const onMouseDown = useCallback(
    (event: MouseEvent) => {
      const thisProps: CellProps = getProps();
      const initialDOMProps: any = getInitialDOMProps();

      if (event.button === 2) {
        return;
      }

      if (thisProps.onMouseDown) {
        thisProps.onMouseDown(thisProps, event);
      }

      if (initialDOMProps.onMouseDown) {
        initialDOMProps.onMouseDown(event, thisProps);
      }

      if (thisProps.onCellMouseDown) {
        thisProps.onCellMouseDown(event, thisProps);
      }

      if (thisProps.onDragRowMouseDown && thisProps.id === REORDER_COLUMN_ID) {
        thisProps.onDragRowMouseDown(event, thisProps.rowIndex, domRef);
      }
      // event.preventDefault() // DO NOT prevent default,
      // since this makes keyboard navigation unusable because
      // the grid does not get focus any more
      // event.stopPropagation();
    },
    [
      props.onMouseDown,
      props.onCellMouseDown,
      props.onDragRowMouseDown,
      props.id,
      props.rowIndex,
    ]
  );

  const onContextMenu = useCallback(
    (event: MouseEvent & { nativeEvent: any }) => {
      const thisProps: CellProps = getProps();
      const initialDOMProps: any = getInitialDOMProps();

      if (event.nativeEvent) {
        event.nativeEvent.__cellProps = thisProps;
      }
      if (thisProps.onContextMenu) {
        thisProps.onContextMenu(event, thisProps);
      }

      if (initialDOMProps.onContextMenu) {
        initialDOMProps.onContextMenu(event, thisProps);
      }
    },
    [props.onContextMenu]
  );

  const onTouchStart = useCallback(
    (event: TouchEvent) => {
      const thisProps = getProps();
      const initialDOMProps: any = getInitialDOMProps();

      if (thisProps.onTouchStart) {
        thisProps.onTouchStart(thisProps, event);
      }

      if (initialDOMProps.onTouchStart) {
        initialDOMProps.onTouchStart(event, thisProps);
      }

      if (thisProps.onCellTouchStart) {
        thisProps.onCellTouchStart(event, thisProps);
      }
      if (thisProps.onDragRowMouseDown && thisProps.id === REORDER_COLUMN_ID) {
        thisProps.onDragRowMouseDown(event, thisProps.rowIndex, domRef);
      }
      // event.preventDefault() // DO NOT prevent default,
      // since this makes keyboard navigation unusable because
      // the grid does not get focus any more
      event.stopPropagation();
    },
    [
      props.onTouchStart,
      props.onCellTouchStart,
      props.onDragRowMouseDown,
      props.id,
      props.rowIndex,
    ]
  );

  const onResizeMouseDown = useCallback(
    (cellProps: EnhancedCellProps, event: MouseEvent) => {
      const thisProps: CellProps = getProps();

      hideFilterContextMenu();
      if (thisProps.hideColumnContextMenu) {
        thisProps.hideColumnContextMenu();
      }

      if (thisProps.onResizeMouseDown) {
        const node: ReactNode | unknown = getDOMNode();

        thisProps.onResizeMouseDown(cellProps, {
          colHeaderNode: node,
          event,
        });
      }
    },
    [props.hideColumnContextMenu, props.onResizeMouseDown]
  );

  const onResizeTouchStart = useCallback(
    (cellProps: EnhancedCellProps, event: TouchEvent) => {
      const thisProps: CellProps = getProps();

      if (thisProps.onResizeTouchStart) {
        thisProps.onResizeTouchStart(cellProps, {
          colHeaderNode: getDOMNode(),
          event,
        });
      }
    },
    [props.onResizeTouchStart]
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      const thisProps: CellProps = getProps();
      const initialDOMProps: any = getInitialDOMProps();

      if (thisProps.onClick) {
        thisProps.onClick(event, thisProps);
      }
      if (initialDOMProps.onClick) {
        initialDOMProps.onClick(event, thisProps);
      }

      if (!thisProps.headerCell && thisProps.onCellClick) {
        thisProps.onCellClick(event, thisProps);
      }

      if (!thisProps.headerCell) {
        if (
          thisProps.computedEditable &&
          !thisProps.inEdit &&
          (thisProps.editStartEvent === 'onClick' ||
            thisProps.editStartEvent === 'click')
        ) {
          startEdit();
        }

        return;
      }

      if (thisProps.preventSortOnClick) {
        if (thisProps.preventSortOnClick(event, thisProps) === true) {
          return;
        }
      }

      if (!thisProps.sortDelay || thisProps.sortDelay < 1) {
        return onSortClick();
      }

      if (sortTimeoutId.current) {
        clearTimeout(sortTimeoutId.current);
        sortTimeoutId.current = null;
      }

      sortTimeoutId.current = setTimeout(() => {
        onSortClick();
        sortTimeoutId.current = null;
      }, parseInt((thisProps as any).sortDelay, 10));

      return undefined;
    },
    [
      props.onClick,
      props.onCellClick,
      props.headerCell,
      props.computedEditable,
      props.inEdit,
      props.editStartEvent,
      props.preventSortOnClick,
      props.sortDelay,
    ]
  );

  const onDoubleClick = (event: MouseEvent) => {
    const thisProps = getProps();
    const initialDOMProps: any = getInitialDOMProps();

    if (thisProps.onDoubleClick) {
      thisProps.onDoubleClick(event, thisProps);
    }

    if (initialDOMProps.onDoubleClick) {
      initialDOMProps.onDoubleClick(event, thisProps);
    }

    const { headerProps, headerCell } = thisProps;

    if (!headerCell) {
      if (
        thisProps.computedEditable &&
        !thisProps.inEdit &&
        (thisProps.editStartEvent === 'onDoubleClick' ||
          thisProps.editStartEvent === 'dblclick' ||
          thisProps.editStartEvent === 'doubleclick')
      ) {
        startEdit();
      }

      return;
    }

    if (headerProps && headerProps.onDoubleClick) {
      headerProps.onDoubleClick(event, thisProps);
    }

    if (sortTimeoutId.current) {
      clearTimeout(sortTimeoutId.current);
      sortTimeoutId.current = null;
    }
  };

  const getEditStartValue = (thisProps = getProps()) => {
    if (typeof thisProps.getEditStartValue == 'function') {
      return Promise.resolve(
        thisProps.getEditStartValue(thisProps.value, thisProps)
      );
    }
    return Promise.resolve(thisProps.value);
  };

  const onSortClick = () => {
    const thisProps = getProps();

    if (thisProps.headerCell && thisProps.computedSortable) {
      if (thisProps.onSortClick) {
        thisProps.onSortClick(thisProps);
      }
    }
  };

  // direction can be 1, -1 or null
  const getSortTools = useCallback(
    (direction: -1 | 1 | null = null, cellProps: EnhancedCellProps) => {
      const { computedSortable, renderSortTool: render } = getProps();
      return renderSortTool(
        { sortable: computedSortable, direction, renderSortTool: render },
        cellProps
      );
    },
    [props.computedSortable, props.renderSortTool]
  );

  const showFilterContextMenu = useCallback(
    (node: ReactNode) => {
      if (props.showColumnFilterContextMenu) {
        props.showColumnFilterContextMenu(node, getProps());
      }
    },
    [props.showColumnFilterContextMenu]
  );

  const hideFilterContextMenu = useCallback(() => {
    if (props.hideColumnFilterContextMenu) {
      props.hideColumnFilterContextMenu();
    }
  }, [props.hideColumnFilterContextMenu]);

  const showContextMenu = useCallback(
    (domRef: ReactNode, onHide: () => void) => {
      if (props.showColumnContextMenu) {
        props.showColumnContextMenu(
          domRef ? domRef : null,
          getProps(),
          { computedVisibleIndex: props.computedVisibleIndex },
          onHide
        );
      }
    },
    [props.showColumnContextMenu]
  );

  const getProxyRegion = useCallback(() => {
    const node: any = getDOMNode();

    const { computedResizable, computedFilterable } = getProps();

    return computedFilterable
      ? (Region as any).from(node.firstChild)
      : (Region as any).from(computedResizable ? node.firstChild : node);
  }, [props.computedResizable, props.computedFilterable]);

  const renderGroupTool = useCallback(() => {
    const thisProps = getProps();
    const { rtl, collapsed, groupProps } = thisProps;

    return groupTool({
      render: groupProps?.renderGroupTool,
      collapsed,
      rtl,
      size: 20,
      toggleGroup: toggleGroup,
    });
  }, [props.rtl, props.collapsed, props.groupProps]);

  const toggleGroup = useCallback(
    (event: any) => {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      const props = getProps();

      if (typeof props.onGroupToggle === 'function') {
        const { data } = props;
        props.onGroupToggle(data.keyPath, props, event);
      }
    },
    [props.onGroupToggle, props.data]
  );

  const cellInstance: CellInstance = {
    showContextMenu,
    getProps,
    setLeft,
    setRight,
    setTop,
    setHeight,
    setWidth,
    setDragging,
    setStateProps,
    updateState,
    updateProps,
    getDOMNode,
    onUpdate,
    getInitialIndex,
    getcomputedVisibleIndex,
    getInitialDOMProps,
    isInEdit,
    getEditable,
    onEditorTabLeave,
    gotoNextEditor,
    gotoPrevEditor,
    onEditorEnterNavigation,
    onEditorTabNavigation,
    onEditorClick,
    onEditorCancel,
    startEdit,
    stopEdit,
    cancelEdit,
    onEditorComplete,
    getEditCompleteValue,
    completeEdit,
    getCurrentEditValue,
    onFilterValueChange,
    onEditValueChange,
    onHeaderCellFocus,
    onColumnHoverMouseEnter,
    onColumnHoverMouseLeave,
    onCellEnterHandle,
    onCellLeave,
    onCellSelectionDraggerMouseDown,
    prepareHeaderCellProps,
    onMouseDown,
    onContextMenu,
    onTouchStart,
    onResizeMouseDown,
    onResizeTouchStart,
    onClick,
    onDoubleClick,
    getEditStartValue,
    onSortClick,
    getSortTools,
    showFilterContextMenu,
    hideFilterContextMenu,
    getProxyRegion,
    renderGroupTool,
    toggleGroup,
    domRef: getDOMNode(),
    props,
  };

  const thisProps = getProps();

  const {
    cellActive,
    cellSelected,
    data,
    empty,
    groupProps,
    headerCell,
    hidden,
    name,
    onRender,
    treeColumn,
    groupSpacerColumn,
    loadNodeAsync,
    groupColumnVisible,
    rowIndex,
    remoteRowIndex,
    rowSelected,
    rowExpanded,
    setRowSelected,
    setRowExpanded,
    isRowExpandable,
    toggleRowExpand,
    toggleNodeExpand,
    totalDataCount,
    computedVisibleIndex,
    inEdit,
    renderRowDetailsMoreIcon,
    renderRowDetailsExpandIcon,
    renderRowDetailsCollapsedIcon,
  }: CellProps = thisProps;

  let { value, render: renderCell, renderSummary } = thisProps;

  const className = prepareClassName(thisProps);
  const style = prepareStyle(thisProps);
  const headerProps = headerCell ? thisProps.headerProps || emptyObject : null;

  if (
    !headerCell &&
    groupSpacerColumn &&
    groupProps &&
    groupProps.depth == computedVisibleIndex
  ) {
    value = renderGroupTool();
  }

  const children = value;

  let cellProps: EnhancedCellProps = Object.assign(
    {},
    thisProps,
    headerCell ? headerProps : thisProps.cellProps,
    {
      instance: cellInstance,
      value,
      name,
      columnIndex: computedVisibleIndex,
      children,
      onClick: onClick,
      onDoubleClick: onDoubleClick,
      onContextMenu: onContextMenu,
      onMouseDown: onMouseDown,
      onTouchStart: onTouchStart,
      onMouseEnter: onCellEnterHandle,
      onMouseLeave: onCellLeave,
    }
  );

  cellProps.className = headerCell
    ? headerProps.className
      ? `${className} ${headerProps.className}`
      : className
    : thisProps.cellProps && thisProps.cellProps.className
    ? typeof thisProps.cellProps.className === 'function'
      ? `${className} ${thisProps.cellProps.className(cellProps)}`
      : `${className} ${thisProps.cellProps.className}`
    : className;

  if (!headerCell) {
    CELL_RENDER_OBJECT.empty = empty;
    CELL_RENDER_OBJECT.value = value;
    CELL_RENDER_OBJECT.data = data;
    CELL_RENDER_OBJECT.cellProps = cellProps;
    CELL_RENDER_OBJECT.columnIndex = computedVisibleIndex;
    CELL_RENDER_OBJECT.treeColumn = treeColumn;
    CELL_RENDER_OBJECT.rowIndex = rowIndex;
    CELL_RENDER_OBJECT.remoteRowIndex = remoteRowIndex;
    CELL_RENDER_OBJECT.rowIndexInGroup = thisProps.rowIndexInGroup;
    CELL_RENDER_OBJECT.rowSelected = rowSelected;
    CELL_RENDER_OBJECT.rowExpanded = rowExpanded;
    CELL_RENDER_OBJECT.nodeProps = data ? data.__nodeProps : emptyObject;
    CELL_RENDER_OBJECT.setRowSelected = setRowSelected;
    CELL_RENDER_OBJECT.setRowExpanded = setRowExpanded;
    CELL_RENDER_OBJECT.toggleGroup = toggleGroup;
    CELL_RENDER_OBJECT.toggleRowExpand = toggleRowExpand;
    CELL_RENDER_OBJECT.toggleNodeExpand = toggleNodeExpand;
    CELL_RENDER_OBJECT.loadNodeAsync = loadNodeAsync;
    CELL_RENDER_OBJECT.isRowExpandable = isRowExpandable;
    CELL_RENDER_OBJECT.totalDataCount = totalDataCount;
    CELL_RENDER_OBJECT.renderRowDetailsExpandIcon = renderRowDetailsExpandIcon;
    CELL_RENDER_OBJECT.renderRowDetailsCollapsedIcon = renderRowDetailsCollapsedIcon;
  }

  let rendersInlineEditor = headerCell ? false : cellProps.rendersInlineEditor;

  if (rendersInlineEditor && typeof rendersInlineEditor === 'function') {
    rendersInlineEditor = (cellProps as any).rendersInlineEditor(
      CELL_RENDER_OBJECT
    );
  }

  CELL_RENDER_OBJECT.rendersInlineEditor = rendersInlineEditor;

  cellProps.style = headerCell
    ? headerProps.style
      ? Object.assign({}, style, headerProps.style)
      : style
    : thisProps.cellProps && thisProps.cellProps.style
    ? typeof thisProps.cellProps.style === 'function'
      ? Object.assign({}, style, thisProps.cellProps.style(cellProps))
      : Object.assign({}, style, thisProps.cellProps.style)
    : style;

  if (inEdit || rendersInlineEditor) {
    cellProps.editProps = {
      inEdit,
      startEdit: startEdit,

      value: thisProps.editValue,
      onClick: onEditorClick,
      onChange: onEditValueChange,
      onComplete: onEditorComplete,
      onCancel: onEditorCancel,

      onEnterNavigation: onEditorEnterNavigation,
      onTabNavigation: onEditorTabNavigation,
      gotoNext: gotoNextEditor,
      gotoPrev: gotoPrevEditor,
    };
  }

  if (headerCell) {
    cellProps.onFocus = onHeaderCellFocus;
  }

  if (headerCell) {
    CELL_RENDER_OBJECT.renderRowDetailsMoreIcon = renderRowDetailsMoreIcon;
  }

  if (headerCell) {
    cellProps = prepareHeaderCellProps(cellProps);
  } else {
    if (
      data &&
      (data.__summary || (data.__group && data.groupColumnSummary)) &&
      renderSummary
    ) {
      renderCell = renderSummary;
    }
    if (renderCell) {
      // reuse the same sealed object in order to have better perf

      CELL_RENDER_SECOND_OBJ.cellProps = cellProps;
      CELL_RENDER_SECOND_OBJ.column = cellProps;
      CELL_RENDER_SECOND_OBJ.headerProps = null;

      if (data && (!data.__group || groupColumnVisible)) {
        // group rendering is handled in renderGroupTitle (see adjustCellProps)
        cellProps.children = renderCell(
          CELL_RENDER_OBJECT,
          CELL_RENDER_SECOND_OBJ
        );
      }
    }

    if (
      !hidden &&
      cellProps.children != null &&
      cellProps.textEllipsis !== false
    ) {
      cellProps.children = wrapInContent(cellProps.children);
    }

    if (onRender) {
      onRender(cellProps, CELL_RENDER_OBJECT);
    }

    if (cellSelected || cellActive || inEdit || rendersInlineEditor) {
      cellProps.children = [
        cellProps.children,
        renderSelectionBox(cellProps),
        inEdit && !rendersInlineEditor ? renderEditor(cellProps) : null,
      ];
    }
    if (treeColumn) {
      if (Array.isArray(cellProps.children)) {
        cellProps.children = [renderNodeTool(thisProps), ...cellProps.children];
      } else {
        cellProps.children = [renderNodeTool(thisProps), cellProps.children];
      }
    }
  }

  const initialDOMProps: any = getInitialDOMProps();

  const domProps = Object.assign({}, initialDOMProps, {
    onFocus: cellProps.onFocus || initialDOMProps.onFocus,
    onClick: cellProps.onClick || initialDOMProps.onClick,
    onContextMenu: cellProps.onContextMenu || initialDOMProps.onContextMenu,
    onDoubleClick: cellProps.onDoubleClick || initialDOMProps.onDoubleClick,
    onMouseDown: cellProps.onMouseDown || initialDOMProps.onMouseDown,
    onTouchStart: cellProps.onTouchStart || initialDOMProps.onTouchStart,
    onMouseEnter: cellProps.onMouseEnter || initialDOMProps.onMouseEnter,
    onMouseLeave: cellProps.onMouseLeave || initialDOMProps.onMouseLeave,
    style: initialDOMProps.style
      ? Object.assign({}, initialDOMProps.style, cellProps.style)
      : cellProps.style,
    className: join(initialDOMProps.className, cellProps.className),
  });

  domProps.ref = domRef;

  return headerCell ? (
    RENDER_HEADER(cellProps, domProps, cellInstance, state)
  ) : (
    <div
      {...domProps}
      children={cellProps.children}
      data-props-id={props.id}
      data-state-props-id={getProps().id}
      id={null}
      name={null}
      value={null}
      title={null}
      data={null}
    />
  );
}

InovuaDataGridCell.defaultProps = {
  cellDefaultClassName: cellBem(),
  headerCellDefaultClassName: headerBem(),
  computedMinWidth: 40,
  groupNestingSize: 10,
  treeNestingSize: 10,
  checkboxTabIndex: null,
  onSortClick: emptyFn,
  preventSortOnClick: (event: any) => {
    const target = event.target;

    return isFocusable(target);
  },
};

InovuaDataGridCell.propTypes = {
  computedAbsoluteIndex: PropTypes.number,
  checkboxTabIndex: PropTypes.number,
  cellActive: PropTypes.bool,
  cellClassName: PropTypes.string,
  cellDefaultClassName: PropTypes.string,
  cellDOMProps: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  computedCellMultiSelectionEnabled: PropTypes.bool,
  cellSelectable: PropTypes.bool,
  cellSelected: PropTypes.bool,
  checkboxColumn: PropTypes.any,
  collapsed: PropTypes.bool,
  computedColspan: PropTypes.number,
  computedRowspan: PropTypes.number,
  columnIndex: PropTypes.number,
  columnResizeHandleWidth: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  computedLocked: PropTypes.oneOf([false, 'start', 'end']),
  computedWidth: PropTypes.number,
  data: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.array]),
  defaultWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  depth: PropTypes.number,
  deselectAll: PropTypes.func,
  domProps: PropTypes.object,
  empty: PropTypes.bool,
  first: PropTypes.bool,
  firstInSection: PropTypes.bool,
  computedFlex: PropTypes.number,
  flex: PropTypes.number,
  group: PropTypes.string,
  computedGroupBy: PropTypes.any,
  groupCell: PropTypes.bool,
  groupSpacerColumn: PropTypes.bool,
  groupNestingSize: PropTypes.number,
  groupProps: PropTypes.object,
  hasBottomSelectedSibling: PropTypes.bool,
  hasLeftSelectedSibling: PropTypes.bool,
  hasLockedStart: PropTypes.bool,
  hasRightSelectedSibling: PropTypes.bool,
  hasTopSelectedSibling: PropTypes.bool,
  header: PropTypes.any,
  headerAlign: PropTypes.oneOf(['start', 'center', 'end']),
  headerCell: PropTypes.bool,
  headerCellDefaultClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  headerDOMProps: PropTypes.object,
  headerEllipsis: PropTypes.bool,
  headerHeight: PropTypes.number,
  headerProps: PropTypes.any,
  headerUserSelect: PropTypes.oneOf([true, false, 'text', 'none']),
  headerVerticalAlign: PropTypes.oneOf([
    'top',
    'middle',
    'center',
    'bottom',
    'start',
    'end',
  ]),
  headerWrapperClassName: PropTypes.string,
  hidden: PropTypes.bool,
  hideIntermediateState: PropTypes.bool,
  hideTransitionDuration: PropTypes.number,
  hiding: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  inHideTransition: PropTypes.bool,
  inShowTransition: PropTypes.bool,
  inTransition: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  index: PropTypes.number,
  initialIndex: PropTypes.number,
  isColumn: PropTypes.bool,
  last: PropTypes.bool,
  lastInRange: PropTypes.bool,
  lastInSection: PropTypes.bool,
  lastRowInGroup: PropTypes.bool,
  lastUnlocked: PropTypes.bool,
  locked: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  computedMaxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  computedMinWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  minRowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  multiSelect: PropTypes.bool,
  name: PropTypes.string,
  nativeScroll: PropTypes.bool,
  nextBorderLeft: PropTypes.bool,
  noBackground: PropTypes.bool,
  onCellClick: PropTypes.func,
  onCellEnter: PropTypes.func,
  onCellMouseDown: PropTypes.func,
  preventSortOnClick: PropTypes.func,
  onCellSelectionDraggerMouseDown: PropTypes.func,
  onGroupToggle: PropTypes.func,
  onMount: PropTypes.func,
  onRender: PropTypes.func,
  onResizeMouseDown: PropTypes.func,
  onResizeTouchStart: PropTypes.func,
  onSortClick: PropTypes.func,
  onUnmount: PropTypes.func,
  prevBorderRight: PropTypes.bool,
  render: PropTypes.func,
  renderCheckbox: PropTypes.func,
  renderGroupTitle: PropTypes.func,
  renderHeader: PropTypes.func,
  renderSortTool: PropTypes.func,
  computedResizable: PropTypes.bool,
  lockable: PropTypes.bool,
  resizeProxyStyle: PropTypes.object,
  rowActive: PropTypes.bool,
  rowHeight: PropTypes.number,
  initialRowHeight: PropTypes.number,
  rowIndex: PropTypes.number,
  rowIndexInGroup: PropTypes.number,
  rowRenderIndex: PropTypes.number,
  rowSelected: PropTypes.bool,
  scrollbarWidth: PropTypes.number,
  indexInHeaderGroup: PropTypes.number,
  parentGroups: PropTypes.array,
  selectAll: PropTypes.func,
  selectedCount: PropTypes.number,
  selection: PropTypes.any,
  setRowSelected: PropTypes.func,
  setRowExpanded: PropTypes.func,
  toggleRowExpand: PropTypes.func,
  toggleNodeExpand: PropTypes.func,
  shouldComponentUpdate: PropTypes.func,
  showBorderBottom: PropTypes.bool,
  showBorderLeft: PropTypes.bool,
  showBorderRight: PropTypes.any,
  showBorderTop: PropTypes.bool,
  showColumnContextMenu: PropTypes.func,
  showColumnMenuSortOptions: PropTypes.bool,
  showColumnMenuFilterOptions: PropTypes.bool,
  showColumnMenuLockOptions: PropTypes.bool,
  showColumnMenuGroupOptions: PropTypes.bool,
  showTransitionDuration: PropTypes.number,
  sort: PropTypes.any,
  sortDelay: PropTypes.number,
  computedSortInfo: PropTypes.any,
  computedSortable: PropTypes.bool,
  textAlign: PropTypes.oneOf(['start', 'center', 'end']),
  textEllipsis: PropTypes.bool,
  textVerticalAlign: PropTypes.oneOf([
    'top',
    'middle',
    'center',
    'bottom',
    'start',
    'end',
  ]),
  titleClassName: PropTypes.string,
  tryRowCellEdit: PropTypes.func,
  totalCount: PropTypes.number,
  totalDataCount: PropTypes.number,
  unselectedCount: PropTypes.number,
  userSelect: PropTypes.oneOf([true, false, 'text', 'none']),
  value: PropTypes.any,
  virtualizeColumns: PropTypes.bool,
  visibilityTransitionDuration: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
  ]),
  computedVisible: PropTypes.bool,
  computedVisibleCount: PropTypes.number,
  computedVisibleIndex: PropTypes.number,
  indexInColumns: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  editable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

  onEditStop: PropTypes.func,
  onEditStart: PropTypes.func,
  onEditCancel: PropTypes.func,
  onEditValueChange: PropTypes.func,
  onEditComplete: PropTypes.func,

  onEditStopForRow: PropTypes.func,
  onEditStartForRow: PropTypes.func,
  onEditCancelForRow: PropTypes.func,
  onEditValueChangeForRow: PropTypes.func,
  onEditCompleteForRow: PropTypes.func,

  onDragRowMouseDown: PropTypes.func,

  isRowExpandable: PropTypes.func,

  editorProps: PropTypes.any,
  editValue: PropTypes.any,
  Editor: PropTypes.func,
  renderEditor: PropTypes.func,
  zIndex: PropTypes.number,

  computedOffset: PropTypes.number,
  groupTitleCell: PropTypes.bool,
  groupExpandCell: PropTypes.bool,

  rendersInlineEditor: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),

  groupColumn: PropTypes.bool,
  treeColumn: PropTypes.bool,
  renderNodeTool: PropTypes.func,

  showInContextMenu: PropTypes.bool,
  naturalRowHeight: PropTypes.bool,

  rtl: PropTypes.bool,
  computedFilterable: PropTypes.bool,
  computedEditable: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  groupColumnVisible: PropTypes.bool,
  filterTypes: PropTypes.any,
  filterDelay: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  getFilterValue: PropTypes.func,
  onFilterValueChange: PropTypes.func,
  getEditStartValue: PropTypes.func,
  getEditCompleteValue: PropTypes.func,
  editStartEvent: PropTypes.string,
  setActiveIndex: PropTypes.func,

  renderColumnReorderProxy: PropTypes.func,
  columnHoverClassName: PropTypes.string,
  renderRowDetailsExpandIcon: PropTypes.func,
  renderRowDetailsCollapsedIcon: PropTypes.func,
};

export default React.memo(
  InovuaDataGridCell as any,
  (prevProps: CellProps, nextProps: CellProps): boolean => {
    let areEqual = equalReturnKey(nextProps, prevProps, {
      computedActiveIndex: 1,
      activeRowRef: 1,
      active: 1,
      timestamp: 1,
      remoteRowIndex: 1,
      onResizeMouseDown: 1,
      onResizeTouchStart: 1,
      onFocus: 1,
      onSortClick: 1,
      onTouchStart: 1,
      onColumnMouseEnter: 1,
      onColumnMouseLeave: 1,
    });

    const equalProps = areEqual.result;

    if (!equalProps) {
      // console.log(
      //   'UPDATE CELL',
      //   areEqual.key,
      //   // prevProps[areEqual.key!],
      //   // nextProps[areEqual.key!],
      //   prevProps.columnIndex,
      //   nextProps.columnIndex,
      //   diff(prevProps, nextProps)
      // );
      return false;
    }

    // if (equalProps) {
    //   return true;
    // }

    // const equal = this.state
    //   ? equalProps && shallowequal(nextState, this.state)
    //   : equalProps;

    return true;
  }
);
