/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react';
import join from '../../../packages/join';
const BASE_CLASS_NAME = 'InovuaReactDataGrid__column-header__menu-tool';
export const MenuTool = (props) => {
    const [keepVisible, setKeepVisible] = useState(false);
    const domRef = useRef();
    const _unmounted = useRef();
    useEffect(() => {
        _unmounted.current = false;
        return () => {
            _unmounted.current = true;
        };
    }, []);
    const onClick = (event) => {
        event.stopPropagation();
    };
    const onMouseDown = (event) => {
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
        return (React.createElement("svg", { ...domProps, viewBox: "0 0 14 12" },
            React.createElement("g", { fillRule: "evenodd" },
                React.createElement("rect", { width: "14", height: "2", rx: "1" }),
                React.createElement("rect", { width: "14", height: "2", y: "5", rx: "1" }),
                React.createElement("rect", { width: "14", height: "2", y: "10", rx: "1" }))));
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
    return (React.createElement("div", { className: className, onMouseDown: onMouseDown, onClick: onClick, ref: domRef }, renderMenuTool()));
};
export default (props, cellInstance) => {
    if (props.groupSpacerColumn) {
        return null;
    }
    if (!props.showColumnMenuTool) {
        return null;
    }
    return (React.createElement(MenuTool, { key: "menuTool", name: props.name, rtl: props.rtl, showOnHover: props.showColumnMenuToolOnHover, showContextMenu: cellInstance.showContextMenu, renderMenuTool: props.renderMenuTool }));
};
