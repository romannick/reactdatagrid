/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  TypeComputedProps,
  TypeExpandedNodes,
} from '../../../../community-edition/types';

type TypeConfig = {
  idProperty: string;
  nodesName: string;
  pathSeparator: string;
  expandedNodes: TypeExpandedNodes | undefined;
  generateIdFromPath: boolean;
  selectedPath: string;
  destinationPath: string;
  selectedItem: any;
};

const updateTreeDataIds = (data: any, config: any) => {
  const idProperty = config.idProperty;
  const nodesName = config.nodesName;

  const updateIds = (dataArr: any[]) => {
    for (let i = 0; i < dataArr.length; i++) {
      const item = dataArr[i];
      if (!item) {
        continue;
      }

      const itemNodes = item[nodesName];

      item[idProperty] = i + 1;

      if (Array.isArray(itemNodes)) {
        updateIds(itemNodes);
      }
    }
  };

  updateIds(data);

  return data;
};

const computeTreeData = (dataArray: any[], config: TypeConfig) => {
  const idProperty = config.idProperty;
  const nodesName = config.nodesName;
  const pathSeparator = config.pathSeparator;
  const expandedNodes = config.expandedNodes;
  const generateIdFromPath = config.generateIdFromPath;
  const selectedPath = config.selectedPath;
  const destinationPath = config.destinationPath;
  const selectedItem = config.selectedItem;

  let counter = 0;

  const computeData = (
    data: any[],
    idSelected: string,
    destinationId: string,
    result: any[] = [],
    parentNode?: any
  ) => {
    let initialIdSelected: string = '';

    for (let i = 0; i < data.length; i++) {
      if (initialIdSelected === '') {
        initialIdSelected = idSelected;
      }

      if (counter === 2) {
        break;
      }

      const item = data[i];
      if (!item) {
        continue;
      }

      const itemId = `${item[idProperty]}`;
      const itemNodes: any[] = item[nodesName];
      const parentNodeId = parentNode ? `${parentNode[idProperty]}` : undefined;
      const path = parentNode
        ? `${parentNodeId}${pathSeparator}${item[idProperty]}`
        : `${item[idProperty]}`;

      if (generateIdFromPath) {
        item[idProperty] = path;
      }

      if (parentNode === undefined) {
        result.push(item);
      } else {
        const parentNodes = parentNode[nodesName];

        if (path === initialIdSelected) {
          parentNodes.splice(i, 1);
          counter++;
        }

        if (path === destinationId) {
          const nodeId = item[idProperty].split(pathSeparator);
          const idInNodes = nodeId.splice(nodeId.length - 1, 1);
          const index = parseInt(idInNodes);
          parentNodes.splice(index, 0, selectedItem);
          counter++;
        }
      }

      if (expandedNodes && expandedNodes[itemId]) {
        if (Array.isArray(itemNodes)) {
          computeData(itemNodes, idSelected, destinationId, result, item);
        }
      }
    }

    return result;
  };

  const computedData = computeData(dataArray, selectedPath, destinationPath);
  const updatedData = updateTreeDataIds(computedData, config);

  return updatedData;
};

const getItemById = (id: string | number, data: any[]) => {
  return data.find((item: any) => item.id === id);
};

const updateTreeData = (
  props: TypeComputedProps,
  {
    selectedPath,
    destinationPath,
  }: {
    selectedPath: string;
    destinationPath: string;
  }
) => {
  const originalData = props.originalData || [];

  const selectedItem = getItemById(selectedPath, props.data);

  const config: TypeConfig = {
    idProperty: props.idProperty,
    nodesName: props.nodesProperty,
    pathSeparator: props.nodePathSeparator,
    expandedNodes: props.computedExpandedNodes,
    generateIdFromPath: props.generateIdFromPath,
    selectedPath,
    destinationPath,
    selectedItem,
  };

  computeTreeData(originalData, config);
};

export default updateTreeData;
