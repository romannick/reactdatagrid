import React, { useState, useCallback, useRef } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags, { FlagsType } from '../flags';

const gridStyle = { minHeight: 550 };

const renderRowDetails = ({ data }: { data: object }) => {
  return (
    <div style={{ padding: 20 }}>
      <h3>Row details:</h3>
      <table>
        <tbody>
          {Object.keys(data).map(name => {
            return (
              <tr key={name}>
                <td>{name}</td>
                <td>{data[name as keyof object]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultWidth: 80,
    type: 'number',
  },
  { name: 'name', header: 'Name', defaultFlex: 1 },
  {
    name: 'country',
    header: 'County',
    defaultFlex: 1,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType] ? flags[value as keyof FlagsType] : value,
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const App = () => {
  const [gridRef, setGridRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState();
  const [activeRowId, setActiveRowId] = useState();
  const [activeRowExpanded, setActiveRowExpanded] = useState();

  const propsRef: any = useRef(null);
  propsRef.current = gridRef && (gridRef as any).current;

  const onActiveIndexChange = useCallback(
    index => {
      console.log(propsRef);
      const item = propsRef.current.getItemAt(index);
      const rowId = propsRef.current.getItemId(item);

      setActiveIndex(index);
      setActiveRowId(rowId);
      setActiveRowExpanded(propsRef.current.isRowExpanded(item));
    },
    [gridRef]
  );

  const onExpandedRowsChange = useCallback(
    ({ expandedRows }) => {
      if (expandedRows) {
        setActiveRowExpanded(!!expandedRows[activeRowId!] as any);
      }
    },
    [activeRowId]
  );

  return (
    <div>
      {activeIndex == null ? null : (
        <p>
          Active row: {activeIndex}. The row is{' '}
          {activeRowExpanded ? 'expanded' : 'collapsed'}.
        </p>
      )}
      <ReactDataGrid
        onReady={setGridRef}
        idProperty="id"
        activeIndex={activeIndex}
        onActiveIndexChange={onActiveIndexChange}
        onExpandedRowsChange={onExpandedRowsChange}
        style={gridStyle}
        rowExpandHeight={400}
        renderRowDetails={renderRowDetails}
        columns={columns}
        dataSource={people}
      />
    </div>
  );
};

export default () => <App />;
