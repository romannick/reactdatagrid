/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const dropGroupIndexValidation = ({
  data,
  dragIndex,
  dropIndex,
  isRowReorderValid,
  selectedGroup,
  allowRowReorderBetweenGroups,
}: {
  data: any[];
  dragIndex: number;
  dropIndex: number;
  isRowReorderValid: Function;
  selectedGroup: string[];
  allowRowReorderBetweenGroups: boolean;
}) => {
  let iterateRows = false;

  let validDropPositions = data.reduce((acc: any[], curr: any, i: number) => {
    if (curr.__group) {
      const value = curr.keyPath.join('/');
      if (!value.localeCompare(selectedGroup)) {
        iterateRows = true;
      } else {
        if (!allowRowReorderBetweenGroups) {
          iterateRows = false;
        }
      }
    }

    if (allowRowReorderBetweenGroups) {
      iterateRows = true;
    }

    if (!curr.__group && iterateRows) {
      acc[i] = true;
    } else {
      acc[i] = false;
    }

    return acc;
  }, {});

  if (!data[data.length - 1].__group) {
    validDropPositions[data.length] = true;
  }

  if (isRowReorderValid) {
    validDropPositions[dropIndex] = isRowReorderValid({
      dragRowIndex: dragIndex,
      dropRowIndex: dropIndex,
    });
  }

  return validDropPositions;
};

export default dropGroupIndexValidation;
