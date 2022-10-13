import React, { RefObject, useRef, useState } from 'react';

import ReactDataGrid from '../../../enterprise-edition';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

import people from '../people';
import Button from '@inovua/reactdatagrid-community/packages/Button';
import { TypeComputedProps } from '@inovua/reactdatagrid-community/types';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    defaultWidth: 80,
    groupBy: false,
  },
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'country', header: 'Country', defaultWidth: 150 },
  { name: 'city', header: 'City', defaultWidth: 150 },
  { name: 'age', header: 'Age', defaultWidth: 100, type: 'number' },
  { name: 'email', header: 'Email', defaultWidth: 150, defaultFlex: 1 },
];

const App = () => {
  const gridRef = useRef<TypeComputedProps | null>(null);

  const [stickyGroupRows, setStickyGroupRows] = useState<boolean>(false);
  const [
    allowRowReorderBetweenGroups,
    setAllowRowReorderBetweenGroups,
  ] = useState<boolean>(true);
  const [smallGrid, setSmallGrid] = useState<boolean>(false);

  const onGroupRowReorderStart = ({
    data,
    dragIndex,
    dragGroup,
  }: {
    data: any;
    dragIndex: number;
    dragGroup: string;
  }) => {
    console.log('drag start', dragIndex, dragGroup, data);
  };

  const onGroupRowReorderEnd = ({
    data,
    dropIndex,
    dropGroup,
  }: {
    data: any;
    dropIndex: number;
    dropGroup: string;
  }) => {
    console.log('drag end', dropIndex, dropGroup, data);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={stickyGroupRows} onChange={setStickyGroupRows}>
          Use sticky group rows
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox
          checked={allowRowReorderBetweenGroups}
          onChange={setAllowRowReorderBetweenGroups}
        >
          AllowRowReorderBetweenGroups
        </CheckBox>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Button
          onClick={() => {
            gridRef?.current?.setItemAt(
              2,
              { country: 'usa' },
              { replace: false }
            );
          }}
        >
          Set group by country
        </Button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={smallGrid} onChange={setSmallGrid}>
          Small grid
        </CheckBox>
      </div>
      <ReactDataGrid
        idProperty="id"
        handle={(ref: RefObject<TypeComputedProps | null>) =>
          (gridRef.current = ref ? ref.current : null)
        }
        style={{ minHeight: smallGrid ? 450 : 750 }}
        stickyGroupRows={stickyGroupRows}
        defaultGroupBy={['country']}
        columns={columns}
        dataSource={people}
        rowReorderColumn
        allowRowReorderBetweenGroups={allowRowReorderBetweenGroups}
        onGroupRowReorderStart={onGroupRowReorderStart}
        onGroupRowReorderEnd={onGroupRowReorderEnd}
      />
    </div>
  );
};

export default () => <App />;
