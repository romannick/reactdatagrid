import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import RadioButtonGroup from '@inovua/reactdatagrid-community/packages/RadioButtonGroup';

import people from '../people';

const gridStyle = { minHeight: 550 };

const rowHeights = [
  { label: 'small', value: 25 },
  { label: 'normal', value: 40 },
  { label: 'large', value: 80 },
];

const columns = [
  { name: 'id', header: 'Id', defaultVisible: false, type: 'number' },
  { name: 'name', defaultFlex: 1, minWidth: 80, header: 'Name' },
  { name: 'country', defaultFlex: 1, minWidth: 80, header: 'Country' },
  { name: 'city', defaultFlex: 1, minWidth: 80, header: 'City' },
  { name: 'age', minWidth: 80, type: 'number', header: 'Age' },
];

const App = () => {
  const [rowHeight, setRowHeight] = useState(40);

  return (
    <div>
      <p>Max row height is 50px</p>
      <div style={{ display: 'inline-flex', marginBottom: 20 }}>
        <div style={{ marginRight: 16 }}>Select row height</div>
        <RadioButtonGroup
          radioOptions={rowHeights}
          radioValue={rowHeight}
          onChange={({ checkedItemValue }) => setRowHeight(checkedItemValue)}
          orientation="horizontal"
        />
      </div>
      <ReactDataGrid
        key={rowHeight}
        idProperty="id"
        style={gridStyle}
        rowHeight={rowHeight}
        columns={columns}
        dataSource={people}
        maxRowHeight={50}
      />
    </div>
  );
};

export default () => <App />;
