/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

function curry(fn: any, n?: number) {
  if (typeof n !== 'number') {
    n = fn.length;
  }

  function getCurryClosure(prevArgs: any) {
    function curryClosure(this: any, ..._rest: any[]) {
      var len = arguments.length;
      var args: any = [].concat(prevArgs);

      if (len) {
        args.push.apply(args, arguments);
      }

      if (n !== undefined && args.length < n) {
        return getCurryClosure(args);
      }

      return fn.apply(this, args);
    }

    return curryClosure;
  }

  return getCurryClosure([]);
}

export default curry;
