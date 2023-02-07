import React, { useRef } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';

import people from '../people';
import flags, { FlagsType } from '../flags';
import moment from 'moment';
import { getGlobal } from '@inovua/reactdatagrid-community/getGlobal';

const globalThis = getGlobal();
(globalThis as any).moment = moment;

const gridStyle = { minHeight: 600 };

const COUNTRIES: any = {
  ca: 'Canada',
  uk: 'United Kingdom',
  usa: 'United States of America',
};

const countries = people.reduce((countries: any, p) => {
  if (countries.filter((c: any) => c.id == p.country).length) {
    return countries;
  }
  countries.push({
    id: p.country,
    label: COUNTRIES[p.country] || p.country,
  });

  return countries;
}, []);

const filterValue = [
  { name: 'name', operator: 'startsWith', type: 'string', value: '' },
  { name: 'age', operator: 'gte', type: 'number', value: 21 },
  { name: 'city', operator: 'startsWith', type: 'string', value: '' },
  {
    name: 'birthDate',
    operator: 'before',
    type: 'date',
    value: '',
  },
  { name: 'country', operator: 'eq', type: 'select', value: 'ca' },
];

const App = () => {
  const dateRef = useRef<any>(null);

  const columns = [
    {
      name: 'id',
      header: 'Id',
      defaultVisible: false,
      defaultWidth: 80,
      type: 'number',
    },
    { name: 'name', header: 'Name', defaultFlex: 1 },
    {
      name: 'age',
      header: 'Age',
      defaultFlex: 1,
      type: 'number',
      filterEditor: NumberFilter,
    },
    {
      name: 'country',
      header: 'Country',
      defaultFlex: 1,
      filterEditor: SelectFilter,
      filterEditorProps: {
        placeholder: 'All',
        dataSource: countries,
      },
      render: ({ value }: { value: string }) =>
        flags[value as keyof FlagsType]
          ? flags[value as keyof FlagsType]
          : value,
    },
    {
      name: 'birthDate',
      header: 'Birth date',
      defaultFlex: 1,
      minWidth: 200,
      filterEditor: DateFilter,
      filterEditorProps: ({ index }: { index: number }) => {
        // for range and not in range operators, the index is 1 for the after field
        return {
          dateFormat: 'MM-DD-YYYY',
          cancelButton: false,
          highlightWeekends: false,
          inputRef: dateRef,
          placeholder:
            index == 1
              ? 'Created date is before...'
              : 'Created date is after...',
        };
      },
      render: ({ value }: { value: string }) => {
        return moment(value).format('MM-DD-YYYY');
      },
    },
    { name: 'city', header: 'City', defaultFlex: 1 },
  ];

  return (
    <div>
      <h3>Grid with default filter value</h3>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            console.log('dateRef', dateRef?.current);
            dateRef?.current?.focus();
          }}
        >
          Date focus
        </button>
      </div>

      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        defaultFilterValue={filterValue}
        columns={columns}
        dataSource={people}
      />
      <p>
        Delete the filters if you want to show all data. You can click the
        configure icon and then "Clear All"
      </p>
    </div>
  );
};

export default () => <App />;
