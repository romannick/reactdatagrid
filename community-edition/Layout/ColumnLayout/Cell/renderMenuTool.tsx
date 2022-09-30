/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode, useEffect, useRef, useState } from 'react';

import join from '../../../packages/join';

const BASE_CLASS_NAME = 'InovuaReactDataGrid__column-header__menu-tool';

type TypeRenderMenuTool = (props: {
  className: string;
  width: number;
  height: number;
}) => Element | ReactNode;

type TypeProps = {
  showContextMenu?: (instance: any, onHide: (() => void) | null) => void;
  showOnHover?: boolean;
  rtl?: boolean;
  name?: string;
  renderMenuTool?: TypeRenderMenuTool;
};

export const MenuTool = (props: TypeProps) => {
  const [keepVisible, setKeepVisible] = useState(false);

  const domRef: any = useRef();
  const _unmounted: any = useRef();

  useEffect(() => {
    _unmounted.current = false;

    return () => {
      _unmounted.current = true;
    };
  }, []);

  const onClick = (event: any) => {
    event.stopPropagation();
  };

  const onMouseDown = (event: any) => {
    // prevent default, in order to avoid blurring the grid
    event.preventDefault();
    props.showContextMenu &&
      props.showContextMenu(domRef.current, props.showOnHover ? onHide : null);

    if (_unmounted.current) {
      return;
    }

    if (props.showOnHover && !keepVisible) {
      setKeepVisible(true);
    }
  };

  const onHide = () => {
    if (_unmounted.current) {
      return;
    }
    setKeepVisible(false);
  };

  const renderMenuTool = () => {
    const domProps = {
      className: join('', 'InovuaReactDataGrid__sort-icon--desc'),
      width: 14,
      height: 12,
    };

    if (props.renderMenuTool) {
      return props.renderMenuTool(domProps);
    }

    return (
      <svg {...domProps} viewBox="0 0 14 12">
        <g fillRule="evenodd">
          <rect width="14" height="2" rx="1" />
          <rect width="14" height="2" y="5" rx="1" />
          <rect width="14" height="2" y="10" rx="1" />
        </g>
      </svg>
    );
  };

  let className = BASE_CLASS_NAME;

  const { showOnHover, rtl } = props;

  if (showOnHover) {
    className += ` ${BASE_CLASS_NAME}--show-on-hover`;
  }
  if (!showOnHover || keepVisible) {
    className += ` ${BASE_CLASS_NAME}--visible`;
  }

  className += ` ${BASE_CLASS_NAME}--direction-${rtl ? 'rtl' : 'ltr'}`;

  return (
    <div
      className={className}
      onMouseDown={onMouseDown}
      onClick={onClick}
      ref={domRef}
    >
      {renderMenuTool()}
    </div>
  );
};

type TypeMenuToolProps = {
  groupSpacerColumn?: boolean;
  showColumnMenuTool?: boolean;
  name?: string;
  rtl?: boolean;
  showColumnMenuToolOnHover?: boolean;
  renderMenuTool?: TypeRenderMenuTool;
};

export default (props: TypeMenuToolProps, cellInstance: any) => {
  if (props.groupSpacerColumn) {
    return null;
  }

  if (!props.showColumnMenuTool) {
    return null;
  }

  return (
    <MenuTool
      key="menuTool"
      name={props.name}
      rtl={props.rtl}
      showOnHover={props.showColumnMenuToolOnHover}
      showContextMenu={cellInstance.showContextMenu}
      renderMenuTool={props.renderMenuTool}
    />
  );
};
