/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default (className?: string): Function => {
  return (element: string, modifier: string): string => {
    const el = element ? `-${element}` : '';
    const mod = modifier ? `--${modifier}` : '';

    return `${className}${el}${mod}`;
  };
};
