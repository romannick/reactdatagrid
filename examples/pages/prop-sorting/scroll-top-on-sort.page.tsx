import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';
import flags from '../flags';

const gridStyle = { minHeight: 350 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
  },
  { name: 'firstName', header: 'Name', defaultFlex: 1 },
  { name: 'email', header: 'Email', defaultFlex: 1 },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    render: ({ value }) => (flags[value] ? flags[value] : value),
  },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const App = () => {
  const [scrollTopOnSort, setScrollTopOnSort] = useState(true);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={scrollTopOnSort} onChange={setScrollTopOnSort}>
          scrollTopOnSort
        </CheckBox>
      </div>
      <ReactDataGrid
        idProperty="id"
        scrollTopOnSort={scrollTopOnSort ? 'always' : scrollTopOnSort}
        style={gridStyle}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
