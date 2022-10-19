import React, { useState, useCallback, useRef, RefObject } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import { TypeComputedProps } from '@inovua/reactdatagrid-community/types';

const columns = [
  { name: 'name', header: 'Name', minWidth: 50, defaultFlex: 2 },
  { name: 'age', header: 'Age', maxWidth: 1000, defaultFlex: 1 },
  {
    name: 'is_active',
    header: 'Active?',
    maxWidth: 1000,
    defaultFlex: 1,
    type: 'boolean',
  },
];

const filterValue = [
  { name: 'name', operator: 'contains', type: 'string', value: 'r' },
];

const gridStyle = { minHeight: 400 };

const dataSource = [
  {
    id: 1,
    name: 'John McQueen some long text goes here and here and there also',
    age: 35,
    is_active: 1,
  },
  { id: 2, name: 'Mary Stones', age: 25 },
  { id: 3, name: 'Robert Fil', age: 27 },
  { id: 4, name: 'Roger Robson', age: 81 },
  { id: 5, name: 'Billary Konwik', age: 18 },
  { id: 6, name: 'Bob Martin', age: 18 },
  { id: 7, name: 'Matthew Richardson', age: 54 },
  { id: 8, name: 'Ritchie Peterson', age: 54 },
  { id: 9, name: 'Bryan Martin', age: 40 },
  { id: 10, name: 'Mark Martin', age: 44 },
  { id: 11, name: 'Michelle Sebastian', age: 24 },
  { id: 12, name: 'Michelle Sullivan', age: 61 },
  { id: 13, name: 'Jordan Bike', age: 16 },
  { id: 14, name: 'Nelson Ford', age: 34 },
  { id: 15, name: 'Tim Cheap', age: 3 },
  { id: 16, name: 'Robert Carlson', age: 31 },
  { id: 17, name: 'Johny Perterson', age: 40 },
];

const App = () => {
  const [selected, setSelected] = useState<number[] | null>(null);

  const onSelectionChange = React.useCallback(
    ({ selected: selectedMap, originalData }) => {
      console.log('selection: ', selectedMap, originalData);
      if (selectedMap === true) {
        const newSelected = Object.keys(originalData).map((id: string) =>
          Number(id)
        );
        setSelected(newSelected);
      } else {
        const newSelected = Object.keys(selectedMap).map(id => Number(id));
        setSelected(newSelected);
      }
    },
    []
  );

  return (
    <div>
      <h3>Multiple row selection - uncontrolled</h3>
      <ReactDataGrid
        idProperty="id"
        enableSelection
        multiSelect
        onSelectionChange={onSelectionChange}
        checkboxColumn
        style={gridStyle}
        columns={columns}
        dataSource={dataSource}
        pagination
        defaultLimit={5}
        defaultFilterValue={filterValue}
      />
      <p>
        Selected rows: {selected == null ? 'none' : JSON.stringify(selected)}.
      </p>
    </div>
  );
};

export default () => <App />;
