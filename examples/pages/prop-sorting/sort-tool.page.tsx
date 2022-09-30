import React from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import flags, { FlagsType } from '../flags';
import Arrow from './Arrow';

const arrowStyle = {
  display: 'block',
  marginBottom: 2,
};

const defaultStyle = {
  display: 'inline-block',
  marginRight: 5,
  marginLeft: 5,
  width: 8,
  verticalAlign: 'middle',
};

const SortIndicator = ({ direction }: { direction: number }) => {
  return (
    <div style={defaultStyle}>
      {direction === -1 ? (
        <Arrow type="activeUp" style={arrowStyle} />
      ) : (
        <Arrow type="up" style={arrowStyle} />
      )}
      {direction === 1 ? (
        <Arrow type="activeDown" style={arrowStyle} />
      ) : (
        <Arrow type="down" style={arrowStyle} />
      )}
    </div>
  );
};

const renderHeader = ({ children, id }: { children: any; id: string }) => {
  if (id === 'age') {
    // for age column, keep the sort arrows to the end
    return children;
  }
  return children.reverse(); // reverse the order
};

const columns = [
  { name: 'id', header: 'ID - unsortable', sortable: false, defaultWidth: 120 },
  { name: 'firstName', header: 'First Name', defaultFlex: 1, renderHeader },
  { name: 'lastName', header: 'Last Name', defaultFlex: 1, renderHeader },
  {
    name: 'country',
    header: 'Country',
    defaultWidth: 100,
    renderHeader,
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType]
        ? flags[value as keyof FlagsType]
        : 'unknown',
  },
  {
    id: 'fullName',
    header: 'Full Name',
    sortable: false,
    minWidth: 50,
    defaultFlex: 1,
    render: ({ data }: { data: { firstName: string; lastName: string } }) =>
      data.firstName + ' ' + data.lastName,
  },
  {
    name: 'age',
    header: 'Age',
    type: 'number',
    renderHeader,
    defaultWidth: 80,
    render: ({ value }: { value: number }) => (
      <span style={{ color: value < 30 ? 'green' : 'inherit' }}>{value}</span>
    ),
  },
];

const renderSortTool = (direction: number) => {
  return <SortIndicator direction={direction} />;
};

const dataSource = [
  { firstName: 'John', lastName: 'Grayner', country: 'usa', age: 35, id: 0 },
  { firstName: 'Mary', lastName: 'Stones', country: 'ca', age: 25, id: 1 },
  { firstName: 'Robert', lastName: 'Fil', country: 'uk', age: 27, id: 2 },
  { firstName: 'Bob', lastName: 'Fisher', country: 'usa', age: 72, id: 3 },
  { firstName: 'Michael', lastName: 'Rogers', country: 'usa', age: 45, id: 4 },
  { firstName: 'Hilly', lastName: 'Bobson', country: 'uk', age: 5, id: 5 },
  { firstName: 'Mike', lastName: 'Brind', country: 'ca', age: 15, id: 6 },
  { firstName: 'Carl', lastName: 'Phancer', country: 'ca', age: 56, id: 7 },
  { firstName: 'Victory', lastName: 'Hope', country: 'uk', age: 52, id: 8 },
];

const gridStyle = { minHeight: 550 };
const defaultSortInfo = { name: 'lastName', dir: 1 };

export default () => (
  <ReactDataGrid
    idProperty="id"
    columns={columns}
    style={gridStyle}
    defaultSortInfo={defaultSortInfo}
    renderSortTool={renderSortTool}
    dataSource={dataSource}
  />
);
