import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import Button from '@inovua/reactdatagrid-community/packages/Button';
import NumericInput from '@inovua/reactdatagrid-community/packages/NumericInput';

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
  const [index, setIndex] = useState();
  1;

  const numericInputProps = {
    value: index,
    onChange: setIndex,
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <NumericInput {...numericInputProps} />
        <Button
          style={{ marginLeft: 20 }}
          onClick={() => {
            (gridRef as any).current.setActiveIndex(index);
          }}
        >
          Set active index
        </Button>
      </div>
      <div style={{ marginBottom: 20 }}>
        <Button
          style={{ marginRight: 20 }}
          disabled={activeIndex === undefined}
          onClick={() =>
            (gridRef as any).current.setRowExpandedAt(activeIndex, true)
          }
        >
          Expand active row
        </Button>
        <Button
          style={{ marginRight: 20 }}
          disabled={activeIndex === undefined}
          onClick={() =>
            (gridRef as any).current.setRowExpandedAt(activeIndex, false)
          }
        >
          Collapse active row
        </Button>
      </div>
      <ReactDataGrid
        onReady={setGridRef}
        idProperty="id"
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
