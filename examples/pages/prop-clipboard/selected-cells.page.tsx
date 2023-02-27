import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';

const gridStyle = { minHeight: 550 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    minWidth: 300,
    type: 'number',
  },
  {
    name: 'name',
    header: 'Name',
    defaultFlex: 1,
    minWidth: 250,
  },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    minWidth: 100,
    defaultVisible: false,
  },
  { name: 'city', header: 'City', defaultFlex: 1, minWidth: 300 },
  { name: 'age', header: 'Age', minWidth: 150, type: 'number' },
  { name: 'email', header: 'Email', defaultFlex: 1, minWidth: 150 },
  {
    name: 'student',
    header: 'Student',
    defaultFlex: 1,
    render: ({ value }) => (value === true ? 'Yes' : 'No'),
  },
];

const App = () => {
  const [cellSelection, setCellSelection] = useState({
    '2,name': true,
    '2,city': true,
    '3,name': true,
    '3,city': true,
  });

  const onCopySelectedCellsChange = useCallback(cells => {
    console.log(cells);
  }, []);

  const onPasteSelectedCellsChange = useCallback(cells => {
    console.log(cells);
  }, []);

  return (
    <div>
      <h3>Grid with copy/paste the selected cells</h3>

      <ReactDataGrid
        idProperty="id"
        theme="default-dark"
        cellSelection={cellSelection}
        onCellSelectionChange={setCellSelection}
        enableClipboard
        onCopySelectedCellsChange={onCopySelectedCellsChange}
        onPasteSelectedCellsChange={onPasteSelectedCellsChange}
        style={gridStyle}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
