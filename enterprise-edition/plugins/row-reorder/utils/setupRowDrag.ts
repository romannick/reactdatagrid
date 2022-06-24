/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MouseEvent } from 'react';
import DragHelper from '@inovua/reactdatagrid-community/packages/drag-helper';

import { TypeDragHelper, TypeConfig } from '../../../types';

type Event = (MouseEvent & TouchEvent) | any;

const emptyFn = () => {};

const setupRowDrag = (event: Event, region: any, cfg: TypeDragHelper): void => {
  const onDrag = cfg.onDrag || emptyFn;
  const onDrop = cfg.onDrop || emptyFn;

  const mobile = !!(event.type === 'touchstart');

  DragHelper(event, {
    region,
    onDrag(event: MouseEvent, config: TypeConfig) {
      if (event.cancelable) {
        event.preventDefault();
      }
      onDrag(event, config);
    },
    onDrop(event: MouseEvent, config: TypeConfig) {
      onDrop(event, config);
    },
    mobile,
  });
};

export default setupRowDrag;
