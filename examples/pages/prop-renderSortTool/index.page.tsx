import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const gridStyle = { minHeight: 600, marginTop: 10 };

let cities = [
  {
    id: 'ny',
    country: 'USA',
    name: 'New York City',
    population: 1000,
  },
  {
    id: 'la',
    country: 'USA',
    name: 'Los Angeles',
    population: 150,
  },
  {
    id: 'paris',
    country: 'France',
    name: 'Paris',
    population: 2000,
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    population: 3000,
  },
  {
    id: 'SF',
    name: 'San Francisco',
    country: 'USA',
    population: 3900,
  },
  {
    id: 'ly',
    name: 'Lyon',
    country: 'France',
    population: 980,
  },
  {
    id: 'ma',
    name: 'Manchester',
    country: 'UK',
    population: 2000,
  },
];

const columns = [
  { name: 'name', defaultFlex: 1, header: 'City' },
  { name: 'country', defaultFlex: 1, header: 'Country' },
  {
    name: 'population',
    type: 'number',
    defaultFlex: 1,
    header: 'Population',
  },
];

const renderSortTool = (direction: any, extraProps: any) => {
  if (!direction) return null;
  console.log('direction', direction);
  console.log('sortedColumnsInfo', extraProps.sortedColumnsInfo);
  console.log('computedSortInfo', extraProps.computedSortInfo);
  return 'SORT';
};

const defaultSortInfo = [{ name: 'population', dir: 1 }];

const App = () => {
  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columns={columns}
        dataSource={cities}
        defaultSortInfo={defaultSortInfo}
        renderSortTool={renderSortTool}
      />
    </div>
  );
};

export default () => <App />;
