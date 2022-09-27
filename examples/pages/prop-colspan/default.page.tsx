import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import { TypeComputedColumn } from '@inovua/reactdatagrid-community/types';
import { TypeColumns } from '@inovua/reactdatagrid-community/types/TypeColumn';

const gridStyle = { minHeight: 550 };

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
    defaultFlex: 1,
    header: 'Name',
    colspan: ({
      data,
      column,
      columns,
    }: {
      data: any;
      column: TypeComputedColumn;
      columns: TypeColumns;
    }) => {
      // make every other row cell expand for 2 columns if the next column is the age column
      if (
        data.id % 2 &&
        columns[column.computedVisibleIndex + 1] &&
        columns[column.computedVisibleIndex + 2].name === 'age'
      ) {
        return 2;
      }

      return 1;
    },
  },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
  },
  { name: 'age', defaultFlex: 1, type: 'number', header: 'Age' },
];

const App = () => {
  return (
    <div>
      <h3>Colspan example</h3>
      <ReactDataGrid style={gridStyle} columns={columns} dataSource={people} />
    </div>
  );
};

export default () => <App />;
