import React, { useRef } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import moment from 'moment';

import people from '../people';
import flags, { FlagsType } from '../flags';
import { getGlobal } from '@inovua/reactdatagrid-community/getGlobal';

const globalThis = getGlobal();

(globalThis as any).moment = moment;

const gridStyle = {
  minHeight: 700,
};

type CountriesType = { [key: string]: string };

const COUNTRIES: CountriesType = {
  ca: 'Canada',
  uk: 'United Kingdom',
  usa: 'United States of America',
  es: 'Spain',
  nd: 'Netherlands',
  fr: 'France',
  it: 'Italy',
};

const countries = Object.keys(COUNTRIES).map(country => {
  const newCountry = {
    id: country,
    label: COUNTRIES[country as keyof CountriesType],
  };
  return newCountry;
});

const filterValue = [
  { name: 'name', operator: 'startsWith', type: 'string', value: '' },
  { name: 'age', operator: 'gte', type: 'number', value: null },
  { name: 'city', operator: 'startsWith', type: 'string', value: '' },
  {
    name: 'birthDate',
    operator: 'before',
    type: 'date',
    value: '',
  },
  { name: 'country', operator: 'eq', type: 'select', value: null },
];

const App = () => {
  const selectRef = useRef<any>(null);
  const numericRef = useRef<any>(null);
  const stringRef = useRef<any>(null);
  const dateRef = useRef<any>(null);

  const columns = [
    {
      name: 'id',
      header: 'Id',
      defaultVisible: false,
      defaultWidth: 80,
      type: 'number',
    },
    {
      name: 'name',
      header: 'Name',
      defaultFlex: 1,
      filterEditorProps: {
        inputRef: stringRef,
      },
    },
    {
      name: 'age',
      header: 'Age',
      defaultFlex: 1,
      type: 'number',
      filterEditor: NumberFilter,
      filterEditorProps: {
        inputRef: numericRef,
      },
    },
    {
      name: 'country',
      header: 'Country',
      defaultFlex: 1,
      minWidth: 200,
      filterEditor: SelectFilter,
      filterEditorProps: {
        placeholder: 'All',
        dataSource: countries,
        constrainTo: '.InovuaReactDataGrid__body',
        inputRef: selectRef,
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
    {
      name: 'city',
      header: 'City',
      defaultFlex: 1,
    },
  ];

  return (
    <div>
      <h3>Grid with default filter value</h3>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            console.log('selectRef', selectRef?.current?.getInputRef());
            selectRef?.current?.getInputRef()?.comboNode?.focus();
          }}
        >
          Select focus
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            console.log('numericRef', numericRef?.current?.getInputRef());
            numericRef?.current?.getInputRef()?.focus();
          }}
        >
          Numeric focus
        </button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => {
            console.log('stringRef', stringRef?.current?.getInputRef());
            stringRef?.current?.getInputRef()?.focus();
          }}
        >
          String focus
        </button>
      </div>
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
    </div>
  );
};

export default () => <App />;
