import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import renderSortTool from '@inovua/reactdatagrid-community/Layout/ColumnLayout/Cell/renderSortTool';

const columns = [
  {
    name: 'name',
    sortName: 'hello',
    header: 'Name',
    minWidth: 50,
    defaultFlex: 2,
  },
  {
    name: 'age',
    sortName: 'world',
    header: 'Age',
    maxWidth: 1000,
    defaultFlex: 1,
  },
];

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
  return (
    <ReactDataGrid
      idProperty="id"
      columns={columns}
      dataSource={dataSource}
      style={gridStyle}
      defaultSortInfo={[]}
      renderSortTool={(direction, extraProps) => {
        const { computedSortInfo, sortedColumnsInfo } = extraProps;
        if (direction != null) {
          console.log('renderSortTool', {
            direction,
            computedSortInfo,
            sortedColumnsInfo,
          });
        }
        return renderSortTool(
          {
            direction,
            sortable: true,
            size: undefined,
            renderSortTool: undefined,
          },
          extraProps
        );
      }}
    />
  );
};

export default () => <App />;
