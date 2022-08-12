import React, { useState } from 'react';

import Button from '@inovua/reactdatagrid-community/packages/Button';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';
import NumericInput from '@inovua/reactdatagrid-community/packages/NumericInput';

import DataGrid from '../../../enterprise-edition';

const gridStyle = { minHeight: 500 };

const COLS = 10;

const times = (arr: any[], n: number, fn?: (x: any, i: number) => void) => {
  const result = [];

  for (var i = 0; i < n; i++) {
    result.push(
      ...arr.map(x => {
        if (fn) {
          return fn(x, i);
        }
        return {
          ...x,
          id: `${i}-${x.id}`,
        };
      })
    );
  }

  return result;
};

const columns = times([{ name: 'id' }], COLS, (_, i) => {
  return {
    name: `id-${i}`,
    id: `id-${i}`,
    header: `ID--${i}`,
    defaultWidth: 120,
    render: ({ value, rowIndex }: { value: string; rowIndex: number }) => {
      return `${rowIndex} - ${value}`;
    },
  };
});

const loadDataSource = (n: number) => {
  const data = times(
    [
      [...new Array(COLS)].reduce(
        (acc, _, i) => {
          acc[`id-${i}`] = i;
          return acc;
        },
        { id: 0 }
      ),
    ],
    n
  );

  return data;
};

const App = () => {
  const [checkboxColumn, setCheckboxColumn] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={checkboxColumn} onChange={setCheckboxColumn}>
          checkboxColumn
        </CheckBox>
      </div>

      <DataGrid
        idProperty="id"
        style={gridStyle}
        columns={columns}
        checkboxColumn={checkboxColumn}
        dataSource={loadDataSource(100)}
      />
    </div>
  );
};

export default () => <App />;
