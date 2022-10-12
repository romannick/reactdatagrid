import React, { useState, useCallback } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';
import Button from '@inovua/reactdatagrid-community/packages/Button';

const DATA_SOURCE = [
  { id: 'ke5764', name: 'Manny', city: 'Los Angeles' },
  { id: 'af3165', name: 'Moe', city: 'New York' },
  { id: 'xn9266', name: 'Jack', city: 'Dallas' },
];

const gridStyle = { minHeight: 180 };

const columns = [
  { name: 'id', header: 'Id', defaultVisible: false, defaultWidth: 80 },
  { name: 'name', header: 'Name', defaultFlex: 1 },
  { name: 'city', header: 'City', defaultFlex: 1 },
];

export default function App() {
  const [dataSource, setDataSource] = useState(DATA_SOURCE);
  // RETURN/TAB event not firing onEditComplete
  // - If initial value is 'true' editing works as expected (can toggle enabled/disabled)
  // - If initial value is 'false' onEditComplete is not called when editing is enabled
  const [isEditable, setIsEditable] = useState(false);

  const onEditComplete = useCallback(
    ({ columnId: name, value, data: { id } }) => {
      debugger;
      const data = dataSource.map(item =>
        item.id === id ? { ...item, [name]: value } : item
      );

      setDataSource(data);
    },
    [dataSource]
  );

  return (
    <div>
      <ReactDataGrid
        idProperty="id"
        style={gridStyle}
        onEditComplete={onEditComplete}
        editable={isEditable}
        columns={columns}
        dataSource={dataSource}
      />
      <Button
        style={{ marginTop: 20 }}
        onClick={() => setIsEditable(!isEditable)}
      >
        {isEditable ? 'Editing Enabled' : 'Editing Disabled'}
      </Button>
    </div>
  );
}
