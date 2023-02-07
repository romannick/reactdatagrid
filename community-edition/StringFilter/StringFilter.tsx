/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { CSSProperties } from 'react';

import TextInput from '../packages/TextInput';
import debounce from '../packages/debounce';

type TypeFilterValue = {
  name: string;
  operator: string;
  type: string;
  value: string | null;
  filterEditorProps?: any;
};

type StringFilterProps = {
  filterValue?: TypeFilterValue;
  filterDelay?: number;
  readOnly?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  rtl?: boolean;
  theme?: string;
  onChange?: Function;
  render?: Function;
  placeholder?: string;
  inputRef?: any;
  filterEditorProps?: any;
};

type StringFilterState = {
  value?: string | null;
};

type InputProps = {
  readOnly?: boolean;
  disabled?: boolean;
  theme?: string;
  rtl?: boolean;
  style?: CSSProperties;
  value?: string | null;
  placeholder?: string;
};

class StringFilter extends React.Component<
  StringFilterProps,
  StringFilterState
> {
  input: any;
  private refInput: any;

  constructor(props: StringFilterProps) {
    super(props);

    this.refInput = (i: any) => {
      const inputRef = props.inputRef || props.filterEditorProps?.inputRef;
      if (inputRef) {
        if (typeof inputRef === 'function') {
          inputRef(i);
        } else {
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

  componentDidUpdate = ({ filterValue: { value } }: any) => {
    if (
      String(value).localeCompare(
        String(this.props.filterValue && this.props.filterValue.value)
      )
    ) {
      if (this.props.filterValue) {
        this.onChange(this.props.filterValue.value);
      }
    }
  };

  getInputRef = () => {
    return this.input;
  };

  onChange(value: string | null) {
    this.onValueChange(value);

    this.setValue(value);
  }

  setValue(value?: string | null) {
    this.setState({
      value,
    });
  }

  onValueChange(value: string | null) {
    this.props.onChange &&
      this.props.onChange({
        ...this.props.filterValue,
        value,
      });
  }

  renderClearIcon = ({ width, height }: { width: number; height: number }) => {
    return (
      <svg style={{ width, height }} viewBox="0 0 10 10">
        <path
          fill="none"
          fillRule="evenodd"
          strokeLinecap="round"
          strokeWidth="1.33"
          d="M1 1l8 8m0-8L1 9"
        />
      </svg>
    );
  };

  render() {
    let {
      filterValue,
      readOnly,
      disabled,
      style,
      rtl,
      theme,
      placeholder,
    } = this.props;

    const inputProps: InputProps = {
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

    return (
      this.props.render &&
      this.props.render(
        <TextInput
          {...filterEditorProps}
          type="text"
          ref={this.refInput}
          onChange={this.onChange}
          renderClearIcon={this.renderClearIcon}
          className="InovuaReactDataGrid__column-header__filter InovuaReactDataGrid__column-header__filter--string"
          {...inputProps}
        />
      )
    );
  }
}

export default StringFilter;
