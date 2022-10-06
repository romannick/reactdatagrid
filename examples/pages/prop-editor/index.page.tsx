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
    renderEditor: (editorProps: any) => {
      const domProps: any = {
        tabIndex: 0,
        autoFocus: true,
        onClick: () => {
          editorProps.onChange(!editorProps.value);
        },
        onBlur: editorProps.onComplete,
        onKeyDown: (e: any) => {
          if (e.key == 'Tab') {
            editorProps.onTabNavigation(
              true /*complete navigation?*/,
              e.shiftKey ? -1 : 1 /*backwards of forwards*/
            );
          }
        },
        style: {
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
        },
      };

      return (
        <div key={editorProps.cellProps.rowIndex} {...domProps}>
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
    renderEditor: (editorProps: any) => {
      const { cellProps } = editorProps;
      // const dataType = editorProps.cellProps.data.type;
      if (cellProps.data.id === 1) {
        return <BoolEditor key="boolean_editor" />;
      } else if (cellProps.data.id === 2) {
        return <SelectEditor key="select_editor" {...editorProps} />;
      } else if (cellProps.data.id === 3) {
        return <DateEditor key="date_editor" />;
      }
    },
    editorProps: {
      style: { background: 'lightgreen' },
      theme: 'default-dark',
      dataSource: [
        { id: 1, label: 'First' },
        { id: 2, label: 'Second' },
        { id: 3, label: 'Third' },
      ],
    },
  },
  {
    name: 'field',
    header: 'Field',
    editable: true,
    editor: SelectEditor,
    editorProps: {
      style: { background: 'lightgreen' },
      dataSource: [
        { id: 'construction', label: 'Construction' },
        { id: 'masinery', label: 'Masinery' },
        { id: 'chemestry', label: 'Chemestry' },
      ],
    },
  },
];

const columnsData = [
  { id: 1, type: 10, value: 100, field: 'construction' },
  { id: 2, type: 20, value: 200, field: 'masinery' },
  { id: 3, type: 30, value: '21.09.2022', field: 'chemestry' },
];

export default function App() {
  return (
    <ReactDataGrid
      columns={defaultColumns}
      dataSource={columnsData}
      idProperty="id"
      editable={true}
    />
  );
}
