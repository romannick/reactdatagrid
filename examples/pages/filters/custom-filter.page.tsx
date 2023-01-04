import React, { useCallback, useState } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-community';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import BoolFilter from '@inovua/reactdatagrid-community/BoolFilter';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';
import flags, { FlagsType } from '../flags';
import filter from '@inovua/reactdatagrid-community/filter';

const gridStyle = { minHeight: 600 };

const filterTypes = Object.assign({}, ReactDataGrid.defaultProps.filterTypes, {
  country: {
    name: 'country',
    emptyValue: null,
    operators: [
      {
        name: 'europe',
        fn: ({
          value,
          filterValue,
        }: {
          value: string;
          filterValue: boolean;
        }) => {
          if (filterValue == null) {
            return true;
          }
          const isInEurope = value !== 'usa' && value !== 'ca';

          return filterValue ? isInEurope : !isInEurope;
        },
      },
    ],
  },
});

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultWidth: 50,
    type: 'number',
  },
  {
    name: 'name',
    header: 'Name',
    defaultFlex: 1,
    maxWidth: 200,
  },
  {
    name: 'country',
    header: 'Country - with custom checkbox',
    defaultFlex: 1,
    minWidth: 300,
    filterEditor: BoolFilter,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
  {
    name: 'age',
    header: 'Age',
    defaultFlex: 1,
    type: 'number',
    filterEditor: NumberFilter,
  },
];

const defaultFilterValue = [
  {
    name: 'country',
    operator: 'europe',
    type: 'country',
    value: true,
    emptyValue: null,
  },
  { name: 'city', operator: 'startsWith', type: 'string', value: '' },
  { name: 'name', operator: 'startsWith', type: 'string', value: '' },
  { name: 'age', operator: 'gte', type: 'number', value: 21 },
];

const App = () => {
  const [enableFiltering, setEnableFiltering] = useState(true);

  const onFilterValueChange = useCallback(filterValue => {
    const data = filter(people, filterValue);
    console.log(data);
  }, []);

  return (
    <div>
      <h3>
        Filterable DataGrid with column.filterEditor - Custom checkbox filter
      </h3>
      <div style={{ marginBottom: 20 }}>
        <CheckBox
          checked={enableFiltering}
          onChange={(value: boolean) => setEnableFiltering(value)}
        >
          Enable filtering
        </CheckBox>
      </div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        filterTypes={filterTypes}
        enableFiltering={enableFiltering}
        defaultFilterValue={defaultFilterValue}
        columns={columns}
        dataSource={people}
        onFilterValueChange={onFilterValueChange}
      />
    </div>
  );
};

export default () => <App />;
