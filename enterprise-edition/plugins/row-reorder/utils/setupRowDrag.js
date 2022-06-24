/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */
import DragHelper from '@inovua/reactdatagrid-community/packages/drag-helper';
const emptyFn = () => { };
const setupRowDrag = (event, region, cfg) => {
    const onDrag = cfg.onDrag || emptyFn;
    const onDrop = cfg.onDrop || emptyFn;
    const mobile = !!(event.type === 'touchstart');
    DragHelper(event, {
        region,
        onDrag(event, config) {
            if (event.cancelable) {
                event.preventDefault();
            }
            onDrag(event, config);
        },
        onDrop(event, config) {
            onDrop(event, config);
        },
        mobile,
    });
};
export default setupRowDrag;
