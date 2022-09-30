import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

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
    name: 'country',
    header: 'County',
    defaultFlex: 1,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const dataSource = people.slice(0, 4);

const App = () => {
  const [showEmptyRows, setShowEmptyRows] = useState(true);
  const [nativeScroll, setNativeScroll] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={showEmptyRows} onChange={setShowEmptyRows}>
          Show empty rows.
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={nativeScroll} onChange={setNativeScroll}>
          Native scroll
        </CheckBox>
      </div>

      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columns={columns}
        showEmptyRows={showEmptyRows}
        dataSource={dataSource}
        nativeScroll={nativeScroll}
      />
    </div>
  );
};

export default () => <App />;
