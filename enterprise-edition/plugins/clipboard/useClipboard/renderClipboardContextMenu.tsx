/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const onCopyClickHandle = (computedProps: any) => {
  if (!computedProps) {
    return;
  }

  const cellSelection = !!computedProps.computedCellSelection;
  const checkboxColumn = !!computedProps.checkboxColumn;
  const selected = !!computedProps.computedSelected;

  if (checkboxColumn || selected) {
    computedProps.copySelectedRowsToClipboard();
  } else if (cellSelection) {
    computedProps.copySelectedCellsToClipboard();
  } else {
    computedProps.copyActiveRowToClipboard();
  }
};

const onPasteClickHandle = (computedProps: any) => {
  if (!computedProps) {
    return;
  }

  const cellSelection = !!computedProps.computedCellSelection;
  const checkboxColumn = !!computedProps.checkboxColumn;
  const selected = !!computedProps.computedSelected;

  if (checkboxColumn || selected) {
    computedProps.pasteSelectedRowsFromClipboard();
  } else if (cellSelection) {
    computedProps.pasteSelectedCellsFromClipboard();
  } else {
    computedProps.pasteActiveRowFromClipboard();
  }
};

const pasteDisableHandle = (computedProps: any) => {
  let result = true;
  if (computedProps.clipboard && computedProps.clipboard.current) {
    result = false;
  }

  return result;
};

const renderClipboardContextMenu = (
  menuProps: any,
  { computedProps }: { computedProps: any }
) => {
  if (!computedProps) {
    return;
  }

  if (!computedProps.enableClipboard) {
    return null;
  }

  menuProps.autoDismiss = true;
  menuProps.items = [
    {
      label: 'Copy',
      secondaryLabel: 'Ctrl/Cmd + C',
      onClick: () => onCopyClickHandle(computedProps),
    },
    {
      label: 'Paste',
      secondaryLabel: 'Ctrl/Cmd + V',
      onClick: () => onPasteClickHandle(computedProps),
      disabled: pasteDisableHandle(computedProps),
    },
  ];
};

export default renderClipboardContextMenu;
