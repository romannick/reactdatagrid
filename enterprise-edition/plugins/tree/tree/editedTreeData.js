/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */
const editedTreeData = (editProps, computedPropsRef) => {
    const { current: computedProps } = computedPropsRef;
    if (!computedProps) {
        return null;
    }
    const originalData = computedProps.originalData;
    const nodesName = computedProps.nodesProperty;
    const rowIndex = editProps.rowIndex;
    const columnId = editProps.columnId;
    const value = editProps.value;
    const clonedData = [].concat(originalData);
    const computeData = (dataArray, result = [], rowIdx = 0, startIndex = 0) => {
        for (let i = 0; i < dataArray.length; i++) {
            const item = dataArray[i];
            if (item) {
                const itemNodes = item[nodesName];
                result.push(item);
                rowIdx = startIndex + i;
                if (rowIdx === rowIndex) {
                    item[columnId] = value;
                }
                if (Array.isArray(itemNodes)) {
                    let startFrom = result.length;
                    computeData(itemNodes, result, rowIdx, startFrom);
                    startIndex += result.length - startFrom;
                }
            }
        }
    };
    computeData(clonedData);
    return clonedData;
};
export default editedTreeData;
