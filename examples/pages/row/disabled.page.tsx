import React, { useState, useRef, RefObject } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';
import { TypeComputedProps } from '@inovua/reactdatagrid-community/types';

const gridStyle = { minHeight: 550 };

const columns = [
  { name: 'id', header: 'Id', defaultVisible: false, resizable: false },
  { name: 'name', header: 'Name', defaultFlex: 1, sortable: false },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultWidth: 100, type: 'number' },
];

const toArray = (
  selected: { [key: string]: boolean } | boolean,
  dataMap: null | { [key: string]: any }
) => {
  const keysObject = selected === true ? dataMap : selected;
  return Object.keys(keysObject!).map((key: string) => Number(key));
};

const disabledRows: { [key: string]: boolean } | null = {
  6: true,
  7: true,
  10: true,
};

const App = () => {
  const [controlledSelection, setControlledSelection] = useState<boolean>(true);
  const [selected, setSelected] = useState<
    { [key: string]: boolean } | boolean
  >({
    2: true,
    4: true,
  });

  const gridRef = useRef<TypeComputedProps | null>(null);

  const handleSelection = ({
    selected,
  }: {
    selected: { [key: string]: boolean } | boolean;
  }) => {
    setSelected(selected);
  };

  const dataMap: null | { [key: string]: any } = gridRef?.current?.dataMap
    ? gridRef.current.dataMap
    : null;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox
          checked={controlledSelection}
          onChange={setControlledSelection}
        >
          Controlled selection
        </CheckBox>
      </div>

      <ReactDataGrid
        idProperty="id"
        handle={(ref: RefObject<null>) =>
          (gridRef.current = ref ? ref.current : null)
        }
        style={gridStyle}
        columns={columns}
        dataSource={people}
        checkboxColumn
        pagination
        selected={controlledSelection ? selected : undefined}
        onSelectionChange={controlledSelection ? handleSelection : undefined}
        disabledRows={disabledRows}
      />
      <p>Selected rows: {JSON.stringify(toArray(selected, dataMap))}.</p>
    </div>
  );
};

export default () => <App />;
