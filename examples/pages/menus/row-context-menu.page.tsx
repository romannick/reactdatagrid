import React, { useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
  },
  { name: 'name', defaultFlex: 1, header: 'Name' },
  {
    name: 'country',
    defaultFlex: 1,
    header: 'Country',
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', defaultFlex: 1, header: 'City' },
  { name: 'age', defaultFlex: 1, type: 'number', header: 'Age' },
];

const App = () => {
  const renderRowContextMenu = useCallback((menuProps, { rowProps }) => {
    menuProps.autoDismiss = true;
    menuProps.items = [
      {
        label: 'Row ' + rowProps.rowIndex,
        onClick: () => {
          console.log({
            title: 'Custom notification for row index: ' + rowProps.rowIndex,
            content: 'Row context menu item clicked',
          });
          menuProps.onDismiss();
        },
      },
      {
        label: 'Want to visit ' + rowProps.data.country + '?',
        onClick: () => {
          console.log({
            title: 'Custom notification for row index: ' + rowProps.rowIndex,
            content: 'Row context menu item clicked',
          });
          menuProps.onDismiss();
        },
      },
    ];
  }, []);

  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        renderRowContextMenu={renderRowContextMenu}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
