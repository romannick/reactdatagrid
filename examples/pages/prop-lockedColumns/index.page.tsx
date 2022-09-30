import React from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags from '../flags';

const gridStyle = { minHeight: 550, maxWidth: 1000 };

const columns = [
  {
    defaultLocked: true,
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultWidth: 100,
    type: 'number',
  },
  { name: 'name', header: 'Name', defaultFlex: 1, minWidth: 450 },
  {
    defaultLocked: 'start',
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    minWidth: 200,
    render: ({ value }: { value: string }) =>
      (flags as any)[value] ? (flags as any)[value] : value,
  },
  { name: 'city', header: 'City', defaultFlex: 1, minWidth: 450 },
  {
    defaultLocked: 'end',
    name: 'age',
    header: 'Age',
    minWidth: 100,
    type: 'number',
  },
];

const App = () => {
  return (
    <div>
      <h3>Scroll horizontally to see the effect</h3>
      <ReactDataGrid
        idProperty="id"
        reorderColumns={false}
        style={gridStyle}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
