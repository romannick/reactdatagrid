import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import flags, { FlagsType } from '../flags';

const gridStyle = { maxHeight: 207 };

const columns = [
  { name: 'firstName', defaultFlex: 1, header: 'First Name' },
  { name: 'lastName', defaultFlex: 1, header: 'Last Name' },
  {
    name: 'country',
    header: 'Country',
    defaultWidth: 100,
    textAlign: 'center',
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType]
        ? flags[value as keyof FlagsType]
        : 'unknown',
  },
  {
    id: 'fullName',
    header: 'Full Name',
    minWidth: 100,
    defaultFlex: 1,
    render: ({ data }: { data: any }) => data.firstName + ' ' + data.lastName,
  },
  {
    name: 'age',
    header: 'Age',
    defaultWidth: 80,
    render: ({ value }: { value: number }) => (
      <span style={{ color: value < 30 ? '#7986cb' : 'inherit' }}>{value}</span>
    ),
    setValue({ value }: { value: number }) {
      if (value < 30) {
        return 0;
      }
      return value;
    },
  },
];

const dataSource = [
  { firstName: 'John', lastName: 'Grayner', country: 'usa', age: 35, id: 0 },
  { firstName: 'Mary', lastName: 'Stones', country: 'ca', age: 25, id: 1 },
  { firstName: 'Robert', lastName: 'Fil', country: 'uk', age: 27, id: 2 },
  { firstName: 'Mark', lastName: 'Twain', country: 'usa', age: 74, id: 3 },
  { firstName: 'Karl', lastName: 'May', country: 'ca', age: 46, id: 4 },
  { firstName: 'Jules', lastName: 'Verne', country: 'uk', age: 52, id: 5 },
];

export default () => (
  <ReactDataGrid
    idProperty="id"
    columns={columns}
    dataSource={dataSource}
    style={gridStyle}
  />
);
