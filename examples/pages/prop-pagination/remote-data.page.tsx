import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-community';
import PaginationToolbar from '@inovua/reactdatagrid-community/packages/PaginationToolbar';

const DATASET_URL = 'https://demos.reactdatagrid.io/api/v1/contacts';

const gridStyle = { minHeight: 550, marginTop: 10 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    maxWidth: 40,
  },
  {
    name: 'firstName',
    defaultFlex: 1,
    header: 'First Name',
  },
  { name: 'lastName', defaultFlex: 1, header: 'Last Name' },
  { name: 'email', groupBy: false, defaultFlex: 1, header: 'Email' },
];

const loadData = ({ skip, limit }: { skip: number; limit: number }) => {
  return fetch(DATASET_URL + '?skip=' + skip + '&limit=' + limit).then(
    response => {
      const totalCount = response.headers.get('X-Total-Count');
      return response.json().then(data => {
        return { data, count: parseInt(totalCount!) };
      });
    }
  );
};

const App = () => {
  const dataSource = useCallback(loadData, []);

  return (
    <div>
      <h3>Remote data and pagination example</h3>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columns={columns}
        pagination
        defaultLimit={20}
        pageSizes={[10, 20, 30, 50, 100]}
        dataSource={dataSource}
      />
    </div>
  );
};

export default () => <App />;
