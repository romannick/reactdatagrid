import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import TextInput from '@inovua/reactdatagrid-community/packages/TextInput';

const gridStyle = { maxHeight: 207 };

const columns = [
  { name: 'firstName', header: 'First Name', defaultFlex: 1 },
  {
    id: 'fullName',
    header: 'Full Name',
    minWidth: 100,
    defaultFlex: 1,
    render: ({ data }: { data: any }) => {
      const inputProps: any = {
        value: data.firstName + ' ' + data.lastName,
        onChange: () => {},
        // theme: 'default-dark',
        style: { minWidth: 150 },
      };
      return <input {...inputProps} />;
    },
  },
];

const dataSource = [
  { firstName: 'John', lastName: 'Grayner', country: 'usa', age: 35, id: 0 },
  { firstName: 'Mary', lastName: 'Stones', country: 'ca', age: 25, id: 1 },
  { firstName: 'Robert', lastName: 'Fil', country: 'uk', age: 27, id: 2 },
  { firstName: 'Mark', lastName: 'Twain', country: 'usa', age: 74, id: 3 },
  { firstName: 'Eric', lastName: 'White', country: 'usa', age: 74, id: 4 },
  { firstName: 'Elaine', lastName: 'Black', country: 'usa', age: 74, id: 5 },
  { firstName: 'Martha', lastName: 'Brown', country: 'usa', age: 74, id: 6 },
  { firstName: 'Blake', lastName: 'Red', country: 'usa', age: 74, id: 7 },
];

export default () => (
  <ReactDataGrid
    idProperty="id"
    columns={columns}
    dataSource={dataSource}
    style={gridStyle}
  />
);
