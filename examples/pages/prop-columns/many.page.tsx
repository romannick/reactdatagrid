/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Button from '@inovua/reactdatagrid-community/packages/Button';
import CheckBox from '@inovua/reactdatagrid-community/packages/CheckBox';
import NumericInput from '@inovua/reactdatagrid-community/packages/NumericInput';

import DataGrid from '../../../enterprise-edition';
import { getGlobal } from '@inovua/reactdatagrid-community/getGlobal';

const globalObject = getGlobal();

import people from '../people';

let Btn = Button as any;

const gridStyle = { minHeight: '50vh' };

const times = (arr: any[], n: number, fn?: (x: any, i: number) => void) => {
  const result = [];

  for (var i = 0; i < n; i++) {
    result.push(
      ...arr.map(x => {
        if (fn) {
          return fn(x, i);
        }
        return {
          ...x,
          id: `${i}-${x.id}`,
        };
      })
    );
  }

  return result;
};
const defaultGroupBy = ['country'];

const defaultCellSelection = { '0-4,id': true, '0-4,desc': true };
class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    (this as any).COLS = 100;

    let columns = times([{ name: 'id' }], (this as any).COLS, (_, i) => {
      return {
        name: `id-${i}`,
        id: `id-${i}`,
        header: `ID--${i}`,
        defaultWidth: 120,
        render: ({ value, rowIndex }: { value: string; rowIndex: number }) => {
          return `${rowIndex} - ${value}`;
        },
      };
    });

    this.state = {
      rtl: true,
      columns,
      rows: 100,
      dataSource: [],
      checkboxColumn: true,
    };
  }

  componentDidMount(): void {
    this.loadDataSource(this.state.rows);
  }

  loadDataSource = (n: number) => {
    const data = times(
      [
        [...new Array((this as any).COLS)].reduce(
          (acc, _, i) => {
            acc[`id-${i}`] = i;
            return acc;
          },
          { id: 0 }
        ),
      ],
      n
    );

    this.setState({ dataSource: data });
  };

  onRowsChange = (rows: any) => {
    this.setState({ rows });
  };

  render() {
    if (!process.browser) {
      return null;
    }

    const numericProps = {
      theme: 'default-dark',
      style: { minWidth: 150 },
      value: this.state.rows,
      onChange: this.onRowsChange,
    };

    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <CheckBox
            checked={this.state.rtl}
            onChange={(value: boolean) => this.setState({ rtl: value })}
          >
            RTL
          </CheckBox>
        </div>
        <div style={{ marginBottom: 20 }}>
          <NumericInput {...numericProps} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <Btn
            style={{ minWidth: 150 }}
            onClick={() => {
              this.loadDataSource(this.state.rows);
            }}
          >
            Set rows
          </Btn>
        </div>

        <div style={{ marginBottom: 20 }}>
          <CheckBox
            checked={this.state.checkboxColumn}
            onChange={() => {
              this.setState({ checkboxColumn: !this.state.checkboxColumn });
            }}
          >
            Checkbox column
          </CheckBox>
        </div>

        <DataGrid
          idProperty="id"
          style={gridStyle}
          handle={x => {
            (globalObject as any).x = x;
          }}
          showHeader={true}
          // rowIndexColumn
          rtl={this.state.rtl}
          columns={this.state.columns}
          dataSource={this.state.dataSource}
          virtualizeColumnsThreshold={3}
          pagination={false}
          // onRowReorder={this.state.checkboxColumn}
          // checkboxColumn={this.state.checkboxColumn}
          // nativeScroll={true}
          // virtualizeColumns={false}

          // virtualizeColumnsThreshold={10}

          // activeCellThrottle={200}
          // activeIndexThrottle={1000}
          // defaultActiveCell={[1, 0]}
        />
      </div>
    );
  }
}

export default () => <App />;
