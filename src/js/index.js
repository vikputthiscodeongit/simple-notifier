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

    init() {
        console.log("SN: Running .init()...");

        if (this.instanceId) {
            throw new Error(`SN: .init() has already been called on this instance (${this.instanceId}).`);
        }

        this.instanceId = getRandomIntUnder(100000);

        this.nodes.wrapper = createEl(
            SN.nodeSkeletons.wrapper.tagName,
            SN.nodeSkeletons.wrapper.attrs
        );

        this.nodes.wrapper.dataset.instanceId = this.instanceId;

        const parentElFChild = this.parentEl.firstElementChild;

        // Insert the instance in the DOM after any earlier initialized instances sharing the same parentEl.
        const siblingEl = parentElFChild.classList.contains("simple-notifier")
            ? parentElFChild.nextElementSibling
            : parentElFChild;

        this.parentEl.insertBefore(this.nodes.wrapper, siblingEl);

        const screenPosArray = this.position.split(" ");

        // If only a y-position is set by the user, add an x-position.
        if (screenPosArray.length === 1) {
            screenPosArray[1] = "center";
        }

        this.nodes.wrapper.classList.add(
            `${SN.nodeClasses.wrapper}--pos-y-${screenPosArray[0]}`,
            `${SN.nodeClasses.wrapper}--pos-x-${screenPosArray[1]}`
        );

        this.events.allDestroyed = new CustomEvent("allNotificationsDestroyed", { detail: {
            instanceId: this.instanceId
        }});

        console.log(`SN: Instance ${this.instanceId} has been initialized.`);
    }

    destroy() {
        console.log("SN: Running .destroy()...");

        if (!this.instanceId) {
            throw new Error("SN: Instance isn't initialized!");
        }

        if (this.runningDestroy) {
            console.log("SN: .destroy was called whilst already running. Returning.");

            return;
        }

        this.runningDestroy = true;

        this.nodes.wrapper.addEventListener("allNotificationsDestroyed", (e) => {
            console.log("SN: All notifications have been destroyed.");

            this.nodes.wrapper.remove();

            if (this.onlyOne) {
                this.onlyOne.states = {};
                this.onlyOne.nextMsgData = {};
            }

            this.events = {};

            this.nId = 1;

            this.instanceId = null;

            delete this.runningDestroy;

            console.log(`SN: Instance ${e.detail.instanceId} has been destroyed.`);
        });

        this.hide();
    }

    show(text, type) {
        console.log("SN: Running .show()...");

        if (!this.instanceId) {
            throw new Error("SN: Instance isn't initialized!");
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
        console.log(`SN: Running ._initNotification() on nId ${nId}...`);

        this.nodes[nId] = {};

        for (const [role, values] of Object.entries(SN.nodeSkeletons)) {
            if (role === "wrapper")
                continue;

            this.nodes[nId][role] = createEl(values.tagName, values.attrs);

            if (role === "notification") {
                this.nodes.wrapper.insertBefore(
                    this.nodes[nId][role],
                    this.nodes.wrapper.firstElementChild
                );
            } else {
                this.nodes[nId].notification.append(this.nodes[nId][role]);
            }
        }

        this.nodes[nId].notification.dataset.notificationId = nId;

        this.timeoutIds[nId] = {};

        this.events[nId] = {};

        this.events[nId].shown = new CustomEvent("notificationShown", { detail: {
            instanceId: this.instanceId,
            notificationId: nId
        }});
        this.events[nId].destroyed = new CustomEvent("notificationDestroyed", { detail: {
            instanceId: this.instanceId,
            notificationId: nId
        }});

        this.nodes.wrapper.addEventListener(
            "notificationShown",
            this.events[nId].shown,
            { once: true }
        );
        this.nodes.wrapper.addEventListener(
            "notificationDestroyed",
            this.events[nId].destroyed,
            { once: true }
        );
    }

    _getMsgData(nId, text, type) {
        console.log(`SN: Running ._getMsgData on nId ${nId}...`);
        
        if (!nId) {
            console.warn("SN: No nId was passed in. Returning!")

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
        console.log(`SN: Running ._showNewNotification() on nId ${nId}...`);

        this.animatedRun = this.animated;

        this.nodes[nId].message.textContent = this.msgData[nId].text;

        this.nodes[nId].notification.classList.add(
            `${SN.nodeClasses.notification}--${this.msgData[nId].type}`,
               SN.nodeClasses.shown
        );

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
        console.log("SN: Running ._reshowNotification()...");

        this.onlyOne.states.inReshow = true;

        this.onlyOne.nextMsgData.text = text;
        this.onlyOne.nextMsgData.type = type;

        clearTimeout(this.timeoutIds[1].hideCall);

        this.hide(1);
    }

    hide(nId) {
        console.log("SN: Running .hide()...");

        if (!this.instanceId) {
            throw new Error("SN: Instance isn't initialized!");
        }

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

            if (nIdsArray.length > 0) {
                console.log(this.timeoutIds);

                Object.values(this.timeoutIds).forEach((nTimeoutIds) => {
                    Object.values(nTimeoutIds).forEach((timeoutId) => {
                        clearTimeout(timeoutId);
                    });
                });
            }
            else if (this.runningDestroy) {
                this.nodes.wrapper.dispatchEvent(this.events.allDestroyed);
            }
            else {
                console.warn("SN: .hide() was called, but no notification is currently shown. Returning!");

                if (this.onlyOne.set) {
                    this.onlyOne.states.inHide = false;
                }

                return;
            }
        }

        nIdsArray.forEach((id) => {
            this._hideNotification(id);
        });

        if (this.onlyOne.set) {
            this.onlyOne.states.inHide = false;
        }
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
                    resolve("All nodes have succesfully been removed.");
                }
            });
        })
            .then(() => {
                this.animatedRun = null;

                delete this.nodes[nId];
                delete this.msgData[nId];
                delete this.timeoutIds[nId];

                this.nodes.wrapper.dispatchEvent(this.events[nId].destroyed);

                delete this.events[nId];

                console.log(`SN: Notification ${nId} has succesfully been destroyed.`);

                if (Object.keys(this.msgData).length === 0) {
                    this.nodes.wrapper.dispatchEvent(this.events.allDestroyed);
                }

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
