import React, { useState, useCallback, useRef } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const gridStyle = { minHeight: 550 };

const treeData = [
  {
    id: 1,
    name: 'Applications',
    folder: true,
    nodes: [
      {
        id: 1,
        name: 'App store',
        size: '4.5Mb',
      },
      {
        id: 2,
        name: 'iMovie',
        size: '106Mb',
      },
      {
        id: 3,
        name: 'IRecall',
        size: '200Mb',
      },
    ],
  },
  {
    id: 2,
    name: 'Documents',
    nodes: [
      {
        id: 1,
        name: 'Todo.md',
        size: '2Kb',
      },
      {
        id: 2,
        name: 'Calendar.md',
        size: '15.2Kb',
      },
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
          {
            id: 1,
            name: 'Personal.xls',
            size: '100Gb',
          },
          { id: 2, name: 'Work.xls' },
        ],
      },
      { id: 2, name: 'MacRestore.gzip' },
    ],
  },
];

const columns = [
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'size', header: 'Size', defaultWidth: 160 },
];

const App = () => {
  const [expandedNodes, setExpandedNodes] = useState({
    1: true,
    2: true,
    '3/1': true,
  });
  const [dataSource, setDataSource] = useState(treeData);

  const gridRef = useRef<any>(null);

  const onExpandedNodesChange = useCallback(({ expandedNodes }) => {
    setExpandedNodes(expandedNodes);
  }, []);

  const onEditComplete = useCallback(
    editProps => {
      const editedTreeData = gridRef.current.editedTreeData(editProps);

      setDataSource(editedTreeData || []);
    },
    [dataSource]
  );

  return (
    <div>
      <h3>Basic TreeGrid</h3>
      <p>
        Expanded nodes:{' '}
        {expandedNodes == null
          ? 'none'
          : JSON.stringify(expandedNodes, null, 2)}
        .
      </p>
      <ReactDataGrid
        treeColumn="name"
        handle={(ref: any) => (gridRef.current = ref ? ref.current : null)}
        expandedNodes={expandedNodes}
        onExpandedNodesChange={onExpandedNodesChange}
        style={gridStyle}
        columns={columns}
        dataSource={dataSource}
        editable
        onEditComplete={onEditComplete}
      />
    </div>
  );
};

export default () => <App />;
