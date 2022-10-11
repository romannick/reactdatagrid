import React, { useCallback, useState } from 'react';

import ReactDataGrid from '../../../enterprise-edition';

import NumberFilter from '@inovua/reactdatagrid-community/NumberFilter';
import SelectFilter from '@inovua/reactdatagrid-community/SelectFilter';
import DateFilter from '@inovua/reactdatagrid-community/DateFilter';
import BoolFilter from '../../../community-edition/BoolFilter';

import filter from '../../../community-edition/filter';

import people from '../people';
import flags from '../flags';
import moment from 'moment';
import { CellProps, TypeFilter } from '@inovua/reactdatagrid-community/types';
import { countries, CountriesType, CountryType } from './countries';
import ComboBox from '@inovua/reactdatagrid-community/packages/ComboBox';

const gridStyle = { minHeight: 600 };

const filterIcon = (className: string) => {
  return (
    <svg
      className={className}
      enableBackground="new 0 0 24 24"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
    >
      <g>
        <path d="M0,0h24 M24,24H0" fill="none" />
        <path d="M7,6h10l-5.01,6.3L7,6z M4.25,5.61C6.27,8.2,10,13,10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-6 c0,0,3.72-4.8,5.74-7.39C20.25,4.95,19.78,4,18.95,4H5.04C4.21,4,3.74,4.95,4.25,5.61z" />
        <path d="M0,0h24v24H0V0z" fill="none" />
      </g>
    </svg>
  );
};

const countriesData: { id: string; label: string }[] = countries.map(
  (country: CountryType) => {
    return { id: country.code, label: country.name };
  }
);

countriesData.length = 3;

const themesData = [
  { id: 'default-dark', label: 'Default dark' },
  { id: 'default-light', label: 'Default light' },
  { id: 'orange-dark', label: 'Orange dark' },
  { id: 'orange-light', label: 'Orange light' },
  { id: 'magenta-dark', label: 'Magenta dark' },
  { id: 'magenta-light', label: 'Magenta light' },
  { id: 'amber-dark', label: 'Amber dark' },
  { id: 'amber-light', label: 'Amber light' },
  { id: 'blue-dark', label: 'Blue dark' },
  { id: 'blue-light', label: 'Blue light' },
  { id: 'green-dark', label: 'Green dark' },
  { id: 'green-light', label: 'Green light' },
  { id: 'pink-dark', label: 'Pink dark' },
  { id: 'pink-light', label: 'Pink light' },
];

const defaultFilterValue = [
  { name: 'name', operator: 'startsWith', type: 'string', value: '' },
  { name: 'age', operator: 'gte', type: 'number', value: null },
  { name: 'city', operator: 'startsWith', type: 'string', value: '' },
  {
    name: 'birthDate',
    operator: 'before',
    type: 'date',
    value: '',
  },
  { name: 'student', operator: 'eq', type: 'bool', value: null },
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
  {
    name: 'name',
    header: 'Name',
    defaultFlex: 1,
    minWidth: 180,
    filterEditorProps: {
      placeholder: 'Name',
      renderSettings: ({ className }: { className: string }) =>
        filterIcon(className),
    },
  },
  {
    name: 'age',
    header: 'Age',
    group: 'personalInfo',
    defaultFlex: 1,
    minWidth: 180,
    type: 'number',
    filterEditorProps: { placeholder: 'Age' },
    filterEditor: NumberFilter,
  },
  {
    name: 'country',
    header: 'Country',
    group: 'personalInfo',
    defaultFlex: 1,
    minWidth: 180,
    filterEditor: SelectFilter,
    filterEditorProps: {
      placeholder: 'All',
      dataSource: countriesData,
    },
    render: ({ value }: { value: any }) =>
      (flags as any)[value] ? (flags as any)[value] : value,
  },
  {
    name: 'birthDate',
    header: 'Bith date',
    defualtFlex: 1,
    minWidth: 200,
    dateFormat: 'MM-DD-YYYY',
    filterEditor: DateFilter,
    filterEditorProps: (props: any, { index }: { index: number }) => {
      // for range and notinrange operators, the index is 1 for the after field
      return {
        dateFormat: 'MM-DD-YYYY',
        cancelButton: false,
        highlightWeekends: false,
        placeholder:
          index == 1 ? 'Created date is before...' : 'Created date is after...',
      };
    },
    render: ({ value, cellProps }: { value: string; cellProps: CellProps }) => {
      return moment(value).format('MM-DD-YYYY');
    },
  },
  {
    name: 'email',
    header: 'Email',
    defaultFlex: 1,
    minWidth: 180,
  },
  {
    name: 'student',
    header: 'Student',
    defaultFlex: 1,
    minWidth: 180,
    filterEditor: BoolFilter,
    render: ({ data }: { data: any }) => {
      return data.student ? 'Yes' : 'No';
    },
  },
  {
    name: 'city',
    header: 'City',
    defaultFlex: 1,
    minWidth: 180,
    filterEditorProps: { placeholder: 'City' },
  },
];

const groups = [
  { name: 'street', group: 'location', header: 'Street' },
  { name: 'personalInfo', header: 'Personal info' },
  { name: 'contactInfo', header: 'Contact info' },
  { name: 'location', header: 'Location' },
];

const App = () => {
  const [dataSource, setDataSource] = useState(people);
  const [filterValue, setFilterValue] = useState(defaultFilterValue);
  const [theme, setTheme] = useState<string>('orange-dark');

  const onFilterValueChange = useCallback(filterValue => {
    const data: any = (filter as TypeFilter)(people, filterValue);

    setFilterValue(filterValue);
    setDataSource(data);
  }, []);

  const onEditComplete = useCallback(
    ({
      value,
      columnId,
      rowIndex,
    }: {
      value?: string;
      columnId: string;
      rowIndex: number;
    }) => {
      const data = [...dataSource];
      (data as any)[rowIndex][columnId] = value;

      setDataSource(data);
    },
    [dataSource]
  );

  const filteredRowsCount = useCallback((filteredRows: number) => {
    // console.log('filteredRows', filteredRows);
  }, []);

  const comboProps = {
    value: theme,
    onChange: setTheme,
    dataSource: themesData,
    changeValueOnNavigation: true,
    collapseOnSelect: true,
    inlineFlex: true,
    clearIcon: false,
    style: { width: 200 },
  };

  return (
    <div>
      <h3>Grid with default filter value</h3>

      <div style={{ marginBottom: 20 }}>
        Theme: <ComboBox {...comboProps} />
      </div>

      <ReactDataGrid
        idProperty="id"
        theme={theme}
        style={gridStyle}
        onFilterValueChange={onFilterValueChange}
        filterValue={filterValue}
        columns={columns}
        dataSource={dataSource}
        filteredRowsCount={filteredRowsCount}
        onEditComplete={onEditComplete}
        editable={true}
        groups={groups}
        defaultGroupBy={[]}
        pagination
      />
      <p>
        Delete the filters if you want to show all data. You can click the
        configure icon and then "Clear All"
      </p>
    </div>
  );
};

export default () => <App />;
