import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const filterTypes = Object.assign({}, ReactDataGrid.defaultProps.filterTypes, {
  country: {
    name: 'country',
    emptyValue: '',
    operators: [
      {
        name: 'europe',
        fn: ({
          value,
          filterValue,
          data,
        }: {
          value: string;
          filterValue: string;
          data: any[];
        }) => {
          const isInEurope = value != 'usa' && value != 'ca';

          return filterValue === 'true' ? isInEurope : !isInEurope;
        },
      },
    ],
  },
});

const filterValue = [
  { name: 'country', operator: 'europe', type: 'country', value: 'true' },
  { name: 'age', operator: 'gte', type: 'number', value: 21 },
];

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    maxWidth: 100,
    type: 'number',
  },
  { name: 'name', defaultFlex: 1, maxWidth: 200, header: 'Name' },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    filterEditor: 'bool',
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', defaultFlex: 1, header: 'City' },
  { name: 'age', defaultFlex: 1, type: 'number', header: 'Age' },
];

const App = () => {
  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        filterTypes={filterTypes}
        defaultFilterValue={filterValue}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
