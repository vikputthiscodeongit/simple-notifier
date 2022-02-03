// TODO - 0.9.0:
// .show() logic when an instance is already showing a message needs improvement.
    // A single SimpleNotifier displays at most a single message.
    // Should .show() be called when a message is already being shown, .hide() it and .show() the new one.

// TODO - 1.0.0:
// Integrate babel.
// Include SCSS respond-above mixin.
// Streamline build process (include SCSS).

import * as cssTimeToMs from "css-duration";
import motionAllowed from "@codebundlesbyvik/css-media-functions";
import { createEl, getElCssValue } from "@codebundlesbyvik/element-operations";
import getRandomIntUnder from "@codebundlesbyvik/number-operations";

// options = {
    // autoHide: Define if notification will be automatically hidden after calling .show(). - false / time in ms - Default is 3500.
    // parentEl: Define the notifier's parent element. Default is <body>.
    // motionPref: Define animation preference. - true / false / "auto" - Default is "auto", which checks prefers-reduced-motion every .show().
// }

class SimpleNotifier {
    constructor(options = {}) {
        this.autoHide = 3500;
        this.parentEl = options.parentEl || document.body;
        this.motionPref = options.motionPref || "auto";
        this.animated = null;

        this.notifierId = null;
        this.msgTimeoutId = null;

        this.nodes = {
            notifier: null,
            message: null
        };
    }

    static nodeSkeletons = [
        {
            tagName: "div",
            role: "notifier",
            attrs: {
                class: "simple-notifier"
            }
        },
        {
            tagName: "p",
            role: "message",
            attrs: {
                class: "simple-notifier__message"
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

    static animClasses = {
        show: [ "animated", "fadeIn" ],
        hide: [ "animated", "fadeOut" ]
    }

    static typeRegex = /(notifier--[A-Za-z]+)/g;

    init() {
        console.log("In SimpleNotifier.init().");

        this.notifierId = getRandomIntUnder(1000);

        SimpleNotifier.nodeSkeletons.forEach((skeleton) => {
            const el = createEl(skeleton.tagName, skeleton.attrs);

            this.nodes[skeleton.role] = el;

            if (skeleton.role === "notifier") {
                this.parentEl.insertBefore(el, this.parentEl.firstElementChild);
            } else {
                this.nodes.notifier.append(el);
            }
        });
    }

    destroy() {
        // Code
    }

    show(text, type) {
        console.log("In SimpleNotifier.show().");

        if (!this.notifierId) {
            console.error("init() method must be called at least once before usage!");

            return;
        }

        if (this.animated === null) {
            this.animated = this.motionPref === "auto" ? motionAllowed() : this.motionPref;
        }

        if (this.msgTimeoutId) {
            clearTimeout(this.msgTimeoutId);
            this.msgTimeoutId = null;

            if (this.nodes.notifier.className.match(SimpleNotifier.typeRegex)) {
                this.nodes.notifier.className =
                    this.nodes.notifier.className.replace(SimpleNotifier.typeRegex, "");
            }
        }

        if (!text) {
            type = SimpleNotifier.defaultMsgData.notext.type;
            text = SimpleNotifier.defaultMsgData.notext.text;
        }

        this.nodes.message.textContent = text;

        if (!type) {
            type = SimpleNotifier.defaultMsgData.notype.type;
        }

        this.nodes.notifier.classList.add(`notifier--${type}`, "is-shown");

        if (this.animated === true) {
            this.nodes.notifier.classList.add(...SimpleNotifier.animClasses.show);

            const timeout = cssTimeToMs(getElCssValue(this.nodes.notifier, "animation-duration"));

            setTimeout(() => {
                this.nodes.notifier.classList.remove(...SimpleNotifier.animClasses.show);
            }, timeout);
        }

        if (typeof this.autoHide === "number" && this.autoHide > 0) {
            this.msgTimeoutId = setTimeout(() => {
                this.hide();
            }, this.autoHide);
        }
    }

    hide() {
        console.log("In SimpleNotifier.hide().");

        clearTimeout(this.msgTimeoutId);
        this.msgTimeoutId = null;

        let timeout = 0;

        if (this.animated === true) {
            this.nodes.notifier.classList.add(...SimpleNotifier.animClasses.hide);

            timeout = cssTimeToMs(getElCssValue(this.nodes.notifier, "animation-duration"));
        }

        setTimeout(() => {
            this.nodes.notifier.classList.remove("is-shown");
            this.nodes.notifier.className =
                this.nodes.notifier.className.replace(SimpleNotifier.typeRegex, "");

            if (this.animated === true) {
                this.nodes.notifier.classList.remove(...SimpleNotifier.animClasses.hide);
            }

            this.nodes.message.textContent = "";

            this.animated = null;
        }, timeout);
    }
}

export default SimpleNotifier;
