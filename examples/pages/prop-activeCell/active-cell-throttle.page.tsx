import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';

const gridStyle = { minHeight: 300 };
const defaultActiveCell = [4, 1];

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
  },
  { name: 'name', defaultFlex: 1, header: 'Name' },
  { name: 'city', minWidth: 120, header: 'City' },
  { name: 'age', minWidth: 80, type: 'number', hedaer: 'Age' },
];

const App = () => {
  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        activeCellThrottle={1000}
        defaultActiveCell={defaultActiveCell}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
