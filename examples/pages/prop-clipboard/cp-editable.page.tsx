import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    minWidth: 300,
    type: 'number',
  },
  { name: 'name', header: 'Name', defaultFlex: 1, minWidth: 250 },

  {
    name: 'city',
    header: 'City',
    defaultFlex: 1,
    minWidth: 300,
    editable: false,
  },
  {
    name: 'age',
    header: 'Age',
    minWidth: 150,
    type: 'number',
    editable: true,
  },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    minWidth: 100,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
];

const App = () => {
  const [dataSource, setDataSource] = useState(people);
  const [cellSelection, setCellSelection] = useState({});

  const onEditComplete = useCallback(
    ({ value, columnId, rowId }) => {
      const data = [...dataSource];
      (data as any)[rowId][columnId] = value;

      setDataSource(data);
    },
    [dataSource]
  );

  const onCopySelectedCellsChange = useCallback(cells => {
    console.log(cells);
  }, []);

  const onPasteSelectedCellsChange = useCallback(cells => {
    console.log(cells);
  }, []);

  return (
    <div>
      <h3>Grid with inline edit</h3>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        onEditComplete={onEditComplete}
        editable={true}
        columns={columns}
        dataSource={dataSource}
        cellSelection={cellSelection}
        onCellSelectionChange={setCellSelection}
        enableClipboard
        onCopySelectedCellsChange={onCopySelectedCellsChange}
        onPasteSelectedCellsChange={onPasteSelectedCellsChange}
        enableClipboardForEditableCellsOnly
        copySpreadsheetCompatibleString
      />
    </div>
  );
};

export default () => <App />;
