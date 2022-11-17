/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MutableRefObject } from 'react';
import { TypeComputedProps, TypeEditInfo } from 'enterprise-edition/types';

const editedTreeData = (
  editProps: TypeEditInfo,
  computedPropsRef: MutableRefObject<TypeComputedProps | null>
): any[] | null => {
  const { current: computedProps } = computedPropsRef;
  if (!computedProps) {
    return null;
  }

  const originalData: any = computedProps.originalData;
  const nodesName = computedProps.nodesProperty;
  const rowIndex = editProps.rowIndex;
  const columnId = editProps.columnId;
  const value = editProps.value;

  const clonedData = [].concat(originalData);

  const computeData = (
    dataArray: any[],
    result: any[] = [],
    rowIdx: number = 0,
    startIndex: number = 0
  ) => {
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
