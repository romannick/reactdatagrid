import React, { useState, useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags from '../flags';

const gridStyle = { minHeight: 500 };

const columns = [
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'email', header: 'Email', defaultFlex: 1 },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    render: ({ value }) => (flags[value] ? flags[value] : value),
  },
  { name: 'age', header: 'Age', type: 'number', defaultFlex: 1 },
  {
    id: 'desc',
    header: 'Description',
    minWidth: 150,
    render: ({ data }) =>
      data.firstName + ', aged: ' + data.age + '. Lives in ' + data.country,
  },
];

const App = () => {
  const [groupBy, setGroupBy] = useState(['country', 'city']);
  const [collapsedGroups, setCollapsedGroups] = useState({
    'uk/London': true,
    usa: true,
  });
  const [expandedGroups, setExpandedGroups] = useState({});

  const onGroupCollapseChange = (collapsedGroups, expandedGroups) => {
    setCollapsedGroups(collapsedGroups);
    setExpandedGroups(expandedGroups);
  };

  return (
    <div>
      <p>Collapsed groups: {JSON.stringify(Object.keys(collapsedGroups))}.</p>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        collapsedGroups={collapsedGroups}
        expandedGroups={expandedGroups}
        onGroupCollapseChange={onGroupCollapseChange}
        defaultGroupBy={groupBy}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
