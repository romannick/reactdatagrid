import React, { useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 600 };

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
  const renderColumnContextMenu = useCallback((menuProps, { cellProps }) => {
    menuProps.items = menuProps.items.concat([
      {
        label: 'Custom item for "' + cellProps.name + '"',
        onClick: () => {
          console.log({
            title: 'Custom notification for column ' + cellProps.name,
            content: 'Column context menu item clicked',
          });
          menuProps.onDismiss();
        },
      },
      {
        label: 'Another custom menu item',
        onClick: () => {
          console.log({
            title: 'Custom notification for column ' + cellProps.name,
            content: 'Second custom column context menu item clicked!!!',
          });
          menuProps.onDismiss();
        },
      },
    ]);
  }, []);

  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        renderColumnContextMenu={renderColumnContextMenu}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
