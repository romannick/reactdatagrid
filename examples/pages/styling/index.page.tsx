import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import React, { useState } from 'react';
import { CellProps } from '@inovua/reactdatagrid-community/types';

type DataSource = {
  [key: string]: { id: string; name: string; metricValue: number }[];
};

const dataSources: DataSource = {
  sourceA: [
    { id: 'row 1', name: 'row 1', metricValue: 5 },
    { id: 'row 2', name: 'row 2', metricValue: 8 },
  ],
  sourceB: [
    { id: 'row 1', name: 'row 1', metricValue: 10 },
    { id: 'row 2', name: 'row 2', metricValue: 15 },
  ],
};

function App() {
  const [filter, setFilter] = useState('sourceA');

  const dataSource = React.useMemo(() => {
    return dataSources[filter as keyof DataSource];
  }, [filter]);

  const columns = React.useMemo(() => {
    // intend to style cells based on dataSource's metricValues range, e.g. if we want to use d3 color scale
    // to determine the background color.

    const styleFunc = (cellProps: CellProps) => {
      // will still refer to old values first before the latest data source eventually propagates
      // this might cause discrepancy if the color scale is already updated based on the new data source, but attempts to read older values
      console.log('cellProps+++');
      console.log(cellProps.dataSourceChange, cellProps.columnsChange);

      const { value } = cellProps;
      console.log(value);
    };
    return [
      {
        name: 'id',
        header: 'id',
      },
      {
        name: 'metricValue',
        header: 'metricValue',
        style: styleFunc,
      },
    ];
  }, [dataSource]);

  // just a basic toggle
  function Filter({ value }: { value: string }) {
    const style = {
      marginTop: 8,
      marginBottom: 8,
      padding: 8,
      backgroundColor: '#6d7087',
      color: '#fafafa',
      letterSpacing: '0.2rem',
      cursor: 'pointer',
      borderRadius: 4,
    };
    return (
      <div style={style} onClick={() => setFilter(value)}>
        {value}
      </div>
    );
  }

  return (
    <div>
      <div>
        <Filter value="sourceA" />
        <Filter value="sourceB" />
      </div>
      <ReactDataGrid
        // rowHeight={null}
        // minRowHeight={35}
        idProperty="id"
        columns={columns}
        dataSource={dataSource}
        style={{ width: '100%' }}
        showColumnMenuTool={false}
        showZebraRows={false}
      />
    </div>
  );
}

export default App;

// export default function App() {
//   return (
//     <div className="App">
//       <ReactGridIssue />
//     </div>
//   );
// }
