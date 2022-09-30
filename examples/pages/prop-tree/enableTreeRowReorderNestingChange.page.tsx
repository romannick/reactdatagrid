import React, { useState } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

const gridStyle = { minHeight: 750 };

const treeData = [
  {
    id: 1,
    name: 'Applications',
    folder: true,
    nodes: [
      { id: 1, name: 'App store', size: '4.5Mb' },
      { id: 2, name: 'iMovie', size: '106Mb' },
      { id: 3, name: 'IRecall', size: '200Mb' },
    ],
  },
  {
    id: 2,
    name: 'Documents',
    nodes: [
      { id: 1, name: 'Todo.md', size: '2Kb' },
      { id: 2, name: 'Calendar.md', size: '15.2Kb' },
      { id: 3, name: 'Shopping list.csv', size: '20Kb' },
    ],
  },
  {
    id: 3,
    name: '3 Downloads',
    nodes: [
      {
        id: 1,
        name: 'Email data',
        nodes: [
          { id: 1, name: 'Personal.xls', size: '100Gb' },
          { id: 2, name: 'Work.xls' },
        ],
      },
      { id: 2, name: 'MacRestore.gzip' },
    ],
  },
  { id: 4, name: 'Movies' },
];

const columns = [
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'size', header: 'Size', defaultWidth: 160 },
];

const App = () => {
  const [rowReorderColumn, setRowReorderColumn] = useState(true);
  const [enableTreeRowReorder, setEnableTreeRowReorder] = useState(true);
  const [
    enableTreeRowReorderNestingChange,
    setEnableTreeRowReorderNestingChange,
  ] = useState(true);

  return (
    <div>
      <h3>TreeGrid with row reorder</h3>

      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={rowReorderColumn} onChange={setRowReorderColumn}>
          rowReorderColumn
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox
          checked={enableTreeRowReorder}
          onChange={setEnableTreeRowReorder}
        >
          enableTreeRowReorder
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox
          checked={enableTreeRowReorderNestingChange}
          onChange={setEnableTreeRowReorderNestingChange}
        >
          enableTreeRowReorderNestingChange
        </CheckBox>
      </div>

      <ReactDataGrid
        treeColumn="name"
        theme="default-dark"
        style={gridStyle}
        columns={columns}
        dataSource={treeData}
        defaultExpandedNodes={{ 1: true, 2: true, 3: true, '3/1': true }}
        rowReorderColumn={rowReorderColumn}
        enableTreeRowReorder={enableTreeRowReorder}
        enableTreeRowReorderNestingChange={enableTreeRowReorderNestingChange}
      />
    </div>
  );
};

export default () => <App />;
