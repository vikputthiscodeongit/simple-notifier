// TODO:
// * Validate browser support
// * Clean up README

import { createEl, getPseudoRandomIntBetween, wait } from "@codebundlesbyvik/js-helpers";
import "../scss/simple-notifier.scss";

enum NotificationState {
    HIDE_BUSY = "HIDE_BUSY",
    SHOW_BUSY = "SHOW_BUSY",
    SHOWN = "SHOWN",
    WAITING_ON_HIDE = "WAITING_ON_HIDE",
}

interface SharedOptions {
    hideAfterTime: number;
    hideOlder: boolean;
    dismissable: boolean;
}

type PositionY = "top" | "bottom";
type PositionX = "left" | "center" | "right";

interface NotifierOptions extends SharedOptions {
    parentEl: HTMLElement;
    position: [PositionY, PositionX];
    classNames: string[];
}

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface NotificationContent {
    variant?: string;
    text: string | string[];
    title?: string;
    titleLevel?: HeadingLevel;
}

interface NotificationOptions extends Partial<SharedOptions>, NotificationContent {}

interface ProcessedNotificationOptions extends SharedOptions {
    variant: string;
    text: string[];
    title: string | null;
    titleLevel: HeadingLevel;
}

interface NotificationProps extends ProcessedNotificationOptions {
    abortController: AbortController;
    el: HTMLDivElement;
    state: NotificationState;
}

const makeInstanceId = (min: number, max: number, excludeIds: number[], tryCount?: number) => {
    const MAX_TRY_COUNT = 3;

    tryCount = tryCount || 1;
    const id = getPseudoRandomIntBetween(min, max);

    if (excludeIds.includes(id)) {
        if (tryCount > MAX_TRY_COUNT) {
            throw new Error(`Failed to generate a unique instanceId ${MAX_TRY_COUNT} times!`);
        }

        makeInstanceId(min, max, excludeIds, ++tryCount);
    }

    return id;
};

const DEFAULT_INSTANCE_OPTIONS: NotifierOptions = {
    parentEl: document.body,
    position: ["top", "center"],
    hideAfterTime: 4000,
    hideOlder: false,
    dismissable: false,
    classNames: [],
};

class SN {
    hideAfterTime: NotifierOptions["hideAfterTime"];
    hideOlder: NotifierOptions["hideOlder"];
    dismissable: NotifierOptions["dismissable"];

    notifierEl: HTMLDivElement;
    notifications: { [id: string]: NotificationProps };
    currentNotificationId: number;
    queuedNotifications: NotificationOptions[];

    instanceId: number;

    constructor(options: Partial<NotifierOptions> = {}) {
        try {
            const mergedOptions = { ...DEFAULT_INSTANCE_OPTIONS, ...options };

            this.hideAfterTime = mergedOptions.hideAfterTime;
            this.hideOlder = mergedOptions.hideOlder;
            this.dismissable = mergedOptions.dismissable;

            this.notifierEl = createEl("div", {
                class: `simple-notifier simple-notifier--position-x-${mergedOptions.position[1]} simple-notifier--position-y-${mergedOptions.position[0]}`,
                ariaLive: "assertive",
            });
            this.notifierEl.classList.add(...mergedOptions.classNames);

            this.notifications = {};
            this.currentNotificationId = 0;
            this.queuedNotifications = [];

            this.instanceId = makeInstanceId(100000, 1000000, SN.#instanceIds);
            SN.#instanceIds.push(this.instanceId);

            mergedOptions.parentEl.insertBefore(
                this.notifierEl,
                mergedOptions.parentEl.firstElementChild,
            );

            console.info(`SimpleNotifier instance ${this.instanceId} initiated.`);
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during instance initialization!");
        }
    }

    static #instanceIds: number[] = [];

    get notificationIds() {
        return Object.keys(this.notifications).map((key) => Number.parseInt(key));
    }

    show(
        textOrOptions: NotificationOptions["text"] | NotificationOptions,
        variant?: NotificationOptions["variant"],
    ) {
        console.info("SN show() - Running...");

        const notificationText =
            typeof textOrOptions === "string" || Array.isArray(textOrOptions)
                ? textOrOptions
                : textOrOptions.text;

        try {
            if (typeof notificationText !== "string" && !Array.isArray(notificationText)) {
                throw new Error(
                    "'textOrOptions' be a `String` or an `Array` of `Strings`, either passed in directly or via an `Object` as `text` value.",
                );
            }
            if (variant !== undefined && typeof variant !== "string") {
                throw new Error("'variant' must be a `String`.");
            }

            if (
                (typeof textOrOptions === "object" &&
                    !Array.isArray(textOrOptions) &&
                    textOrOptions.hideOlder &&
                    Object.keys(this.notifications).length > 0) ||
                this.queuedNotifications.length > 0
            ) {
                const notificationOptions =
                    typeof textOrOptions === "string" || Array.isArray(textOrOptions)
                        ? { variant, text: textOrOptions }
                        : textOrOptions;
                this.queuedNotifications.push(notificationOptions);
                console.info("SN show() - Notification added to queue:", notificationOptions);

                this.hideAll();

                this.notifierEl.addEventListener(
                    "allhidden",
                    () => {
                        console.info("SN show() - Processing queued notifications...");

                        if (this.queuedNotifications.length === 0) {
                            console.info("SN show() - No notifications in queue.");
                            return;
                        }

                        // Make a copy of the queue because it's possible to continuously trigger
                        // new notifications. Any notifications triggered after a copy of the queue
                        // is made are processed on the next run.
                        // Reverse the queue because all notifications newer than the oldest one
                        // that has `hideOlder` set should be shown. Processing the queue from back
                        // to front makes this easier.
                        const queueCopyReversed = [...this.queuedNotifications].reverse();
                        console.debug(
                            "SN show() - Queued notifications (newest first):",
                            queueCopyReversed,
                        );
                        this.queuedNotifications = [];

                        let notificationsToShowReversed: NotificationOptions[] = [];
                        let count = 0;

                        for (const notificationOptions of queueCopyReversed) {
                            count++;

                            if (!notificationOptions.hideOlder) continue;

                            notificationsToShowReversed = queueCopyReversed.slice(0, count);

                            break;
                        }

                        console.debug(
                            "SN show() - Queued notifications to show (newest first):",
                            notificationsToShowReversed,
                        );

                        // Reverse the queue again so that the oldest notification is the one
                        // that's shown first.
                        notificationsToShowReversed.reverse().forEach((notificationOptions) => {
                            this.show(notificationOptions);
                        });
                    },
                    { once: true },
                );

                return;
            }

            const currentNotificationId = this.currentNotificationId;
            console.info("SN show() - Notification ID:", currentNotificationId);
            this.currentNotificationId++;

            const notificationOptions = this.#getNotificationOptions(textOrOptions, variant);
            const notificationEl = this.#makeNotificationEl(
                currentNotificationId,
                notificationOptions,
            );
            const notificationProps = {
                ...notificationOptions,
                state: NotificationState.SHOW_BUSY,
                el: notificationEl,
                abortController: new AbortController(),
            };
            this.notifications[currentNotificationId] = notificationProps;

            this.notifierEl.append(notificationEl);
            console.info(
                `SN show(): Element of notification ${currentNotificationId} appended to DOM.`,
            );

            notificationEl.addEventListener(
                "animationend",
                () => {
                    console.info(
                        `SN show(): Animation of element of notification ${currentNotificationId} completed.`,
                    );

                    this.notifications[currentNotificationId].state = NotificationState.SHOWN;

                    const notificationShownEvent = new CustomEvent("shown", {
                        detail: {
                            instanceId: this.instanceId,
                            notificationId: currentNotificationId,
                        },
                    });
                    this.notifierEl.dispatchEvent(notificationShownEvent);

                    console.info(`SN show(): Notification ${currentNotificationId} shown.`);

                    if (notificationOptions.hideAfterTime > 0) {
                        const fn = async () => await this.#scheduleHide(currentNotificationId);
                        fn().catch((reason) => console.info(reason));
                    }
                },
                {
                    once: true,
                    signal: notificationProps.abortController.signal,
                },
            );

            if (process.env.NODE_ENV !== "production") {
                notificationEl.addEventListener(
                    "animationcancel",
                    () => {
                        console.debug(
                            `SN show(): Animation of element of notification ${currentNotificationId} cancled.`,
                        );
                    },
                    { once: true },
                );
            }
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during notification show!");
        }
    }

    #getNotificationOptions(
        textOrOptions: NotificationOptions["text"] | NotificationOptions,
        variant?: NotificationOptions["variant"],
    ): ProcessedNotificationOptions {
        const notificationOptions =
            typeof textOrOptions === "object" && !Array.isArray(textOrOptions)
                ? textOrOptions
                : undefined;
        const notificationText = notificationOptions
            ? notificationOptions.text
            : (textOrOptions as string | string[]);
        const mergedOptions = {
            hideAfterTime: notificationOptions?.hideAfterTime ?? this.hideAfterTime,
            hideOlder: notificationOptions?.hideOlder ?? this.hideOlder,
            dismissable: notificationOptions?.dismissable ?? this.dismissable,
            text: Array.isArray(notificationText) ? notificationText : [notificationText],
            title: notificationOptions?.title || null,
            titleLevel: notificationOptions?.titleLevel ?? "h6",
            variant: notificationOptions?.variant ?? variant ?? "default",
        };
        console.debug("SN #getNotificationOptions() - mergedOptions:", mergedOptions);

        return mergedOptions;
    }

    #makeNotificationEl(id: number, options: ProcessedNotificationOptions) {
        const notificationEl = createEl<HTMLDivElement>("div", {
            class: `simple-notification simple-notification--${options.variant} simple-notification--animation-in`,
            role: "alert",
            dataNotificationId: id.toString(),
        });

        const contentEl = createEl("div", {
            class: "simple-notification__part simple-notification__part--main",
        });

        if (options.title) {
            const titleEl = createEl(options.titleLevel, {
                class: "simple-notification__title",
                textContent: options.title,
            });

            contentEl.append(titleEl);
        }

        options.text.forEach((line) => {
            const textEl = createEl("p", { class: "simple-notification__text", textContent: line });

            contentEl.append(textEl);
        });

        notificationEl.append(contentEl);

        if (options.dismissable) {
            const sideContentEl = createEl("div", {
                class: "simple-notification__part simple-notification__part--side",
            });
            const hideButtonEl = createEl("button", {
                type: "button",
                class: "simple-notification__hide-button",
                ariaLabel: "Dismiss notification",
            });
            hideButtonEl.addEventListener("click", () => this.hide(id), {
                once: true,
            });

            sideContentEl.append(hideButtonEl);
            notificationEl.append(sideContentEl);
        }

        console.debug("SN #makeNotificationEl() - notificationEl:", notificationEl);

        return notificationEl;
    }

    async #scheduleHide(id: number) {
        console.info(`SN #scheduleHide(): Running on notification ${id}...`);

        this.notifications[id].state = NotificationState.WAITING_ON_HIDE;

        const notificationProps = this.notifications[id];

        try {
            console.info(
                `SN #scheduleHide(): hide() will be called on notification ${id} in ${notificationProps.hideAfterTime} ms...`,
            );
            await wait(
                notificationProps.hideAfterTime,
                true,
                notificationProps.abortController.signal,
            );

            this.hide(id);
        } catch {
            console.info(
                `SN #scheduleHide(): Scheduled hide() call of notification ${id} aborted.`,
            );
        }
    }

    hide(notificationId: number) {
        console.info(`SN hide(): Running on notification ${notificationId}...`);

        try {
            if (typeof notificationId !== "number") {
                throw new Error("'notificationId' must be a `Number`.");
            }

            if (this.notifications[notificationId].state === NotificationState.HIDE_BUSY) {
                console.warn(`Already hiding notification ${notificationId}.`);
                return;
            }

            const notificationProps = this.notifications[notificationId];

            if (!notificationProps) {
                console.warn(`Notification ${notificationId} doesn't exist.`);
                return;
            }

            if (
                this.notifications[notificationId].state === NotificationState.SHOW_BUSY ||
                this.notifications[notificationId].state === NotificationState.WAITING_ON_HIDE
            ) {
                console.info(
                    `SN hide(): Notification ${notificationId} in show action or waiting on hide action. Aborting any scheduled function calls...`,
                );

                notificationProps.abortController.abort();
            }

            this.notifications[notificationId].state = NotificationState.HIDE_BUSY;

            notificationProps.el.classList.remove("simple-notification--animation-in");
            notificationProps.el.classList.add("simple-notification--animation-out");

            notificationProps.el.addEventListener(
                "animationend",
                () => {
                    console.info(
                        `SN hide(): Animation of element of notification ${notificationId} completed.`,
                    );

                    notificationProps.el.remove();
                    console.info(
                        `SN hide(): Element of notification ${notificationId} removed from DOM.`,
                    );

                    delete this.notifications[notificationId];

                    const notificationHiddenEvent = new CustomEvent("hidden", {
                        detail: {
                            instanceId: this.instanceId,
                            notificationId,
                        },
                    });
                    this.notifierEl.dispatchEvent(notificationHiddenEvent);

                    console.info(`SN hide(): Notification ${notificationId} hidden.`);

                    if (this.notificationIds.length === 0) {
                        console.info(`SN hide(): All notifications hidden.`);

                        const allNotificationsHiddenEvent = new CustomEvent("allhidden", {
                            detail: { instanceId: this.instanceId },
                        });
                        this.notifierEl.dispatchEvent(allNotificationsHiddenEvent);
                    }
                },
                { once: true },
            );
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("Unknown error during notification hide!");
        }
    }

    hideAll() {
        console.info("SN hideAll(): Running...");

        const notificationIdsToHide = this.notificationIds.filter(
            (id) => this.notifications[id].state !== NotificationState.HIDE_BUSY,
        );
        console.info("SN hideAll() - notifications to hide:", notificationIdsToHide);

        if (notificationIdsToHide.length === 0) return;

        notificationIdsToHide.forEach((notificationId) => this.hide(notificationId));
    }
}

export { type NotifierOptions, type NotificationOptions, SN as default };
