import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-community';
import PaginationToolbar from '@inovua/reactdatagrid-community/packages/PaginationToolbar';
import { data } from './fake-backend';

const gridStyle = { minHeight: 550, marginTop: 10 };

const columns = [
  {
    name: 'id',
    type: 'number',
    maxWidth: 40,
    header: 'ID',
    defaultVisible: false,
  },
  { name: 'firstName', defaultFlex: 2, header: 'First Name' },
  { name: 'lastName', defaultFlex: 2, header: 'Last Name' },
  { name: 'email', defaultFlex: 3, header: 'Email' },
];

const App = () => {
  const getData = useCallback(
    ({ skip, limit }: { skip: number; limit: number }) => {
      return new Promise((resolve, reject) => {
        const newData = data.slice(skip, skip + limit);
        return resolve({ data: newData, count: data.length });
      });
    },
    []
  );

  const renderPaginationToolbar = useCallback(paginationProps => {
    return (
      <PaginationToolbar
        {...paginationProps}
        theme="default-dark"
        constrainTo=".InovuaReactDataGrid__body"
        renderCurrentPageInput={({
          currentPage: page,
        }: {
          currentPage: any;
        }) => <div>&nbsp;&nbsp;{page}&nbsp;&nbsp;</div>}
        bordered={false}
      />
    );
  }, []);

  return (
    <div>
      <h3>Async data and pagination example</h3>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columns={columns}
        pagination
        dataSource={getData}
        defaultLimit={20}
        pageSizes={[10, 20, 30, 50, 100]}
        renderPaginationToolbar={renderPaginationToolbar}
      />
    </div>
  );
};

export default () => <App />;
