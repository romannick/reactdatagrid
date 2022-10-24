/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import contains from '../../packages/contains';
const handleRowNavigation = (event, computedProps) => {
    const { key } = event;
    const activeItem = computedProps.computedActiveItem;
    const isGroup = computedProps.isGroup(activeItem);
    const options = {
        ArrowUp: () => computedProps.incrementActiveIndex(-1),
        ArrowDown: () => computedProps.incrementActiveIndex(1),
        Home: () => computedProps.setActiveIndex(0),
        Enter: (event) => {
            if (!activeItem) {
                return;
            }
            if (isGroup) {
                computedProps.toggleGroup(activeItem);
                return;
            }
            computedProps.toggleActiveRowSelection(event);
        },
        End: () => computedProps.setActiveIndex(computedProps.data.length - 1),
        PageUp: () => computedProps.incrementActiveIndex(-computedProps.keyPageStep),
        PageDown: () => computedProps.incrementActiveIndex(computedProps.keyPageStep),
    };
    const fn = options[key];
    if (fn) {
        fn(event);
        return true;
    }
    if (computedProps.allowRowTabNavigation) {
        if (key === 'Tab') {
            const dir = event.shiftKey ? -1 : 1;
            // if activeElement is inside the currently active row, we want to skip our tab navigation and let the VirtualList handle its thing
            const rowNode = computedProps.getDOMNodeForRowIndex(computedProps.computedActiveIndex);
            if (document.activeElement &&
                rowNode &&
                contains(rowNode, document.activeElement)) {
                return false;
            }
            const nextIndex = computedProps.computedActiveIndex + dir;
            const validNextIndex = nextIndex >= 0 && nextIndex < computedProps.count;
            if (validNextIndex) {
                computedProps.incrementActiveIndex(dir);
                return true; // prevent normal tab navigation as we're doing row navigation
            }
        }
    }
    return false;
};
export default handleRowNavigation;
