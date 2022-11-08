/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useState } from 'react';

import DataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import { getGlobal } from '@inovua/reactdatagrid-community/getGlobal';

const globalObject = getGlobal();

const gridStyle = { minHeight: 350 };

const minWidth: number = 160;
const columns = [
  {
    name: 'id',
    header: 'ID',
    type: 'number',
    defaultWidth: 80,
    defaultVisible: false,
  },
  { name: 'firstName', header: 'First Name', flex: 1, minWidth },
  { name: 'city', header: 'City', flex: 1, minWidth },
  { name: 'email', header: 'Email', flex: 1, minWidth },
  { name: 'country', header: 'Country', flex: 1, minWidth },
  { name: 'age', header: 'Age', type: 'number', flex: 1, minWidth },
  {
    name: 'student',
    header: 'Student',
    render: ({ value }: { value: boolean }) => {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return value;
    },
    minWidth,
  },
  { name: 'birthDate', header: 'Birth Date', flex: 1, minWidth },
];

(globalObject as any).cellSelection = [];
const onCellSelectionChange = (activeCell: [number, number] | null) => {
  (globalObject as any).cellSelection.push(activeCell);
};

const App = () => {
  const [dataSource, setDataSource] = useState(people);

  const onEditComplete = useCallback(
    ({
      value,
      columnId,
      rowIndex,
    }: {
      value: string | boolean;
      columnId: number;
      rowIndex: number;
    }) => {
      const data = [...dataSource];
      (data as any)[rowIndex][columnId] = value;

      setDataSource(data);
    },
    []
  );

  return (
    <div>
      <DataGrid
        columns={columns}
        idProperty="id"
        style={gridStyle}
        dataSource={dataSource}
        defaultCellSelection={{}}
        onCellSelectionChange={onCellSelectionChange}
        multiSelect
        enableCellBulkUpdate
        editable
        onEditComplete={onEditComplete}
      />
    </div>
  );
};
export default () => <App />;
