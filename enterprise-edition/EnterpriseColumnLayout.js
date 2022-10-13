/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { createRef } from 'react';
import Region from '@inovua/reactdatagrid-community/packages/region';
import InovuaDataGridColumnLayout from '@inovua/reactdatagrid-community/Layout/ColumnLayout';
import DragRow from './plugins/row-reorder/DragRow';
import DragRowArrow from './plugins/row-reorder/DragRowArrow';
import ScrollingRegion from './plugins/row-reorder/ScrollingRegion';
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
const raf = globalObject.requestAnimationFrame;
const identity = (a) => a;
export default class InovuaDataGridEnterpriseColumnLayout extends InovuaDataGridColumnLayout {
    dropIndex;
    dragBoxInitialHeight = 0;
    dropRowHeight = 0;
    validDropPositions = [];
    scrollTopRegionRef;
    scrollBottomRegionRef;
    dragRowArrow;
    refDragRow;
    refDragRowArrow;
    dragRow;
    content;
    direction = 0;
    SCROLL_MARGIN = 40;
    DRAG_ROW_MAX_HEIGHT = 100;
    iterate = true;
    DRAG_INFO = null;
    scrolling = false;
    gridScrollInterval;
    constructor(props) {
        super(props);
        this.refDragRow = (row) => {
            this.dragRow = row;
        };
        this.refDragRowArrow = (dragRow) => {
            this.dragRowArrow = dragRow;
        };
        this.scrollTopRegionRef = createRef();
        this.scrollBottomRegionRef = createRef();
        this.SCROLL_MARGIN = 40;
        this.DRAG_ROW_MAX_HEIGHT = 100;
        this.iterate = true;
        this.DRAG_INFO = null;
        this.scrolling = false;
    }
    renderLockedEndRows = (computedProps) => {
        return this.renderLockedRows(computedProps.computedLockedEndRows, 'end', computedProps);
    };
    renderLockedStartRows = (computedProps) => {
        return this.renderLockedRows(computedProps.computedLockedStartRows, 'start', computedProps);
    };
    renderLockedRows = (rows, position, computedProps) => {
        if (!rows || !rows.length) {
            return null;
        }
        return (React.createElement(LockedRows, { key: position, rows: rows, computedProps: computedProps, position: position }));
    };
    renderDragRowArrow = () => {
        const props = this.lastComputedProps;
        const { rowReorderArrowStyle } = props;
        return (React.createElement(DragRowArrow, { ref: this.refDragRowArrow, rowHeight: this.dropRowHeight, rowReorderArrowStyle: rowReorderArrowStyle }));
    };
    renderReorderRowProxy = (props) => {
        return (React.createElement(DragRow, { ref: this.refDragRow, renderRowReorderProxy: props && props.renderRowReorderProxy }));
    };
    renderScrollingTopRegion = () => {
        return (React.createElement(ScrollingRegion, { ref: this.scrollTopRegionRef, dir: -1, onMouseEnter: (event) => this.onScrollingRegionMouseEnter(event, -1), onMouseLeave: this.onScrollingRegionMouseLeave }));
    };
    renderScrollingBottomRegion = () => {
        return (React.createElement(ScrollingRegion, { ref: this.scrollBottomRegionRef, dir: 1, onMouseEnter: (event) => this.onScrollingRegionMouseEnter(event, 1), onMouseLeave: this.onScrollingRegionMouseLeave }));
    };
    onScrollingRegionMouseEnter = (event, dir) => {
        if (event.cancelable) {
            event.preventDefault();
        }
        if (this.DRAG_INFO && this.DRAG_INFO.dragging) {
            this.scrolling = true;
            const props = this.lastComputedProps;
            const { rowReorderScrollByAmount, rowReorderAutoScrollSpeed } = props;
            if (this.scrolling && dir) {
                globalObject.clearInterval(this.gridScrollInterval);
                this.gridScrollInterval = globalObject.setInterval(() => this.startScrolling(rowReorderScrollByAmount, dir), rowReorderAutoScrollSpeed);
            }
        }
    };
    startScrolling = (rowReorderScrollByAmount, dir) => {
        const initialScrollTop = this.getScrollTop();
        const newScrollTop = initialScrollTop + dir * rowReorderScrollByAmount;
        raf(() => {
            this.setScrollPosition(newScrollTop);
        });
    };
    setScrollPosition = (scrollTop) => {
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
        this.scrolling = false;
        this.setReorderArrowVisible(true);
        globalObject.clearInterval(this.gridScrollInterval);
    };
    getDragRowInstance = (dragIndex) => {
        const visibleRows = this.getContentRows();
        const dragRow = visibleRows.filter((row) => {
            if (!row) {
                return;
            }
            return row.props.rowIndex === dragIndex;
        })[0];
        return dragRow;
    };
    onDragRowMouseDownHandle = (ev, index, cellNode) => {
        const dragIndex = index;
        const props = this.lastComputedProps;
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
        this.setupDrag(ev, { dragIndex, contentRegion, headerHeight, cellRegion }, props);
    };
    setupDrag = (event, { dragIndex, contentRegion, headerHeight, cellRegion, }, props) => {
        const { dragBoxInitialRegion, dragRowHeight, } = this.getDragBoxInitialRegion({
            dragIndex,
        });
        const { dragProxy, dragProxyPosition, dragBoxOffsets, leftBoxOffset, } = this.getDragProxy(props, {
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
        this.dragStartCallbacks(props, dragIndex, selectedGroup);
        this.DRAG_INFO = {
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
        this.iterate = true;
        this.setReorderArrowAt(dragIndex, ranges, 0);
        setupRowDrag(event, dragBoxInitialRegion, {
            onDrag: (event, config) => this.onRowDrag(event, config, props),
            onDrop: (event, config) => this.onRowDrop(event, config, props),
        });
    };
    onRowDrag = (_event, config, props) => {
        if (!this.DRAG_INFO) {
            return;
        }
        const { dragIndex, dragBoxInitialRegion, dragProxy, dragBoxOffsets, } = this.DRAG_INFO;
        const { initialDiffTop, initialDiffLeft, dragProxyAdjust, scrollDiff, scrollTop, diffTop, diffLeft, } = this.adjustScrollOnDrag(props, config);
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
        let dropIndex = -1;
        let dir = initialDiffTop > 0 ? 1 : -1;
        this.direction = dir;
        const { rowHeightManager, computedGroupBy, computedTreeEnabled, silentSetData, enableTreeRowReorderNestingChange, } = props;
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
        if (dropIndex === dragIndex &&
            computedTreeEnabled &&
            enableTreeRowReorderNestingChange) {
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
        }
        else {
            this.setReorderArrowVisible(false);
        }
    };
    onRowDrop = (_event, _config, props) => {
        const { dropIndex } = this;
        const { onRowReorder, setActiveIndex, computedGroupBy, computedTreeEnabled, generateIdFromPath, enableTreeRowReorderNestingChange, } = props;
        this.dragEndCallbacks(props, dropIndex);
        if (!this.DRAG_INFO) {
            this.clearDropInfo();
            return;
        }
        let { dragIndex } = this.DRAG_INFO;
        if (dropIndex === -1 &&
            computedTreeEnabled &&
            enableTreeRowReorderNestingChange) {
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
    updateDataSource = (props, { dropIndex, dragIndex }) => {
        const { data, setOriginalData } = props;
        if (this.validDropPositions[dropIndex]) {
            const newDataSource = moveYAfterX(data, dragIndex, dropIndex);
            setOriginalData(newDataSource);
        }
    };
    updateTree = (props, dragIndex, dropIndex) => {
        const { data, silentSetData, nodePathSeparator, onTreeRowReorderEnd, } = props;
        const { selectedParent, dropParent } = this.DRAG_INFO;
        if (this.validDropPositions[dropIndex]) {
            const { dropDepth } = this.DRAG_INFO;
            const direction = this.direction;
            const dataSource = moveYAfterX(data, dragIndex, dropIndex);
            const newDataSource = this.recomputeNodeProps(dataSource, direction, dropIndex, dropDepth, dropParent, nodePathSeparator);
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
    updateGroups = (props, dragIndex, dropIndex) => {
        const { data, silentSetData, setItemOnReorderingGroups } = props;
        const { dropGroup, selectedGroup } = this.DRAG_INFO;
        this.dragEndGroupCallbacks(props, dropIndex, dropGroup);
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
    recomputeNodeProps = (data, direction, dropIndex, dropDepth, destinationPath, pathSeparator) => {
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
    computedNesting = (props, dragProxyLeft, dragIndex, silentSetData) => {
        if (dragProxyLeft < -20) {
            this.updateNesting(-1, props, dragIndex, silentSetData);
        }
        else if (dragProxyLeft > 80) {
            this.updateNesting(1, props, dragIndex, silentSetData);
        }
    };
    updateNesting = (dir, props, dragIndex, silentSetData) => {
        const originalData = props.originalData;
        const data = props.data;
        const idProperty = props.idProperty;
        const pathSeparator = props.nodePathSeparator;
        const nodesName = props.nodesProperty;
        const generateIdFromPath = props.generateIdFromPath;
        let dataSource = [...data];
        const { selectedParent: selectedPath } = this.DRAG_INFO;
        const depth = dataSource[dragIndex].__nodeProps.depth + dir;
        const computeNesting = (dataArray, result = [], parentNode) => {
            if (this.iterate) {
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
                    }
                    else {
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
                            this.iterate = false;
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
        const computeIds = (dataArray) => {
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
    computeItem = (props) => {
        const { computedGroupBy: groupBy } = props;
        const { dropKeyPath } = this.DRAG_INFO;
        if (!dropKeyPath) {
            return {};
        }
        let item = {};
        for (let i = 0; i < groupBy.length; i++) {
            item[groupBy[i]] = dropKeyPath[i];
        }
        return item;
    };
    initDrag = ({ cellNode }) => {
        const contentNode = this.content.getDOMNode();
        const headerNode = this.headerLayout
            ? this.headerLayout.headerDomNode.current
            : null;
        const contentRegion = Region.from(contentNode);
        const headerRegion = Region.from(headerNode);
        const headerHeight = headerRegion.getHeight();
        const node = cellNode && cellNode.current;
        const cellRegion = Region.from(node);
        return {
            contentRegion,
            headerHeight,
            cellRegion,
        };
    };
    getDropGroup = () => {
        const { ranges, dragBoxRegion } = this.DRAG_INFO;
        const { dropGroup, keyPath: dropKeyPath } = getDropGroup({
            ranges,
            dragBoxRegion,
        });
        this.DRAG_INFO = Object.assign({}, this.DRAG_INFO, {
            dropGroup,
            dropKeyPath,
        });
    };
    getDropParent = () => {
        const { ranges, dragBoxRegion } = this.DRAG_INFO;
        const { dropParent, dropDepth } = getDropParent({
            ranges,
            dragBoxRegion,
        });
        this.DRAG_INFO = Object.assign({}, this.DRAG_INFO, {
            dropParent,
            dropDepth,
        });
    };
    onRowReorder = (props, { dragIndex, dropIndex }) => {
        const { data, onRowReorder } = props;
        const rowData = data[dragIndex];
        onRowReorder({
            data: rowData,
            dragRowIndex: dragIndex,
            insertRowIndex: dropIndex,
        });
    };
    getDragProxy = (props, { dragIndex, contentRegion, cellRegion, dragBoxInitialRegion, }) => {
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
    getDragBoxInitialRegion = ({ dragIndex }) => {
        const dragBox = this.getDragRowInstance(dragIndex);
        const dragBoxNode = dragBox.domRef ? dragBox.domRef.current : null;
        let dragBoxInitialRegion;
        if (dragBox) {
            dragBoxInitialRegion = Region.from(dragBoxNode);
        }
        this.dragBoxInitialHeight =
            dragBoxInitialRegion && dragBoxInitialRegion.getHeight();
        if (this.DRAG_ROW_MAX_HEIGHT &&
            dragBoxInitialRegion &&
            dragBoxInitialRegion.getHeight() > this.DRAG_ROW_MAX_HEIGHT) {
            dragBoxInitialRegion.setHeight(this.DRAG_ROW_MAX_HEIGHT);
            dragBoxInitialRegion.shift({
                top: this.dragBoxInitialHeight / 2 - this.DRAG_ROW_MAX_HEIGHT / 2,
            });
        }
        const dragRowHeight = dragBoxInitialRegion.getHeight();
        return { dragBoxInitialRegion, dragRowHeight };
    };
    setScrollRegionVisibility = (props) => {
        if (this.scrollTopRegionRef.current) {
            this.scrollTopRegionRef.current.setVisible(true);
            const height = (this.headerLayout &&
                this.headerLayout.headerNode &&
                this.headerLayout.headerNode.offsetHeight) ||
                props.rowHeight / 2 ||
                0;
            this.scrollTopRegionRef.current.setHeight(height);
        }
        if (this.scrollBottomRegionRef.current) {
            this.scrollBottomRegionRef.current.setVisible(true);
        }
    };
    getRanges = (props, { initialScrollTop, contentRegion, dragBoxInitialRegion, }) => {
        const { count, rowHeightManager, data, computedGroupBy, computedTreeEnabled, generateIdFromPath, } = props;
        let ranges = [];
        let selectedGroup;
        let selectedParent = '';
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
        }
        else if (computedTreeEnabled && generateIdFromPath) {
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
        }
        else {
            ranges = getRangesForRows({
                count,
                initialOffset: contentRegion.top,
                rowHeightManager,
                initialScrollTop,
            });
        }
        return { ranges, selectedGroup, selectedParent };
    };
    compareRanges = ({ scrollDiff }) => {
        const { ranges } = this.DRAG_INFO;
        const mapRange = (r) => {
            if (!r) {
                return null;
            }
            if (r && r.group) {
                return null;
            }
            else {
                return {
                    ...r,
                    top: r.top - scrollDiff,
                    bottom: r.bottom - scrollDiff,
                };
            }
        };
        return ranges.map(mapRange);
    };
    adjustDragProxy = ({ diffTop, diffLeft, initialDiffTop, initialDiffLeft, dragProxyAdjust, }) => {
        const { dragBoxRegion, dragBoxInitialRegion, dragBoxOffsets, headerHeight, leftBoxOffset, } = this.DRAG_INFO;
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
        const dragProxyTop = dragBoxInitialRegion.top -
            dragBoxOffsets.top +
            initialDiffTop -
            dragProxyAdjust +
            headerHeight;
        const dragProxyLeft = dragBoxInitialRegion.left -
            dragBoxOffsets.left +
            initialDiffLeft +
            leftBoxOffset;
        return { dragProxyTop, dragProxyLeft };
    };
    getValidDropPositions = (props, dragIndex, dropIndex) => {
        const { computedGroupBy, data, count, isRowReorderValid, allowRowReorderBetweenGroups, computedTreeEnabled, enableTreeRowReorderParentChange, nodePathSeparator, groupPathSeparator, generateIdFromPath, } = props;
        const { selectedGroup, selectedParent } = this.DRAG_INFO;
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
        if (!this.DRAG_INFO) {
            return;
        }
        const { dragProxy } = this.DRAG_INFO;
        this.dropIndex = -1;
        dragProxy.setVisible(false);
        this.DRAG_INFO = null;
        if (this.scrollTopRegionRef.current) {
            this.scrollTopRegionRef.current.setVisible(false);
        }
        if (this.scrollBottomRegionRef.current) {
            this.scrollBottomRegionRef.current.setVisible(false);
        }
    };
    cancelDrop = () => {
        if (this.DRAG_INFO) {
            this.DRAG_INFO.dragProxy.setVisible(false);
        }
        this.setReorderArrowVisible(false);
        this.DRAG_INFO = null;
    };
    adjustScrollOnDrag = (props, config) => {
        const { rowReorderScrollByAmount } = props;
        const { contentRegion, scrollTopMax, dragBoxInitialRegion, initialScrollTop, } = this.DRAG_INFO;
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
        if (dragBoxInitialRegion.top + initialDiffTop <
            minScrollTop + this.SCROLL_MARGIN &&
            initialDiffTop < 0) {
            scrollAdjust = -rowReorderScrollByAmount;
        }
        else if (dragBoxInitialRegion.top + initialDiffTop >
            maxScrollTop - this.SCROLL_MARGIN &&
            initialDiffTop > 0) {
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
    setReorderArrowAt = (index, ranges, direction, visible) => {
        visible =
            visible !== undefined ? visible : index !== this.DRAG_INFO.dragIndex;
        if (!this.scrolling) {
            this.setReorderArrowVisible(visible);
        }
        let box = ranges[index];
        if (!box) {
            return;
        }
        if (box.group) {
            return;
        }
        const { contentRegion } = this.DRAG_INFO;
        let boxPos;
        let dragRowArrowHeight = this.dragRowArrow.props
            .rowReorderArrowStyle
            ? this.dragRowArrow.props.rowReorderArrowStyle.height
            : 3;
        if (!Number.isInteger(dragRowArrowHeight)) {
            dragRowArrowHeight = 3;
        }
        let boxSide = box.bottom;
        if (direction < 0) {
            boxSide = box.top;
        }
        else if (direction > 0) {
            boxSide = box.bottom;
        }
        if (index === 0) {
            boxPos = box.top;
        }
        else if (index === ranges.length - 1) {
            const lastBox = ranges[ranges.length - 1];
            boxPos = lastBox.bottom - Math.floor(dragRowArrowHeight);
        }
        else {
            boxPos = boxSide - Math.floor(dragRowArrowHeight / 2);
        }
        const arrowPosition = boxPos - contentRegion.top;
        return this.setReorderArrowPosition(arrowPosition);
    };
    setReorderArrowPosition = (top) => {
        this.dragRowArrow.setTop(top);
    };
    setReorderArrowVisible = (visible) => {
        this.dragRowArrow.setVisible(visible);
    };
    dragStartCallbacks = (props, dragIndex, selectedGroup) => {
        const data = props.data[dragIndex];
        const grouped = props.computedGroupBy && props.computedGroupBy.length > 0;
        if (grouped) {
            props.onGroupRowReorderStart &&
                props.onGroupRowReorderStart({
                    data,
                    dragIndex,
                    dragGroup: selectedGroup,
                });
        }
        else {
            props.onRowReorderStart && props.onRowReorderStart({ data, dragIndex });
        }
    };
    dragEndCallbacks = (props, dropIndex) => {
        if (dropIndex) {
            const data = props.data[dropIndex];
            props.onRowReorderEnd && props.onRowReorderEnd({ data, dropIndex });
        }
    };
    dragEndGroupCallbacks = (props, dropIndex, dropGroup) => {
        if (dropIndex !== undefined && props.onGroupRowReorderEnd) {
            const data = props.data[dropIndex];
            props.onGroupRowReorderEnd({ data, dropIndex, dropGroup });
        }
    };
    onRowReorderValidation = (ev, props, dragIndex) => {
        if ((ev.isDefaultPrevented && ev.isDefaultPrevented()) ||
            ev.defaultPrevented) {
            return false;
        }
        const { onRowReorder, rowReorderColumn, computedPagination, computedSortInfo, computedFiltered, dataSource, data, computedPivot, computedTreeEnabled, enableTreeRowReorder, generateIdFromPath, } = props;
        let isNotRowReorder = false;
        if (!onRowReorder &&
            (typeof onRowReorder !== 'function' || typeof onRowReorder !== 'boolean')) {
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
        if ((ev.nativeEvent
            ? ev.nativeEvent.which === 3
            : ev.which === 3) /* right click */ ||
            ev.metaKey ||
            ev.ctrlKey) {
            return false;
        }
        if (computedPagination ||
            computedSortInfo ||
            computedFiltered ||
            typeof dataSource === 'function' ||
            (computedPivot && computedPivot.length > 0)) {
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
