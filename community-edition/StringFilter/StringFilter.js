/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import TextInput from '../packages/TextInput';
import debounce from '../packages/debounce';
class StringFilter extends React.Component {
    input;
    refInput;
    constructor(props) {
        super(props);
        this.refInput = (i) => {
            const inputRef = props.inputRef || props.filterEditorProps?.inputRef;
            if (inputRef) {
                if (typeof inputRef === 'function') {
                    inputRef(i);
                }
                else {
                    inputRef.current = i;
                }
            }
            this.input = i;
        };
        const { filterValue } = props;
        this.state = {
            value: filterValue ? filterValue.value || '' : '',
        };
        this.onChange = this.onChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
        if (props.filterDelay && props.filterDelay >= 1) {
            this.onValueChange = debounce(this.onValueChange, props.filterDelay, {
                leading: false,
                trailing: true,
            });
        }
    }
    componentDidUpdate = ({ filterValue: { value } }) => {
        if (String(value).localeCompare(String(this.props.filterValue && this.props.filterValue.value))) {
            if (this.props.filterValue) {
                this.onChange(this.props.filterValue.value);
            }
        }
    };
    getInputRef = () => {
        return this.input;
    };
    onChange(value) {
        this.onValueChange(value);
        this.setValue(value);
    }
    setValue(value) {
        this.setState({
            value,
        });
    }
    onValueChange(value) {
        this.props.onChange &&
            this.props.onChange({
                ...this.props.filterValue,
                value,
            });
    }
    renderClearIcon = ({ width, height }) => {
        return (React.createElement("svg", { style: { width, height }, viewBox: "0 0 10 10" },
            React.createElement("path", { fill: "none", fillRule: "evenodd", strokeLinecap: "round", strokeWidth: "1.33", d: "M1 1l8 8m0-8L1 9" })));
    };
    render() {
        let { filterValue, readOnly, disabled, style, rtl, theme, placeholder, } = this.props;
        const inputProps = {
            readOnly,
            disabled,
            theme,
            rtl,
            value: this.state.value,
            placeholder,
            style: {
                minWidth: 0,
                ...style,
            },
        };
        let filterEditorProps;
        if (filterValue) {
            filterEditorProps = filterValue.filterEditorProps;
            inputProps.value = this.state.value;
        }
        return (this.props.render &&
            this.props.render(React.createElement(TextInput, { ...filterEditorProps, type: "text", ref: this.refInput, onChange: this.onChange, renderClearIcon: this.renderClearIcon, className: "InovuaReactDataGrid__column-header__filter InovuaReactDataGrid__column-header__filter--string", ...inputProps })));
    }
}
export default StringFilter;
