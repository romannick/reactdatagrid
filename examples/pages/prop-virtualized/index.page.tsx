import React, { useState, useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

const DATASET_URL: string = 'https://demos.reactdatagrid.io/api/v1/leads';

const gridStyle = { minHeight: 500, marginTop: 10 };

const emulateRowRenderComputations = () => {
  for (let i = 0; i < 1000; i++) {
    const array = new Array(i);
  }
};

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    maxWidth: 40,
  },
  { name: 'firstName', defaultFlex: 1, header: 'First Name' },
  { name: 'lastName', defaultFlex: 1, header: 'Last Name' },
  { name: 'email', groupBy: false, defaultFlex: 1, header: 'Email' },
  {
    name: 'permissionToCall',
    minWidth: 200,
    header: 'Permission to call',
    render: ({ data }: { data: { permissionToCall: boolean } }) => {
      emulateRowRenderComputations();
      return data.permissionToCall ? 'Yes' : 'No';
    },
    renderGroupTitle: (value: boolean) =>
      value ? 'Can be called' : 'Cannot be called',
  },
];

const loadData = ({ skip, limit }: { skip: number; limit: number }) => {
  return fetch(DATASET_URL + '?skip=' + skip + '&limit=' + limit).then(
    response => {
      const totalCount: string | null = response.headers.get('X-Total-Count');
      return response.json().then(data => {
        return { data, count: parseInt(totalCount!) };
      });
    }
  );
};

const App = () => {
  const [virtualized, setVirtualized] = useState(false);

  const dataSource = useCallback(loadData, []);

  return (
    <div>
      <CheckBox
        style={{ marginBottom: 20 }}
        checked={virtualized}
        onChange={setVirtualized}
      >
        virtualized
      </CheckBox>
      <ReactDataGrid
        key={virtualized}
        sortable={false}
        idProperty="id"
        style={gridStyle}
        columns={columns}
        pagination
        pageSizes={[100, 400, 800]}
        dataSource={dataSource}
        defaultLimit={200}
        virtualized={virtualized}
      />
    </div>
  );
};

export default () => <App />;
