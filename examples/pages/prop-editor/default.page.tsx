import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';
import BoolEditor from '@inovua/reactdatagrid-community/BoolEditor';
import SelectEditor from '@inovua/reactdatagrid-community/SelectEditor';

const gridStyle = { minHeight: 650 };

const dataSource = [
  { id: 1, name: 'John McQueen', age: 35 },
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

const selectEditorData = [
  { id: 'child', label: 'Child' },
  { id: 'teen', label: 'Teen' },
  { id: 'young', label: 'Young' },
  { id: 'old', label: 'Old' },
];

const columns = [
  { name: 'name', header: 'Name', minWidth: 50, defaultFlex: 1 },
  {
    name: 'age',
    header: 'Age',
    maxWidth: 1000,
    defaultFlex: 1,
    renderEditor: (props: any) => {
      console.log('props', props);
      const { value, cellProps } = props;

      if (value < 45) {
        return <SelectEditor {...props} />;
      } else if (value >= 45) {
        const { theme, autoFocus, key } = props;
        return (
          <BoolEditor
            key={key}
            theme={theme}
            autoFocus={autoFocus}
            style={{ background: 'transparent' }}
          />
        );
      }
    },
    editorProps: {
      dataSource: selectEditorData,
      theme: 'default-dark',
    },
  },
];

const App = () => {
  return (
    <div>
      <p>Choose the right age, or if the person is retired or not.</p>
      <ReactDataGrid
        idProperty="id"
        columns={columns}
        dataSource={dataSource}
        style={gridStyle}
        editable
      />
    </div>
  );
};

export default App;
