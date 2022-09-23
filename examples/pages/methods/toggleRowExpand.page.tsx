import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import Button from '@inovua/reactdatagrid-community/packages/Button';

import people from '../people';
import flags from '../flags';
import NumericInput from '@inovua/reactdatagrid-community/packages/NumericInput';

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
  const [index, setIndex] = useState();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <NumericInput
          style={{ width: 100 }}
          theme="default-dark"
          value={index}
          onChange={setIndex}
        />
        <Button
          style={{ marginLeft: 20 }}
          onClick={() => {
            gridRef.current.setActiveIndex(index);
          }}
        >
          Set active index
        </Button>
      </div>
      <Button
        style={{ marginBottom: 20 }}
        disabled={activeIndex === undefined}
        onClick={() => gridRef.current.toggleRowExpand(activeIndex)}
      >
        Toggle expand for active row
      </Button>
      <ReactDataGrid
        onReady={setGridRef}
        idProperty="id"
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
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
