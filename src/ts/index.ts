import {
    createEl,
    cssDurationToMs,
    getCssPropValue,
    getPseudoRandomIntBetween,
    isMotionAllowed,
    wait,
} from "@codebundlesbyvik/js-helpers";
import "../scss/simple-notifier.scss";

type PositionY = "top" | "bottom";
type PositionX = "left" | "center" | "right";

interface AllInstanceOptions {
    parentEl: HTMLElement;
    position: [PositionY, PositionX];
    dismissable: boolean;
    hideAfter: number;
    singleNotification: boolean;
}
interface InstanceOptions extends Partial<AllInstanceOptions> {}
interface NotificationOptions
    extends Partial<Pick<AllInstanceOptions, "dismissable" | "hideAfter" | "singleNotification">> {
    text: string;
    title?: string;
    type?: string;
}

const DEFAULT_INSTANCE_OPTIONS: AllInstanceOptions = {
    parentEl: document.body,
    position: ["top", "center"],
    dismissable: false,
    hideAfter: 4000,
    singleNotification: false,
};

class SN {
    mergedOptions: AllInstanceOptions;

    parentEl: HTMLElement;
    position: [PositionY, PositionX];
    hideAfter: number;
    dismissable: boolean;
    singleNotification: boolean;

    notifierEl: HTMLElement | undefined;
    instanceId: number | null;
    initTryCount: number;
    activeNotifications: {
        [notificationId: number]: {
            abortController: AbortController;
            el: HTMLElement;
        };
    };
    currentNotificationId: number;

    constructor(options: InstanceOptions = {}) {
        this.mergedOptions = {
            ...DEFAULT_INSTANCE_OPTIONS,
            ...options,
        };

        this.parentEl = this.mergedOptions.parentEl;
        this.position = this.mergedOptions.position;

        this.dismissable = this.mergedOptions.dismissable;
        this.hideAfter = this.mergedOptions.hideAfter;
        this.singleNotification = this.mergedOptions.singleNotification;

        this.notifierEl;
        this.instanceId = null;
        this.initTryCount = 0;
        this.activeNotifications = {};
        this.currentNotificationId = 0;
    }

    static instanceIds: number[] = [];

    init() {
        console.log("Running .init()...");
        this.initTryCount++;

        try {
            if (this.instanceId !== null) {
                throw new Error(
                    `.init() has already been called on this instance (${this.instanceId}).`,
                );
            }

            // TODO: Fix in js-helpers.
            this.instanceId = getPseudoRandomIntBelow(100000, false);

            if (SN.instanceIds.includes(this.instanceId)) {
                this.instanceId = null;

                if (this.initTryCount > 2) return;

                this.init();

                return;
            }

            SN.instanceIds.push(this.instanceId);

            this.notifierEl = createEl("div", {
                class: `simple-notifier simple-notifier--pos-y-${this.position[0]} simple-notifier--pos-x-${this.position[1]}`,
                ariaLive: "assertive",
            });
            this.parentEl.insertBefore(this.notifierEl, this.parentEl.firstElementChild);

            // TODO: Fire initialized event.
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown notifier initialization error.");
        }
    }

    async show(textOrOptions: string | NotificationOptions, type?: string) {
        try {
            const options =
                arguments.length === 1 && typeof textOrOptions !== "string"
                    ? (textOrOptions as NotificationOptions)
                    : undefined;

            if (this.singleNotification || !!options?.singleNotification) {
                this.hideAll();
            }

            if (!this.notifierEl) {
                throw new Error("notifierEl not found.");
            }

            this.currentNotificationId++;
            console.log("this.currentNotificationId:", this.currentNotificationId);

            const text = typeof textOrOptions === "string" ? textOrOptions : textOrOptions.text;
            const title = options?.title;
            type = type || options?.type;
            const dismissable = this.dismissable || !!options?.dismissable;
            const notificationEl = this.#makeNotificationEl({
                notificationId: this.currentNotificationId,
                text,
                title,
                type,
                dismissable,
            });

            this.notifierEl.append(notificationEl);

            const abortController = new AbortController();

            this.activeNotifications = {
                ...this.activeNotifications,
                [this.currentNotificationId]: {
                    abortController,
                    el: notificationEl,
                },
            };
            console.log("this.activeNotifications:", this.activeNotifications);

            const hideAfterMs = options?.hideAfter || this.hideAfter;
            const notificationToHideId = this.currentNotificationId; // Pass value, not a reference.

            if (hideAfterMs > 0) {
                try {
                    await wait(hideAfterMs, null, abortController);
                    this.hide(notificationToHideId);
                } catch (errorOrAbortReason) {
                    return errorOrAbortReason;
                }
            }
        } catch (errorOrAbortReason) {
            if (errorOrAbortReason instanceof Error) {
                throw errorOrAbortReason;
            } else {
                console.log(errorOrAbortReason);
            }
        }
    }

    async hide(notificationId: number) {
        console.log("Hiding notification with id:", notificationId);

        const notification = this.activeNotifications[notificationId];

        notification.abortController.abort(`Notification ${notificationId} timeout aborted.`);
        await this.#destroyNotificationEl(notification.el);
        delete this.activeNotifications[notificationId];
    }

    hideAll() {
        for (const notificationId of Object.keys(this.activeNotifications)) {
            this.hide(Number.parseInt(notificationId));
        }
    }

    #makeNotificationEl({
        notificationId,
        text,
        title,
        type,
        dismissable,
    }: {
        notificationId: number;
        text: string;
        title?: string;
        type?: string;
        dismissable: boolean;
    }) {
        const notificationEl = createEl("div", {
            class: `simple-notification simple-notification--${type || "default"}`,
            role: "alert",
        });

        const mainContainerEl = createEl("div", {
            class: "simple-notification__part simple-notification__part--main",
        });

        if (title) {
            const titleEl = createEl("h6", {
                class: "simple-notification__title",
                text: title,
            });

            mainContainerEl.append(titleEl);
        }

        const messageEl = createEl("p", {
            class: "simple-notification__message",
            text,
        });

        mainContainerEl.append(messageEl);
        notificationEl.append(mainContainerEl);

        if (dismissable) {
            const sideContainerEl = createEl("div", {
                class: "simple-notification__part simple-notification__part--side",
            });

            const closeButtonEl = createEl("button", { type: "button" });
            closeButtonEl.addEventListener("click", () => this.hide(notificationId), {
                once: true,
            });

            sideContainerEl.append(closeButtonEl);
            notificationEl.append(sideContainerEl);
        }

        return notificationEl;
    }

    async #destroyNotificationEl(notificationEl: HTMLElement) {
        const cssAnimationDuration = getCssPropValue(notificationEl, "animation-duration");

        const animationTimeMs =
            cssAnimationDuration !== null ? cssDurationToMs(cssAnimationDuration) : 0;
        console.log("animationTimeMs:", animationTimeMs);
        notificationEl.classList.add("fade-out");
        await wait(animationTimeMs);
        console.log("Hiding...");
        notificationEl.remove();
    }
}

export default SN;
