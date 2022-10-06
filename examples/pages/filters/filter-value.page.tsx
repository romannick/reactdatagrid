import React, { useState, useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import filter from '@inovua/reactdatagrid-community/filter';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const defaultFilterValue = [
  { name: 'name', operator: 'startsWith', type: 'string', value: 'B' },
  { name: 'age', operator: 'gte', type: 'number', value: 21 },
];

const defaultFilterValue2 = [
  { name: 'name', operator: 'startsWith', type: 'string', value: 'B' },
  { name: 'age', operator: 'gte', type: 'number', value: '' },
];

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
  },
  { name: 'name', defaultFlex: 1, header: 'Name' },
  { name: 'age', defaultFlex: 1, type: 'number', header: 'Age' },
  {
    name: 'country',
    defaultFlex: 1,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
    header: 'Country',
  },
  { name: 'city', defaultFlex: 1, header: 'City' },
];

const App = () => {
  const initialData = useCallback(() => filter(people, defaultFilterValue), []);

  const [dataSource, setDataSource] = useState(initialData);
  const [filterValue, setFilterValue] = useState(defaultFilterValue);

  const onFilterValueChange = useCallback(filterValue => {
    debugger;
    const data = filter(people, filterValue);

    setFilterValue(filterValue);
    setDataSource(data);
  }, []);

  return (
    <div>
      <p>
        <button onClick={() => setFilterValue(defaultFilterValue)}>
          filter value set 1
        </button>
        <button onClick={() => setFilterValue(defaultFilterValue2)}>
          filter value set 2
        </button>
      </p>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        onFilterValueChange={onFilterValueChange}
        filterValue={filterValue}
        columns={columns}
        dataSource={dataSource}
      />
      <p>
        Delete the filters if you want to show all data. You can click the
        configure icon and then "Clear All"
      </p>
    </div>
  );
};

export default () => <App />;
