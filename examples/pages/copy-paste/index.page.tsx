import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';
import Checkbox from '../../../community-edition/packages/CheckBox';

const columns = [
  { name: 'name', header: 'Name', minWidth: 50, defaultFlex: 2 },
  { name: 'age', header: 'Age', maxWidth: 1000, defaultFlex: 1 },
];

const gridStyle = { minHeight: 550 };

const dataSource = [
  { id: 1, name: 'John McQueen', age: 35 },
  { id: 2, name: 'Mary Stones', age: 25 },
  { id: 3, name: 'Robert Fil', age: 27 },
  { id: 4, name: 'Roger Robson', age: 81 },
  { id: 5, name: 'Billary Konwik', age: 18 },
];

const renderClipboardContextMenu = (
  menuProps: any,
  { computedProps }: { computedProps: any }
) => {
  if (!computedProps) {
    return;
  }

  menuProps.autoDismiss = true;
  menuProps.items = [
    {
      label: 'Copy to clipboard',
      onClick: () => computedProps.copySelectedRowsToClipboard(),
    },
    {
      label: 'Paste from clipboard',
      onClick: () => computedProps.pasteSelectedRowsFromClipboard(),
    },
  ];
};

const App = () => {
  const [
    copySpreadsheetCompatibleString,
    setCopySpreadsheetCompatibleString,
  ] = useState<boolean>(true);
  const [checkboxColumn, setCheckboxColumn] = useState<boolean>(false);
  const [checkboxOnlyRowSelect, setCheckboxOnlyRowSelect] = useState<boolean>(
    false
  );
  const [enableCellSelection, setEnableCellSelection] = useState<boolean>(
    false
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Checkbox
          checked={copySpreadsheetCompatibleString}
          onChange={setCopySpreadsheetCompatibleString}
        >
          copySpreadsheetCompatibleString
        </Checkbox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Checkbox checked={checkboxColumn} onChange={setCheckboxColumn}>
          checkboxColumn
        </Checkbox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Checkbox
          checked={checkboxOnlyRowSelect}
          onChange={setCheckboxOnlyRowSelect}
        >
          checkboxOnlyRowSelect
        </Checkbox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Checkbox
          checked={enableCellSelection}
          onChange={setEnableCellSelection}
        >
          enableCellSelection
        </Checkbox>
      </div>

      <ReactDataGrid
        onCopySelectedCellsChange={(cells: any) => {
          console.log('cells', cells);
        }}
        onCopyActiveRowChange={(rows: any) => {
          console.log('rows', rows);
        }}
        key={`checkbox_${checkboxColumn}__${enableCellSelection}`}
        defaultCellSelection={enableCellSelection ? {} : undefined}
        enableClipboard
        enableSelection
        multiSelect
        idProperty="id"
        columns={columns}
        dataSource={dataSource}
        style={gridStyle}
        clipboardSeparator="\n"
        checkboxColumn={checkboxColumn}
        checkboxOnlyRowSelect={checkboxOnlyRowSelect}
        copySpreadsheetCompatibleString={copySpreadsheetCompatibleString}
        renderClipboardContextMenu={renderClipboardContextMenu}
        onCopySelectedRowsChange={(rows: any) => console.log('copy', rows)}
        onPasteSelectedRowsChange={(rows: any) => console.log('paste', rows)}
      />
    </div>
  );
};

export default () => <App />;
