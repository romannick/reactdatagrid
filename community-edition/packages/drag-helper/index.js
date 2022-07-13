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
const globalObject = getGlobal();
var Helper = function (config) {
    this.config = config;
};
const getEvents = (mobile) => {
    return {
        move: mobile ? 'touchmove' : 'mousemove',
        up: mobile ? 'touchend' : 'mouseup',
    };
};
// function emptyFn() {}
function getPageCoords(event, mobile) {
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
    initDrag: function (event) {
        this.onDragInit(event);
        let mobile = this.config.mobile;
        if (mobile === undefined) {
            mobile = isMobile;
        }
        var events = this.config.events || getEvents(mobile);
        var onDragStart = once(this.onDragStart, this);
        var target = mobile ? event.target : globalObject;
        var mouseUpListener = function (event) {
            this.onDrop(event);
            target && target.removeEventListener(events.move, mouseMoveListener);
            target && target.removeEventListener(events.up, mouseUpListener);
        }.bind(this);
        var mouseMoveListener = function (event) {
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
    onDragInit: function (event) {
        var config = {
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
    onDragStart: function (event, mobile) {
        this.state.initPageCoords = getPageCoords(event, mobile);
        this.state.didDrag = this.state.config.didDrag = true;
        this.callConfig('onDragStart', event);
    },
    /**
     * Called on all mousemove events after drag is initialized.
     *
     * @param  {Event} event
     */
    onDrag: function (event, mobile) {
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
    onDrop: function (event) {
        this.callConfig('onDrop', event);
        this.state = null;
    },
    callConfig: function (fnName, event) {
        var config = this.state.config;
        var args = [event, config];
        var fn = this.config[fnName];
        if (fn) {
            fn.apply(this, args);
        }
    },
});
export default function (event, config) {
    if (config.scope) {
        var skippedKeys = {
            scope: 1,
            region: 1,
            constrainTo: 1,
        };
        Object.keys(config).forEach(function (key) {
            var value = config[key];
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
