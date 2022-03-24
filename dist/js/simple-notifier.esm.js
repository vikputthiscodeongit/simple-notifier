function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const mergeOptions = require("merge-options");

import { getPropValue, motionAllowed, timeToMs } from "@codebundlesbyvik/css-operations";
import createEl from "@codebundlesbyvik/element-operations";
import getRandomIntUnder from "@codebundlesbyvik/number-operations";
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
  constructor() {
    let userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
      throw new Error("SN: .init() has already been called on this instance (".concat(this.instanceId, ")."));
    }

    this.instanceId = getRandomIntUnder(100000);
    this.nodes.wrapper = createEl(SN.nodeSkeletons.wrapper.tagName, SN.nodeSkeletons.wrapper.attrs);
    this.nodes.wrapper.dataset.instanceId = this.instanceId;
    const parentElFChild = this.parentEl.firstElementChild; // Insert the instance in the DOM after any earlier initialized instances sharing the same parentEl.

    const wrapperSibling = parentElFChild.classList.contains("simple-notifier") ? parentElFChild.nextElementSibling : parentElFChild;
    this.parentEl.insertBefore(this.nodes.wrapper, wrapperSibling);
    const screenPosArray = this.position.split(" "); // If only a y-position is set by the user, add an x-position.

    if (screenPosArray.length === 1) {
      screenPosArray[1] = "center";
    }

    this.nodes.wrapper.classList.add("".concat(SN.nodeClasses.wrapper, "--pos-y-").concat(screenPosArray[0]), "".concat(SN.nodeClasses.wrapper, "--pos-x-").concat(screenPosArray[1]));
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
    this.nodes[nId].notification.classList.add("".concat(SN.nodeClasses.notification, "--").concat(this.msgData[nId].type), SN.nodeClasses.shown);

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
        return;
      }
    }

    let i = 1;
    nIdsArray.forEach(id => {
      this._hideNotification(id);

      i++;

      if (this.onlyOne.set && i > nIdsArray.length) {
        this.onlyOne.states.inHide = false;
      }
    });
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
          resolve("All nodes have been removed succesfully.");
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
      class: "".concat(SN.nodeClasses.notification, "__message")
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

export default SN;

//# sourceMappingURL=simple-notifier.esm.js.map