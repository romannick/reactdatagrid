import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

type Data = {
  id: number;
  name: string;
  nodes: Data[] | null;
  largeObject: any[];
  __nodeProps: { [key: string]: any };
};

const gridStyle = { minHeight: 550 };

const largeNumber = 1000000000;
const smallNumber = 10000;

const largeObject = Array(largeNumber);

let nextId = 1;

const createNode = (name: string) => {
  return {
    id: nextId++,
    name,
    largeObject,
    nodes: null,
  };
};

const createParentNodes = () => {
  const nodes = [];
  for (let i = 0; i < 20; ++i) {
    nodes.push(createNode(`Parent ${i}`));
  }
  return nodes;
};

const createChildNodes = (startIndex: number) => {
  const nodes = [];
  for (let i = 0; i < 20; ++i) {
    nodes.push(createNode(`Child ${i + startIndex + 1}`));
  }
  return nodes;
};

const columns = [
  {
    name: 'name',
    render: ({
      data,
      loadNodeAsync,
    }: {
      data: Data;
      loadNodeAsync: () => void;
    }) => {
      const handleClick = () => {
        loadNodeAsync();
      };

      return (
        <div>
          <span>{data.name}</span>{' '}
          {data.nodes?.length && (
            <button onClick={handleClick}>Load 20 more</button>
          )}
        </div>
      );
    },
    header: 'Name',
    defaultFlex: 1,
  },
  {
    name: 'age',
    header: 'Age',
    width: 120,
    render: () => {
      return <span>{Math.floor(Math.random() * 100)}</span>;
    },
  },
];

const App = () => {
  const treeData = React.useRef(createParentNodes());

  const handleLoadNode = async ({ node }: { node: any }) => {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    });

    const prevNodes = node.nodes || [];
    const newNodes = createChildNodes(prevNodes.length);

    return [...prevNodes, ...newNodes];
  };

  return (
    <div>
      <ReactDataGrid
        treeColumn="name"
        style={gridStyle}
        columns={columns}
        dataSource={treeData.current}
        livePagination
        loadNode={handleLoadNode}
      />
      <div style={{ marginTop: 20 }}>
        <span>Number: {largeNumber.toLocaleString('en-En')}</span>
      </div>
    </div>
  );
};

export default () => <App />;
