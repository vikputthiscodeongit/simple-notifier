import * as cssTimeToMs from "css-duration";
import motionAllowed from "@codebundlesbyvik/css-media-functions";
import { createEl, getElCssValue } from "@codebundlesbyvik/element-operations";
import getRandomIntUnder from "@codebundlesbyvik/number-operations";

const defaultOptions = {
    autoHide: 3500,          // Number / Boolean
    parentEl: document.body, // Element
    position: "top center",  // String
    animations: "auto"       // String / Boolean
};

class SimpleNotifier {
    constructor(userOptions = {}) {
        this.mergedOptions = Object.assign(defaultOptions, userOptions);

        this.autoHide = this.mergedOptions.autoHide;
        this.parentEl = this.mergedOptions.parentEl;
        this.position = this.mergedOptions.position;
        this.motionPref = this.mergedOptions.animations;
        this.animatedRun = null;

        this.instanceId = null;
        this.states = {
            isShown: null,
            hiding: null,
            reshowing: null
        };
        this.timeoutIds = {
            showAnim: null,
            hideCall: null,
            hideAnim: null
        };
        this.events = {
            isShown: null,
            isHidden: null
        };

        this.nodes = {
            notifier: null,
            message: null
        };
        this.message = {
            text: null,
            type: null
        };
    }

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

    static nodeCls = {
        base: "simple-notifier",
        typeRegex: /simple-notifier--[A-Za-z]+/g,
        shown: "is-shown",
        anim: {
            base: "animated",
            show: "fadeIn",
            hide: "fadeOut"
        }
    }

    static nodeSkeletons = [
        {
            tagName: "div",
            role: "notifier",
            attrs: {
                class: SimpleNotifier.nodeCls.base,
                role: "alert"
            }
        },
        {
            tagName: "p",
            role: "message",
            attrs: {
                class: `${SimpleNotifier.nodeCls.base}__message`
            }
        }
    ];

    static defaultMsgData = {
        notext: {
            text: "This is some dummy text for you, because none was passed in.",
            type: "debug"
        },
        notype: {
            type: "default"
        }
    };

    init() {
        console.log("In SimpleNotifier.init().");

        if (this.instanceId) {
            throw new Error("Can't call .init() on an already initialized instance.");
        }

        this.instanceId = getRandomIntUnder(1000);

        SimpleNotifier.nodeSkeletons.forEach((skeleton) => {
            const el = createEl(skeleton.tagName, skeleton.attrs);

            this.nodes[skeleton.role] = el;

            if (skeleton.role === "notifier") {
                this.parentEl.insertBefore(el, this.parentEl.firstElementChild);
            } else {
                this.nodes.notifier.append(el);
            }
        });

        const screenPosArray = this.position.split(" ");

        if (screenPosArray.length === 1) {
            screenPosArray[1] = "center";
        }

        this.nodes.notifier.classList.add(
            `${SimpleNotifier.nodeCls.base}--pos-y-${screenPosArray[0]}`,
            `${SimpleNotifier.nodeCls.base}--pos-x-${screenPosArray[1]}`
        );

        this.events.isShown = new Event("notifierShown");
        this.nodes.notifier.addEventListener("notifierShown", () => {
            console.log("notifierShown event dispatched.");
        });

        this.events.isHidden = new Event("notifierHidden");
        this.nodes.notifier.addEventListener("notifierHidden", () => {
            console.log("notifierHidden event dispatched.");

            if (this.states.reshowing) {
                this.states.reshowing = false;

                this._newShow();
            }
        });
    }

    destroy() {
        // Code
    }

    show(text, type) {
        console.log("In SimpleNotifier.show().");

        if (!this.instanceId) {
            throw new Error(".init() must be called at least once before usage!");
        }

        if (this.states.reshowing) {
            console.log(".show() was called while executing .reShow(). Returning!");

            return;
        }

        if (!text) {
            type = SimpleNotifier.defaultMsgData.notext.type;
            text = SimpleNotifier.defaultMsgData.notext.text;
        }

        if (!type) {
            type = SimpleNotifier.defaultMsgData.notype.type;
        }

        this.message.text = text;
        this.message.type = type;

        if (this.states.isShown) {
            console.log("A notification is already being shown. Calling .reShow().");

            this._reShow();
        } else {
            console.log("No notification is currently shown. Calling .newShow().");

            this._newShow();
        }
    }

    _newShow() {
        console.log("In SimpleNotifier.newShow().");

        this.animatedRun = this.animated;

        this.nodes.message.textContent = this.message.text;

        this.nodes.notifier.classList.add(
            `${SimpleNotifier.nodeCls.base}--${this.message.type}`,
            SimpleNotifier.nodeCls.shown
        );

        this.states.isShown = true;

        this.nodes.notifier.dispatchEvent(this.events.isShown);

        if (this.animatedRun) {
            this.nodes.notifier.classList.add(
                SimpleNotifier.nodeCls.anim.base,
                SimpleNotifier.nodeCls.anim.show
            );

            const toDur = cssTimeToMs(getElCssValue(this.nodes.notifier, "animation-duration"));

            this.timeoutIds.showAnim = setTimeout(() => {
                this.nodes.notifier.classList.remove(SimpleNotifier.nodeCls.anim.show);

                this.timeoutIds.showAnim = null;
            }, toDur);
        }

        if (this.hideCallTimeout > 0) {
            this.timeoutIds.hideCall = setTimeout(() => {
                this.hide();

                this.timeoutIds.hideCall = null;
            }, this.hideCallTimeout);
        }
    }

    _reShow() {
        console.log("In SimpleNotifier.reShow().");

        this.states.reshowing = true;

        clearTimeout(this.timeoutIds.hideCall);

        this.hide();
    }

    hide() {
        console.log("In SimpleNotifier.hide().");

        if (this.states.hiding) {
            console.log(".hide() was called whilst already running. Returning!");

            return;
        }

        this.states.hiding = true;

        let toDur = 0;

        if (this.animatedRun) {
            this.nodes.notifier.classList.add(SimpleNotifier.nodeCls.anim.hide);

            toDur = cssTimeToMs(getElCssValue(this.nodes.notifier, "animation-duration"));
        }

        this.timeoutIds.hideAnim = setTimeout(() => {
            this.nodes.notifier.classList.remove(SimpleNotifier.nodeCls.shown);
            this.nodes.notifier.className =
                this.nodes.notifier.className.replace(SimpleNotifier.nodeCls.typeRegex, "");

            this.states.isShown = false;

            this.nodes.message.textContent = "";

            if (this.animatedRun) {
                this.nodes.notifier.classList.remove(SimpleNotifier.nodeCls.anim.hide);

                if (!this.states.reshowing) {
                    this.nodes.notifier.classList.remove(SimpleNotifier.nodeCls.anim.base);
                }
            }

            this.animatedRun = null;

            this.states.hiding = false;

            this.nodes.notifier.dispatchEvent(this.events.isHidden);

            this.timeoutIds.hideAnim = null;
        }, toDur);
    }
}

export default SimpleNotifier;
