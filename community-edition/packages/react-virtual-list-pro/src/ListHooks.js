/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useCallback, useRef, useEffect, useState, useImperativeHandle, forwardRef, } from 'react';
import PropTypes from 'prop-types';
import contains from '../../../packages/contains';
import cleanupProps from '../../../packages/react-clean-props';
import RO from 'resize-observer-polyfill';
import VirtualScrollContainer, { getScrollbarWidth, hasSticky, NativeScrollContainer, } from '../../../packages/react-virtual-scroll-container-pro/src';
import uglified from '../../../packages/uglified';
import join from '../../../packages/join';
import binarySearch from '../../../packages/binary-search';
import RowHeightManager from './RowHeightManager';
import getFocusableElements from '../../getFocusableElements';
import renderRows from './renderRows';
import shouldComponentUpdate from '../../../packages/shouldComponentUpdate';
import getVisibleRange from './getVisibleRange';
import StickyRowsContainer from './StickyRowsContainer';
import throttle from 'lodash.throttle';
import { getGlobal } from '../../../getGlobal';
const globalObject = getGlobal();
const sortAsc = (a, b) => a - b;
const emptyFn = function () { };
const emptyObject = Object.freeze ? Object.freeze({}) : {};
const ua = globalObject.navigator ? globalObject.navigator.userAgent : '';
const IS_EDGE = ua.indexOf('Edge/') !== -1;
const IS_FF = ua.toLowerCase().indexOf('firefox') > -1;
const BASE_CLASS_NAME = 'inovua-react-virtual-list';
const ResizeObserver = globalObject.ResizeObserver || RO;
// const sum = (a: number, b: number): number => a + b;
const unique = (arr) => {
    if (Set) {
        return [...new Set(arr)];
    }
    return Object.keys(arr.reduce((acc, item) => {
        acc[item] = true;
        return acc;
    }, {}));
};
const useForceUpdate = () => {
    const [, fn] = useState(0);
    const update = useCallback(() => {
        fn(x => x + 1);
    }, []);
    return update;
};
const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
};
const InovuaVirtualList = forwardRef((props, ref) => {
    const forceUpdate = useForceUpdate();
    const stickyRowsContainerRef = useRef(null);
    const scrollContainerRef = useRef();
    const rowRef = useRef(null);
    const containerNode = useRef(null);
    const strictVisibleCountRef = useRef(0);
    const visibleCountRef = useRef(0);
    const rowOffsetsRef = useRef([]);
    const rowHeightsRef = useRef([]);
    const scrollTopPosRef = useRef(0);
    const scrollLeftPosRef = useRef(0);
    const rowsRef = useRef([]);
    const mappingRef = useRef({});
    const scrollingRef = useRef(false);
    const disableScrollPropNameRef = useRef();
    const disableScrollOtherPropNameRef = useRef();
    const disableScrollPropValueRef = useRef();
    const oldRowIndexesRef = useRef([]);
    const forceScrollTopRef = useRef(0);
    const scrollTopRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const prevScrollTopPosRef = useRef(0);
    const prevScrollLeftPosRef = useRef(0);
    const sizeRef = useRef({
        height: 0,
        width: 0,
    });
    const prevStartRowIndexRef = useRef(0);
    const rowCoveredByRef = useRef({});
    const updateRafHandleRef = useRef();
    const mountedRef = useRef(false);
    const unmountedRef = useRef(false);
    const rowSpansRef = useRef({});
    const currentStickyRowsRef = useRef();
    const scrollHeightRef = useRef(0);
    const reorderRef = useRef(false);
    const initRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        setupRowHeightManager(props.rowHeightManager);
        return () => {
            if (props.rowHeightManager) {
                props.rowHeightManager.removeListener('index', onIndex);
            }
            mountedRef.current = false;
            unmountedRef.current = true;
            rowsRef.current = null;
            rowHeightsRef.current = null;
            rowOffsetsRef.current = null;
        };
    }, []);
    // UNSAFE_componentWillReceiveProps(nextProps) {
    //   const nextCount = Math.max(nextProps.count, 0);
    //   const rowHeightChange =
    //     this.props.rowHeight && nextProps.rowHeight != this.props.rowHeight;
    //   if (this.props.renderRow !== nextProps.renderRow) {
    //     rowCoveredByRef.current = {};
    //     rowSpansRef.current = {};
    //   }
    //   if (
    //     nextCount != this.props.count ||
    //     nextProps.showEmptyRows != this.props.showEmptyRows ||
    //     rowHeightChange
    //   ) {
    //     const size = sizeRef.current;
    //     const oldVisibleCount = this.getVisibleCount();
    //     this.updateVisibleCount(size.height, nextProps);
    //     this.cleanupRows(nextProps);
    //     reorderRef.current =
    //       rowHeightChange || this.getVisibleCount(nextProps) < oldVisibleCount;
    //     // optimize this
    //     this.initSizes(nextProps);
    //   }
    // }
    const prevNativeScroll = usePrevious(props.nativeScroll);
    const prevRowHeightManager = usePrevious(props.rowHeightManager);
    const prevCount = usePrevious(props.count);
    const prevRenderRow = usePrevious(props.renderRow);
    const prevShowEmptyRows = usePrevious(props.showEmptyRows);
    const prevStickyRows = usePrevious(props.stickyRows);
    useEffect(() => {
        let prevScrollTopPos;
        let prevScrollLeftPos;
        if (prevNativeScroll !== props.nativeScroll) {
            prevScrollTopPos = scrollTopPosRef.current;
            prevScrollLeftPos = scrollLeftPosRef.current;
            globalObject.requestAnimationFrame(() => {
                if (unmountedRef.current) {
                    return;
                }
                scrollTopRef.current = prevScrollTopPos;
                scrollLeftRef.current = prevScrollLeftPos;
            });
        }
        if (prevRowHeightManager !== props.rowHeightManager) {
            if (prevRowHeightManager) {
                prevRowHeightManager.removeListener('index', onIndex);
            }
            setupRowHeightManager(props.rowHeightManager);
        }
        if (props.count != prevCount ||
            props.renderRow != prevRenderRow ||
            props.rowHeightManager != prevRowHeightManager ||
            props.rowHeightManager == null ||
            props.showEmptyRows != prevShowEmptyRows) {
            const refreshConfig = { reorder: reorderRef.current };
            if (prevScrollTopPos !== undefined) {
                refreshConfig.scrollTop = prevScrollTopPos;
                refreshConfig.scrollLeft = prevScrollLeftPos;
            }
            const visibleCount = visibleCountRef.current;
            if (props.count <= visibleCount) {
                // there will be no scroll, so compute as if scrollPosition is zero
                refreshConfig.scrollTop = 0;
            }
            if ((IS_EDGE || IS_FF) && props.count < prevCount) {
                fixEdgeScrollPosition();
            }
            reorderRef.current = false;
            refreshLayout(refreshConfig);
        }
        if (prevStickyRows !== props.stickyRows) {
            updateStickyRows(undefined, undefined, { force: true });
        }
    }, [
        props.nativeScroll,
        props.rowHeightManager,
        props.count,
        props.renderRow,
        props.showEmptyRows,
        props.stickyRows,
    ]);
    const getVisibleCount = useCallback((theProps = props) => {
        const { virtualized, enableRowSpan, extraRows: extraRowsProps, } = theProps;
        const extraRows = enableRowSpan ? 2 : extraRowsProps || 0;
        const visibleCount = visibleCountRef.current;
        if (visibleCount === undefined) {
            return 0;
        }
        if (!virtualized) {
            return ((props.showEmptyRows
                ? Math.max(visibleCount || 0, props.count || 0)
                : props.count) + extraRows);
        }
        return ((props.showEmptyRows
            ? visibleCount || props.count
            : Math.min(visibleCount || props.count, props.count)) + extraRows);
    }, [props.virtualized, props.enableRowSpan, props.extraRows]);
    const getMaxRenderCount = useCallback((theProps = props) => {
        const visibleCount = getVisibleCount(props);
        const maxCount = theProps.showEmptyRows
            ? Math.max(visibleCount || 0, theProps.count)
            : Math.max(theProps.count || 0, 0);
        return maxCount;
    }, [getVisibleCount]);
    const initSizes = useCallback((theProps = props) => {
        const { minRowHeight, rowHeightManager } = theProps;
        if (rowHeightManager) {
            return;
        }
        const count = getMaxRenderCount(theProps);
        const rowOffsets = [];
        let totalHeight = 0;
        const rowHeights = [...Array(count)].map(() => {
            rowOffsets.push(totalHeight);
            if (minRowHeight != null) {
                totalHeight += minRowHeight;
            }
            return minRowHeight;
        });
        rowOffsets[count] = totalHeight;
        rowOffsetsRef.current = rowOffsets;
        rowHeightsRef.current = rowHeights;
    }, [getMaxRenderCount, props.minRowHeight, props.rowHeightManager]);
    const init = useCallback(() => {
        initSizes(props);
    }, []);
    if (initRef.current) {
        init();
        initRef.current = false;
    }
    const getContainerNode = useCallback(() => {
        return containerNode.current;
    }, []);
    const getEmptyScrollOffset = useCallback(() => {
        if (props.emptyScrollOffset != null) {
            return props.emptyScrollOffset;
        }
        const SCROLLBAR_WIDTH = getScrollbarWidth();
        return props.emptyScrollOffset || SCROLLBAR_WIDTH || 17;
    }, [props.emptyScrollOffset]);
    const renderScroller = useCallback((theProps) => {
        let offset = getEmptyScrollOffset() || 0;
        if (theProps.nativeScroll) {
            offset = 0;
        }
        const style = {
            ...theProps.style,
            overscrollBehavior: props.overscrollBehavior || 'none',
            backfaceVisibility: 'hidden',
            WebkitOverscrollBehavior: props.overscrollBehavior || 'none',
            right: -offset,
            bottom: -offset,
        };
        theProps.style = style;
        if (props.showEmptyRows &&
            props.count < strictVisibleCountRef.current &&
            getScrollbarWidth() &&
            props.nativeScroll) {
            style.overflowY = 'hidden';
        }
        let result;
        if (props.renderScroller) {
            result = props.renderScroller(theProps);
        }
        if (result === undefined) {
            result = React.createElement("div", { ...theProps });
        }
        return result;
    }, [
        getEmptyScrollOffset,
        getScrollbarWidth,
        props.overscrollBehavior,
        props.showEmptyRows,
        props.count,
        props.nativeScroll,
        props.renderScroller,
    ]);
    const getTotalRowHeight = useCallback((theProps = props) => {
        return theProps.rowHeightManager
            ? theProps.rowHeightManager.getTotalSize(theProps.count)
            : theProps.count * theProps.rowHeight;
    }, []);
    const getScrollHeight = useCallback(() => {
        const SCROLLBAR_WIDTH = getScrollbarWidth();
        let offset = SCROLLBAR_WIDTH ? 0 : getEmptyScrollOffset() || 0;
        if (props.nativeScroll) {
            offset = 0;
        }
        const height = getTotalRowHeight();
        return height + offset;
    }, [
        props.nativeScroll,
        getTotalRowHeight,
        getEmptyScrollOffset,
        getScrollbarWidth,
    ]);
    const renderScrollerSpacerOnNaturalRowHeight = useCallback((spacerProps) => {
        spacerProps.style.height = getScrollHeight();
        if (props.renderScrollerSpacer) {
            props.renderScrollerSpacer(spacerProps);
        }
    }, [props.renderScrollerSpacer, getScrollHeight]);
    const renderView = useCallback((theProps) => {
        let offset = getEmptyScrollOffset() || 0;
        if (props.nativeScroll) {
            offset = 0;
        }
        const minHeight = offset ? `calc(100% - ${offset}px)` : '100%';
        let maxWidth = offset ? `calc(100% - ${offset}px)` : '100%';
        if (props.rtl && !props.nativeScroll) {
            maxWidth = '100%';
        }
        const style = {
            ...theProps.style,
            minHeight,
            maxWidth,
        };
        // to hide the native vertical scrollbar, which gets visible
        if (props.rtl && !getScrollbarWidth()) {
            style.transform = `translateX(${-offset}px)`;
        }
        const viewProps = {
            ...theProps,
            style,
            'data-name': 'view',
        };
        let result;
        if (props.renderView) {
            result = props.renderView(viewProps);
        }
        if (result === undefined) {
            result = React.createElement("div", { ...viewProps });
        }
        return result;
    }, [
        props.nativeScroll,
        props.rtl,
        props.renderView,
        getEmptyScrollOffset,
        getScrollbarWidth,
    ]);
    const getScrollSize = useCallback((node) => {
        const res = {
            width: node.scrollWidth,
            height: getScrollHeight(),
        };
        return res;
    }, [getScrollHeight]);
    const getClientSize = useCallback((n) => {
        const node = n.firstChild;
        const SCROLLBAR_WIDTH = getScrollbarWidth();
        let offset = SCROLLBAR_WIDTH ? 0 : getEmptyScrollOffset() || 0;
        if (props.nativeScroll) {
            offset = 0;
        }
        return {
            width: node.clientWidth + offset,
            height: node.clientHeight + offset,
        };
    }, [props.nativeScroll, getEmptyScrollOffset, getScrollbarWidth]);
    /**
     * the indexes need to be successive numbers, in asc order
     */
    const setHeightForRows = useCallback((indexes, heights) => {
        if (!indexes.length || !heights.length) {
            return 0;
        }
        if (props.showWarnings) {
            if (indexes.length != heights.length) {
                console.warn('setHeightForRows signature mismatch!!!');
                return 0;
            }
            indexes.forEach((_, i) => {
                if (i > 0) {
                    const diff = indexes[i] - indexes[i - 1];
                    if (diff !== 1) {
                        console.warn('setHeightForRows should be called with successive indexes!', indexes);
                    }
                }
            });
        }
        const { count } = props;
        let diff = 0;
        indexes.forEach((index, i) => {
            const height = heights[i] || 0;
            const oldHeight = rowHeightsRef.current[index] || 0;
            rowHeightsRef.current[index] = height;
            rowOffsetsRef.current[index] =
                diff + (rowOffsetsRef.current[index] || 0);
            diff += height - oldHeight;
        });
        for (let i = indexes[indexes.length - 1] + 1; i <= count; i++) {
            rowOffsetsRef.current[i] = diff + (rowOffsetsRef.current[i] || 0);
        }
        return diff;
    }, [props.showWarnings, props.count]);
    // shouldComponentUpdate(nextProps, nextState) {
    //   return shouldComponentUpdate(this, nextProps, nextState);
    // }
    const renderSizer = useCallback((scrollHeight) => {
        const { renderSizer, minRowWidth, emptyScrollOffset, rowHeightManager, showEmptyRows, } = props;
        const SCROLLBAR_WIDTH = getScrollbarWidth();
        const offset = SCROLLBAR_WIDTH ? 0 : emptyScrollOffset || 0;
        let minHeight = scrollHeight + offset;
        if (showEmptyRows) {
            minHeight = Math.max(minHeight, strictVisibleCountRef.current * rowHeightManager.getDefaultRowHeight());
        }
        const style = {
            minHeight: isNaN(minHeight) ? '' : minHeight,
            minWidth: minRowWidth ? minRowWidth + offset : 0,
        };
        let result;
        if (renderSizer) {
            result = renderSizer({ style }, scrollHeight);
        }
        if (result === undefined) {
            result = React.createElement("div", { key: "sizer", "data-name": "sizer", style: style });
        }
        return result;
    }, [
        props.renderSizer,
        props.minRowWidth,
        props.emptyScrollOffset,
        props.rowHeightManager,
        props.showEmptyRows,
    ]);
    const renderRowContainer = useCallback(() => {
        const theProps = {
            key: 'rowContainer',
            className: `${BASE_CLASS_NAME}__row-container`,
            ref: containerNode,
            children: renderRowsHandle(),
        };
        let result;
        if (props.renderRowContainer) {
            result = props.renderRowContainer(theProps);
        }
        if (result === undefined) {
            result = React.createElement("div", { ...theProps });
        }
        return result;
    }, [props.renderRowContainer]);
    const renderStickyRowsContainer = useCallback(() => {
        return props.stickyRows ? (React.createElement(StickyRowsContainer, { rtl: props.rtl, key: "stickyrowscontainer", stickyOffset: props.stickyOffset, handle: stickyRowsContainerRef, rowHeightManager: props.rowHeightManager })) : null;
    }, [props.stickyRows, props.rtl, props.stickyOffset, props.rowHeightManager]);
    const onViewResize = useCallback(() => {
        requestAnimationFrame(() => {
            rafSync();
        });
    }, []);
    const onScrollbarsChange = useCallback(({ vertical, horizontal }) => {
        const scrollTopPos = scrollTopPosRef.current;
        const scrollLeftPos = scrollLeftPosRef.current;
        if ((!vertical && scrollTopPos) || (!horizontal && scrollLeftPos)) {
            applyScrollStyle({
                scrollTop: !vertical ? 0 : scrollTopPos,
                scrollLeft: !horizontal ? 0 : scrollLeftPos,
            });
        }
        if (props.onScrollbarsChange) {
            props.onScrollbarsChange({ vertical, horizontal });
        }
    }, [props.onScrollbarsChange]);
    const onRowUnmount = useCallback((row) => {
        // protect against lazy row unmounting
        const rows = rowsRef.current;
        if (!rows) {
            return;
        }
        const currentRowIndex = row.getIndex();
        const isFound = mappingRef.current[currentRowIndex];
        if (!isFound) {
            return;
        }
        delete mappingRef.current[currentRowIndex];
        const index = rows.indexOf(row);
        if (index != -1) {
            rows.splice(index, /* delete count */ 1);
        }
    }, []);
    const rowRefFn = useCallback((r) => {
        if (!r) {
            return;
        }
        mappingRef.current[r.props.index] = r;
        if (rowsRef.current) {
            rowsRef.current[r.props.index] = r;
        }
    }, []);
    const getScrollerNode = useCallback(() => {
        return scrollContainerRef.current.scrollerNode;
    }, []);
    const onScrollStart = useCallback((...args) => {
        scrollingRef.current = true;
        if (props.scrollOneDirectionOnly) {
            const [scrollPos, prevScrollPos] = args;
            const absTop = Math.abs(scrollPos.scrollTop - prevScrollPos.scrollTop);
            const absLeft = Math.abs(scrollPos.scrollLeft - prevScrollPos.scrollLeft);
            const scrollerNode = getScrollerNode();
            if (absTop != absLeft) {
                disableScrollPropNameRef.current =
                    absTop > absLeft ? 'overflowX' : 'overflowY';
                disableScrollOtherPropNameRef.current =
                    absTop > absLeft ? 'overflowY' : 'overflowX';
                disableScrollPropValueRef.current =
                    scrollerNode.style[disableScrollPropNameRef.current];
                scrollerNode.style[disableScrollOtherPropNameRef.current] = 'scroll';
                scrollerNode.style[disableScrollPropNameRef.current] = 'hidden';
            }
        }
        if (props.onScrollStart) {
            props.onScrollStart(...args);
        }
    }, [props.onScrollStart, props.scrollOneDirectionOnly, getScrollerNode]);
    const onScrollStop = useCallback((...args) => {
        scrollingRef.current = false;
        if (props.scrollOneDirectionOnly) {
            const scrollerNode = getScrollerNode();
            scrollerNode.styprops.scrollOneDirectionOnlyle[disableScrollPropNameRef.current] = disableScrollPropValueRef.current;
            scrollerNode.style.overflow = 'scroll';
        }
        if (props.onScrollStop) {
            props.onScrollStop(...args);
        }
    }, [props.onScrollStop, props.scrollOneDirectionOnly]);
    const forEachRow = useCallback((fn, onlyVisible = true) => {
        const rows = rowsRef.current;
        const visibleCount = getVisibleCount();
        let i = -1;
        for (let initialIndex in rows) {
            if (rows.hasOwnProperty(initialIndex) &&
                (!onlyVisible || (onlyVisible && +initialIndex < visibleCount))) {
                i++;
                fn(rows[initialIndex], i);
            }
        }
    }, []);
    const getRows = useCallback(() => {
        const rows = [];
        forEachRow((row) => {
            if (row) {
                rows.push(row);
            }
        });
        return rows;
    }, [forEachRow]);
    const sortRows = useCallback((rows) => {
        return rows.slice().sort((row1, row2) => row1.getIndex() - row2.getIndex());
    }, []);
    const getRowAt = useCallback((index) => {
        let row = mappingRef.current[index];
        if (row && row.getIndex() != index) {
            row = null;
        }
        return row;
    }, []);
    const setRowIndex = useCallback((row, index, callback) => {
        const existingRow = mappingRef.current[index];
        if (existingRow) {
            // there was already a row with that index
            // so keep that, and set the index again on it
            existingRow.setIndex(index, callback);
            // and also make the specified row invisible, if it's a different row
            if (existingRow !== row) {
                row.setVisible(false);
            }
            return;
        }
        const oldIndex = row.getIndex();
        row.setIndex(index, callback);
        delete mappingRef.current[oldIndex];
        mappingRef.current[index] = row;
    }, []);
    const getSortedRows = useCallback((rows = getRows()) => {
        return sortRows(rows);
    }, [sortRows]);
    const onRowsUpdated = useCallback((newIndexes, _range, updateScroll) => {
        newIndexes.sort((i1, i2) => i1 - i2);
        const start = newIndexes[0];
        const end = props.showEmptyRows
            ? newIndexes[newIndexes.length - 1]
            : Math.min(newIndexes[newIndexes.length - 1], props.count - 1);
        const { minRowHeight } = props;
        const rowIndexes = [];
        const rowHeights = [];
        const rows = [];
        for (let row, rowHeight, i = start; i <= end; i++) {
            const mapping = mappingRef.current;
            row = mapping[i];
            rowHeight = row ? row.getInfo().height : minRowHeight;
            if (row) {
                rows.push(row);
            }
            rowIndexes.push(i);
            rowHeights.push(rowHeight);
        }
        let newToTopHeight = 0;
        let oldTop;
        if (oldRowIndexesRef.current) {
            oldTop = oldRowIndexesRef.current[0];
            rowIndexes.forEach((rowIndex, i) => {
                let diff;
                if (rowIndex < oldTop && rowHeightsRef.current != null) {
                    diff = rowHeights[i] - rowHeightsRef.current[rowIndex];
                    newToTopHeight += diff;
                }
            });
        }
        if (rowIndexes.length) {
            setHeightForRows(rowIndexes, rowHeights);
        }
        rows.forEach(row => {
            const index = row.getIndex();
            const rowOffsets = rowOffsetsRef.current;
            const offset = rowOffsets && rowOffsets[index];
            row.setOffset(offset);
        });
        oldRowIndexesRef.current = rowIndexes;
        let newScrollTop;
        if (newToTopHeight) {
            const scrollTopPos = scrollTopPosRef.current;
            newScrollTop = scrollTopPos + newToTopHeight;
            updateScroll(newScrollTop);
            forceScrollTopRef.current = newScrollTop;
            scrollTopRef.current = newScrollTop;
        }
        else {
            updateScroll();
        }
    }, [setHeightForRows, props.showEmptyRows, props.count, props.minRowHeight]);
    const getVisibleRangeFn = useCallback((args) => {
        return getVisibleRange(args);
    }, []);
    const applyScrollStyle = useCallback(({ scrollTop, scrollLeft, force, reorder, }, domNode) => {
        // protect against safari inertial scrolling overscroll
        // that can give negative scroll positions
        // which results in weird behaviour
        if (scrollTop < 0) {
            scrollTop = 0;
        }
        if (!props.rtl) {
            if (scrollLeft < 0) {
                scrollLeft = 0;
            }
        }
        else {
            if (scrollLeft > 0) {
                scrollLeft = 0;
            }
        }
        if (forceScrollTopRef.current !== undefined) {
            scrollTop = forceScrollTopRef.current;
            forceScrollTopRef.current = undefined;
            return;
        }
        if (props.applyScrollLeft && scrollLeft !== undefined) {
            scrollLeft = 0;
            props.applyScrollLeft(scrollLeft, domNode);
        }
        if (scrollTop === undefined) {
            scrollTop = prevScrollTopPosRef.current;
        }
        if (scrollLeft === undefined) {
            scrollLeft = prevScrollLeftPosRef.current;
        }
        scrollTopPosRef.current = scrollTop;
        scrollLeftPosRef.current = scrollLeft;
        const { count, useTransformPosition, rowHeightManager, naturalRowHeight, virtualized, showEmptyRows, } = props;
        const size = sizeRef.current;
        const range = getVisibleRangeFn({
            scrollTop,
            size: size,
            count,
            naturalRowHeight,
            rowHeightManager,
            showEmptyRows,
        });
        const startRowIndex = range.start;
        const prevStartRowIndex = prevStartRowIndexRef.current;
        prevScrollTopPosRef.current = scrollTop;
        prevScrollLeftPosRef.current = scrollLeft;
        prevStartRowIndexRef.current = startRowIndex;
        updateStickyRows(scrollTop, undefined, { force: false });
        const updateScroll = (top = scrollTop) => {
            const containerNode = getContainerNode();
            const parentNodeStyle = containerNode && containerNode.parentNode.style;
            containerNode &&
                containerNode.parentNode.classList.add(`${BASE_CLASS_NAME}__view-container`);
            const scrollLeftTranslateValue = -scrollLeft;
            if (useTransformPosition) {
                parentNodeStyle.transform = `translate3d(${scrollLeftTranslateValue}px, ${-top}px, 0px)`;
            }
            else {
                parentNodeStyle.left = `${scrollLeftTranslateValue}px`;
                parentNodeStyle.top = `${-top}px`;
            }
        };
        if (rowHeightManager == null) {
            force = true;
        }
        if ((startRowIndex == prevStartRowIndex && !force) || !virtualized) {
            updateScroll();
            return;
        }
        updateScroll();
        updateRows(range, reorder, emptyFn);
    }, [
        props.count,
        props.rtl,
        props.useTransformPosition,
        props.rowHeightManager,
        props.naturalRowHeight,
        props.virtualized,
        props.showEmptyRows,
        props.applyScrollLeft,
        getVisibleRangeFn,
        getContainerNode,
    ]);
    const getGapsFor = useCallback((startRowIndex, endRowIndex, sortedRows) => {
        const visibleRowPositions = {};
        const rows = sortedRows || getSortedRows();
        rows.forEach(row => {
            if (row.isVisible()) {
                visibleRowPositions[row.getIndex()] = true;
            }
        });
        const gaps = [];
        const rowCoveredBy = rowCoveredByRef.current;
        if (props.enableRowSpan && rowCoveredBy[startRowIndex] != null) {
            // the startRowIndex is a covered row
            // so move startRowIndex up to the row before it that has the rowspan
            startRowIndex = rowCoveredBy[startRowIndex];
        }
        let alreadyVisible;
        let coveredBy;
        for (; startRowIndex <= endRowIndex; startRowIndex++) {
            alreadyVisible = visibleRowPositions[startRowIndex];
            if (props.enableRowSpan && !alreadyVisible) {
                coveredBy = rowCoveredBy[startRowIndex];
                if (coveredBy != null) {
                    // if we can recycle the row,
                    // behave as if the row is already visible
                    // since we can reuse it and can skip the row from
                    // being included in the missing row gaps
                    alreadyVisible = props.recycleCoveredRows;
                }
            }
            if (!alreadyVisible) {
                gaps.push(startRowIndex);
            }
        }
        return gaps;
    }, [props.enableRowSpan, props.recycleCoveredRows, getSortedRows]);
    const updateRows = useCallback(throttle((range, reorder, _updateScroll) => {
        const startRowIndex = range.start;
        const endRowIndex = range.end;
        if (props.onRenderRangeChange) {
            props.onRenderRangeChange(startRowIndex, endRowIndex);
        }
        const rows = getSortedRows();
        const gaps = getGapsFor(startRowIndex, endRowIndex, rows);
        const newIndexes = [];
        const visited = {};
        rows.forEach((row, i) => {
            const rowIndex = row.getIndex();
            if (reorder) {
                const newRowIndex = startRowIndex + i;
                setRowIndex(row, newRowIndex);
                if (props.rowHeightManager == null) {
                    newIndexes.push(newRowIndex);
                }
                return;
            }
            const extraRows = props.enableRowSpan ? row.getRowSpan() - 1 : 0;
            const outOfView = rowIndex + extraRows < startRowIndex ||
                rowIndex > endRowIndex ||
                visited[rowIndex] ||
                (props.enableRowSpan &&
                    props.recycleCoveredRows &&
                    rowCoveredByRef.current[rowIndex] !== undefined);
            visited[rowIndex] = true;
            if (props.rowHeightManager == null) {
                if (outOfView) {
                    if (gaps.length) {
                        // there are still gaps to be covered
                        const newIndex = gaps.pop();
                        newIndexes.push(newIndex);
                        // so assign one to this row
                        setRowIndex(row, newIndex);
                    }
                    else {
                        // no more gaps, so just set the row as invisible
                        row.setVisible(false);
                    }
                }
                else {
                    // row in view,
                    // so make sure it's visible
                    row.setVisible(true);
                    newIndexes.push(row.getIndex());
                }
                return;
            }
            if (outOfView && gaps.length) {
                const newIndex = gaps.pop();
                setRowIndex(row, newIndex);
            }
        });
        if (newIndexes.length && props.rowHeightManager == null) {
            if (updateRafHandleRef.current) {
                globalObject.cancelAnimationFrame(updateRafHandleRef.current);
            }
            updateRafHandleRef.current = globalObject.requestAnimationFrame(() => {
                updateRafHandleRef.current = null;
                onRowsUpdated(newIndexes, {
                    start: startRowIndex,
                    end: endRowIndex,
                }, () => { });
            });
        }
    }, 16), [
        props.rowHeightManager,
        props.recycleCoveredRows,
        props.enableRowSpan,
        props.onRenderRangeChange,
        getSortedRows,
        getGapsFor,
        setRowIndex,
        onRowsUpdated,
    ]);
    const smoothScrollTo = (...args) => {
        scrollContainerRef.current.smoothScrollTo(...args);
    };
    const fixEdgeScrollPosition = useCallback(() => {
        if (!(IS_EDGE || IS_FF)) {
            return;
        }
        // because of a weird behavior in edge, we cannot use this.scrollTopMax
        const maxTop = getTotalRowHeight() -
            (scrollContainerRef.current.viewNode
                ? scrollContainerRef.current.viewNode.offsetHeight
                : 0);
        if (scrollTopRef.current > maxTop) {
            globalObject.requestAnimationFrame(() => {
                if (unmountedRef.current) {
                    return;
                }
                scrollTopRef.current = maxTop;
            });
        }
    }, [getTotalRowHeight]);
    const setupRowHeightManager = useCallback((rowHeightManager) => {
        if (rowHeightManager) {
            rowHeightManager.on('index', onIndex);
        }
    }, []);
    const onIndex = useCallback(() => {
        const size = sizeRef.current;
        updateVisibleCount(size.height);
        if (unmountedRef.current) {
            return;
        }
        refreshLayout({ reorder: false, force: true });
        cleanupRows();
        fixEdgeScrollPosition();
        const rows = rowsRef.current;
        rows &&
            rows.forEach((row) => {
                row.setIndex(row.getIndex(), undefined, undefined, true);
            });
        forceUpdate();
    }, []);
    const adjustHeights = useCallback(() => {
        const rows = rowsRef.current;
        if (rows != null && Array.isArray(rows)) {
            rows.forEach(r => r.updateRowHeight());
        }
    }, []);
    const refreshLayout = useCallback((config) => {
        const defaults = {
            force: true,
            reorder: true,
        };
        adjustHeights();
        const options = config ? { ...defaults, ...config } : defaults;
        applyScrollStyle(options);
    }, [adjustHeights, applyScrollStyle]);
    const getOverlappingHeight = useCallback(() => {
        if (scrollContainerRef.current &&
            scrollContainerRef.current.getBeforeAndAfterHeight) {
            return scrollContainerRef.current.getBeforeAndAfterHeight();
        }
        return 0;
    }, []);
    const updateVisibleCount = useCallback((height, theProps) => {
        theProps = theProps || props;
        const { rowHeightManager, minRowHeight, showEmptyRows } = theProps;
        const strictVisibleCount = rowHeightManager
            ? Math.ceil(height / rowHeightManager.getMinHeight())
            : Math.ceil(height / (minRowHeight || 1));
        strictVisibleCountRef.current = strictVisibleCount;
        // we're doing + 1 since if there fit exactly n rows, if the user scrolls
        // to half a row, there can be n + 1 visible rows at max
        visibleCountRef.current = rowHeightManager
            ? strictVisibleCount + 1
            : strictVisibleCount + 2;
        const maxCount = theProps.count;
        const visibleCount = visibleCountRef.current;
        if (visibleCount > maxCount && !showEmptyRows) {
            visibleCountRef.current = maxCount;
        }
    }, [props.rowHeightManager, props.minRowHeight, props.showEmptyRows]);
    const getCleanupRows = useCallback((theProps = props) => {
        const indexes = [];
        const rows = rowsRef.current;
        const visibleCount = getVisibleCount(theProps);
        const length = rows != null ? rows.length : 0;
        for (let i = visibleCount; i < length; i++) {
            indexes.push(i);
        }
        return indexes;
    }, [getVisibleCount]);
    const cleanupRows = useCallback((theProps = props) => {
        // now clear extra remaining rows from memory
        // since we have kept references to every row
        // we need to delete those from memory
        getCleanupRows(theProps).forEach(i => {
            const row = rowsRef.current && rowsRef.current[i];
            if (row) {
                delete mappingRef.current[row.getIndex()];
                delete rowsRef.current[i];
            }
        });
    }, [getCleanupRows]);
    const getDOMNode = useCallback(() => {
        debugger;
        return scrollContainerRef.current
            ? scrollContainerRef.current.domNode ||
                scrollContainerRef.current.getDOMNode()
            : null;
    }, []);
    const onResize = useCallback(() => {
        const node = getDOMNode();
        if (!node) {
            return;
        }
        const size = props.measureSize
            ? props.measureSize(node)
            : { width: node.clientWidth, height: node.clientHeight };
        size.height -= getOverlappingHeight();
        sizeRef.current = size;
        if (props.scrollProps && typeof props.scrollProps.onResize == 'function') {
            props.scrollProps.onResize(size);
        }
        updateVisibleCount(size.height);
        if (props.virtualized) {
            if (props.showEmptyRows) {
                initSizes();
            }
            if (unmountedRef.current) {
                return;
            }
            refreshLayout({ reorder: false, force: true });
            cleanupRows();
            forceUpdate();
        }
        if (props.onResize) {
            props.onResize(size);
        }
    }, [
        props.measureSize,
        props.scrollProps,
        props.virtualized,
        props.showEmptyRows,
        props.onResize,
    ]);
    const setRowRowSpan = useCallback((rowIndex, rowSpan) => {
        if (rowSpan === 1) {
            return;
        }
        rowSpansRef.current[rowIndex] = rowSpan;
        let current = rowIndex + 1;
        const last = rowIndex + rowSpan - 1;
        for (; current <= last; current++) {
            rowCoveredByRef.current[current] = rowIndex;
        }
    }, []);
    const renderRowsHandle = useCallback(() => {
        const { rowHeight, renderRow, count, pureRows, rowHeightManager, showEmptyRows, virtualized, rowContain, naturalRowHeight, useTransformRowPosition, } = props;
        let to = getVisibleCount();
        return renderRows({
            ref: rowRef,
            onUnmount: onRowUnmount,
            notifyRowSpan: setRowRowSpan,
            pure: pureRows,
            renderRow,
            rowHeightManager,
            rowHeight,
            rowContain,
            count,
            from: 0,
            to,
            naturalRowHeight,
            onKeyDown: onRowKeyDown,
            onFocus: onRowFocus,
            useTransformPosition: useTransformRowPosition,
            showEmptyRows,
            virtualized,
        });
    }, [
        props.rowHeight,
        props.renderRow,
        props.count,
        props.pureRows,
        props.rowHeightManager,
        props.showEmptyRows,
        props.virtualized,
        props.rowContain,
        props.naturalRowHeight,
        props.useTransformRowPosition,
        getVisibleCount,
    ]);
    const onRowKeyDown = useCallback((index, event) => {
        if (event.key !== 'Tab') {
            return;
        }
        if (props.handleRowKeyDown) {
            props.handleRowKeyDown(index, event);
            return;
        }
        const activeElement = globalObject.document.activeElement;
        const theRow = getRowAt(index);
        const rowNode = theRow.getDOMNode ? theRow.getDOMNode() : theRow.node;
        if (!activeElement || !contains(rowNode, activeElement)) {
            // the current focused element is not inside the row
            // so no need to do further work
            return;
        }
        const dir = event.shiftKey ? -1 : 1;
        const nextIndex = index + dir;
        const maxCount = getMaxRenderCount();
        if (nextIndex < 0 || nextIndex >= maxCount) {
            return;
        }
        const thisElements = props.getRowFocusableElements
            ? props.getRowFocusableElements(index, rowNode)
            : getFocusableElements(rowNode);
        if (thisElements && thisElements.length) {
            // the current row has focusable elements
            // but if the current active element is not the first or not the last,
            // let the browser handle the focus
            const limit = dir === -1 ? 0 : thisElements.length - 1;
            if (thisElements[limit] !== activeElement) {
                // and do nothing to help the browser
                return;
            }
        }
        if (typeof props.shouldPreventDefaultTabKeyOnRow !== 'function' ||
            props.shouldPreventDefaultTabKeyOnRow(index, event) !== false) {
            event.preventDefault();
        }
        focusRow(nextIndex, dir);
    }, [
        props.handleRowKeyDown,
        props.getRowFocusableElements,
        props.shouldPreventDefaultTabKeyOnRow,
    ]);
    const getRowVisibilityInfo = useCallback((index, offset) => {
        const rendered = isRowRendered(index);
        const { rowHeightManager, minRowHeight } = props;
        const size = sizeRef.current;
        const scrollTop = scrollTopRef.current;
        const top = scrollTop + offset;
        const bottom = scrollTop + size.height - offset;
        let rowTop;
        let rowBottom;
        if (rowHeightManager) {
            rowTop = rowHeightManager.getRowOffset(index);
            rowBottom = rowTop + rowHeightManager.getRowHeight(index);
        }
        else {
            const row = getRowAt(index);
            if (row) {
                const info = row.getInfo();
                rowTop = info.offset;
                rowBottom = rowTop + info.height;
            }
            else {
                const indexes = getRenderedIndexes();
                const firstRenderedIndex = indexes[0];
                const lastRenderedIndex = indexes[indexes.length - 1];
                const rowOffsets = rowOffsetsRef.current;
                const rowHeights = rowHeightsRef.current;
                if (index < firstRenderedIndex && minRowHeight != null) {
                    rowTop =
                        rowOffsets[firstRenderedIndex] -
                            (firstRenderedIndex - index) * minRowHeight;
                }
                else if (index > lastRenderedIndex && minRowHeight != null) {
                    rowTop =
                        rowOffsets[lastRenderedIndex] +
                            rowHeights[lastRenderedIndex] +
                            (index - lastRenderedIndex) * minRowHeight;
                }
                else {
                    rowTop = rowOffsets[index];
                }
                rowBottom = rowTop + rowHeights[index];
            }
        }
        const visible = top <= rowTop && rowBottom <= bottom;
        return {
            rendered,
            visible,
            top: rowTop,
            bottom: rowBottom,
            topDiff: rowTop - top,
            bottomDiff: bottom - rowBottom,
        };
    }, [props.rowHeightManager, props.minRowHeight]);
    const scrollToIndex = useCallback((index, { direction, force, duration = 0, offset = 0, } = emptyObject, callback) => {
        if (direction) {
            if (direction != 'top' && direction != 'bottom') {
                direction = null;
            }
        }
        if (force && !direction) {
            force = false;
        }
        if (index < 0 || index >= getMaxRenderCount()) {
            return;
        }
        if (typeof callback != 'function') {
            callback = emptyFn;
        }
        const info = getRowVisibilityInfo(index, offset);
        if (!info.rendered) {
            const { rowHeight } = props;
            // if no direction specified, scroll to the direction where this row
            // is in relation to the current view
            if (!direction) {
                const rows = rowsRef.current;
                const existingIndex = rows && rows[0].getIndex();
                direction = index > existingIndex ? 'bottom' : 'top';
            }
            const newScrollTop = direction === 'top'
                ? info.top - offset
                : scrollTopRef.current - info.bottomDiff + offset;
            const afterScroll = () => {
                if (!rowHeight) {
                    setTimeout(() => {
                        // the raf inside the setTimeout is needed since sometimes
                        // scrollTopRef.currnet is not correctly updated in scrollToIndex, if scrollToIndex is called
                        // directly in the setTimeout
                        globalObject.requestAnimationFrame(() => {
                            scrollToIndex(index, {
                                direction,
                                force,
                                // if there is a duration, it was applied on the previos scroll action
                                // so the duration has already elapsed - but in order not to transition instantly
                                // lets still use 100ms for the next scroll
                                duration: duration ? 100 : 0,
                            }, callback);
                        });
                    });
                }
                else {
                    if (typeof callback == 'function') {
                        callback();
                    }
                }
            };
            if (duration) {
                smoothScrollTo(newScrollTop, { duration }, afterScroll);
            }
            else {
                scrollTopRef.current = newScrollTop;
                afterScroll();
            }
            return;
        }
        const { visible } = info;
        if (!visible) {
            if (!direction) {
                // determine direction based on the row position in the current view
                direction = info.topDiff < 0 ? 'top' : 'bottom';
                force = true;
            }
        }
        if (!visible || (direction && force)) {
            let newScrollTop;
            // the row is either not fully visible, or we have direction
            if (direction == 'top' || info.topDiff < 0) {
                newScrollTop = scrollTopRef.current + info.topDiff - offset;
            }
            else if (direction == 'bottom' || info.bottomDiff < 0) {
                newScrollTop = scrollTopRef.current - info.bottomDiff + offset;
            }
            if (newScrollTop != null) {
                if (duration) {
                    smoothScrollTo(newScrollTop, { duration }, callback);
                    return;
                }
                scrollTopRef.current = newScrollTop;
            }
        }
        callback();
    }, [getMaxRenderCount, getRowVisibilityInfo, props.rowHeight]);
    const focusRow = useCallback((index, dir, callback) => {
        if (index >= getMaxRenderCount() || index < 0) {
            return;
        }
        scrollToIndex(index, { direction: dir == 1 ? 'bottom' : 'top' }, () => {
            const nextRow = getRowAt(index);
            const nextRowNode = nextRow.getDOMNode
                ? nextRow.getDOMNode()
                : nextRow.node;
            const elements = props.getRowFocusableElements
                ? props.getRowFocusableElements(index, nextRowNode)
                : getFocusableElements(nextRowNode);
            if (elements.length) {
                const focusIndex = dir === -1 ? elements.length - 1 : 0;
                elements[focusIndex].focus();
            }
            if (typeof callback == 'function') {
                callback();
            }
        });
    }, [getMaxRenderCount, scrollToIndex, props.getRowFocusableElements]);
    const isRowRendered = useCallback((index) => {
        return !!getRowAt(index);
    }, []);
    const getStickyRowsArray = useCallback(() => {
        const stickyRows = props.stickyRows;
        const scaleMap = {};
        const rows = Object.keys(stickyRows)
            .map((key, i) => {
            const scale = +(stickyRows[key] || 1);
            const row = {
                index: +key,
                scale,
                indexInAllRows: i,
            };
            scaleMap[scale] = scaleMap[scale] || [];
            scaleMap[scale].push(row);
            return row;
        })
            .sort((a, b) => sortAsc(a.index, b.index));
        const scales = unique(rows.map(r => r.scale)).sort(sortAsc);
        const result = {
            rows,
            scales,
            rowsPerScales: scales.map(scale => scaleMap[scale]),
        };
        return result;
    }, [props.stickyRows]);
    const updateStickyRows = useCallback((scrollTop = scrollTopRef.current, firstVisibleRowIndex, { force } = { force: true }) => {
        if (!props.stickyRows) {
            return;
        }
        const { rowsPerScales, rows: allRows } = getStickyRowsArray();
        if (firstVisibleRowIndex === undefined) {
            firstVisibleRowIndex = getFirstVisibleRowIndexForSticky(scrollTop);
        }
        firstVisibleRowIndex = firstVisibleRowIndex || 0;
        let enteringRows = [];
        const comparator = ({ index }, b) => sortAsc(index, b);
        let initialIndex = -1;
        const currentStickyRows = [];
        const currentStickyRowsMap = [];
        let maxStickyRowIndex = -1;
        let firstFreeVisibleRowIndex = firstVisibleRowIndex;
        rowsPerScales.forEach(rows => {
            if (!rows.length) {
                return;
            }
            const foundIndex = binarySearch(rows, firstFreeVisibleRowIndex, comparator);
            let computedFoundIndex = foundIndex;
            let stickyRow;
            let stickyRowIndex;
            if (foundIndex < 0) {
                computedFoundIndex = ~foundIndex - 1;
            }
            stickyRow = rows[computedFoundIndex];
            if (stickyRow) {
                stickyRowIndex = stickyRow.index;
                if (stickyRowIndex > initialIndex) {
                    firstFreeVisibleRowIndex++;
                    currentStickyRows.push(stickyRow);
                    currentStickyRowsMap[stickyRowIndex] = true;
                    initialIndex = stickyRowIndex;
                    maxStickyRowIndex = Math.max(maxStickyRowIndex, stickyRowIndex);
                }
                const nextRow = allRows[stickyRow.indexInAllRows + 1];
                if (nextRow && nextRow.index <= firstFreeVisibleRowIndex) {
                    enteringRows.push(nextRow);
                }
            }
        });
        enteringRows = enteringRows.filter((row) => !currentStickyRowsMap[row.index] && row.index > maxStickyRowIndex);
        const enteringRow = enteringRows[0];
        if (JSON.stringify(currentStickyRowsRef.current) ===
            JSON.stringify(currentStickyRows) &&
            !force) {
            stickyRowsContainerRef.current.setEnteringRow({
                enteringRow,
                scrollTop,
            });
            return;
        }
        setStickyRows(currentStickyRows, scrollTop, enteringRow);
    }, [props.stickyRows]);
    const getFirstVisibleRowIndexForSticky = useCallback((scrollTop = scrollTopPosRef.current) => {
        const { rowHeightManager } = props;
        const stickyHeight = currentStickyRowsRef.current
            ? currentStickyRowsRef.current.reduce((_, row) => {
                return rowHeightManager.getRowHeight(row.index);
            }, 0)
            : 0;
        const rowIndex = Math.max(0, rowHeightManager.getRowAt(scrollTop + stickyHeight) - 1);
        return rowIndex;
    }, [props.rowHeightManager]);
    const setStickyRows = useCallback((currentStickyRows = currentStickyRowsRef.current, scrollTop = scrollTopRef.current, enteringRow) => {
        currentStickyRowsRef.current = currentStickyRows;
        const rowElements = currentStickyRows.map(row => {
            return renderStickyRow(row.index);
        });
        stickyRowsContainerRef.current.setStickyRows(rowElements.length ? rowElements : null, currentStickyRows, {
            enteringRow,
            scrollTop,
        });
        currentStickyRowsRef.current = currentStickyRows;
        if (props.onStickyRowUpdate) {
            props.onStickyRowUpdate();
        }
    }, [props.onStickyRowUpdate]);
    const renderStickyRow = useCallback((index) => {
        const { rowHeight, renderRow, count, pureRows, rowHeightManager, rowContain, naturalRowHeight, useTransformRowPosition, } = props;
        return renderRows({
            pure: pureRows,
            renderRow,
            rowHeightManager,
            rowHeight,
            rowContain,
            count,
            from: index,
            to: index + 1,
            naturalRowHeight,
            sticky: true,
            useTransformPosition: useTransformRowPosition,
            virtualized: false,
        })[0];
    }, [
        props.rowHeight,
        props.renderRow,
        props.count,
        props.pureRows,
        props.rowHeightManager,
        props.rowContain,
        props.naturalRowHeight,
        props.useTransformRowPosition,
    ]);
    const isRowVisible = useCallback((index) => {
        if (!isRowRendered(index)) {
            return false;
        }
        const { rowHeightManager } = props;
        const size = sizeRef.current;
        const top = scrollTopRef.current;
        const bottom = top + size.height;
        let rowTop;
        let rowBottom;
        if (rowHeightManager) {
            rowTop = rowHeightManager.getRowOffset(index);
            rowBottom = rowTop + rowHeightManager.getRowHeight(index);
        }
        else {
            const row = getRowAt(index);
            const info = row.getInfo();
            rowTop = info.offset;
            rowBottom = rowTop + info.height;
        }
        return top <= rowTop && rowBottom <= bottom;
    }, [props.rowHeightManager]);
    const getRenderedIndexes = useCallback(() => {
        return Object.keys(mappingRef.current).map((k) => k * 1);
    }, []);
    const onRowFocus = useCallback((_index, _event) => { }, []);
    const rafSync = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.rafSync();
        }
        adjustHeights();
    }, []);
    const checkHeights = useCallback(() => {
        const rows = getSortedRows();
        let result = true;
        const rowHeights = rowHeightsRef.current;
        rows.forEach((row) => {
            if (result !== true) {
                return;
            }
            const index = row.getIndex();
            if (row.node.offsetHeight != rowHeights[index]) {
                console.warn(`row height mismatch at ${index}!`);
                result = index;
            }
        });
        if (result === true) {
            rowHeights.reduce((acc, height, index) => {
                const rowOffsets = rowOffsetsRef.current;
                if (rowOffsets[index] !== acc &&
                    result === true &&
                    index < props.count) {
                    console.warn(`row offset mismatch at ${index}!`);
                    result = index;
                }
                return acc + height;
            }, 0);
        }
        return result;
    }, [props.count]);
    const getScrollTopMax = () => {
        return mountedRef.current ? scrollContainerRef.current.scrollTopMax : 0;
    };
    const getScrollLeftMax = () => {
        return mountedRef.current ? scrollContainerRef.current.scrollLeftMax : 0;
    };
    const getScrollingElement = () => {
        return scrollContainerRef.current;
    };
    const getScrollTop = () => {
        return mountedRef.current ? getScrollingElement().scrollTop : 0;
    };
    const setScrollTop = (value) => {
        const element = getScrollingElement();
        if (element) {
            element.scrollTop = value;
        }
    };
    const getScrollLeft = () => {
        return mountedRef.current ? getScrollingElement().scrollLeft : 0;
    };
    const setScrollLeft = (value) => {
        const element = getScrollingElement();
        if (element) {
            element.scrollLeft = value;
        }
    };
    useImperativeHandle(ref, () => ({
        getDOMNode,
        getScrollTopMax,
        getScrollLeftMax,
        getScrollTop,
        setScrollTop,
        getScrollLeft,
        setScrollLeft,
        getVisibleCount,
        getMaxRenderCount,
        getContainerNode,
        renderScroller,
        getTotalRowHeight,
        getScrollHeight,
        renderScrollerSpacerOnNaturalRowHeight,
        renderView,
        getScrollSize,
        getClientSize,
        setHeightForRows,
        renderSizer,
        renderRowContainer,
        renderStickyRowsContainer,
        onViewResize,
        onScrollbarsChange,
        onRowUnmount,
        rowRefFn,
        getScrollerNode,
        onScrollStart,
        onScrollStop,
        forEachRow,
        getRows,
        sortRows,
        setRowIndex,
        getSortedRows,
        onRowsUpdated,
        getVisibleRangeFn,
        applyScrollStyle,
        getGapsFor,
        updateRows,
        smoothScrollTo,
        fixEdgeScrollPosition,
        setupRowHeightManager,
        onIndex,
        adjustHeights,
        refreshLayout,
        getOverlappingHeight,
        updateVisibleCount,
        getCleanupRows,
        cleanupRows,
        onResize,
        setRowRowSpan,
        renderRowsHandle,
        onRowKeyDown,
        getRowVisibilityInfo,
        scrollToIndex,
        focusRow,
        isRowRendered,
        getStickyRowsArray,
        updateStickyRows,
        getFirstVisibleRowIndexForSticky,
        setStickyRows,
        renderStickyRow,
        isRowVisible,
        getRenderedIndexes,
        checkHeights,
        stickyRowsContainerRef,
        scrollContainerRef,
        props,
    }));
    const style = { position: 'relative', ...props.style };
    const className = join(props.className, BASE_CLASS_NAME, props.theme && `${BASE_CLASS_NAME}--theme-${props.theme}`, `${BASE_CLASS_NAME}--virtual-scroll`);
    const scrollHeight = props.rowHeightManager
        ? props.rowHeightManager.getTotalSize(props.count)
        : scrollHeightRef.current ||
            (props.minRowHeight != null && props.minRowHeight * props.count);
    const rowContainer = renderRowContainer();
    const sizer = renderSizer(scrollHeight);
    const stickyRowsContainer = renderStickyRowsContainer();
    let children;
    if (hasSticky()) {
        children = React.Fragment ? (React.createElement(React.Fragment, null,
            rowContainer,
            sizer)) : ([rowContainer, sizer]);
    }
    else {
        children = (React.createElement("div", null,
            rowContainer,
            sizer));
    }
    const Factory = props.nativeScroll
        ? NativeScrollContainer
        : VirtualScrollContainer;
    let renderScrollerSpacer = props.renderScrollerSpacer;
    if (props.naturalRowHeight) {
        renderScrollerSpacer = renderScrollerSpacerOnNaturalRowHeight;
    }
    return (React.createElement(Factory, { contain: props.contain, ResizeObserver: props.ResizeObserver !== undefined
            ? props.ResizeObserver
            : ResizeObserver, extraChildren: stickyRowsContainer, useTransformToScroll: props.useTransformPosition, ...cleanupProps(props, InovuaVirtualList.propTypes), ...props.scrollProps, rtl: props.rtl, nativeScroll: props.nativeScroll, ref: scrollContainerRef, onScrollbarsChange: onScrollbarsChange, style: style, theme: props.theme, className: className, onScrollStart: onScrollStart, onScrollStop: onScrollStop, applyScrollStyle: applyScrollStyle, onResize: onResize, onViewResize: onViewResize, renderScroller: renderScroller, renderScrollerSpacer: renderScrollerSpacer, renderView: renderView, getClientSize: getClientSize, getScrollSize: getScrollSize, children: children }));
});
InovuaVirtualList.defaultProps = {
    minRowHeight: 20,
    nativeScroll: false,
    shouldAllowScrollbars: () => true,
    rafOnResize: false,
    theme: 'default-light',
    showEmptyRows: false,
    showWarnings: !uglified,
    virtualized: true,
    scrollOneDirectionOnly: false,
    useTransformPosition: !IS_EDGE && hasSticky(),
    useTransformRowPosition: false,
    recycleCoveredRows: true,
    scrollProps: {},
};
const propTypes = {
    applyScrollLeft: PropTypes.func,
    naturalRowHeight: PropTypes.bool,
    count: (props) => {
        const { count } = props;
        if (count == null) {
            throw new Error(`"count" is required!`);
        }
        if (typeof count != 'number') {
            throw new Error(`"count" should be a number!`);
        }
        if (count < 0) {
            throw new Error(`"count" should be >= 0!`);
        }
    },
    getRowFocusableElements: PropTypes.func,
    contain: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    rowContain: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    handleRowKeyDown: PropTypes.func,
    rafOnResize: PropTypes.bool,
    checkResizeDelay: PropTypes.number,
    extraRows: PropTypes.number,
    measureSize: PropTypes.func,
    minRowHeight: PropTypes.number,
    minRowWidth: PropTypes.number,
    nativeScroll: PropTypes.bool,
    onRenderRangeChange: PropTypes.func,
    shouldFocusNextRow: PropTypes.func,
    onResize: PropTypes.func,
    onScrollStart: PropTypes.func,
    onScrollbarsChange: PropTypes.func,
    onScrollStop: PropTypes.func,
    pureRows: PropTypes.bool,
    rowHeight: PropTypes.number,
    renderRow: PropTypes.func.isRequired,
    renderRowContainer: PropTypes.func,
    renderSizer: PropTypes.func,
    showEmptyRows: PropTypes.bool,
    useTransformPosition: PropTypes.bool,
    useTransformRowPosition: PropTypes.bool,
    scrollProps: PropTypes.object,
    showWarnings: PropTypes.bool,
    renderView: PropTypes.func,
    renderScroller: PropTypes.func,
    renderScrollerSpacer: PropTypes.func,
    shouldComponentUpdate: PropTypes.func,
    shouldPreventDefaultTabKeyOnRow: PropTypes.func,
    theme: PropTypes.string,
    overscrollBehavior: PropTypes.string,
    virtualized: PropTypes.bool,
    scrollOneDirectionOnly: PropTypes.bool,
    onStickyRowUpdate: PropTypes.func,
    stickyRows: PropTypes.object,
    recycleCoveredRows: PropTypes.bool,
    stickyOffset: PropTypes.number,
    enableRowSpan: PropTypes.bool,
    rowHeightManager: (props, propName) => {
        const value = props[propName];
        if (!value) {
            return new Error(`
  You have to provide a "rowHeightManager" property, which should be an instance of RowHeightManager.
  `);
        }
        if (!(value instanceof RowHeightManager)) {
            return new Error('The "rowHeightManager" property should be an instance of RowHeightManager!');
        }
    },
};
InovuaVirtualList.propTypes = propTypes;
export { RowHeightManager, propTypes, shouldComponentUpdate, getScrollbarWidth, };
export default React.memo(InovuaVirtualList);
