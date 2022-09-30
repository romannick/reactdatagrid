import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 300 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
  },
  { name: 'name', defaultFlex: 1, header: 'Name' },
  {
    name: 'country',
    defaultFlex: 1,
    header: 'Country',
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', defaultFlex: 1, header: 'City' },
  { name: 'age', defaultFlex: 1, type: 'number', header: 'Age' },
];

const App = () => {
  return (
    <div>
      <p>Column menu constrained to document.documentElement</p>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columnContextMenuConstrainTo={false}
        columnContextMenuPosition={'fixed'}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
