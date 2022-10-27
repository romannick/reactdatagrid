import React, { useCallback, useState } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import BoolFilter from '@inovua/reactdatagrid-community/BoolFilter';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';
import flags, { FlagsType } from '../flags';
import { TypeFilterValue } from '@inovua/reactdatagrid-community/types';
import filter from '@inovua/reactdatagrid-community/filter';

const gridStyle = { minHeight: 600 };

const filterTypes = Object.assign(ReactDataGrid.defaultProps.filterTypes, {
  country: {
    name: 'country',
    operators: [
      {
        name: 'europe',
        fn: ({
          value,
          filterValue,
          data,
        }: {
          value: string;
          filterValue: TypeFilterValue;
          data: any;
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

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultWidth: 50,
    type: 'number',
  },
  { name: 'name', header: 'Name', defaultFlex: 1, maxWidth: 200 },
  { name: 'details', header: 'Details', defaultFlex: 1, minWidth: 200 },
  {
    name: 'country',
    header: 'Country - with custom checkbox',
    defaultFlex: 1,
    maxWidth: 100,
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

const App = () => {
  const initialData = useCallback(() => filter(people, defaultFilterValue), []);

  const [dataSource, setDataSource] = useState(initialData);
  const [filterValue, setFilterValue] = useState(defaultFilterValue);

  const onFilterValueChange = useCallback(filterValue => {
    const data = filter(people, filterValue);

    setFilterValue(filterValue);
    setDataSource(data);
  }, []);

  return (
    <div>
      <h3>
        Filterable DataGrid with column.filterEditor - Custom checkbox filter
      </h3>

      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        filterTypes={filterTypes}
        columns={columns}
        dataSource={dataSource}
        filterValue={filterValue}
        onFilterValueChange={onFilterValueChange}
      />
    </div>
  );
};

export default () => <App />;
