import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const columns = [
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'live', header: 'Live', defaultWidth: 60 },
];

const gridStyle = { minHeight: 550 };

const dataSource = [
  {
    id: 1,
    name: 'Show',
    nodes: [
      {
        id: 1,
        name: 'Series',
        nodes: [
          {
            id: 1,
            name: 'Season 1',
            nodes: [
              {
                id: 1,
                name: 'Episode 1',
                live: 'yes',
              },
              {
                id: 2,
                name: 'Episode 2',
                live: 'yes',
              },
            ],
          },
          {
            id: 2,
            name: 'Season 2',
            nodes: [
              {
                id: 1,
                name: 'Episode 1',
                live: 'yes',
                nodes: [
                  {
                    id: 1,
                    name: 'Part - 1',
                    live: 'yes',
                  },
                  {
                    id: 2,
                    name: 'Part - 2',
                    live: 'yes',
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const App = () => {
  return (
    <ReactDataGrid
      idProperty="id"
      columns={columns}
      dataSource={dataSource}
      style={gridStyle}
      checkboxColumn
      treeColumn="name"
      treeGridChildrenSelectionEnabled={true}
      treeGridChildrenDeselectionEnabled={true}
      defaultExpandedNodes={{
        1: true,
        '1/1': true,
        '1/1/1': true,
        '1/1/2': true,
        '1/1/2/1': true,
      }}
    />
  );
};

export default () => <App />;
