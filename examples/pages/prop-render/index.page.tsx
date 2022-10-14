import React, { useEffect, useRef, useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import flags, { FlagsType } from '../flags';
import people, { People, PeopleType } from '../people';

const gridStyle = { height: 500 };

const City = (props: { data: PeopleType; value: string }) => {
  const { data, value } = props;

  const [city, setCity] = useState<string | null>(null);
  const colorRef = useRef<string | undefined>();

  useEffect(() => {
    if (value) {
      setCity(value);
    }

    if (data.age > 30) {
      colorRef.current = '#48b146';
    }
  }, [data, value]);

  return (
    <div style={{ color: colorRef ? colorRef.current : '#9ba7b4' }}>
      {city ? city : 'No city'}
    </div>
  );
};

const columns = [
  { name: 'id', header: 'Id', defaultVisible: false, type: 'number' },
  { name: 'name', defaultFlex: 1, minWidth: 100, header: 'Name' },
  {
    name: 'country',
    header: 'Country',
    defaultWidth: 100,
    textAlign: 'center',
    render: ({ value }: { value: string }) =>
      flags[value as keyof FlagsType]
        ? flags[value as keyof FlagsType]
        : 'unknown',
  },
  {
    name: 'city',
    defaultFlex: 1,
    minWidth: 100,
    header: 'City',
    render: City,
  },
  {
    name: 'age',
    header: 'Age',
    defaultWidth: 80,
    render: ({ value }: { value: number }) => (
      <span style={{ color: value < 30 ? '#7986cb' : 'inherit' }}>{value}</span>
    ),
  },
];

export default () => (
  <ReactDataGrid
    idProperty="id"
    columns={columns}
    dataSource={people as People}
    style={gridStyle}
  />
);
