import React from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';

const gridStyle = { minHeight: 250 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultWidth: 60,
    type: 'number',
  },
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const App = () => {
  const rowHeights = people.reduce((acc: any, next) => {
    console.log('next', next);
    acc[next.id] = next.id % 2 == 0 ? 70 : 35;
    return acc;
  }, {});

  console.log('rowHeights', rowHeights);

  return (
    <div>
      <h3>Grid with toggle for showColumnMenuTool</h3>

      <ReactDataGrid
        idProperty="id"
        rowHeights={rowHeights}
        style={gridStyle}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
