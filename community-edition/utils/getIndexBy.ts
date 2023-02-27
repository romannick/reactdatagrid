/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const getIndexBy = (
  data: any[],
  by: string,
  id: number | string,
  getItemId: (item: any) => void,
  compoundIdProperty?: boolean
) => {
  let index = -1;

  for (let i = 0, len = data.length; i < len; i++) {
    const item = data[i];
    const itemId = compoundIdProperty ? getItemId(item) : item[by];
    const parsedId = typeof itemId === 'number' ? Number(id) : id;

    if (itemId === parsedId) {
      // we found our id
      index = i;
      break;
    }
  }

  return index;
};

export default getIndexBy;
