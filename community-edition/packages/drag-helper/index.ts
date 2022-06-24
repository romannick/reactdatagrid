/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Region from '../region-align';

import once from './utils/once';
import isMobile from '../isMobile';
import { getGlobal } from '../../getGlobal';
import { TypeConfig } from '../../types';

type Event = MouseEvent & TouchEvent;

type HelperConfig = {
  mobile?: boolean;
  onDrag: (event: Event, config: TypeConfig) => void;
  onDrop: (event: Event, config: TypeConfig) => void;
  region: any;
  events?: { move: string; up: string };
  constrainTo?: any;
};

type DragConfig = {
  diff: { top: number; left: number };
  dragRegion?: any;
  didDrag?: boolean;
};

type HelperState = {
  config: DragConfig;
  initialRegion?: any;
  dragRegion?: any;
  constrainTo?: any;
  initPageCoords?: { pageX: number; pageY: number };
  didDrag?: boolean;
};

const globalObject = getGlobal();

var Helper: any = function(
  this: { config: HelperConfig },
  config: HelperConfig
) {
  this.config = config;
};

const getEvents = (mobile: boolean) => {
  return {
    move: mobile ? 'touchmove' : 'mousemove',
    up: mobile ? 'touchend' : 'mouseup',
  };
};

// function emptyFn() {}

function getPageCoords(event: Event, mobile: boolean) {
  var firstTouch;

  var pageX = event.pageX;
  var pageY = event.pageY;

  if (mobile && event.touches && (firstTouch = event.touches[0])) {
    pageX = firstTouch.pageX;
    pageY = firstTouch.pageY;
  }

  return {
    pageX: pageX,
    pageY: pageY,
  };
}

Object.assign(Helper.prototype, {
  /**
   * Should be called on a mousedown event
   *
   * @param  {Event} event
   * @return {[type]}       [description]
   */
  initDrag: function(
    this: {
      config: HelperConfig;
      onDragInit: (event: Event) => void;
      onDragStart: (event: Event) => void;
    },
    event: Event
  ) {
    this.onDragInit(event);

    let mobile = this.config.mobile;
    if (mobile === undefined) {
      mobile = isMobile;
    }

    var events = this.config.events || getEvents(mobile);

    var onDragStart: any = once(this.onDragStart, this);
    var target = mobile ? event.target : globalObject;

    var mouseUpListener: any = function(this: any, event: Event) {
      this.onDrop(event);

      target && target.removeEventListener(events.move, mouseMoveListener);
      target && target.removeEventListener(events.up, mouseUpListener);
    }.bind(this);

    var mouseMoveListener: any = function(this: any, event: Event) {
      /**
       * Make sure the left mouse button is pressed
       */
      if (!mobile && event.which !== 1) {
        mouseUpListener(event);
        return;
      }

      onDragStart(event, mobile);
      this.onDrag(event, mobile);
    }.bind(this);

    target && target.addEventListener(events.move, mouseMoveListener, false);
    target && target.addEventListener(events.up, mouseUpListener);
  },

  onDragInit: function(
    this: {
      state: HelperState;
      config: HelperConfig;
      callConfig: (fnName: string, event: Event) => void;
    },
    event: Event
  ) {
    var config: DragConfig = {
      diff: {
        left: 0,
        top: 0,
      },
    };

    this.state = {
      config: config,
    };

    if (this.config.region) {
      this.state.initialRegion = Region.from(this.config.region);
      this.state.dragRegion = config.dragRegion = this.state.initialRegion.clone();
    }
    if (this.config.constrainTo) {
      this.state.constrainTo = Region.from(this.config.constrainTo);
    }

    this.callConfig('onDragInit', event);
  },

  /**
   * Called when the first mousemove event occurs after drag is initialized
   * @param  {Event} event
   */
  onDragStart: function(
    this: {
      state: HelperState;
      callConfig: (fnName: string, event: Event) => void;
    },
    event: Event,
    mobile: boolean
  ) {
    this.state.initPageCoords = getPageCoords(event, mobile);

    this.state.didDrag = this.state.config.didDrag = true;
    this.callConfig('onDragStart', event);
  },

  /**
   * Called on all mousemove events after drag is initialized.
   *
   * @param  {Event} event
   */
  onDrag: function(this: any, event: Event, mobile: boolean): void {
    var config = this.state.config;

    var initPageCoords = this.state.initPageCoords;
    var eventCoords = getPageCoords(event, mobile);

    var diff = (config.diff = {
      left: eventCoords.pageX - initPageCoords.pageX,
      top: eventCoords.pageY - initPageCoords.pageY,
    });

    if (this.state.initialRegion) {
      var dragRegion = config.dragRegion;

      //set the dragRegion to initial coords
      dragRegion.set(this.state.initialRegion);

      //shift it to the new position
      dragRegion.shift(diff);

      if (this.state.constrainTo) {
        //and finally constrain it if it's the case
        // var boolConstrained = dragRegion.constrainTo(this.state.constrainTo);

        diff.left = dragRegion.left - this.state.initialRegion.left;
        diff.top = dragRegion.top - this.state.initialRegion.top;
      }

      config.dragRegion = dragRegion;
    }

    this.callConfig('onDrag', event);
  },

  /**
   * Called on the mouseup event on window
   *
   * @param  {Event} event
   */
  onDrop: function(this: any, event: Event) {
    this.callConfig('onDrop', event);

    this.state = null;
  },

  callConfig: function(this: any, fnName: string, event: Event) {
    var config = this.state.config;
    var args = [event, config];

    var fn = this.config[fnName];

    if (fn) {
      fn.apply(this, args);
    }
  },
});

export default function(event: Event, config: any) {
  if (config.scope) {
    var skippedKeys = {
      scope: 1,
      region: 1,
      constrainTo: 1,
    };

    Object.keys(config).forEach(function(key: string) {
      var value: any = config[key];

      if (key in skippedKeys) {
        return;
      }

      if (typeof value == 'function') {
        config[key] = value.bind(config.scope);
      }
    });
  }

  var helper = new Helper(config);

  helper.initDrag(event);

  return helper;
}
