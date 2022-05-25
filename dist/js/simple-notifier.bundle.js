(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SimpleNotifier = factory());
})(this, (function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  var isPlainObj = value => {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
  };

  const isOptionObject = isPlainObj;
  const {
    hasOwnProperty
  } = Object.prototype;
  const {
    propertyIsEnumerable
  } = Object;

  const defineProperty = (object, name, value) => Object.defineProperty(object, name, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });

  const globalThis$1 = commonjsGlobal;
  const defaultMergeOptions = {
    concatArrays: false,
    ignoreUndefined: false
  };

  const getEnumerableOwnPropertyKeys = value => {
    const keys = [];

    for (const key in value) {
      if (hasOwnProperty.call(value, key)) {
        keys.push(key);
      }
    }
    /* istanbul ignore else  */


    if (Object.getOwnPropertySymbols) {
      const symbols = Object.getOwnPropertySymbols(value);

      for (const symbol of symbols) {
        if (propertyIsEnumerable.call(value, symbol)) {
          keys.push(symbol);
        }
      }
    }

    return keys;
  };

  function clone(value) {
    if (Array.isArray(value)) {
      return cloneArray(value);
    }

    if (isOptionObject(value)) {
      return cloneOptionObject(value);
    }

    return value;
  }

  function cloneArray(array) {
    const result = array.slice(0, 0);
    getEnumerableOwnPropertyKeys(array).forEach(key => {
      defineProperty(result, key, clone(array[key]));
    });
    return result;
  }

  function cloneOptionObject(object) {
    const result = Object.getPrototypeOf(object) === null ? Object.create(null) : {};
    getEnumerableOwnPropertyKeys(object).forEach(key => {
      defineProperty(result, key, clone(object[key]));
    });
    return result;
  }
  /**
   * @param {*} merged already cloned
   * @param {*} source something to merge
   * @param {string[]} keys keys to merge
   * @param {Object} config Config Object
   * @returns {*} cloned Object
   */


  const mergeKeys = (merged, source, keys, config) => {
    keys.forEach(key => {
      if (typeof source[key] === 'undefined' && config.ignoreUndefined) {
        return;
      } // Do not recurse into prototype chain of merged


      if (key in merged && merged[key] !== Object.getPrototypeOf(merged)) {
        defineProperty(merged, key, merge(merged[key], source[key], config));
      } else {
        defineProperty(merged, key, clone(source[key]));
      }
    });
    return merged;
  };
  /**
   * @param {*} merged already cloned
   * @param {*} source something to merge
   * @param {Object} config Config Object
   * @returns {*} cloned Object
   *
   * see [Array.prototype.concat ( ...arguments )](http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.concat)
   */


  const concatArrays = (merged, source, config) => {
    let result = merged.slice(0, 0);
    let resultIndex = 0;
    [merged, source].forEach(array => {
      const indices = []; // `result.concat(array)` with cloning

      for (let k = 0; k < array.length; k++) {
        if (!hasOwnProperty.call(array, k)) {
          continue;
        }

        indices.push(String(k));

        if (array === merged) {
          // Already cloned
          defineProperty(result, resultIndex++, array[k]);
        } else {
          defineProperty(result, resultIndex++, clone(array[k]));
        }
      } // Merge non-index keys


      result = mergeKeys(result, array, getEnumerableOwnPropertyKeys(array).filter(key => !indices.includes(key)), config);
    });
    return result;
  };
  /**
   * @param {*} merged already cloned
   * @param {*} source something to merge
   * @param {Object} config Config Object
   * @returns {*} cloned Object
   */


  function merge(merged, source, config) {
    if (config.concatArrays && Array.isArray(merged) && Array.isArray(source)) {
      return concatArrays(merged, source, config);
    }

    if (!isOptionObject(source) || !isOptionObject(merged)) {
      return clone(source);
    }

    return mergeKeys(merged, source, getEnumerableOwnPropertyKeys(source), config);
  }

  var mergeOptions$1 = function (...options) {
    const config = merge(clone(defaultMergeOptions), this !== globalThis$1 && this || {}, defaultMergeOptions);
    let merged = {
      _: {}
    };

    for (const option of options) {
      if (option === undefined) {
        continue;
      }

      if (!isOptionObject(option)) {
        throw new TypeError('`' + option + '` is not an Option Object');
      }

      merged = merge(merged, {
        _: option
      }, config);
    }

    return merged._;
  };

  function getPropValue(el, prop) {
    const elStyles = window.getComputedStyle(el);
    const propValue = elStyles.getPropertyValue(prop);
    return propValue === "" ? null : propValue;
  }

  function getUnit(value) {
    let length = value.length;

    if (!value || !length) {
      return null;
    }

    let i = length;

    while (i--) {
      if (!isNaN(value[i])) {
        return value.slice(i + 1, length) || null;
      }
    }

    return null;
  }

  function motionAllowed() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function timeToMs(time) {
    const number = parseFloat(time);

    switch (getUnit(time)) {
      case null:
      case "ms":
        return number;

      case "s":
        return number * 1000;

      case "m":
        return number * 60000;

      case "h":
        return number * 3600000;

      case "d":
        return number * 86400000;

      case "w":
        return number * 604800000;

      case "y":
        return number * 31536000000;

      default:
        return null;
    }
  }

  function createEl(tagName, attrs) {
    const el = document.createElement(tagName);

    if (attrs) {
      for (let [prop, val] of Object.entries(attrs)) {
        prop = prop.replace(/[A-Z0-9]/g, letter => `-${letter.toLowerCase()}`);
        el.setAttribute(prop, val);
      }
    }

    return el;
  }

  // Get a random integer under a given number.
  function getRandomIntUnder(max, includeMax) {
    const int = includeMax === true ? 0 : 1;
    return Math.floor(Math.random() * (max - int));
  }

  const mergeOptions = mergeOptions$1;
  const defaultOptions = {
    autoHide: true,
    // Number / Boolean
    onlyOneNotification: true,
    // Boolean
    parentEl: document.body,
    // Element
    position: "top center",
    // String
    animations: "auto" // String / Boolean

  };

  class SN {
    constructor(userOptions = {}) {
      this.mergedOptions = mergeOptions(defaultOptions, userOptions);
      this.autoHide = this.mergedOptions.autoHide;
      this.parentEl = this.mergedOptions.parentEl;
      this.position = this.mergedOptions.position;
      this.motionPref = this.mergedOptions.animations;
      this.instanceId = null;
      this.nId = 1;
      this.nodes = {};
      this.msgData = {};
      this.timeoutIds = {};
      this.events = {};
      this.onlyOne = {
        set: this.mergedOptions.onlyOneNotification,
        states: {},
        nextMsgData: {}
      };
      this.animatedRun = null;
    }

    get animated() {
      switch (this.motionPref) {
        case "undefined":
        case "auto":
          return motionAllowed();

        default:
          return this.motionPref;
      }
    }

    get hideCallTimeout() {
      switch (this.autoHide) {
        case true:
          return 3500;

        case false:
          return 0;

        default:
          return this.autoHide;
      }
    }

    init() {
      if (this.instanceId) {
        throw new Error(`SN: .init() has already been called on this instance (${this.instanceId}).`);
      }

      this.instanceId = getRandomIntUnder(100000);
      this.nodes.wrapper = createEl(SN.nodeSkeletons.wrapper.tagName, SN.nodeSkeletons.wrapper.attrs);
      this.nodes.wrapper.dataset.instanceId = this.instanceId;
      const parentElFChild = this.parentEl.firstElementChild; // Insert the instance in the DOM after any earlier initialized instances sharing the same parentEl.

      const siblingEl = parentElFChild.classList.contains("simple-notifier") ? parentElFChild.nextElementSibling : parentElFChild;
      this.parentEl.insertBefore(this.nodes.wrapper, siblingEl);
      const screenPosArray = this.position.split(" "); // If only a y-position is set by the user, add an x-position.

      if (screenPosArray.length === 1) {
        screenPosArray[1] = "center";
      }

      this.nodes.wrapper.classList.add(`${SN.nodeClasses.wrapper}--pos-y-${screenPosArray[0]}`, `${SN.nodeClasses.wrapper}--pos-x-${screenPosArray[1]}`);
      this.events.allDestroyed = new CustomEvent("allNotificationsDestroyed", {
        detail: {
          instanceId: this.instanceId
        }
      });
    }

    destroy() {
      if (!this.instanceId) {
        throw new Error("SN: Instance isn't initialized!");
      }

      if (this.runningDestroy) {
        return;
      }

      this.runningDestroy = true;
      this.nodes.wrapper.addEventListener("allNotificationsDestroyed", e => {
        this.nodes.wrapper.remove();

        if (this.onlyOne) {
          this.onlyOne.states = {};
          this.onlyOne.nextMsgData = {};
        }

        this.events = {};
        this.nId = 1;
        this.instanceId = null;
        delete this.runningDestroy;
      });
      this.hide();
    }

    show(text, type) {
      if (!this.instanceId) {
        throw new Error("SN: Instance isn't initialized!");
      }

      if (this.onlyOne.set) {
        if (this.onlyOne.states.inReshow) {
          return;
        }

        if (this.onlyOne.states.isVisible) {
          this._reshowNotification(text, type);

          return;
        }
      }

      let nId = this.nId;

      if (!this.onlyOne.set) {
        this.nId++;
      }

      this._initNotification(nId);

      this._getMsgData(nId, text, type);

      this._showNewNotification(nId);
    }

    _initNotification(nId) {
      this.nodes[nId] = {};

      for (const [role, values] of Object.entries(SN.nodeSkeletons)) {
        if (role === "wrapper") continue;
        this.nodes[nId][role] = createEl(values.tagName, values.attrs);

        if (role === "notification") {
          this.nodes.wrapper.insertBefore(this.nodes[nId][role], this.nodes.wrapper.firstElementChild);
        } else {
          this.nodes[nId].notification.append(this.nodes[nId][role]);
        }
      }

      this.nodes[nId].notification.dataset.notificationId = nId;
      this.timeoutIds[nId] = {};
      this.events[nId] = {};
      this.events[nId].shown = new CustomEvent("notificationShown", {
        detail: {
          instanceId: this.instanceId,
          notificationId: nId
        }
      });
      this.events[nId].destroyed = new CustomEvent("notificationDestroyed", {
        detail: {
          instanceId: this.instanceId,
          notificationId: nId
        }
      });
      this.nodes.wrapper.addEventListener("notificationShown", this.events[nId].shown, {
        once: true
      });
      this.nodes.wrapper.addEventListener("notificationDestroyed", this.events[nId].destroyed, {
        once: true
      });
    }

    _getMsgData(nId, text, type) {
      if (!nId) {
        return;
      }

      if (!text) {
        if (this.onlyOne.nextMsgData) {
          text = this.onlyOne.nextMsgData.text;
          type = this.onlyOne.nextMsgData.type;
          this.onlyOne.nextMsgData = {};
        } else {
          text = SN.defaultMsgData.notext.text;
          type = SN.defaultMsgData.notext.type;
        }
      }

      if (!type) {
        type = SN.defaultMsgData.notype.type;
      }

      this.msgData[nId] = {};
      this.msgData[nId].text = text;
      this.msgData[nId].type = type;
    }

    _showNewNotification(nId) {
      this.animatedRun = this.animated;
      this.nodes[nId].message.textContent = this.msgData[nId].text;
      this.nodes[nId].notification.classList.add(`${SN.nodeClasses.notification}--${this.msgData[nId].type}`, SN.nodeClasses.shown);

      if (this.animatedRun) {
        this.nodes[nId].notification.classList.add(SN.nodeClasses.anim.base, SN.nodeClasses.anim.show);
        const animTimeout = timeToMs(getPropValue(this.nodes[nId].notification, "animation-duration"));
        this.timeoutIds[nId].showAnim = setTimeout(() => {
          this.nodes[nId].notification.classList.remove(SN.nodeClasses.anim.show);
        }, animTimeout);
      }

      if (this.onlyOne.set) {
        this.onlyOne.states.isVisible = true;
      }

      this.nodes.wrapper.dispatchEvent(this.events[nId].shown);

      if (this.hideCallTimeout > 0) {
        this.timeoutIds[nId].hideCall = setTimeout(() => {
          this.hide(nId);
        }, this.hideCallTimeout);
      } else {
        this.animatedRun = null;
      }
    }

    _reshowNotification(text, type) {
      this.onlyOne.states.inReshow = true;
      this.onlyOne.nextMsgData.text = text;
      this.onlyOne.nextMsgData.type = type;
      clearTimeout(this.timeoutIds[1].hideCall);
      this.hide(1);
    }

    hide(nId) {
      if (!this.instanceId) {
        throw new Error("SN: Instance isn't initialized!");
      }

      if (this.onlyOne.set) {
        if (this.onlyOne.states.inHide) {
          return;
        }

        this.onlyOne.states.inHide = true;
      }

      let nIdsArray;

      if (typeof nId === "number") {
        if (this.msgData[nId] === "undefined") {
          return;
        }

        nIdsArray = [nId];
      }

      if (typeof nId === "undefined") {
        nIdsArray = Object.keys(this.msgData);

        if (nIdsArray.length > 0) {
          Object.values(this.timeoutIds).forEach(nTimeoutIds => {
            Object.values(nTimeoutIds).forEach(timeoutId => {
              clearTimeout(timeoutId);
            });
          });
        } else if (this.runningDestroy) {
          this.nodes.wrapper.dispatchEvent(this.events.allDestroyed);
        } else {
          if (this.onlyOne.set) {
            this.onlyOne.states.inHide = false;
          }

          return;
        }
      }

      nIdsArray.forEach(id => {
        this._hideNotification(id);
      });

      if (this.onlyOne.set) {
        this.onlyOne.states.inHide = false;
      }
    }

    _hideNotification(nId) {
      if (this.animatedRun === null) {
        this.animatedRun = this.animated;
      }

      let animTimeout = 0;

      if (this.animatedRun) {
        this.nodes[nId].notification.classList.add(SN.nodeClasses.anim.hide);
        animTimeout = timeToMs(getPropValue(this.nodes[nId].notification, "animation-duration"));
      }

      this.timeoutIds[nId].hideAnim = setTimeout(() => {
        this.nodes[nId].notification.classList.remove(SN.nodeClasses.shown);
        this.nodes[nId].notification.className = this.nodes[nId].notification.className.replace(SN.nodeClasses.typeRegex, "");

        if (this.animatedRun) {
          this.nodes[nId].notification.classList.remove(SN.nodeClasses.anim.hide);
        }

        if (this.onlyOne.set) {
          this.onlyOne.states.isVisible = false;
        }

        this._destroyNotification(nId);
      }, animTimeout);
    }

    _destroyNotification(nId) {
      const nodesArrayKeys = Object.keys(this.nodes[nId]);
      const nodesArrayValues = Object.values(this.nodes[nId]);
      new Promise(resolve => {
        let nodeKey = 0;
        nodesArrayValues.forEach(node => {
          node.remove();
          nodeKey++;

          if (nodeKey === nodesArrayKeys.length) {
            resolve("All nodes have succesfully been removed.");
          }
        });
      }).then(() => {
        this.animatedRun = null;
        delete this.nodes[nId];
        delete this.msgData[nId];
        delete this.timeoutIds[nId];
        this.nodes.wrapper.dispatchEvent(this.events[nId].destroyed);
        delete this.events[nId];

        if (Object.keys(this.msgData).length === 0) {
          this.nodes.wrapper.dispatchEvent(this.events.allDestroyed);
        }

        if (this.onlyOne.set && this.onlyOne.states.inReshow) {
          this.onlyOne.states.inReshow = false;
          this.show();
        }
      }).catch(error => {
        throw new Error(error);
      });
    }

  }

  _defineProperty(SN, "nodeClasses", {
    wrapper: "simple-notifier",
    notification: "simple-notification",
    typeRegex: /simple-notification--[A-Za-z]+/g,
    shown: "is-shown",
    anim: {
      base: "animated",
      show: "fadeIn",
      hide: "fadeOut"
    }
  });

  _defineProperty(SN, "nodeSkeletons", {
    wrapper: {
      tagName: "div",
      attrs: {
        class: SN.nodeClasses.wrapper
      }
    },
    notification: {
      tagName: "div",
      attrs: {
        class: SN.nodeClasses.notification,
        role: "alert"
      }
    },
    message: {
      tagName: "p",
      attrs: {
        class: `${SN.nodeClasses.notification}__message`
      }
    }
  });

  _defineProperty(SN, "defaultMsgData", {
    notext: {
      text: "This is some dummy text for you, because none was passed in.",
      type: "debug"
    },
    notype: {
      type: "default"
    }
  });

  return SN;

}));
//# sourceMappingURL=simple-notifier.bundle.js.map
