/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import useProperty from './useProperty';
import { useCallback, useEffect, useRef } from 'react';
import clamp from '../utils/clamp';
import usePrevious from './usePrevious';
import throttle from '@inovua/reactdatagrid-community/packages/throttle';
import { getGlobal } from '../getGlobal';
const globalObject = getGlobal();
const useActiveIndex = (props, computedProps, computedPropsRef) => {
    let [computedActiveIndex, doSetActiveIndex] = useProperty(props, 'activeIndex', -1);
    const [computedLastActiveIndex, doSetLastActiveIndex] = useProperty(props, 'lastActiveIndex', null);
    if (!props.enableKeyboardNavigation) {
        computedActiveIndex = -1;
    }
    const setActiveIndex = useCallback((activeIndex) => {
        const computedProps = computedPropsRef.current;
        if (!computedProps ||
            !computedProps.computedHasRowNavigation ||
            globalObject.isNaN(activeIndex)) {
            return;
        }
        const { data } = computedProps;
        if (activeIndex >= 0) {
            activeIndex = clamp(activeIndex, 0, data.length - 1);
        }
        else {
            activeIndex = -1;
        }
        if (activeIndex === computedProps.computedActiveIndex) {
            return;
        }
        doSetActiveIndex(activeIndex);
    }, []);
    const incrementActiveIndex = useCallback((inc) => {
        const computedProps = computedPropsRef.current;
        if (!computedProps) {
            return;
        }
        const computedActiveIndex = computedProps.computedActiveIndex;
        if (computedProps.activeIndexThrottle) {
            throttle(() => setActiveIndex(computedActiveIndex + inc), computedProps.activeIndexThrottle, {
                trailing: true,
                leading: false,
            });
        }
        else {
            setActiveIndex(computedActiveIndex + inc);
        }
    }, []);
    const getActiveItem = useCallback(() => {
        const computedProps = computedPropsRef.current;
        return computedProps
            ? computedProps.data[computedProps.computedActiveIndex]
            : null;
    }, []);
    const getFirstVisibleIndex = useCallback(() => {
        const computedProps = computedPropsRef.current;
        if (!computedProps) {
            return -1;
        }
        const scrollTop = computedProps.getScrollTop();
        const rowHeight = props.rowHeight;
        return Math.ceil(scrollTop / rowHeight);
    }, [props.rowHeight]);
    const oldActiveIndex = usePrevious(computedActiveIndex, -1);
    useEffect(() => {
        const { current: computedProps } = computedPropsRef;
        if (!computedProps) {
            return;
        }
        if (!computedProps.computedFocused) {
            return;
        }
        if (oldActiveIndex !== computedActiveIndex) {
            const top = computedActiveIndex < oldActiveIndex;
            computedProps.scrollToIndexIfNeeded(computedActiveIndex, { top });
        }
    }, [computedActiveIndex, oldActiveIndex]);
    computedProps.activeRowRef = useRef(null);
    return {
        computedActiveIndex,
        setActiveIndex,
        incrementActiveIndex,
        getActiveItem,
        getFirstVisibleIndex,
        computedLastActiveIndex,
        doSetLastActiveIndex,
    };
};
export default useActiveIndex;
