import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const columns = [
  {
    defaultSortingDirection: 'desc',
    name: 'id',
    header: 'Id',
    type: 'number',
    flex: 1,
  },
  {
    name: 'firstName',
    header: 'First Name',
    flex: 1,
    defaultSortingDirection: 'asc',
  },
  { name: 'lastName', header: 'Last Name', flex: 1 },
  { name: 'email', header: 'Email', groupBy: false, flex: 1 },
];

const dataSource = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Wick',
    email: 'puppy.lover@gmail.com',
  },
  {
    id: 2,
    firstName: 'Harry',
    lastName: 'Potter',
    email: 'i.am.a.wizard@hotmail.com',
  },
  {
    id: 3,
    firstName: 'Dom',
    lastName: 'Toretto',
    email: '2fast@protonmail.com',
  },
];

const App = () => {
  return (
    <ReactDataGrid
      columns={columns}
      dataSource={dataSource}
      defaultSortingDirection="asc"
    />
  );
};

export default () => <App />;
