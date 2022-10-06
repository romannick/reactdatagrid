import React from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import moment from 'moment';

import people from '../people';
import flags from '../flags';

const gridStyle = {
  minHeight: 200,
  position: 'absolute',
  bottom: 20,
  left: 20,
  width: 'calc(100% - 40px)',
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

console.log(countries);

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
    minWidth: 200,
    filterEditor: SelectFilter,
    filterEditorProps: {
      placeholder: 'All',
      dataSource: countries,
    },
    render: ({ value }) => (flags[value] ? flags[value] : value),
  },
  {
    name: 'birthDate',
    header: 'Bith date',
    defualtFlex: 1,
    minWidth: 200,
    filterEditor: DateFilter,
    filterEditorProps: (props, { index }) => {
      // for range and notinrange operators, the index is 1 for the after field
      return {
        dateFormat: 'MM-DD-YYYY',
        cancelButton: false,
        highlightWeekends: false,
        placeholder:
          index == 1 ? 'Created date is before...' : 'Created date is after...',
      };
    },
    render: ({ value, cellProps }) => {
      return moment(value).format('MM-DD-YYYY');
    },
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
];

const divStyle = {
  position: 'relative',
  height: '90vh',
};

const App = () => {
  return (
    <div>
      <h3>Grid with default filter value</h3>
      <div style={divStyle}>
        <ReactDataGrid
          idProperty="id"
          style={gridStyle}
          defaultFilterValue={filterValue}
          columns={columns}
          dataSource={people}
        />
      </div>
    </div>
  );
};

export default () => <App />;
