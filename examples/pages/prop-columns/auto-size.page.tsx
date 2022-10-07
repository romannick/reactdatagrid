import React, { useState, useCallback, RefObject, CSSProperties } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';
import Button from '@inovua/reactdatagrid-community/packages/Button';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';
import {
  IColumn,
  TypeComputedProps,
} from '@inovua/reactdatagrid-community/types';

const gridStyle: CSSProperties = { minHeight: 550 };

const columns: IColumn = [
  {
    name: 'id',
    header: 'Id',
    defaultWidth: 60,
    type: 'number',
    resizable: false,
  },
  { name: 'name', header: 'Name', defaultWidth: 100 },
  {
    name: 'country',
    header: 'Country',
    defaultWidth: 100,
    resizable: false,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', header: 'City', defaultWidth: 120 },
  { name: 'age', header: 'Age', defaultWidth: 100, type: 'number' },
];

const App = () => {
  const [gridRef, setGridRef] = useState<RefObject<TypeComputedProps>>();
  const [skipSortTool, setSkipSortTool] = useState<boolean>(true);
  const [sortable, setSortable] = useState<boolean>(true);

  const setColumnsSizesAuto = useCallback(
    (skipHeader: boolean, skipSortTool: boolean): void => {
      if (gridRef!.current!.setColumnsSizesAuto) {
        gridRef!.current!.setColumnsSizesAuto({
          skipHeader,
          skipSortTool,
        });
      }
    },
    [gridRef]
  );

  return (
    <div>
      <h3>Grid with auto size</h3>

      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={skipSortTool} onChange={setSkipSortTool}>
          Skip sort tool
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={sortable} onChange={setSortable}>
          Sortable
        </CheckBox>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Button
          onClick={() => {
            if (gridRef!.current!.setColumnSizesToFit) {
              gridRef!.current!.setColumnSizesToFit();
            }
          }}
        >
          Set column sizes to fit
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Button
          onClick={() => {
            if (gridRef!.current!.setColumnSizeAuto) {
              gridRef!.current!.setColumnSizeAuto('name');
            }
          }}
        >
          Set 'name' column size auto
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Button onClick={() => setColumnsSizesAuto(false, skipSortTool)}>
          Set column sizes auto
        </Button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Button onClick={() => setColumnsSizesAuto(true, skipSortTool)}>
          Set column sizes auto (skipHeader)
        </Button>
      </div>

      <ReactDataGrid
        idProperty="id"
        handle={setGridRef}
        style={gridStyle}
        columns={columns}
        dataSource={people}
        enableColumnAutosize
        defaultGroupBy={[]}
        sortable={sortable}
        renderSortTool={() => (
          <div style={{ position: 'absolute', width: 0, height: 0 }}></div>
        )}
      />
    </div>
  );
};

export default () => <App />;
