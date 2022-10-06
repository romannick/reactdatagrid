import React from 'react';
import SelectEditor from '@inovua/reactdatagrid-community/SelectEditor';
import BoolEditor from '@inovua/reactdatagrid-community/BoolEditor';
import ReactDataGrid from '@inovua/reactdatagrid-enterprise';
import DateEditor from '@inovua/reactdatagrid-community/DateEditor';

const defaultColumns = [
  {
    name: 'id',
    header: 'ID',
  },
  {
    name: 'type',
    header: 'Daten Typ',
    editable: true,
    renderEditor: editorProps => {
      console.log('editorProps', editorProps);
      return (
        <div
          tabIndex={0}
          autoFocus
          onClick={() => {
            editorProps.onChange(!editorProps.value);
          }}
          onBlur={editorProps.onComplete}
          onKeyDown={e => {
            if (e.key == 'Tab') {
              editorProps.onTabNavigation(
                true /*complete navigation?*/,
                e.shiftKey ? -1 : 1 /*backwards of forwards*/
              );
            }
          }}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: '#434d64',
            color: '#9ba7b4',
            left: 0,
            top: 0,
          }}
        >
          {editorProps.value ? 'X' : 'O'}
        </div>
      );
    },
  },
  {
    name: 'value',
    header: 'Wert',
    editable: true,
    dateFormat: 'DD.MM.YYYY',
    renderEditor: (props: any) => {
      console.log('PROPS', props);
      const { cellProps } = props;
      // const dataType = editorProps.cellProps.data.type;
      if (cellProps.data.id === 1) {
        return <BoolEditor />;
      } else if (cellProps.data.id === 2) {
        return <SelectEditor editorProps={cellProps} />;
      } else if (cellProps.data.id === 3) {
        return <DateEditor />;
      }
    },
  },
];

const columnsData = [
  { id: 1, type: 10, value: 100 },
  { id: 2, type: 20, value: 200 },
  { id: 3, type: 30, value: '21.09.2022' },
];

export default function App() {
  return (
    <ReactDataGrid
      theme="default-light"
      columns={defaultColumns}
      dataSource={columnsData}
      idProperty="id"
      editable={true}
    />
  );
}
