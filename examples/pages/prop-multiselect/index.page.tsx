import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const toArray = (selected: { [key: string]: boolean }) =>
  Object.keys(selected).map((id: string): number => Number(id));

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultWidth: 60,
    type: 'number',
  },
  { name: 'name', header: 'Name', defaultFlex: 1 },
  {
    name: 'country',
    header: 'Country',
    defaultFlex: 1,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const App = () => {
  const [selected, setSelected] = useState({ 5: true, 1: true });

  const onSelectionChange = useCallback(({ selected }) => {
    setSelected(selected);
  }, []);

  return (
    <div>
      <h3>Multiple row selection with default selection - uncontrolled</h3>
      <ReactDataGrid
        idProperty="id"
        defaultSelected={selected}
        onSelectionChange={onSelectionChange}
        style={gridStyle}
        columns={columns}
        dataSource={people}
        enableCellSelection
        // defaultCellSelection={[]}
      />
      <p>Selected rows: {JSON.stringify(toArray(selected))}.</p>
    </div>
  );
};

export default () => <App />;
