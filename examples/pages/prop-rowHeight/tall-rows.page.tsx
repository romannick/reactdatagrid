import { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const columns = (tallRows: boolean) => {
  return [
    {
      name: 'name',
      header: 'Name',
      minWidth: 50,
      defaultFlex: 2,
      render: ({ value }: { value: string }) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {tallRows && (
              <div
                style={{
                  width: '20px',
                  height: '80px',
                  backgroundColor: 'red',
                }}
              />
            )}
            {value}
          </div>
        );
      },
    },
    { name: 'age', header: 'Age', maxWidth: 1000, defaultFlex: 1 },
  ];
};

const gridStyle = { minHeight: 550 };

const dataSource = [
  { id: 1, name: 'John McQueen', age: 35 },
  { id: 2, name: 'Mary Stones', age: 25 },
  { id: 3, name: 'Robert Fil', age: 27 },
  { id: 4, name: 'Roger Robson', age: 81 },
  { id: 5, name: 'Billary Konwik', age: 18 },
  { id: 6, name: 'Bob Martin', age: 18 },
  { id: 7, name: 'Matthew Richardson', age: 54 },
  { id: 8, name: 'Ritchie Peterson', age: 54 },
  { id: 9, name: 'Bryan Martin', age: 40 },
  { id: 10, name: 'Mark Martin', age: 44 },
  { id: 11, name: 'Michelle Sebastian', age: 24 },
  { id: 12, name: 'Michelle Sullivan', age: 61 },
  { id: 13, name: 'Jordan Bike', age: 16 },
  { id: 14, name: 'Nelson Ford', age: 34 },
  { id: 15, name: 'Tim Cheap', age: 3 },
  { id: 16, name: 'Robert Carlson', age: 31 },
  { id: 17, name: 'Johny Perterson', age: 40 },
];

const App = () => {
  const [tallRows, setTallRows] = useState(false);

  const rowHeights = dataSource.reduce(
    (acc: { [key: number]: number }, current) => {
      acc[current.id] = tallRows ? 80 : 40;
      return acc;
    },
    []
  );

  return (
    <div>
      <button
        style={{ marginBottom: '20px' }}
        onClick={() => setTallRows(t => !t)}
      >
        {tallRows ? 'Set normal row height' : 'Set tall row height'}
      </button>
      <ReactDataGrid
        idProperty="id"
        columns={columns(tallRows)}
        dataSource={dataSource}
        style={gridStyle}
        // TS won't let me use null here, it will locally and is defined as a valid value in this doc:
        // https://reactdatagrid.io/docs/performance-and-virtualization#flexible-or-natural-row-height
        // rowHeight={undefined}
        // minRowHeight={40}
        // virtualized={false}
        rowHeights={rowHeights}
      />
    </div>
  );
};

export default () => <App />;
