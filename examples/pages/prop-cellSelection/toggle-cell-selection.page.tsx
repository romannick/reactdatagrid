import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const defaultCellSelection = { '2,name': true };

const columns = [
  { name: 'id', type: 'number', header: 'Id', defaultVisible: false },
  { name: 'firstName', defaultFlex: 1, header: 'First Name' },
  {
    name: 'country',
    defaultFlex: 1,
    header: 'Country',
    render: ({ value }: { value: string }) =>
      (flags as any)[value] ? (flags as any)[value] : value,
  },
  { name: 'age', type: 'number', defaultFlex: 1, header: 'Age' },
];

const App = () => {
  const [toggleCellSelectOnClick, setToggleCellSelectOnClick] = useState(true);

  return (
    <div>
      <div>
        <CheckBox
          checked={toggleCellSelectOnClick}
          onChange={setToggleCellSelectOnClick}
        >
          Toggle cell select on click
        </CheckBox>
      </div>
      <p>
        When clicking a cell it becomes both the active cell & the selected
        cell. Make sure you notice the difference in styling when both are
        applied.
      </p>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        multiSelect={false}
        toggleCellSelectOnClick={toggleCellSelectOnClick}
        defaultCellSelection={defaultCellSelection}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
