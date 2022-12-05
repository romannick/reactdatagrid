import ReactDataGrid from '@inovua/reactdatagrid-enterprise';

import { TypeComputedProps } from '@inovua/reactdatagrid-enterprise/types';
import { useState } from 'react';

const columns = [
  { name: 'id', header: 'ID' },
  { name: 'name', header: 'Name' },
  { name: 'age', header: 'Age' },
];

const gridStyle = { minHeight: 500 };

const dataSource = [
  { id: 1, name: 'John', age: 3 },
  { id: 2, name: 'John', age: 3 },
  { id: 3, name: 'John', age: 3 },
  { id: 4, name: 'John', age: 3 },
  { id: 5, name: 'John', age: 3 },
  { id: 6, name: 'John', age: 3 },
  { id: 7, name: 'John', age: 3 },
  { id: 8, name: 'John', age: 3 },
  { id: 9, name: 'John', age: 3 },
  { id: 10, name: 'John', age: 3 },
  { id: 11, name: 'John', age: 7 },
  { id: 12, name: 'John', age: 7 },
  { id: 13, name: 'John', age: 7 },
  { id: 14, name: 'John', age: 7 },
  { id: 21, name: 'John', age: 8 },
  { id: 22, name: 'John', age: 8 },
  { id: 31, name: 'Mary', age: 2 },
  { id: 32, name: 'Mary', age: 2 },
  { id: 33, name: 'Mary', age: 2 },
  { id: 34, name: 'Mary', age: 2 },
  { id: 35, name: 'Mary', age: 2 },
  { id: 36, name: 'Mary', age: 2 },
  { id: 37, name: 'Mary', age: 2 },
  { id: 38, name: 'Mary', age: 2 },
  { id: 41, name: 'Mary', age: 8 },
  { id: 42, name: 'Mary', age: 8 },
  { id: 43, name: 'Mary', age: 8 },
  { id: 44, name: 'Mary', age: 8 },
  { id: 45, name: 'Mary', age: 8 },
  { id: 46, name: 'Mary', age: 8 },
  { id: 47, name: 'Mary', age: 8 },
  { id: 48, name: 'Mary', age: 8 },
  { id: 51, name: 'Roger', age: 1 },
  { id: 52, name: 'Roger', age: 1 },
  { id: 61, name: 'Roger', age: 4 },
  { id: 62, name: 'Roger', age: 4 },
  { id: 63, name: 'Roger', age: 4 },
  { id: 64, name: 'Roger', age: 4 },
  { id: 65, name: 'Roger', age: 4 },
  { id: 66, name: 'Roger', age: 4 },
  { id: 67, name: 'Roger', age: 4 },
  { id: 68, name: 'Roger', age: 4 },
];

const App = () => {
  const [tableRef, setTableRef] = useState<React.RefObject<
    TypeComputedProps
  > | null>(null);

  (globalThis as any).tableRef = tableRef;
  return (
    <div>
      <div>
        <button
          onClick={() => {
            let prevIndex = tableRef?.current?.getFirstVisibleIndex() ?? 0;
            let prevRow;
            console.log(
              '(prev) starting item',
              tableRef?.current?.getItemAt(prevIndex)
            );

            while (!prevRow?.__group || prevRow?.depth !== 1) {
              prevIndex--;
              prevRow = tableRef?.current?.getItemAt(prevIndex);
              if (!prevRow) {
                return;
              }
            }

            console.log('(prev) scrolling to row:', { prevRow });
            tableRef?.current?.scrollToIndex(prevIndex, {
              top: true,
              force: true,
            });
          }}
        >
          scroll to previous name group
        </button>
        <button
          onClick={() => {
            let nextIndex = tableRef?.current?.getFirstVisibleIndex() ?? 0;
            let nextRow: any;
            console.log(
              '(next) starting item',
              tableRef?.current?.getItemAt(nextIndex)
            );

            while (!nextRow?.__group || nextRow?.depth !== 1) {
              nextIndex++;
              nextRow = tableRef?.current?.getItemAt(nextIndex);
              if (!nextRow) {
                return;
              }
            }

            console.log('(next) scrolling to row:', { nextRow });
            tableRef?.current?.scrollToIndex(nextIndex, {
              top: true,
              force: true,
            });
          }}
        >
          scroll to next name group
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            let prevIndex = tableRef?.current?.getFirstVisibleIndex() ?? 0;
            let prevRow;
            console.log(
              '(prev) starting item',
              tableRef?.current?.getItemAt(prevIndex)
            );

            while (!prevRow?.__group || prevRow?.depth !== 2) {
              prevIndex--;
              prevRow = tableRef?.current?.getItemAt(prevIndex);
              if (!prevRow) {
                return;
              }
            }

            console.log('(prev) scrolling to row:', { prevRow });
            tableRef?.current?.scrollToIndex(prevIndex, {
              top: true,
              force: true,
            });
          }}
        >
          scroll to previous age group
        </button>
        <button
          onClick={() => {
            let nextIndex = tableRef?.current?.getFirstVisibleIndex() ?? 0;
            let nextRow: any;

            if (tableRef?.current?.getItemAt(nextIndex)?.depth === 1) {
              // if table has just loaded, first item will be the level 1 header
              // so increment the index by 1 to the level 2 header so that we look for
              // the one after that as our next scroll-to level 2 header
              nextIndex++;
            }
            console.log(
              '(next) starting item',
              tableRef?.current?.getItemAt(nextIndex)
            );

            while (!nextRow?.__group || nextRow?.depth !== 2) {
              nextIndex++;
              nextRow = tableRef?.current?.getItemAt(nextIndex);
              if (!nextRow) {
                return;
              }
            }
            nextIndex -= (nextRow?.depth || 0) - 1;

            console.log('(next) scrolling to row:', { nextRow, nextIndex });
            tableRef?.current?.scrollToIndex(nextIndex, {
              top: true,
              force: true,
            });
          }}
        >
          scroll to next age group
        </button>
      </div>
      <button
        onClick={() => {
          const index = tableRef?.current?.getFirstVisibleIndex();
          if (index !== undefined) {
            console.log(
              'item at first visible index:',
              tableRef?.current?.getItemAt(index)
            );
          }
        }}
      >
        get first visible item
      </button>
      <ReactDataGrid
        licenseKey={process.env.NEXT_PUBLIC_LICENSE_KEY}
        onReady={setTableRef}
        idProperty="id"
        style={gridStyle}
        groupColumn={{}}
        hideGroupByColumns
        stickyGroupRows
        rowHeight={50}
        groupBy={['name', 'age']}
        columns={columns}
        dataSource={dataSource}
      />
    </div>
  );
};

export default () => <App />;
