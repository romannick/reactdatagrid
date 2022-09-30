/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode, CSSProperties } from 'react';
import { CellProps } from './CellProps';

type func = (...args: any[]) => any;

const DEFAULT_STYLE = {
  position: 'relative',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

// stop propagation in order not to trigger row active index change
const stopPropagation = (e: any) => e.stopPropagation();

export default (
  {
    render,
    nodeLoading,
    nodeCollapsed,
    leafNode,
    node,
    nodeProps,
    toggleNodeExpand,
    style,
    size,
    renderTreeCollapseTool,
    renderTreeExpandTool,
    renderTreeLoadingTool,
  }: {
    render?: func;
    nodeLoading?: boolean;
    nodeCollapsed?: boolean;
    nodeExpanded?: boolean;
    leafNode?: boolean;
    node?: ReactNode;
    rtl?: boolean;
    nodeProps?: any;
    toggleNodeExpand?: func;
    style?: CSSProperties | ((props: CellProps) => void);
    size?: number;
    renderTreeCollapseTool?: ({
      domProps,
      size,
    }: {
      domProps: any;
      size?: number;
    }) => void;
    renderTreeExpandTool?: ({
      domProps,
      size,
    }: {
      domProps: any;
      size?: number;
    }) => void;
    renderTreeLoadingTool?: ({
      domProps,
      size,
      className,
    }: {
      domProps: any;
      size?: number;
      className: string;
    }) => void;
  },
  cellProps?: CellProps
) => {
  size = size || 18;
  if (!leafNode) {
    (style as any) = style ? { ...DEFAULT_STYLE, ...style } : DEFAULT_STYLE;
  }

  const domProps: any = {
    onMouseDown: leafNode ? null : toggleNodeExpand,
    onClick: leafNode ? null : stopPropagation,
    style,
  };

  let result;

  if (render) {
    domProps.style = { ...domProps.style };
    result = render(domProps, {
      ...cellProps,
      leafNode,
      nodeCollapsed,
      node,
      nodeLoading,
      nodeProps,
      toggleNodeExpand,
      size,
    });
    if (result != undefined) {
      return result;
    }
  }

  if (leafNode) {
    let tools = true;
    if (renderTreeCollapseTool === null && renderTreeExpandTool === null) {
      tools = false;
    }

    return (
      <div
        {...domProps}
        style={{ ...domProps.style, width: tools ? size : 0, height: size }}
      />
    );
  }

  const renderNodeLoading = ({
    domProps,
    size,
  }: {
    domProps: any;
    size: number;
  }) => {
    const className = `${domProps.className ||
      ''} InovuaReactDataGrid__cell__node-tool--loading`;

    let loadingTool;

    if (renderTreeLoadingTool === null) {
      return <div style={domProps.style} />;
    }

    if (renderTreeLoadingTool) {
      loadingTool = renderTreeLoadingTool({ domProps, size, className });
    }

    if (loadingTool === undefined) {
      loadingTool = (
        <svg
          {...domProps}
          className={className}
          height={size}
          width={size}
          viewBox="0 0 24 24"
        >
          <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
        </svg>
      );
    }

    return loadingTool;
  };

  if (nodeLoading) {
    return renderNodeLoading({ domProps, size });
  }

  const renderCollapseToolHandle = () => {
    let result;

    if (renderTreeCollapseTool === null) {
      return <div style={domProps.style} />;
    }

    if (renderTreeCollapseTool) {
      result = renderTreeCollapseTool({ domProps, size });
    }

    if (result === undefined) {
      result = (
        <svg {...domProps} height={size} viewBox="0 0 24 24" width={size}>
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      );
    }

    return result;
  };

  const renderExpandToolHandle = () => {
    let result;

    if (renderTreeExpandTool === null) {
      return <div style={domProps.style} />;
    }

    if (renderTreeExpandTool) {
      result = renderTreeExpandTool({ domProps, size });
    }

    if (result === undefined) {
      result = (
        <svg {...domProps} height={size} viewBox="0 0 24 24" width={size}>
          <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
        </svg>
      );
    }

    return result;
  };

  if (nodeCollapsed) {
    return renderCollapseToolHandle();
  }

  return renderExpandToolHandle();
};
