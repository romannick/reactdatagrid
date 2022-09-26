import React from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const gridStyle = { minHeight: 550 };

const columns = [
  { name: 'id', header: 'Id', defaultWidth: 80 },
  {
    name: 'name',
    sortable: false,
    header: 'Name (column not sortable)',
    defaultFlex: 1,
  },
  { name: 'age', header: 'Age', type: 'number', defaultFlex: 1 },
];

let dataSource = [];

for (let i = 0; i < 50000; ++i) {
  dataSource.push({ name: 'Little Johny', age: i, id: i });
}

const App = () => {
  return (
    <ReactDataGrid
      idProperty="id"
      style={gridStyle}
      columns={columns}
      defaultActiveIndex={3}
      dataSource={dataSource}
    />
  );
};

export default () => <App />;
