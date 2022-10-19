import React, { useState } from 'react';

import ReactDataGrid from '../../../enterprise-edition';

import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';

import people from '../people';
import flags, { FlagsType } from '../flags';
import moment from 'moment';
import { getGlobal } from '@inovua/reactdatagrid-community/getGlobal';
import { TypeFilterValue } from '@inovua/reactdatagrid-community/types';
import Button from '@inovua/reactdatagrid-community/packages/Button';

const globalObject = getGlobal();

let window = globalObject || globalThis;

if ((window as any).moment == null) {
  (window as any).moment = moment;
}

const gridStyle = { minHeight: 600 };

const COUNTRIES: { [key: string]: string } = {
  ca: 'Canada',
  uk: 'United Kingdom',
  usa: 'United States of America',
};

const countries = people.reduce(
  (countries: { id: string; label: string }[], p: any) => {
    if (countries.filter((c: { id: string }) => c.id == p.country).length) {
      return countries;
    }
    countries.push({
      id: p.country,
      label: COUNTRIES[p.country] || p.country,
    });

    return countries;
  },
  []
);

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
    filterEditorProps: {
      placeholder: 'All',
      dataSource: countries,
    },
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  {
    name: 'birthDate',
    header: 'Birth date',
    defaultFlex: 1,
    minWidth: 200,
    dateFormat: 'MM-DD-YYYY',
    filterEditor: DateFilter,
    filterEditorProps: ({ index }: { index: number }) => {
      // for range and not in range operators, the index is 1 for the after field
      return {
        dateFormat: 'MM-DD-YYYY',
        cancelButton: false,
        highlightWeekends: false,
        placeholder:
          index == 1 ? 'Created date is before...' : 'Created date is after...',
      };
    },
    render: ({ value }: { value: string }) => {
      return moment(value).format('MM-DD-YYYY');
    },
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
];

const initialFilterValue = [
  { name: 'name', operator: 'startsWith', type: 'string', value: '' },
  { name: 'age', operator: 'eq', type: 'number', value: null },
  { name: 'city', operator: 'startsWith', type: 'string', value: '' },
  {
    name: 'birthDate',
    operator: 'before',
    type: 'date',
    value: '',
  },
  { name: 'country', operator: 'startsWith', type: 'string', value: '' },
] as TypeFilterValue;

const App = () => {
  const [filterValue, setFilterValue] = useState<TypeFilterValue>(
    initialFilterValue
  );

  return (
    <div>
      <h3>Grid with default filter value</h3>

      <Button
        style={{ marginBottom: 20, borderRadius: 4 }}
        onClick={() => {
          setFilterValue(initialFilterValue);
        }}
      >
        Reset filters
      </Button>

      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        filterValue={filterValue}
        onFilterValueChange={setFilterValue}
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
