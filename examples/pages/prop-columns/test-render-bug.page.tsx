import React, { useState, useCallback } from 'react';
import ReactDataGrid from '../../../enterprise-edition';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

const DATASET_URL: string = 'https://demos.reactdatagrid.io/api/v1/contacts';

const gridStyle = { minHeight: 400, marginTop: 10 };

const defaultSelected = { 1: true, 3: true };

const columns = [
  {
    name: 'id',
    type: 'number',
    defaultWidth: 60,
    header: 'Id',
    defaultVisible: false,
  },
  { name: 'firstName', defaultFlex: 1, header: 'First Name' },
  { name: 'lastName', defaultFlex: 1, header: 'Last Name' },
  { name: 'email', groupBy: false, defaultFlex: 1, header: 'Email' },
];

const loadData = ({ skip, limit, sortInfo }) => {
  return fetch(
    DATASET_URL +
      '?skip=' +
      skip +
      '&limit=' +
      limit +
      (sortInfo ? '&sortInfo=' + JSON.stringify(sortInfo) : '')
  ).then(response => {
    const totalCount = response.headers.get('X-Total-Count');
    return response.json().then(data => {
      return { data, count: parseInt(totalCount) };
    });
  });
};

const App = () => {
  const [checkboxOnlyRowSelect, setCheckboxOnlyRowSelect] = useState(true);
  const [checkboxColumn, setCheckboxColumn] = useState(true);

  const dataSource = useCallback(loadData, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={checkboxColumn} onChange={setCheckboxColumn}>
          Checkbox column
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox
          checked={checkboxOnlyRowSelect}
          onChange={setCheckboxOnlyRowSelect}
        >
          Update row select using checkbox clicks only
        </CheckBox>
      </div>
      <ReactDataGrid
        idProperty="id"
        key={'grid-' + checkboxOnlyRowSelect}
        style={gridStyle}
        checkboxColumn={checkboxColumn}
        columns={columns}
        checkboxOnlyRowSelect={checkboxOnlyRowSelect}
        pagination
        defaultSelected={defaultSelected}
        sortable={false}
        dataSource={dataSource}
      />
    </div>
  );
};

export default () => <App />;
