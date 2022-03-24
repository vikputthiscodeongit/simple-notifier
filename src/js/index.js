const mergeOptions = require("merge-options");
import { getPropValue, motionAllowed, timeToMs } from "@codebundlesbyvik/css-operations";
import createEl from "@codebundlesbyvik/element-operations";
import getRandomIntUnder from "@codebundlesbyvik/number-operations";

const defaultOptions = {
    autoHide: true,            // Number / Boolean
    onlyOneNotification: true, // Boolean
    parentEl: document.body,   // Element
    position: "top center",    // String
    animations: "auto"         // String / Boolean
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

    static nodeClasses = {
        wrapper: "simple-notifier",
        notification: "simple-notification",
        typeRegex: /simple-notification--[A-Za-z]+/g,
        shown: "is-shown",
        anim: {
            base: "animated",
            show: "fadeIn",
            hide: "fadeOut"
        }
    }

    static nodeSkeletons = {
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
    };

    static defaultMsgData = {
        notext: {
            text: "This is some dummy text for you, because none was passed in.",
            type: "debug"
        },
        notype: {
            type: "default"
        }
    };

    get animated() {
        switch(this.motionPref) {
            case "undefined":
            case "auto":
                return motionAllowed();
            default:
                return this.motionPref;
        }
    }

    get hideCallTimeout() {
        switch(this.autoHide) {
            case true:
                return 3500;
            case false:
                return 0;
            default:
                return this.autoHide;
        }
    }

    _eventCallbackShown(e) {
        console.log(`SN: notificationShown event dispatched by notification ${e.detail.id}.`);
    }

    _eventCallbackDestroyed(e) {
        console.log(`SN: notificationDestroyed event dispatched by notification ${e.detail.id}.`);
    }

    init() {
        console.log("SN: Running .init()...");

        if (this.instanceId) {
            throw new Error("SN: .init() has already been called on this instance.");
        }

        this.instanceId = getRandomIntUnder(1000);

        const wrapperEl = createEl(
            SN.nodeSkeletons.wrapper.tagName,
            SN.nodeSkeletons.wrapper.attrs
        );

        this.nodes.wrapper.dataset.instanceId = this.instanceId;

        const parentElFChild = this.parentEl.firstElementChild;

        // Insert the instance in the DOM after any earlier initialized instances sharing the same parentEl.
        const wrapperSibling = parentElFChild.classList.contains("simple-notifier")
            ? parentElFChild.nextElementSibling
            : parentElFChild;

        this.parentEl.insertBefore(this.nodes.wrapper, wrapperSibling);

        const screenPosArray = this.position.split(" ");

        // If only a y-position is set by the user, add an x-position.
        if (screenPosArray.length === 1) {
            screenPosArray[1] = "center";
        }

        this.nodes.wrapper.classList.add(
            `${SN.nodeClasses.wrapper}--pos-y-${screenPosArray[0]}`,
            `${SN.nodeClasses.wrapper}--pos-x-${screenPosArray[1]}`
        );
    }

    show(text, type) {
        console.log("SN: Running .show()...");

        if (!this.instanceId) {
            throw new Error("SN: .init() must be once before usage!");
        }

        if (this.onlyOne.set) {
            if (this.onlyOne.states.inReshow) {
                console.log("SN: onlyOneNotification === true and .show() was called during execution ._reshowNotification(). Returning.");

                return;
            }

            if (this.onlyOne.states.isVisible) {
                console.log("SN: onlyOneNotification === true and notification is currently visible. Calling ._reshowNotification()...");

                this._reshowNotification(text, type);

                return;
            }

            this.onlyOne.states.inShow = true;
        }

        let nId = this.nId;

        if (!this.onlyOne.set) {
            this.nId++;
        }

        this._initNotification(nId);

        this._getMsgData(nId, text, type);

        this._showNewNotification(nId);

        if (this.onlyOne.set) {
            this.onlyOne.states.inShow = false;
        }
    }

    _initNotification(nId) {
        console.log(`SN: Running ._initNotification() on nId ${nId}...`);

        // Nodes
        this.nodes[nId] = {};

        for (const [role, values] of Object.entries(SN.nodeSkeletons)) {
            if (role === "wrapper")
                continue;

            const el = createEl(values.tagName, values.attrs);

            this.nodes[nId][role] = el;

            if (role === "notification") {
                this.nodes.wrapper.insertBefore(el, this.nodes.wrapper.firstElementChild);
            } else {
                this.nodes[nId].notification.append(el);
            }
        }

        this.nodes[nId].notification.dataset.notificationId = nId;

        this.timeoutIds[nId] = {};

        // Events
        this.events[nId] = {};

        this.events[nId].shown =
            new CustomEvent("notificationShown", { detail: { id: nId } });
        this.events[nId].destroyed =
            new CustomEvent("notificationDestroyed", { detail: { id: nId } });

        this.events[nId].shown.cbBound = this._eventCallbackShown.bind(this);
        this.events[nId].destroyed.cbBound = this._eventCallbackDestroyed.bind(this);

        this.nodes.wrapper
            .addEventListener("notificationShown", this.events[nId].shown.cbBound);
        this.nodes.wrapper
            .addEventListener("notificationDestroyed", this.events[nId].destroyed.cbBound);
    }

    _getMsgData(nId, text, type) {
        console.log(`SN: Running ._getMsgData on nId ${nId}...`);

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
        console.log(`SN: Running ._showNewNotification() on nId ${nId}...`);

        if (this.onlyOne.set) {
            this.onlyOne.states.inShowNew = true;
        }

        this.animatedRun = this.animated;

        this.nodes[nId].message.textContent = this.msgData[nId].text;

        this.nodes[nId].notification.classList.add(
            `${SN.nodeClasses.notification}--${this.msgData[nId].type}`,
               SN.nodeClasses.shown
        );

        if (this.onlyOne.set) {
            this.onlyOne.states.isVisible = true;
        }

        if (this.animatedRun) {
            this.nodes[nId].notification.classList.add(
                SN.nodeClasses.anim.base,
                SN.nodeClasses.anim.show
            );

            const animTimeout = timeToMs(getPropValue(
                this.nodes[nId].notification,
                "animation-duration"
            ));

            this.timeoutIds[nId].showAnim = setTimeout(() => {
                this.nodes[nId].notification.classList.remove(SN.nodeClasses.anim.show);

                this.timeoutIds[nId].showAnim = null;
            }, animTimeout);
        }

        this.nodes.wrapper.dispatchEvent(this.events[nId].shown);

        this.nodes.wrapper
            .removeEventListener("notificationShown", this.events[nId].shown.cbBound);
        delete this.events[nId].shown;

        if (this.hideCallTimeout > 0) {
            this.timeoutIds[nId].hideCall = setTimeout(() => {
                this.hide(nId);

                this.timeoutIds[nId].hideCall = null;
            }, this.hideCallTimeout);
        } else {
            this.animatedRun = null;
        }

        if (this.onlyOne.set) {
            this.onlyOne.states.inShowNew = false;
        }
    }

    _reshowNotification(text, type) {
        console.log("SN: Running ._reshowNotification()...");

        this.onlyOne.states.inReshow = true;

        this.onlyOne.nextMsgData.text = text;
        this.onlyOne.nextMsgData.type = type;

        clearTimeout(this.timeoutIds[1].hideCall);
        this.timeoutIds[1].hideCall = null;

        this.hide(1);
    }

    hide(nId) {
        console.log(`SN: Running .hide() on nId ${nId}...`);

        if (this.onlyOne.set) {
            if (this.onlyOne.states.inHide) {
                console.log("SN: onlyOneNotification === true and .hide() was called whilst already running. Returning.");

                return;
            }

            this.onlyOne.states.inHide = true;
        }

        let nIdsArray;

        if (typeof nId === "number") {
            if (this.msgData[nId] === "undefined") {
                console.warn(`SN: .hide() was called on a non-existant notification. Returning!`);

                return;
            }

            nIdsArray = [nId];
        }

        if (typeof nId === "undefined") {
            nIdsArray = Object.keys(this.msgData);

            if (nIdsArray.length === 0) {
                console.warn("SN: .hide() was called, but no notification is currently shown. Returning!");

                return;
            }
        }

        let i = 1;

        nIdsArray.forEach((id) => {
            this._hideNotification(id);

            i++;

            if (this.onlyOne.set && i > nIdsArray.length) {
                this.onlyOne.states.inHide = false;
            }
        });
    }

    _hideNotification(nId) {
        console.log(`SN: Running ._hideNotification() on nId ${nId}...`);

        if (this.animatedRun === null) {
            this.animatedRun = this.animated;
        }

        let animTimeout = 0;

        if (this.animatedRun) {
            this.nodes[nId].notification.classList.add(SN.nodeClasses.anim.hide);

            animTimeout = timeToMs(getPropValue(
                this.nodes[nId].notification,
                "animation-duration"
            ));
        }

        this.timeoutIds[nId].hideAnim = setTimeout(() => {
            this.nodes[nId].notification.classList.remove(SN.nodeClasses.shown);
            this.nodes[nId].notification.className =
                this.nodes[nId].notification.className.replace(SN.nodeClasses.typeRegex, "");

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
        console.log(`SN: Running ._destroyNotification() on nId ${nId}...`);

        const nodesArrayKeys = Object.keys(this.nodes[nId]);
        const nodesArrayValues = Object.values(this.nodes[nId]);

        new Promise((resolve) => {
            let nodeKey = 0;

            nodesArrayValues.forEach((node) => {
                node.remove();

                nodeKey++;

                if (nodeKey === nodesArrayKeys.length) {
                    resolve("All nodes were removed succesfully.");
                }
            });
        })
            .then(() => {
                this.nodes.wrapper.dispatchEvent(this.events[nId].destroyed);

                this.nodes.wrapper.removeEventListener(
                    "notificationDestroyed",
                    this.events[nId].destroyed.cbBound
                );
                delete this.events[nId];

                delete this.nodes[nId];
                delete this.msgData[nId];

                this.animatedRun = null;

                this.timeoutIds[nId].hideAnim = null;

                console.log(`SN: Notification ${nId} has succesfully been destroyed.`);

                if (this.onlyOne.set && this.onlyOne.states.inReshow) {
                    this.onlyOne.states.inReshow = false;

                    this.show();
                }
            })
            .catch((error) => {
                throw new Error(error);
            });
    }
}

export default SN;
