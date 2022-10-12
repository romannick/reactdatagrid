/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';

import DataGrid from '../../../enterprise-edition';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

const gridStyle = { minHeight: 500 };

const times = (arr, n, fn?) => {
  const result = [];

  for (var i = 0; i < n; i++) {
    result.push(
      ...arr.map(x => {
        if (fn) {
          return fn(x, i);
        }
        return Object.assign({}, x, {
          id: `${i}-${x.id}`,
        });
      })
    );
  }

  return result;
};

const COLS = 30;
const columns = times([{ name: 'id' }], COLS, (_, i) => {
  return {
    name: i ? `id-${i}` : 'id',
    id: i ? `id-${i}` : 'id',
    header: i ? `ID ${i}` : 'ID',
  };
});

const loadData = () => {
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
    50
  );

  return data;
};

const App = () => {
  const [virtualColumns, setVirtualColumns] = useState(true);
  const [rtl, setRtl] = useState(true);

  if (typeof window === 'undefined') {
    return null;
  }
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={virtualColumns} onChange={setVirtualColumns}>
          Virtual columns
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={rtl} onChange={setRtl}>
          Virtual columns
        </CheckBox>
      </div>

      <DataGrid
        idProperty="id"
        style={gridStyle}
        rtl={rtl}
        columns={columns}
        dataSource={loadData}
        headerHeight={virtualColumns ? 48 : undefined}
      />
    </div>
  );
};

export default () => <App />;
