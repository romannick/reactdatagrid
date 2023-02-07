/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FunctionNotifier } from '../../../../utils/notifier';
import React, { ReactNode, createRef } from 'react';

import StringFilter from '../../../../StringFilter/StringFilter';

const filterWrapperClassName =
  'InovuaReactDataGrid__column-header__filter-wrapper';

type TypeGenericFilterProps = {
  cellInstance?: any;
  props?: any;
  rtl?: boolean;
  enableColumnFilterContextMenu?: boolean;
  notifyColumnFilterVisibleStateChange?: FunctionNotifier<boolean>;
  inputRef?: any;
};

type TypeGenericFilterState = {
  focused: boolean;
  open: boolean;
};

class GenericFilter extends React.Component<
  TypeGenericFilterProps,
  TypeGenericFilterState
> {
  onSettingsClickListener: null;
  settings: any;
  refSettings: any;
  ref: any;
  specificFilter: any;
  unsubscribeColumnFilterVisibility?: VoidFunction;

  constructor(props: TypeGenericFilterProps) {
    super(props);

    this.onSettingsClick = this.onSettingsClick.bind(this);
    this.onSettingsClickListener = null;

    this.ref = (specificFilter: any) => {
      const inputRef =
        props.inputRef ||
        (props.props.filterEditorProps &&
          props.props.filterEditorProps.inputRef);
      if (inputRef) {
        if (typeof inputRef === 'function') {
          inputRef(specificFilter);
        } else {
          inputRef.current = specificFilter;
        }
      }
      this.specificFilter = specificFilter;
    };

    this.state = {
      focused: false,
      open: false,
    };
  }

  componentDidMount() {
    if (this.props.cellInstance) {
      this.props.cellInstance.filter = this;
    }

    this.setupEventListener();
  }

  setupEventListener = () => {
    this.unsubscribeColumnFilterVisibility = this.props.props.notifyColumnFilterVisibleStateChange.onCalled(
      (visible: boolean) => {
        if (!visible && this.state.open) {
          this.close(this.settings);
        }
      }
    );
    this.refSettings = (s: any) => {
      /**
       * https://inovua.freshdesk.com/a/tickets/221
       * We need to attach mousedown here
       * because otherwise, if we go through the normal react flow,
       * by the time we click, the filter menu gets blurred, and is hidden
       * so the menu is shown again on click.
       * However, the correct behaviour is that the click
       * should toggle the visibility of the filter menu
       */
      if (s) {
        if (!this.onSettingsClickListener) {
          this.onSettingsClickListener = s.addEventListener(
            'mousedown',
            this.onSettingsClick
          );
        }
      } else {
        if (this.settings && this.onSettingsClickListener) {
          this.settings.removeEventListener(this.onSettingsClickListener);
        }
      }
      this.settings = s;
    };
  };

  componentWillUnmount() {
    if (this.props.cellInstance) {
      this.props.cellInstance.filter = null;
    }
    if (this.settings && this.onSettingsClickListener) {
      this.settings.removeEventListener(this.onSettingsClickListener);
    }
    this.onSettingsClickListener = null;
    this.settings = null;

    if (this.unsubscribeColumnFilterVisibility) {
      this.unsubscribeColumnFilterVisibility();
    }
  }

  onSettingsClick = (e: any) => {
    if (!this.state.open) {
      this.onMenuOpen(e);
    } else {
      this.onMenuClose(e);
    }
  };

  onFocus = () => {
    this.setState({ focused: true });
  };

  onBlur = () => {
    this.setState({ focused: false });
  };

  onMenuOpen = (e: any) => {
    e.preventDefault();
    this.props.cellInstance.showFilterContextMenu(this.settings);
    this.setState({
      focused: true,
      open: true,
    });
  };

  onMenuClose = (e: any) => {
    e.preventDefault();

    this.close();
  };

  onKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      this.onMenuOpen(event);
    }
  };

  close = (settings?: ReactNode) => {
    this.setState(
      {
        focused: false,
        open: false,
      },
      () => {
        this.props.cellInstance.hideFilterContextMenu(settings);
      }
    );
  };

  setValue = (value: any) => {
    if (this.specificFilter.setValue) {
      this.specificFilter.setValue(value);
    }
  };

  render() {
    const { props, cellInstance } = this.props;
    let filterValue = props.computedFilterValue;

    const active = filterValue ? filterValue.active !== false : false;

    const filterType = filterValue
      ? filterValue.type || props.filterType || props.type
      : props.filterType || props.type || 'string';

    if (filterValue && !filterValue.type) {
      filterValue = { ...filterValue, type: filterType };
    }

    let className = filterWrapperClassName;

    if (filterValue) {
      if (!active) {
        className += ` ${className}--disabled`;
      }
    }

    let settings: any;
    let style: any = {
      minHeight: props.filterRowHeight + 1, // adding the border
    };

    if (filterValue) {
      const settingsIconClassName =
        'InovuaReactDataGrid__column-header__filter-settings-icon';

      const settingsIcon =
        props.filterEditorProps && props.filterEditorProps.renderSettings ? (
          props.filterEditorProps.renderSettings({
            className: settingsIconClassName,
            filterValue,
          })
        ) : (
          <svg
            tabIndex={0}
            className={settingsIconClassName}
            width="14"
            height="14"
            viewBox="0 0 14 14"
          >
            <path
              fillRule="evenodd"
              d="M13.222 2H.778C.348 2 0 1.552 0 1s.348-1 .778-1h12.444c.43 0 .778.448.778 1s-.348 1-.778 1zM1.556 3.111l3.888 4.667v5.444c0 .43.349.778.778.778h1.556c.43 0 .778-.348.778-.778V7.778l3.888-4.667H1.556z"
            />
          </svg>
        );

      settings = (
        <div
          className="InovuaReactDataGrid__column-header__filter-settings"
          ref={this.refSettings}
          onKeyDown={this.onKeyDown}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
        >
          {settingsIcon}
        </div>
      );
    }

    if (!filterValue) {
      className += ` ${filterWrapperClassName}--empty`;
      return <div style={style} className={className} />;
    }

    const { filterTypes } = props;
    const filterTypeDescription = filterTypes[filterType] || { operators: [] };
    const operator = filterTypeDescription.operators.filter(
      (op: { name: string }) => op.name === filterValue.operator
    )[0];

    const operatorDisabled = operator && operator.disableFilterEditor;

    const filterProps = {
      i18n: props.i18n,
      rtl: props.rtl,
      nativeScroll: props.nativeScroll,
      filterDelay: props.filterDelay !== undefined ? props.filterDelay : 250,
      ...props.filterEditorProps,
      filterEditorProps: props.filterEditorProps,
      ref: this.ref,
      cellProps: props,
      renderInPortal: props.renderInPortal,
      cell: cellInstance,
      filterValue,
      emptyValue: filterTypeDescription.emptyValue,
      onChange: cellInstance.onFilterValueChange,
      active,
      disabled: !active || operatorDisabled,
      filterType,
      theme: props.theme,

      render: (node: ReactNode) => {
        return (
          <div style={style} className={className}>
            {node}
            {props.enableColumnFilterContextMenu && settings}
          </div>
        );
      },
    };

    const FilterEditor = props.filterEditor;
    if (FilterEditor && typeof FilterEditor != 'string') {
      return <FilterEditor {...filterProps} />;
    }

    if (props.renderFilterEditor) {
      return props.renderFilterEditor(filterProps, props, cellInstance);
    }

    return <StringFilter {...filterProps} />;
  }
}

type TypeFilterProps = {
  rtl?: boolean;
};

export default (props: TypeFilterProps, cellInstance: any) => {
  return (
    <GenericFilter
      key={`filter-${cellInstance.getProps().id}`}
      props={props}
      rtl={props.rtl}
      cellInstance={cellInstance}
    />
  );
};
