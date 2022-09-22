import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import Button from '@inovua/reactdatagrid-community/packages/Button';

import people from '../people';
import flags from '../flags';

const gridStyle = { minHeight: 300 };

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
    render: ({ value }) => (flags[value] ? flags[value] : value),
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const App = () => {
  const [gridRef, setGridRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <div>
      <p>Active index is: {activeIndex}</p>
      <div style={{ marginBottom: 20 }}>
        <Button
          onClick={() => {
            console.log({
              activeIndex: activeIndex,
              content:
                'Active row id:' + gridRef!.current.getRowId(activeIndex),
            });
          }}
        >
          Show id of the active row
        </Button>
      </div>
      <ReactDataGrid
        idProperty="id"
        onReady={setGridRef}
        style={gridStyle}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
