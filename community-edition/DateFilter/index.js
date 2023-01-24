/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { Component } from 'react';
import { DateInput } from '../packages/Calendar';
class DateFilter extends Component {
    constructor(props) {
        super(props);
        const { filterValue } = props;
        this.state = {
            value: filterValue ? filterValue.value || '' : '',
            text: '',
        };
        this.onChange = this.onChange.bind(this);
        this.onStartChange = this.onStartChange.bind(this);
        this.onEndChange = this.onEndChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        this.onTextChange = this.onTextChange.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (this.props.filterValue &&
            prevProps.filterValue &&
            this.props.filterValue.value !== prevProps.filterValue.value) {
            //@ts-ignore
            this.setValue(this.props.filterValue.value);
        }
    }
    onChange(value) {
        if (value === this.state.value) {
            return;
        }
        this.onValueChange(value);
        this.setValue(value);
    }
    onStartChange(start) {
        if (this.state.value) {
            if (this.state.value.start && start === this.state.value.start) {
                return;
            }
        }
        const newValue = typeof this.state.value === 'string' ? {} : { ...this.state.value };
        newValue.start = start;
        this.onValueChange(newValue);
        this.setValue(newValue);
    }
    onEndChange(end) {
        if (this.state.value) {
            if (this.state.value.end && end === this.state.value.end) {
                return;
            }
        }
        const newValue = typeof this.state.value === 'string' ? {} : { ...this.state.value };
        newValue.end = end;
        this.onValueChange(newValue);
        this.setValue(newValue);
    }
    setValue(value) {
        this.setState({
            value,
        });
        if (typeof value === 'string') {
            this.onTextChange(value);
        }
    }
    onValueChange(value) {
        this.props.onChange &&
            this.props.onChange({
                ...this.props.filterValue,
                value,
            });
    }
    onTextChange(value) {
        this.setState({ text: value });
    }
    onStartTextChange = (start) => {
        const { text } = this.state;
        if (text && text.start && start === text.start) {
            return;
        }
        const newText = typeof text === 'string' ? {} : { ...text };
        newText.start = start;
        this.setState({ text: newText });
    };
    onEndTextChange = (end) => {
        const { text } = this.state;
        if (text && text.end && end === text.end) {
            return;
        }
        const newText = typeof text === 'string' ? {} : { ...text };
        newText.end = end;
        this.setState({ text: newText });
    };
    render() {
        const { filterValue, readOnly, disabled, rtl, style, cell, renderInPortal, i18n, theme, } = this.props;
        let { filterEditorProps, cellProps: { dateFormat }, } = this.props;
        if (filterEditorProps === undefined) {
            filterEditorProps = filterValue && filterValue.filterEditorProps;
        }
        if (dateFormat === undefined) {
            if (typeof filterEditorProps === 'function') {
                dateFormat = filterEditorProps(this.props, {
                    value: this.state.value,
                    index: 0,
                }).dateFormat;
            }
            else {
                dateFormat = (filterEditorProps && filterEditorProps.dateFormat) || '';
            }
        }
        const calendarLabels = {
            todayButtonText: i18n && i18n('calendar.todayButtonText'),
            clearButtonText: i18n && i18n('calendar.clearButtonText'),
            okButtonText: i18n && i18n('calendar.okButtonText'),
            cancelButtonText: i18n && i18n('calendar.cancelButtonText'),
        };
        const startTarget = () => (cell &&
            cell
                .getDOMNode()
                .querySelectorAll('.InovuaReactDataGrid__column-header__filter')[0]) ||
            (cell && cell.getDOMNode());
        const inputProps = {
            calendarProps: { ...calendarLabels },
            readOnly,
            disabled,
            dateFormat,
            forceValidDate: false,
            relativeToViewport: true,
            okButton: false,
            cancelButton: false,
            overlayProps: {
                zIndex: null,
                positions: ['tl-bl', 'bl-tl', 'tr-br', 'br-tr'],
                target: startTarget,
            },
            style: {
                minWidth: 0,
                ...style,
            },
            theme,
            rtl,
        };
        if (filterValue) {
            inputProps.value = this.state.value;
            if (!inputProps.value) {
                inputProps.text = '';
            }
        }
        const renderPicker = renderInPortal;
        const editorClassName = 'InovuaReactDataGrid__column-header__filter InovuaReactDataGrid__column-header__filter--date';
        switch (filterValue && filterValue.operator) {
            case 'inrange':
            case 'notinrange':
                const { value, text } = this.state;
                const { start, end } = value;
                const { start: startText, end: endText } = text, startInputProps = { ...inputProps, value: start, text: startText }, endInputProps = {
                    ...inputProps,
                    value: end,
                    text: endText,
                    overlayProps: {
                        target: () => {
                            const filterNodes = cell &&
                                cell
                                    .getDOMNode()
                                    .querySelectorAll('.InovuaReactDataGrid__column-header__filter');
                            return filterNodes[filterNodes.length - 1];
                        },
                    },
                };
                const startFilterEditorProps = typeof filterEditorProps === 'function'
                    ? filterEditorProps(this.props, {
                        value: start,
                        index: 0,
                    })
                    : filterEditorProps;
                const endFilterEditorProps = typeof filterEditorProps === 'function'
                    ? filterEditorProps(this.props, {
                        value: end,
                        index: 1,
                    })
                    : filterEditorProps;
                const startProps = {
                    okButton: true,
                    placeholder: i18n && i18n('start'),
                    ...startFilterEditorProps,
                    onChange: this.onStartChange,
                    onTextChange: this.onStartTextChange,
                    className: editorClassName,
                    ...startInputProps,
                    renderPicker,
                };
                const startEditor = React.createElement(DateInput, { ...startProps });
                const endProps = {
                    okButton: true,
                    placeholder: i18n && i18n('end'),
                    ...endFilterEditorProps,
                    onChange: this.onEndChange,
                    onTextChange: this.onEndTextChange,
                    className: editorClassName,
                    ...endInputProps,
                    renderPicker,
                    endInput: true,
                };
                const endEditor = React.createElement(DateInput, { ...endProps });
                return this.props.render(React.createElement("div", { style: { display: 'flex' } },
                    startEditor,
                    React.createElement("div", { className: "InovuaReactDataGrid__column-header__filter__binary_operator_separator" }),
                    endEditor));
            default:
                const finalEditorProps = typeof filterEditorProps === 'function'
                    ? filterEditorProps(this.props, {
                        value: this.state.value,
                    })
                    : filterEditorProps;
                const finalProps = {
                    ...finalEditorProps,
                    onChange: this.onChange,
                    onTextChange: this.onTextChange,
                    className: editorClassName,
                    ...inputProps,
                    renderPicker,
                };
                return this.props.render(React.createElement(DateInput, { ...finalProps }));
        }
    }
}
export default DateFilter;
