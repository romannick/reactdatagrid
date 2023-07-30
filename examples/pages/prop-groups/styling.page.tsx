import React from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import data from './data.json';

const COUNTRIES = [
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'usa', label: 'United States of America' },
];

const CITIES = [
  { value: 'sj', label: 'San Jose' },
  { value: 'la', label: 'Los Angeles' },
  { value: 'stl', label: 'St. Louis' },
];

const App = () => {
  const columns = React.useMemo(() => {
    return [
      {
        name: 'id',
        header: 'Id',
        defaultVisible: false,
        defaultWidth: 80,
        type: 'number',
      },
      {
        name: 'name',
        header: 'Name (contains)',
        defaultFlex: 1,
        groupBy: false,
      },
      {
        name: 'age',
        header: 'Age (gte)',
        defaultFlex: 1,
        type: 'number',
        groupBy: false,
      },
      {
        name: 'country',
        header: 'Country',
        defaultFlex: 1,
        render: ({ value }) =>
          COUNTRIES.find(item => item.value === value)?.label,
      },
      {
        name: 'city',
        header: 'City (inlist)',
        defaultFlex: 1,
        render: ({ value }) => CITIES.find(item => item.value === value)?.label,
      },
      {
        name: 'date',
        header: 'Date (after)',
        defaultFlex: 1,
        render: ({ value }) => value?.toString(),
      },
      {
        name: 'group',
        header: 'Group',
        defaultFlex: 1,
      },
    ];
  }, []);

  const defaultFilterValue = React.useMemo(() => {
    return [
      { name: 'name', operator: 'contains', type: 'string', value: '' },
      { name: 'age', operator: 'gte', type: 'number', value: '' },
      { name: 'city', operator: 'inlist', type: 'select', value: '' },
      { name: 'date', operator: 'after', type: 'date', value: '' },
    ];
  }, []);

  return (
    <ReactDataGrid
      idProperty="id"
      columns={columns}
      dataSource={data}
      style={{ height: 550 }}
      defaultFilterValue={defaultFilterValue}
      defaultGroupBy={['group']}
      checkboxColumn={true}
    />
  );
};

export default () => <App />;
