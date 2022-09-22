import React, { useState } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';

const gridStyle = { minHeight: 400 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
    groupBy: false,
  },
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'country', header: 'Country', defaultWidth: 150 },
  { name: 'city', header: 'City', defaultWidth: 150 },
  { name: 'age', header: 'Age', defaultWidth: 100, type: 'number' },
  { name: 'email', header: 'Email', defaultWidth: 150, defaultFlex: 1 },
];

const defaultGroupBy = ['country'];

const renderGroupCollapseTool = ({ domProps, size, rtl }: any) => {
  return (
    <svg
      fill="red"
      style={{ color: 'red' }}
      {...domProps}
      height={size}
      width={size}
      viewBox="0 0 48 48"
    >
      {rtl ? (
        <g transform="rotate(180, 24, 24)">
          <path d="M24 40 21.9 37.85 34.25 25.5H8V22.5H34.25L21.9 10.15L24 8L40 24Z" />
        </g>
      ) : (
        <path d="M24 40 21.9 37.85 34.25 25.5H8V22.5H34.25L21.9 10.15L24 8L40 24Z" />
      )}
    </svg>
  );
};

const renderGroupExpandTool = ({ domProps, size }: any) => {
  return (
    <svg {...domProps} height={size} width={size} viewBox="0 0 48 48">
      <path d="M24 40 8 24 10.1 21.9 22.5 34.3V8H25.5V34.3L37.9 21.9L40 24Z" />
    </svg>
  );
};

const App = () => {
  const [rtl, setRtl] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={rtl} onChange={setRtl}>
          Right-to-left
        </CheckBox>
      </div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        defaultGroupBy={defaultGroupBy}
        columns={columns}
        dataSource={people}
        rtl={rtl}
        renderGroupCollapseTool={renderGroupCollapseTool}
        renderGroupExpandTool={renderGroupExpandTool}
      />
    </div>
  );
};

export default () => <App />;
