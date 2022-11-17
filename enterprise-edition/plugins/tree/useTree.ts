/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */

import computeTreeData from './computeTreeData';
import editedTreeData from './tree/editedTreeData';
import {
  TypeComputedProps,
  TypeDataGridProps,
  TypeEditInfo,
} from '../../types';
import { MutableRefObject } from 'react';
import useTreeColumn from './useTreeColumn';

export default (
  props: TypeDataGridProps,
  computedProps: TypeComputedProps,
  computedPropsRef: MutableRefObject<TypeComputedProps | null>
) => {
  Object.assign(
    computedProps,
    useTreeColumn(props, computedProps, computedPropsRef)
  );

  const computedEditedTreeData = (editProps: TypeEditInfo) => {
    return editedTreeData(editProps, computedPropsRef);
  };

  computedProps.computeTreeData = computeTreeData;
  computedProps.editedTreeData = computedEditedTreeData;
};
