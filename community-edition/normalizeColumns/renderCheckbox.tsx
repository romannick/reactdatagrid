/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Checkbox from '../packages/CheckBox';
import { CellProps } from '../types';

type TypeCheckboxProps = {
  disabled?: boolean;
  tabIndex?: number | null;
  onClick?: (event: MouseEvent) => void;
  supportIndeterminate?: boolean;
  theme?: string;
  className?: string;
  checked?: any;
  onChange?: ((...args: any[]) => any) | null;
  isIndeterminate?: boolean;
};

const stopPropagation = (e: MouseEvent) => {
  e.stopPropagation();
};

const emptyObject = {};

export default (cellProps: CellProps, { headerProps }: any = emptyObject) => {
  const {
    selectAll,
    deselectAll,
    selectedCount,
    unselectedCount,
    totalCount,
    headerCell,
    empty,
    rowIndex,
    rowSelected,
    setRowSelected,
    renderCheckbox,
    hideIntermediateState,
  } = cellProps;

  if (empty && !renderCheckbox) {
    return null;
  }
  const checkboxProps: TypeCheckboxProps = {
    disabled: empty,
    tabIndex: cellProps.checkboxTabIndex,
    onClick: stopPropagation,
    supportIndeterminate: false,
    theme: cellProps.theme,
    className: 'InovuaReactDataGrid__checkbox',
  };

  if (headerCell) {
    const { selected, unselected } = headerProps;
    checkboxProps.supportIndeterminate = !hideIntermediateState;

    let checked;
    if (selected === true) {
      checked =
        unselected &&
        typeof unselected == 'object' &&
        Object.keys(unselected).length != 0
          ? checkboxProps.supportIndeterminate
            ? null
            : false
          : true;
    } else {
      checked =
        selectedCount == 0 || !totalCount
          ? false
          : totalCount <= selectedCount! && unselectedCount === 0
          ? true
          : checkboxProps.supportIndeterminate
          ? null
          : false;
    }

    checkboxProps.checked = checked;
    checkboxProps.onChange = checked === false ? selectAll : deselectAll;
  } else {
    checkboxProps.onChange = setRowSelected
      ? setRowSelected.bind(null, rowIndex)
      : null;
    checkboxProps.checked = rowSelected;
  }
  if (renderCheckbox) {
    if (checkboxProps.checked === null && checkboxProps.supportIndeterminate) {
      checkboxProps.isIndeterminate = true;
    }
    const result = renderCheckbox(checkboxProps, cellProps);
    if (result !== undefined) {
      return result;
    }
  }

  delete checkboxProps.isIndeterminate;

  return <Checkbox {...checkboxProps} />;
};
