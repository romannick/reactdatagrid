import { RefObject, useState } from 'react';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import {
  TypeColumn,
  TypeComputedProps,
} from '@inovua/reactdatagrid-enterprise/types';

const columns: TypeColumn[] = [
  { name: 'name', header: 'Name', flex: 1 },
  {
    id: 'action',
    width: 100,
    editable: true,
    render: () => null,
    renderEditor: () => <input key="edit" />,
  },
];

const dataSource = [
  { id: 1, name: 'John McQueen' },
  { id: 2, name: 'Mary Stones' },
  { id: 3, name: 'Robert Fil' },
  { id: 4, name: 'Roger Robson' },
  { id: 5, name: 'Billary Konwik' },
];

const App = () => {
  const [tableRef, setTableRef] = useState<RefObject<TypeComputedProps>>({
    current: null,
  });

  return (
    <div>
      <button
        onClick={() => {
          tableRef.current?.startEdit?.({
            columnId: 'action',
            rowIndex: 1,
          });

          tableRef.current?.reload();
        }}
      >
        edit second row
      </button>
      <button
        onClick={() => {
          tableRef.current?.cancelEdit?.({
            columnId: 'action',
            rowIndex: 1,
          });
        }}
      >
        cancel edit
      </button>
      <ReactDataGrid
        columns={columns}
        dataSource={dataSource}
        style={{ minHeight: 550 }}
        rowHeight={null}
        virtualized
        onReady={(table: any) => {
          setTableRef(table);
        }}
      />
    </div>
  );
};

export default () => <App />;
