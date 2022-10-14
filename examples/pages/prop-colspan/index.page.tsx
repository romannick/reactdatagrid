import React, { useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-community';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';

const gridStyle = { minHeight: 850 };
const modeList = [
  { id: 0, label: 'AND' },
  { id: 1, label: 'OR' },
  { id: 2, label: 'NOT' },
];
const columns = [
  { name: 'channel', header: 'Channel', minWidth: 50, defaultFlex: 1 },
  {
    name: 'mode0',
    header: 'Level 0',
    defaultFlex: 1,
    width: 100,
    render: ({ value }: { value: number }) => modeList[value].label,
    rowspan: ({ data }: { data: { id: number } }) => {
      return data.id % 2 ? 1 : 2;
    },
  },
  {
    name: 'mode1',
    header: 'Level 1',
    defaultFlex: 1,
    width: 100,
    render: ({ value }: { value: number }) => modeList[value].label,
    rowspan: ({ data }: { data: { id: number } }) => {
      return data.id % 4 ? 1 : 4;
    },
  },
  {
    name: 'mode2',
    header: 'Level 2',
    defaultFlex: 1,
    width: 100,
    render: ({ value }: { value: number }) => modeList[value].label,
    rowspan: ({ data }: { data: { id: number } }) => {
      return data.id % 2 ? 1 : 2;
    },
  },
];

const dS = [
  { id: 0, channel: 'CH-0', mode0: 0, mode1: 1, mode2: 2 },
  { id: 1, channel: 'CH-1', mode0: 0, mode1: 1, mode2: 2 },
  { id: 2, channel: 'CH-2', mode0: 0, mode1: 1, mode2: 2 },
  { id: 3, channel: 'CH-3', mode0: 0, mode1: 1, mode2: 2 },
  { id: 4, channel: 'CH-4', mode0: 0, mode1: 1, mode2: 2 },
  { id: 5, channel: 'CH-5', mode0: 0, mode1: 1, mode2: 2 },
  { id: 6, channel: 'CH-6', mode0: 0, mode1: 1, mode2: 2 },
  { id: 7, channel: 'CH-7', mode0: 0, mode1: 1, mode2: 2 },
  { id: 8, channel: 'CH-8', mode0: 0, mode1: 1, mode2: 2 },
  { id: 9, channel: 'CH-9', mode0: 0, mode1: 1, mode2: 2 },
  { id: 10, channel: 'CH-10', mode0: 0, mode1: 1, mode2: 2 },
  { id: 11, channel: 'CH-11', mode0: 0, mode1: 1, mode2: 2 },
  { id: 12, channel: 'CH-12', mode0: 0, mode1: 1, mode2: 2 },
  { id: 13, channel: 'CH-13', mode0: 0, mode1: 1, mode2: 2 },
  { id: 14, channel: 'CH-14', mode0: 0, mode1: 1, mode2: 2 },
  { id: 15, channel: 'CH-15', mode0: 0, mode1: 1, mode2: 2 },
];

function App() {
  const [showHoverRows, setShowHoverRows] = useState<boolean>(true);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <CheckBox checked={showHoverRows} onChange={setShowHoverRows}>
          Show hover effect for rows
        </CheckBox>
      </div>

      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        columns={columns}
        dataSource={dS}
        showHoverRows={showHoverRows}
      />
    </div>
  );
}

export default App;
