/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createRef, MouseEvent, ReactNode, RefObject } from 'react';

import Region from '@inovua/reactdatagrid-community/packages/region';

import InovuaDataGridColumnLayout from '@inovua/reactdatagrid-community/Layout/ColumnLayout';

import DragRow from './plugins/row-reorder/DragRow';
import DragRowArrow from './plugins/row-reorder/DragRowArrow';
import ScrollingRegion from './plugins/row-reorder/ScrollingRegion';

import {
  TypeConstrainRegion,
  TypeConfig,
  RangeResultType,
  TypeComputedProps,
} from '@inovua/reactdatagrid-community/types';

import getRangesForRows from './plugins/row-reorder/utils/getRangesForRows';
import setupRowDrag from './plugins/row-reorder/utils/setupRowDrag';
import getDropRowIndex from './plugins/row-reorder/utils/getDropRowIndex';
import moveYAfterX from './plugins/row-reorder/utils/moveYAfterX';
import dropIndexValidation from './plugins/row-reorder/utils/dropIndexValidation';
import LockedRows from './plugins/locked-rows/LockedRows';
import getRangesForGroups from './plugins/row-reorder/utils/getRangesForGroups';
import getRangesForTree from './plugins/row-reorder/utils/getRangesForTree';
import getDropGroup from './plugins/row-reorder/utils/getDropGroup';
import getDropParent from './plugins/row-reorder/utils/getDropParent';
import updateTreeData from './plugins/tree/tree/updateTreeData';
import { getGlobal } from '@inovua/reactdatagrid-community/getGlobal';

const globalObject = getGlobal();

let DRAG_INFO: any = null;
let scrolling: boolean = false;
const SCROLL_MARGIN: number = 40;
const DRAG_ROW_MAX_HEIGHT = 100;
const raf = globalObject.requestAnimationFrame;
const identity = (a: any) => a;
let iterate = true;

type Event = MouseEvent & TouchEvent;

export default class InovuaDataGridEnterpriseColumnLayout extends InovuaDataGridColumnLayout {
  private dropIndex: number | undefined;
  private dragBoxInitialHeight: number = 0;
  private dropRowHeight: number = 0;
  private validDropPositions: { [key: number]: boolean }[] = [];
  private scrollTopRegionRef: RefObject<any>;
  private scrollBottomRegionRef: RefObject<any>;
  private dragRowArrow: any;
  private refDragRow: any;
  private refDragRowArrow: any;
  private dragRow: any;
  private content: any;
  private direction: number = 0;
  declare lastComputedProps?: TypeComputedProps;
  gridScrollInterval: any;

  constructor(props: any) {
    super(props);

    this.refDragRow = (row: any) => {
      this.dragRow = row;
    };

    this.refDragRowArrow = (dragRow: any) => {
      this.dragRowArrow = dragRow;
    };

    this.scrollTopRegionRef = createRef();
    this.scrollBottomRegionRef = createRef();
  }

  renderLockedEndRows = (computedProps: TypeComputedProps): any => {
    return this.renderLockedRows(
      computedProps.computedLockedEndRows,
      'end',
      computedProps
    );
  };
  renderLockedStartRows = (computedProps: TypeComputedProps): any => {
    return this.renderLockedRows(
      computedProps.computedLockedStartRows,
      'start',
      computedProps
    );
  };

  renderLockedRows = (
    rows: any[],
    position: 'start' | 'end',
    computedProps: TypeComputedProps
  ): any => {
    if (!rows || !rows.length) {
      return null;
    }

    return (
      <LockedRows
        key={position}
        rows={rows}
        computedProps={computedProps}
        position={position}
      />
    );
  };

  renderDragRowArrow = () => {
    const props: TypeComputedProps = this.lastComputedProps!;
    const { rowReorderArrowStyle } = props;

    return (
      <DragRowArrow
        ref={this.refDragRowArrow}
        rowHeight={this.dropRowHeight}
        rowReorderArrowStyle={rowReorderArrowStyle}
      />
    );
  };

  renderReorderRowProxy = (props?: TypeComputedProps): ReactNode => {
    return (
      <DragRow
        ref={this.refDragRow}
        renderRowReorderProxy={props && props.renderRowReorderProxy}
      />
    );
  };

  renderScrollingTopRegion = (): ReactNode => {
    return (
      <ScrollingRegion
        ref={this.scrollTopRegionRef}
        dir={-1}
        onMouseEnter={(event: any) =>
          this.onScrollingRegionMouseEnter(event, -1)
        }
        onMouseLeave={this.onScrollingRegionMouseLeave}
      />
    );
  };

  renderScrollingBottomRegion = (): ReactNode => {
    return (
      <ScrollingRegion
        ref={this.scrollBottomRegionRef}
        dir={1}
        onMouseEnter={(event: any) =>
          this.onScrollingRegionMouseEnter(event, 1)
        }
        onMouseLeave={this.onScrollingRegionMouseLeave}
      />
    );
  };

  onScrollingRegionMouseEnter = (event: any, dir?: -1 | 1) => {
    if (event.cancelable) {
      event.preventDefault();
    }
    if (DRAG_INFO && DRAG_INFO.dragging) {
      scrolling = true;

      const props: TypeComputedProps = this.lastComputedProps!;
      const { rowReorderScrollByAmount, rowReorderAutoScrollSpeed } = props;

      if (scrolling && dir) {
        globalObject.clearInterval(this.gridScrollInterval);
        this.gridScrollInterval = globalObject.setInterval(
          () => this.startScrolling(rowReorderScrollByAmount, dir),
          rowReorderAutoScrollSpeed
        );
      }
    }
  };

  startScrolling = (rowReorderScrollByAmount: number, dir: -1 | 1): any => {
    const initialScrollTop = this.getScrollTop();
    const newScrollTop = initialScrollTop + dir * rowReorderScrollByAmount;

    raf(() => {
      this.setScrollPosition(newScrollTop);
    });
  };

  setScrollPosition = (scrollTop: number) => {
    const scrollTopMax = this.getScrollTopMax();
    this.setReorderArrowVisible(false);

    if (scrollTop < 0) {
      scrollTop = 0;
    }

    if (scrollTop > scrollTopMax) {
      scrollTop = scrollTopMax;
    }

    this.setScrollTop(scrollTop);
  };

  onScrollingRegionMouseLeave = () => {
    scrolling = false;
    this.setReorderArrowVisible(true);
    globalObject.clearInterval(this.gridScrollInterval);
  };

  getDragRowInstance = (dragIndex: number) => {
    const visibleRows = this.getContentRows();

    const dragRow = visibleRows.filter((row: any) => {
      if (!row) {
        return;
      }
      return row.props.rowIndex === dragIndex;
    })[0];

    return dragRow;
  };

  onDragRowMouseDownHandle = (
    ev: Event | any,
    index: number,
    cellNode: any
  ) => {
    const dragIndex: number = index;
    const props: TypeComputedProps = this.lastComputedProps!;
    if (!this.onRowReorderValidation(ev, props, dragIndex)) {
      return;
    }

    const { computedFocused, computedSetFocused, setActiveIndex } = props;

    const { contentRegion, headerHeight, cellRegion } = this.initDrag({
      cellNode,
    });

    this.dragRowArrow.setOffset(headerHeight);

    if (!computedFocused) {
      computedSetFocused(true);
    }
    setActiveIndex(index);

    this.setupDrag(
      ev,
      { dragIndex, contentRegion, headerHeight, cellRegion },
      props
    );
  };

  setupDrag = (
    event: Event,
    {
      dragIndex,
      contentRegion,
      headerHeight,
      cellRegion,
    }: {
      dragIndex: number;
      contentRegion: TypeConstrainRegion;
      headerHeight: number;
      cellRegion: TypeConstrainRegion;
    },
    props: any
  ) => {
    const {
      dragBoxInitialRegion,
      dragRowHeight,
    } = this.getDragBoxInitialRegion({
      dragIndex,
    });

    const {
      dragProxy,
      dragProxyPosition,
      dragBoxOffsets,
      leftBoxOffset,
    } = this.getDragProxy(props, {
      dragIndex,
      contentRegion,
      cellRegion,
      dragBoxInitialRegion,
    });

    this.setScrollRegionVisibility(props);

    dragProxy.setHeight(dragRowHeight);
    dragProxy.setTop(dragProxyPosition.top);
    dragProxy.setLeft(dragProxyPosition.left);

    const initialScrollTop = this.getScrollTop();
    const { ranges, selectedGroup, selectedParent } = this.getRanges(props, {
      initialScrollTop,
      contentRegion,
      dragBoxInitialRegion,
    });

    DRAG_INFO = {
      dragging: true,
      dragIndex,
      ranges,
      selectedGroup,
      selectedParent,
      contentRegion,
      headerHeight,
      dragBoxInitialRegion,
      dragBoxRegion: dragBoxInitialRegion.clone(),
      dragProxy,
      dragBoxOffsets,
      initialScrollTop,
      leftBoxOffset,
      scrollTopMax: this.getScrollTopMax(),
    };

    iterate = true;

    this.setReorderArrowAt(dragIndex, ranges, 0);

    setupRowDrag(event, dragBoxInitialRegion, {
      onDrag: (event: Event, config: TypeConfig) =>
        this.onRowDrag(event, config, props),
      onDrop: (event: Event, config: TypeConfig) =>
        this.onRowDrop(event, config, props),
    });
  };

  onRowDrag = (_event: Event, config: TypeConfig, props: any) => {
    if (!DRAG_INFO) {
      return;
    }

    const {
      dragIndex,
      dragBoxInitialRegion,
      dragProxy,
      dragBoxOffsets,
    }: any = DRAG_INFO;

    const {
      initialDiffTop,
      initialDiffLeft,
      dragProxyAdjust,
      scrollDiff,
      scrollTop,
      diffTop,
      diffLeft,
    } = this.adjustScrollOnDrag(props, config);

    const { dragProxyTop, dragProxyLeft } = this.adjustDragProxy({
      diffTop,
      diffLeft,
      initialDiffTop,
      initialDiffLeft,
      dragProxyAdjust,
    });

    dragProxy.setTop(dragProxyTop);
    dragProxy.setLeft(dragProxyLeft);
    dragProxy.setVisible(true);

    let dropIndex: number = -1;
    let dir = initialDiffTop > 0 ? 1 : -1;
    this.direction = dir;

    const {
      rowHeightManager,
      computedGroupBy,
      computedTreeEnabled,
      silentSetData,
      enableTreeRowReorderNestingChange,
    } = props;

    if (computedGroupBy && computedGroupBy.length > 0) {
      this.getDropGroup();
    }

    if (computedTreeEnabled) {
      this.getDropParent();
    }

    const { index: newDropIndex } = getDropRowIndex({
      rowHeightManager,
      dragBoxInitialRegion,
      dragBoxOffsets,
      initialDiffTop,
      scrollTop,
      dragIndex,
      dir,
    });

    if (newDropIndex !== -1) {
      dropIndex = newDropIndex;
    }

    if (
      dropIndex === dragIndex &&
      computedTreeEnabled &&
      enableTreeRowReorderNestingChange
    ) {
      this.computedNesting(props, dragProxyLeft, dragIndex, silentSetData);
      return;
    }

    if (this.dropIndex !== dropIndex) {
      this.getValidDropPositions(props, dragIndex, dropIndex);
      this.dragRowArrow.setValid(this.validDropPositions[dropIndex]);
    }
    this.dropIndex = dropIndex;

    const rowHeight = rowHeightManager.getRowHeight(this.dropIndex);
    this.dragRowArrow.setHeight(rowHeight);

    if (dragIndex !== this.dropIndex) {
      const compareRanges = this.compareRanges({ scrollDiff });
      this.setReorderArrowAt(this.dropIndex, compareRanges, dir);
    } else {
      this.setReorderArrowVisible(false);
    }
  };

  onRowDrop = (_event: Event, _config: TypeConfig, props: any) => {
    const { dropIndex } = this;
    const {
      onRowReorder,
      setActiveIndex,
      computedGroupBy,
      computedTreeEnabled,
      generateIdFromPath,
      enableTreeRowReorderNestingChange,
    } = props;

    if (!DRAG_INFO) {
      this.clearDropInfo();
      return;
    }

    let { dragIndex } = DRAG_INFO;

    if (
      dropIndex === -1 &&
      computedTreeEnabled &&
      enableTreeRowReorderNestingChange
    ) {
      this.clearDropInfo();
      return;
    }

    if (dropIndex === undefined) {
      this.cancelDrop();
      this.clearDropInfo();
      return;
    }

    if (dropIndex === dragIndex) {
      this.clearDropInfo();
      return;
    }

    if (!this.validDropPositions[dropIndex]) {
      this.clearDropInfo();
      return;
    }

    if (computedGroupBy && computedGroupBy.length > 0) {
      this.updateGroups(props, dragIndex, dropIndex);
      return;
    }

    if (computedTreeEnabled && generateIdFromPath) {
      this.updateTree(props, dragIndex, dropIndex);
      return;
    }

    this.clearDropInfo();
    setActiveIndex(dropIndex);

    if (onRowReorder && typeof onRowReorder === 'function') {
      this.onRowReorder(props, { dragIndex, dropIndex });
      return;
    }

    this.updateDataSource(props, { dropIndex, dragIndex });
  };

  updateDataSource = (
    props: any,
    { dropIndex, dragIndex }: { dropIndex: number; dragIndex: number }
  ) => {
    const { data, setOriginalData } = props;
    if (this.validDropPositions[dropIndex]) {
      const newDataSource = moveYAfterX(data, dragIndex, dropIndex);

      setOriginalData(newDataSource);
    }
  };

  updateTree = (props: any, dragIndex: number, dropIndex: number) => {
    const {
      data,
      silentSetData,
      nodePathSeparator,
      onTreeRowReorderEnd,
    } = props;
    const { selectedParent, dropParent } = DRAG_INFO;

    if (this.validDropPositions[dropIndex]) {
      const { dropDepth } = DRAG_INFO;
      const direction = this.direction;
      const dataSource = moveYAfterX(data, dragIndex, dropIndex);
      const newDataSource = this.recomputeNodeProps(
        dataSource,
        direction,
        dropIndex,
        dropDepth,
        dropParent,
        nodePathSeparator
      );

      updateTreeData(props, {
        selectedPath: selectedParent,
        destinationPath: dropParent,
      });

      if (onTreeRowReorderEnd) {
        onTreeRowReorderEnd({ updatedTreeData: props.originalData });
      }

      this.clearDropInfo();
      silentSetData(newDataSource);
      props.reload();
    }
  };

  updateGroups = (props: any, dragIndex: number, dropIndex: number) => {
    const { data, silentSetData, setItemOnReorderingGroups } = props;
    const { dropGroup, selectedGroup } = DRAG_INFO;

    if (!selectedGroup.localeCompare(dropGroup)) {
      const newDataSource = moveYAfterX(data, dragIndex, dropIndex);
      silentSetData(newDataSource);
      this.clearDropInfo();
      return;
    }

    if (dropGroup) {
      const item = this.computeItem(props);
      setItemOnReorderingGroups(dragIndex, item, {
        replace: false,
      });

      const newDataSource = moveYAfterX(data, dragIndex, dropIndex);
      silentSetData(newDataSource);

      this.clearDropInfo();
      return;
    }

    this.clearDropInfo();
    return;
  };

  recomputeNodeProps = (
    data: any[],
    direction: number,
    dropIndex: number,
    dropDepth: number,
    destinationPath: string,
    pathSeparator: string
  ) => {
    const parentNodeIdArr = destinationPath.split(pathSeparator);
    parentNodeIdArr.splice(parentNodeIdArr.length - 1, 1);
    const parentNodeId = parentNodeIdArr.join(pathSeparator);

    if (direction < 0) {
      data[dropIndex].__nodeProps.depth = dropDepth;
      data[dropIndex].__nodeProps.parentNodeId = parentNodeId;
    }
    if (direction > 0) {
      data[dropIndex].__nodeProps.depth = dropDepth;
      data[dropIndex].__nodeProps.parentNodeId = parentNodeId;
    }

    return data;
  };

  computedNesting = (
    props: any,
    dragProxyLeft: number,
    dragIndex: number,
    silentSetData: Function
  ) => {
    if (dragProxyLeft < -20) {
      this.updateNesting(-1, props, dragIndex, silentSetData);
    } else if (dragProxyLeft > 80) {
      this.updateNesting(1, props, dragIndex, silentSetData);
    }
  };

  updateNesting = (
    dir: -1 | 1,
    props: any,
    dragIndex: number,
    silentSetData: Function
  ) => {
    const originalData = props.originalData;
    const data = props.data;
    const idProperty = props.idProperty;
    const pathSeparator = props.nodePathSeparator;
    const nodesName = props.nodesProperty;
    const generateIdFromPath = props.generateIdFromPath;

    let dataSource = [...data];
    const { selectedParent: selectedPath } = DRAG_INFO;
    const depth = dataSource[dragIndex].__nodeProps.depth + dir;

    const computeNesting = (
      dataArray: any[],
      result: any[] = [],
      parentNode?: any
    ) => {
      if (iterate) {
        for (let i = 0; i < dataArray.length; i++) {
          const item = dataArray[i];
          if (!item) {
            continue;
          }

          const itemId = `${item[idProperty]}`;
          const itemNodes = item[nodesName];
          const parentNodeId = parentNode
            ? `${parentNode[idProperty]}`
            : undefined;
          const path = parentNode
            ? `${parentNodeId}${pathSeparator}${itemId}`
            : `${itemId}`;

          if (generateIdFromPath) {
            item[idProperty] = path;
          }

          if (parentNode === undefined) {
            result.push(item);
          } else {
            if (path === selectedPath) {
              if (depth < 0) {
                this.clearDropInfo();
                break;
              }
              const parentNodes = parentNode[nodesName];
              const extraNodeProps = identity({
                depth: depth,
              });

              const itemWithExtraProps = {
                ...item,
                __extraNodeProps: extraNodeProps,
              };

              parentNodes[i] = itemWithExtraProps;
              iterate = false;
              props.reload();
              break;
            }
          }

          if (Array.isArray(itemNodes)) {
            computeNesting(itemNodes, result, item);
          }
        }
      }

      return result;
    };

    const computeIds = (dataArray: any) => {
      for (let i = 0; i < dataArray.length; i++) {
        const item = dataArray[i];
        if (!item) {
          continue;
        }

        const itemNodes = item[nodesName];
        item[idProperty] = i + 1;

        if (Array.isArray(itemNodes)) {
          computeIds(itemNodes);
        }
      }
    };

    const newOriginalData = computeNesting(originalData);
    computeIds(newOriginalData);

    if (depth < 0) {
      this.clearDropInfo();
      return;
    }
    dataSource[dragIndex].__nodeProps.depth = depth;

    this.clearDropInfo();
    silentSetData(dataSource);
    return;
  };

  computeItem = (props: any) => {
    const { computedGroupBy: groupBy } = props;
    const { dropKeyPath } = DRAG_INFO;

    if (!dropKeyPath) {
      return {};
    }

    let item: any = {};
    for (let i = 0; i < groupBy.length; i++) {
      item[groupBy[i]] = dropKeyPath[i];
    }

    return item;
  };

  initDrag = ({ cellNode }: { cellNode: any }) => {
    const contentNode = this.content.getDOMNode();
    const headerNode = this.headerLayout
      ? (this.headerLayout as any).headerDomNode.current
      : null;

    const contentRegion = Region.from(contentNode);
    const headerRegion = Region.from(headerNode);
    const headerHeight: number = headerRegion.getHeight();

    const node = cellNode && cellNode.current;
    const cellRegion = Region.from(node);

    return {
      contentRegion,
      headerHeight,
      cellRegion,
    };
  };

  getDropGroup = () => {
    const { ranges, dragBoxRegion } = DRAG_INFO;

    const { dropGroup, keyPath: dropKeyPath } = getDropGroup({
      ranges,
      dragBoxRegion,
    });
    DRAG_INFO = Object.assign({}, DRAG_INFO, {
      dropGroup,
      dropKeyPath,
    });
  };

  getDropParent = () => {
    const { ranges, dragBoxRegion } = DRAG_INFO;

    const { dropParent, dropDepth } = getDropParent({
      ranges,
      dragBoxRegion,
    });
    DRAG_INFO = Object.assign({}, DRAG_INFO, {
      dropParent,
      dropDepth,
    });
  };

  onRowReorder = (
    props: any,
    { dragIndex, dropIndex }: { dragIndex: number; dropIndex: number }
  ) => {
    const { data, onRowReorder } = props;

    const rowData = data[dragIndex];
    onRowReorder({
      data: rowData,
      dragRowIndex: dragIndex,
      insertRowIndex: dropIndex,
    });
  };

  getDragProxy = (
    props: any,
    {
      dragIndex,
      contentRegion,
      cellRegion,
      dragBoxInitialRegion,
    }: {
      dragIndex: number;
      contentRegion: TypeConstrainRegion;
      cellRegion: TypeConstrainRegion;
      dragBoxInitialRegion: TypeConstrainRegion;
    }
  ) => {
    const dragProxy = this.dragRow ? this.dragRow : undefined;

    dragProxy.setDragIndex(dragIndex);
    dragProxy.setProps(props);

    const dragBoxOffsets = {
      top: contentRegion.top,
      left: contentRegion.left,
    };

    const leftBoxOffset = cellRegion.left - dragBoxOffsets.left;
    this.dragRowArrow.setLeft(leftBoxOffset);

    const dragProxyPosition = {
      top: dragBoxInitialRegion.top - dragBoxOffsets.top,
      left: dragBoxInitialRegion.left - dragBoxOffsets.left,
    };

    return { dragProxy, dragProxyPosition, dragBoxOffsets, leftBoxOffset };
  };

  getDragBoxInitialRegion = ({ dragIndex }: { dragIndex: number }) => {
    const dragBox = this.getDragRowInstance(dragIndex);
    const dragBoxNode = dragBox.domRef ? dragBox.domRef.current : null;

    let dragBoxInitialRegion: any;
    if (dragBox) {
      dragBoxInitialRegion = Region.from(dragBoxNode);
    }

    this.dragBoxInitialHeight =
      dragBoxInitialRegion && dragBoxInitialRegion.getHeight();

    if (
      DRAG_ROW_MAX_HEIGHT &&
      dragBoxInitialRegion &&
      dragBoxInitialRegion.getHeight() > DRAG_ROW_MAX_HEIGHT
    ) {
      dragBoxInitialRegion.setHeight(DRAG_ROW_MAX_HEIGHT);
      dragBoxInitialRegion.shift({
        top: this.dragBoxInitialHeight / 2 - DRAG_ROW_MAX_HEIGHT / 2,
      });
    }

    const dragRowHeight = dragBoxInitialRegion.getHeight();

    return { dragBoxInitialRegion, dragRowHeight };
  };

  setScrollRegionVisibility = (props: any) => {
    if (this.scrollTopRegionRef.current) {
      this.scrollTopRegionRef.current.setVisible(true);

      const height =
        (this.headerLayout &&
          (this.headerLayout as any).headerNode &&
          (this.headerLayout as any).headerNode.offsetHeight) ||
        props.rowHeight / 2 ||
        0;
      this.scrollTopRegionRef.current.setHeight(height);
    }

    if (this.scrollBottomRegionRef.current) {
      this.scrollBottomRegionRef.current.setVisible(true);
    }
  };

  getRanges = (
    props: any,
    {
      initialScrollTop,
      contentRegion,
      dragBoxInitialRegion,
    }: {
      initialScrollTop: number;
      contentRegion: TypeConstrainRegion;
      dragBoxInitialRegion: TypeConstrainRegion;
    }
  ) => {
    const {
      count,
      rowHeightManager,
      data,
      computedGroupBy,
      computedTreeEnabled,
      generateIdFromPath,
    } = props;

    let ranges: RangeResultType[] = [];
    let selectedGroup: any;
    let selectedParent: string = '';

    if (computedGroupBy && computedGroupBy.length > 0) {
      ranges = getRangesForGroups({
        data,
        initialOffset: contentRegion.top,
        rowHeightManager,
        initialScrollTop,
      });

      const { dropGroup } = getDropGroup({
        ranges,
        dragBoxRegion: dragBoxInitialRegion,
      });
      selectedGroup = dropGroup;
    } else if (computedTreeEnabled && generateIdFromPath) {
      ranges = getRangesForTree({
        data,
        initialOffset: contentRegion.top,
        rowHeightManager,
        initialScrollTop,
      });

      const { dropParent } = getDropParent({
        ranges,
        dragBoxRegion: dragBoxInitialRegion,
      });
      selectedParent = dropParent;
    } else {
      ranges = getRangesForRows({
        count,
        initialOffset: contentRegion.top,
        rowHeightManager,
        initialScrollTop,
      });
    }

    return { ranges, selectedGroup, selectedParent };
  };

  compareRanges = ({ scrollDiff }: { scrollDiff: number }) => {
    const { ranges } = DRAG_INFO;

    const mapRange = (r: RangeResultType) => {
      if (!r) {
        return null;
      }

      if (r && r.group) {
        return null;
      } else {
        return {
          ...r,
          top: r.top - scrollDiff,
          bottom: r.bottom - scrollDiff,
        };
      }
    };

    return ranges.map(mapRange);
  };

  adjustDragProxy = ({
    diffTop,
    diffLeft,
    initialDiffTop,
    initialDiffLeft,
    dragProxyAdjust,
  }: {
    diffTop: number;
    diffLeft: number;
    initialDiffTop: number;
    initialDiffLeft: number;
    dragProxyAdjust: number;
  }) => {
    const {
      dragBoxRegion,
      dragBoxInitialRegion,
      dragBoxOffsets,
      headerHeight,
      leftBoxOffset,
    } = DRAG_INFO;

    dragBoxRegion.set({
      top: dragBoxInitialRegion.top,
      bottom: dragBoxInitialRegion.bottom,
      left: dragBoxInitialRegion.left,
      right: dragBoxInitialRegion.right,
    });

    dragBoxRegion.shift({
      top: diffTop,
      left: diffLeft,
    });

    const dragProxyTop =
      dragBoxInitialRegion.top -
      dragBoxOffsets.top +
      initialDiffTop -
      dragProxyAdjust +
      headerHeight;

    const dragProxyLeft =
      dragBoxInitialRegion.left -
      dragBoxOffsets.left +
      initialDiffLeft +
      leftBoxOffset;

    return { dragProxyTop, dragProxyLeft };
  };

  getValidDropPositions = (
    props: any,
    dragIndex: number,
    dropIndex: number
  ) => {
    const {
      computedGroupBy,
      data,
      count,
      isRowReorderValid,
      allowRowReorderBetweenGroups,
      computedTreeEnabled,
      enableTreeRowReorderParentChange,
      nodePathSeparator,
      groupPathSeparator,
      generateIdFromPath,
    } = props;
    const { selectedGroup, selectedParent } = DRAG_INFO;

    const validDropPositions = dropIndexValidation({
      data,
      count,
      dragIndex,
      dropIndex,
      isRowReorderValid,
      selectedGroup,
      selectedParent,
      nodePathSeparator,
      groupPathSeparator,
      allowRowReorderBetweenGroups,
      computedGroupBy,
      computedTreeEnabled,
      generateIdFromPath,
      enableTreeRowReorderParentChange,
    });

    this.validDropPositions = validDropPositions;

    return validDropPositions;
  };

  clearDropInfo = () => {
    globalObject.clearInterval(this.gridScrollInterval);
    this.dragBoxInitialHeight = 0;
    this.setReorderArrowVisible(false);

    if (!DRAG_INFO) {
      return;
    }
    const { dragProxy } = DRAG_INFO;
    this.dropIndex = -1;
    dragProxy.setVisible(false);
    DRAG_INFO = null;

    if (this.scrollTopRegionRef.current) {
      this.scrollTopRegionRef.current.setVisible(false);
    }

    if (this.scrollBottomRegionRef.current) {
      this.scrollBottomRegionRef.current.setVisible(false);
    }
  };

  cancelDrop = () => {
    if (DRAG_INFO) {
      DRAG_INFO.dragProxy.setVisible(false);
    }

    this.setReorderArrowVisible(false);
    DRAG_INFO = null;
  };

  adjustScrollOnDrag = (props: any, config: TypeConfig) => {
    const { rowReorderScrollByAmount } = props;
    const {
      contentRegion,
      scrollTopMax,
      dragBoxInitialRegion,
      initialScrollTop,
    }: any = DRAG_INFO;

    let diffTop = config.diff.top;
    let diffLeft = config.diff.left;

    const minScrollTop = Math.max(contentRegion.top, 0);
    const maxScrollTop = contentRegion.bottom;

    const scrollTop = this.getScrollTop();
    const scrollDiff = scrollTop - initialScrollTop;
    const initialDiffTop = diffTop;
    const initialDiffLeft = diffLeft;

    diffTop += scrollDiff;

    let scrollAdjust = 0;
    let dragProxyAdjust = 0;

    if (
      dragBoxInitialRegion.top + initialDiffTop <
        minScrollTop + SCROLL_MARGIN &&
      initialDiffTop < 0
    ) {
      scrollAdjust = -rowReorderScrollByAmount;
    } else if (
      dragBoxInitialRegion.top + initialDiffTop >
        maxScrollTop - SCROLL_MARGIN &&
      initialDiffTop > 0
    ) {
      scrollAdjust = rowReorderScrollByAmount;
    }

    if (scrollAdjust) {
      if (scrollTop + scrollAdjust < 0) {
        scrollAdjust = -scrollTop;
      }
      if (scrollTop + scrollAdjust > scrollTopMax) {
        scrollAdjust = scrollTopMax - scrollTop;
      }
      if (scrollAdjust) {
        if (!props.rowReorderAutoScroll) {
          this.setScrollTop(scrollTop + scrollAdjust);
        }
        dragProxyAdjust = scrollAdjust;
      }
    }

    return {
      initialDiffTop,
      initialDiffLeft,
      dragProxyAdjust,
      scrollDiff,
      scrollTop,
      diffTop,
      diffLeft,
    };
  };

  setReorderArrowAt = (
    index: number,
    ranges: RangeResultType[],
    direction: number,
    visible?: boolean
  ): void => {
    visible = visible !== undefined ? visible : index !== DRAG_INFO.dragIndex;

    if (!scrolling) {
      this.setReorderArrowVisible(visible);
    }

    let box = ranges[index];

    if (!box) {
      return;
    }

    if (box.group) {
      return;
    }

    const { contentRegion } = DRAG_INFO;

    let boxPos: number;
    let dragRowArrowHeight: number = this.dragRowArrow.props
      .rowReorderArrowStyle
      ? this.dragRowArrow.props.rowReorderArrowStyle.height
      : 3;

    if (!Number.isInteger(dragRowArrowHeight)) {
      dragRowArrowHeight = 3;
    }

    let boxSide = box.bottom;
    if (direction < 0) {
      boxSide = box.top;
    } else if (direction > 0) {
      boxSide = box.bottom;
    }

    if (index === 0) {
      boxPos = box.top;
    } else if (index === ranges.length - 1) {
      const lastBox = ranges[ranges.length - 1];
      boxPos = lastBox.bottom - Math.floor(dragRowArrowHeight);
    } else {
      boxPos = boxSide - Math.floor(dragRowArrowHeight / 2);
    }

    const arrowPosition: number = boxPos - contentRegion.top;

    return this.setReorderArrowPosition(arrowPosition);
  };

  setReorderArrowPosition = (top: number) => {
    this.dragRowArrow.setTop(top);
  };

  setReorderArrowVisible = (visible: boolean) => {
    this.dragRowArrow.setVisible(visible);
  };

  onRowReorderValidation = (
    ev: Event | any,
    props: any,
    dragIndex: number
  ): boolean => {
    if (
      (ev.isDefaultPrevented && ev.isDefaultPrevented()) ||
      ev.defaultPrevented
    ) {
      return false;
    }

    const {
      onRowReorder,
      rowReorderColumn,
      computedPagination,
      computedSortInfo,
      computedFiltered,
      dataSource,
      data,
      computedPivot,
      computedTreeEnabled,
      enableTreeRowReorder,
      generateIdFromPath,
    } = props;

    let isNotRowReorder = false;

    if (
      !onRowReorder &&
      (typeof onRowReorder !== 'function' || typeof onRowReorder !== 'boolean')
    ) {
      if (!rowReorderColumn) {
        isNotRowReorder = true;
      }
    }

    if (computedTreeEnabled && !enableTreeRowReorder) {
      isNotRowReorder = true;
    }

    if (computedTreeEnabled && !generateIdFromPath) {
      isNotRowReorder = true;
    }

    if (isNotRowReorder) {
      return false;
    }

    if (
      (ev.nativeEvent
        ? ev.nativeEvent.which === 3
        : ev.which === 3) /* right click */ ||
      ev.metaKey ||
      ev.ctrlKey
    ) {
      return false;
    }

    if (
      computedPagination ||
      computedSortInfo ||
      computedFiltered ||
      typeof dataSource === 'function' ||
      (computedPivot && computedPivot.length > 0)
    ) {
      if (typeof onRowReorder !== 'function') {
        return false;
      }
    }

    let dragRow;
    dragRow = data[dragIndex];
    if (!dragRow) {
      ev?.stopPropagation();
      return false;
    }

    return true;
  };
}
