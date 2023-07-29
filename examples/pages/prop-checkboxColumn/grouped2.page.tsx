import React, { useState, useCallback } from 'react';

import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

const gridStyle = { minHeight: 600, marginTop: 10 };

let cities: any;

const sum = (a: number, b: number) => a + b;

const columns = [
  { name: 'name', defaultFlex: 1, header: 'City' },
  { name: 'country', defaultFlex: 1, header: 'Country' },
  { name: 'code', defaultFlex: 1, header: 'Code' },
  {
    name: 'population',
    type: 'number',
    defaultFlex: 1,
    header: 'Population',

    render: ({ value, data }: { value: any; data: any }) => {
      // if you want to custom-render the summary value for this column
      // you can do so

      return data.__group ? (
        <React.Fragment>
          <div>
            <b>Total: </b>
            {value}{' '}
          </div>
        </React.Fragment>
      ) : (
        value
      );
    },

    groupSummaryReducer: {
      initialValue: 0,
      reducer: sum,
    },
  },
];

const App = () => {
  const [showGroupColumn] = useState(true);
  const [selected, setSelected] = useState({});

  const renderGroupTitle = useCallback((value, { data }) => {
    let summary = null;

    if (data.groupColumnSummary) {
      summary = (
        <div>
          <div>Total Population?: {data.groupColumnSummary.population}</div>{' '}
        </div>
      );
    }

    return (
      <div>
        {value}
        {summary}
      </div>
    );
  }, []);

  const handleSelectionChange = useCallback(config => {
    console.log('config', config);
    setSelected({ ...config.selected });
  }, []);
  return (
    <div>
      <h3>
        Showing population column summary with custom group title renderer
      </h3>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        groupColumn={showGroupColumn}
        columns={columns}
        dataSource={cities}
        defaultGroupBy={['country', 'code']}
        renderGroupTitle={renderGroupTitle}
        checkboxColumn
        selected={selected}
        columnUserSelect
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
};

cities = [
  {
    id: 'ny',
    country: 'USA',
    name: 'New York City',
    code: 'ny',
    population: 1000,
  },
  {
    id: 'ny2',
    country: 'USA',
    name: 'New York City 2',
    code: 'ny',
    population: 2000,
  },
  {
    id: 'la',
    country: 'USA',
    name: 'Los Angeles',
    code: 'la',
    population: 150,
  },
  {
    id: 'paris',
    country: 'France',
    name: 'Paris',
    code: 'paris',
    population: 2000,
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    code: 'london',
    population: 3000,
  },
  {
    id: 'SF',
    name: 'San Francisco',
    country: 'USA',
    code: 'SF',
    population: 3900,
  },
  {
    id: 'ly',
    name: 'Lyon',
    country: 'France',
    code: 'ly',
    population: 980,
  },
  {
    id: 'ma',
    name: 'Manchester',
    country: 'UK',
    population: 2000,
  },
];

export default () => <App />;
