import { createEl, getPseudoRandomIntBetween, wait } from "@codebundlesbyvik/js-helpers";
import "./style.css";

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

interface NotifierOptions extends SharedOptions {
    parentEl: HTMLElement;
    position: ["top" | "bottom", "left" | "center" | "right"];
    classNames: string[];
}

interface NotificationContent {
    variant?: string;
    text?: string | string[];
    title?: string;
    titleLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface NotificationOptions extends Partial<SharedOptions>, NotificationContent {}

interface ProcessedNotificationOptions
    extends SharedOptions,
        Required<Omit<NotificationContent, "text" | "title">> {
    text: string[] | null;
    title: string | null;
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
    notifications: Map<number, NotificationProps>;
    currentNotificationId: number;
    queuedNotifications: NotificationOptions[];

    instanceId: number;

    constructor(options: Partial<NotifierOptions> = {}) {
        const mergedOptions = { ...DEFAULT_INSTANCE_OPTIONS, ...options };

        this.hideAfterTime = mergedOptions.hideAfterTime;
        this.hideOlder = mergedOptions.hideOlder;
        this.dismissable = mergedOptions.dismissable;

        this.notifierEl = createEl("div", {
            class: `simple-notifier simple-notifier--position-x-${mergedOptions.position[1]} simple-notifier--position-y-${mergedOptions.position[0]}`,
            ariaLive: "assertive",
        });
        this.notifierEl.classList.add(...mergedOptions.classNames);

        this.notifications = new Map<number, NotificationProps>();
        this.currentNotificationId = 0;
        this.queuedNotifications = [];

        this.instanceId = makeInstanceId(100000, 1000000, SN.#instanceIds);
        SN.#instanceIds.push(this.instanceId);

        mergedOptions.parentEl.insertBefore(
            this.notifierEl,
            mergedOptions.parentEl.firstElementChild,
        );

        console.info(`SimpleNotifier instance ${this.instanceId} initiated.`);
    }

    static #instanceIds: number[] = [];

    get notificationIds() {
        return [...this.notifications.keys()];
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
            : (textOrOptions as string | string[] | undefined);
        const mergedOptions = {
            hideAfterTime: notificationOptions?.hideAfterTime ?? this.hideAfterTime,
            hideOlder: notificationOptions?.hideOlder ?? this.hideOlder,
            dismissable: notificationOptions?.dismissable ?? this.dismissable,
            text:
                typeof notificationText === "string" && notificationText !== ""
                    ? [notificationText]
                    : notificationText || null,
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

        if (options.text) {
            options.text.forEach((line) => {
                const textEl = createEl("p", {
                    class: "simple-notification__text",
                    textContent: line,
                });

                contentEl.append(textEl);
            });
        }

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
            hideButtonEl.addEventListener("click", () => this.hide(id), { once: true });

            sideContentEl.append(hideButtonEl);
            notificationEl.append(sideContentEl);
        }

        console.debug("SN #makeNotificationEl() - notificationEl:", notificationEl);

        return notificationEl;
    }

    #processQueuedNotifications() {
        console.info("SN #processQueuedNotifications(): Running...");

        if (this.queuedNotifications.length === 0) {
            console.info("SN #processQueuedNotifications() - No notifications in queue.");
            return;
        }

        // Make a copy of the queue because it's possible to continuously trigger
        // new notifications. Any notifications triggered after a copy of the queue
        // is made are processed on the next run.
        // Process the queue in reverse because all notifications older than the
        // oldest one that has `hideOlder` set should be ignored.
        const queueCopyReversed = [...this.queuedNotifications].reverse();
        console.debug(
            "SN #processQueuedNotifications() - Queued notifications (newest first):",
            queueCopyReversed,
        );
        this.queuedNotifications = [];

        let notificationsToShowReversed: NotificationOptions[] = [];
        let count = 0;

        for (const notificationOptions of queueCopyReversed) {
            count++;

            if (notificationOptions.hideOlder) {
                notificationsToShowReversed = queueCopyReversed.slice(0, count);

                break;
            }
        }

        console.debug(
            "SN #processQueuedNotifications() - Queued notifications to show (newest first):",
            notificationsToShowReversed,
        );

        // Reverse the queue again so that the oldest notification is the one
        // shown first.
        notificationsToShowReversed.reverse().forEach((notificationOptions) => {
            this.show(notificationOptions);
        });
    }

    show(
        textOrOptions: NotificationOptions["text"] | NotificationOptions,
        variant?: NotificationOptions["variant"],
    ) {
        console.info("SN show() - Running...");

        const userOptions = typeof textOrOptions === "object" && !Array.isArray(textOrOptions);

        if (
            textOrOptions === undefined ||
            (userOptions && textOrOptions.text === undefined && textOrOptions.title === undefined)
        ) {
            console.warn(
                "`text` or `title` must be defined. `text` may be provided as `string` or `string[]` or via an `object` as `text` value.",
            );
            return;
        }

        if (variant !== undefined && typeof variant !== "string") {
            console.warn("`variant` must be a `string`.");
            return;
        }

        const hideOlder = (userOptions && textOrOptions.hideOlder) ?? this.hideOlder;

        if ((hideOlder && this.notifications.size > 0) || this.queuedNotifications.length > 0) {
            const notificationOptions = !userOptions
                ? { text: textOrOptions, variant, hideOlder }
                : { ...textOrOptions, hideOlder };
            this.queuedNotifications.push(notificationOptions);
            console.info("SN show() - Notification added to queue:", notificationOptions);

            this.hideAll();

            this.notifierEl.addEventListener(
                "allhidden",
                () => this.#processQueuedNotifications(),
                { once: true },
            );

            return;
        }

        const currentNotificationId = this.currentNotificationId;
        this.currentNotificationId++;

        const notificationOptions = this.#getNotificationOptions(textOrOptions, variant);
        const notificationEl = this.#makeNotificationEl(currentNotificationId, notificationOptions);
        const notificationProps = {
            ...notificationOptions,
            state: NotificationState.SHOW_BUSY,
            el: notificationEl,
            abortController: new AbortController(),
        };
        this.notifications.set(currentNotificationId, notificationProps);

        this.notifierEl.append(notificationEl);
        console.info(
            `SN show(): Element of notification ${currentNotificationId} appended to DOM.`,
        );

        notificationEl.addEventListener(
            "animationend",
            () => {
                console.debug(
                    `SN show(): Animation of element of notification ${currentNotificationId} completed.`,
                );

                notificationProps.state = NotificationState.SHOWN;

                const notificationShownEvent = new CustomEvent("shown", {
                    detail: {
                        instanceId: this.instanceId,
                        notificationId: currentNotificationId,
                    },
                });
                this.notifierEl.dispatchEvent(notificationShownEvent);

                console.info(`SN show(): Notification ${currentNotificationId} shown.`);

                if (notificationOptions.hideAfterTime > 0) {
                    notificationProps.state = NotificationState.WAITING_ON_HIDE;

                    wait(
                        notificationProps.hideAfterTime,
                        true,
                        notificationProps.abortController.signal,
                    )
                        .then(() => this.hide(currentNotificationId))
                        .catch((abortReason) => console.info(abortReason));
                }
            },
            { once: true, signal: notificationProps.abortController.signal },
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
    }

    hide(notificationId: number) {
        console.info(`SN hide(): Running on notification ${notificationId}...`);

        if (typeof notificationId !== "number") {
            console.warn("`notificationId` must be a `number`.");
            return;
        }

        const notificationProps = this.notifications.get(notificationId);

        if (!notificationProps) {
            console.warn(`Notification ${notificationId} doesn't exist.`);
            return;
        }

        if (notificationProps.state === NotificationState.HIDE_BUSY) {
            console.warn(`Already hiding notification ${notificationId}.`);
            return;
        }

        if (
            notificationProps.state === NotificationState.SHOW_BUSY ||
            notificationProps.state === NotificationState.WAITING_ON_HIDE
        ) {
            console.debug(
                `SN hide(): Notification ${notificationId} in show action or waiting on hide action. Aborting any scheduled function calls...`,
            );

            notificationProps.abortController.abort(
                `Scheduled hide or active show action of notification ${notificationId} aborted.`,
            );
        }

        notificationProps.state = NotificationState.HIDE_BUSY;

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

                this.notifications.delete(notificationId);

                const notificationHiddenEvent = new CustomEvent("hidden", {
                    detail: { instanceId: this.instanceId, notificationId },
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
    }

    hideAll() {
        console.info("SN hideAll(): Running...");

        const notificationIdsToHide = [];

        for (const [id, props] of this.notifications.entries()) {
            if (props.state === NotificationState.HIDE_BUSY) continue;

            notificationIdsToHide.push(id);
        }

        console.info("SN hideAll() - notifications to hide:", notificationIdsToHide);

        if (notificationIdsToHide.length === 0) return;

        notificationIdsToHide.forEach((notificationId) => this.hide(notificationId));
    }
}

export { type NotifierOptions, type NotificationOptions, SN as default };
