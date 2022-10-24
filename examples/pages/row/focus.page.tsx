import React from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';

import people from '../people';
import flags, { FlagsType } from '../flags';
import moment from 'moment';

const gridStyle = { minHeight: 400 };

type Countries = { [key: string]: string };

const COUNTRIES: Countries = {
  ca: 'Canada',
  uk: 'United Kingdom',
  usa: 'United States of America',
};

const countries = people.reduce(
  (countries: { id: string; label: string }[], p: { country: string }) => {
    if (countries.filter(c => c.id == p.country).length) {
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

const filterValue = [
  { name: 'name', operator: 'startsWith', type: 'string', value: '' },
  { name: 'age', operator: 'gte', type: 'number', value: '' },
  { name: 'city', operator: 'startsWith', type: 'string', value: '' },
  {
    name: 'birthDate',
    operator: 'before',
    type: 'date',
    value: '',
  },
  { name: 'country', operator: 'eq', type: 'select', value: null },
];

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
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  {
    name: 'birthDate',
    header: 'Birth date',
    defaultFlex: 1,
    minWidth: 200,
    filterEditor: DateFilter,
    filterEditorProps: ({ index }: { index: number }) => {
      // for range and notinrange operators, the index is 1 for the after field
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

const App = () => {
  return (
    <div>
      <h3>Grid with default filter value</h3>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        defaultFilterValue={filterValue}
        columns={columns}
        dataSource={people}
        allowRowTabNavigation
        rowFocusClassName="global-row-background-tomato"
      />

      <input
        type="text"
        style={{
          background: '#464d56',
          color: '#fafafa',
          height: 32,
          width: 120,
          marginTop: 20,
          border: 'none',
        }}
      />
      <p>
        Delete the filters if you want to show all data. You can click the
        configure icon and then "Clear All"
      </p>
    </div>
  );
};

export default () => <App />;
