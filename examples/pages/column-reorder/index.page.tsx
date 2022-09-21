import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

const columns = [
  {
    name: 'id',
    type: 'number',
    defaultWidth: 80,
    hedaer: 'Id',
    defaultVisible: false,
  },
  {
    name: 'firstName',
    group: 'personalInfo',
    defaultFlex: 1,
    header: 'First Name',
  },
  { name: 'age', group: 'personalInfo', type: 'number', header: 'Age' },
  { name: 'email', group: 'contactInfo', defaultFlex: 1, header: 'Email' },
  { name: 'phone', group: 'contactInfo', header: 'Phone' },
  { name: 'city', group: 'location', header: 'City' },
  {
    name: 'streetName',
    group: 'street',
    defaultFlex: 1,
    header: 'Street name',
  },
  { name: 'streetNo', group: 'street', type: 'number', header: 'Street no' },
];
const groups = [
  { name: 'street', group: 'location', header: 'Street' },
  { name: 'personalInfo', header: 'Personal info' },
  { name: 'contactInfo', header: 'Contact info' },
  { name: 'location', header: 'Location' },
];

const dataSource = [
  {
    id: 0,
    firstName: 'Bob',
    age: 25,
    email: 'bobby@whocares.com',
    phone: '+7403 456 768',
    city: 'Paris',
    streetName: 'Champs Elysee',
    streetNo: 34,
  },
  {
    id: 1,
    firstName: 'Lynda',
    age: 38,
    email: 'lynda@idont.com',
    phone: '+7103 66 98 768',
    city: 'London',
    streetName: 'St Mary',
    streetNo: 14,
  },
  {
    id: 2,
    firstName: 'Richard',
    age: 18,
    email: 'richy@rich.com',
    phone: '+173 668 08 83',
    city: 'Manchester',
    streetName: 'St Robert',
    streetNo: 53,
  },
  {
    id: 3,
    firstName: 'Michael',
    age: 45,
    email: 'mike@mikey.com',
    phone: '+075 0628 156 74',
    city: 'Los Angeles',
    streetName: 'Greenfield',
    streetNo: 24,
  },
  {
    id: 4,
    firstName: 'Martin',
    age: 12,
    email: 'martin@bobson.com',
    phone: '+173 5624 675 462',
    city: 'San Jose',
    streetName: 'Patrick Ball',
    streetNo: 67,
  },
];
const gridStyle = { minHeight: 500 };

const App = () => {
  const [allowGroupSplitOnReorder, setAllowGroupSplitOnReorder] = useState(
    false
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p>Try dragging columns to break up some groups.</p>
        <CheckBox
          checked={allowGroupSplitOnReorder}
          onChange={setAllowGroupSplitOnReorder}
        >
          Allow group split on reorder
        </CheckBox>
      </div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columnMinWidth={100}
        columns={columns}
        groups={groups}
        allowGroupSplitOnReorder={allowGroupSplitOnReorder}
        dataSource={dataSource}
      />
    </div>
  );
};

export default () => <App />;
