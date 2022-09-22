import React, { useState, useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import people from '../people';
import flags from '../flags';

const gridStyle = { minHeight: 550 };

const renderRowDetails = ({ data }) => {
  return (
    <div style={{ padding: 20 }}>
      <h3>Row details:</h3>
      <table>
        <tbody>
          {Object.keys(data).map(name => {
            return (
              <tr key={name}>
                <td>{name}</td>
                <td>{data[name]}</td>
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
    render: ({ value }) => (flags[value] ? flags[value] : value),
  },
  { name: 'city', header: 'City', defaultFlex: 1 },
  { name: 'age', header: 'Age', defaultFlex: 1, type: 'number' },
];

const App = () => {
  const [gridRef, setGridRef] = useState(null);
  const [activeIndex, setActiveIndex] = useState();
  const [activeRowId, setActiveRowId] = useState();
  const [activeRowExpanded, setActiveRowExpanded] = useState();

  const onActiveIndexChange = useCallback(index => {
    const rowId = gridRef.current.getItemId(gridRef.current.getItemAt(index));

    setActiveIndex(index);
    setActiveRowId(rowId);
    setActiveRowExpanded(gridRef.current.isRowExpandedById(rowId));
  }, []);

  const onExpandedRowsChange = useCallback(
    ({ expandedRows }) => {
      if (expandedRows) {
        setActiveRowExpanded(!!expandedRows[activeRowId]);
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
