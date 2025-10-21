import { createEl, wait } from "@codebundlesbyvik/js-helpers";
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
    position: ["start" | "end", "start" | "center" | "end"];
    classNames: string[];
    hideButtonElAriaLabelText?: string;
}

interface NotificationOptions extends Partial<SharedOptions> {
    text?: string | { content: string; el: string } | (string | { content: string; el: string })[];
    title?: string | { content: string; el: string };
    variant?: string;
}

interface ProcessedNotificationOptions
    extends Required<Omit<NotificationOptions, "text" | "title">> {
    text: [string, string][] | null;
    title: [string, string] | null;
}

interface Notification extends ProcessedNotificationOptions {
    abortControllers: {
        hideButtonElEvent: AbortController;
        waitForHide: AbortController;
    };
    state: NotificationState;
    el: HTMLDivElement;
}

const DEFAULT_INSTANCE_OPTIONS: NotifierOptions = {
    parentEl: document.body,
    position: ["start", "center"],
    hideAfterTime: 4000,
    hideOlder: false,
    dismissable: false,
    classNames: [],
};

class SN {
    hideAfterTime: NotifierOptions["hideAfterTime"];
    hideOlder: NotifierOptions["hideOlder"];
    dismissable: NotifierOptions["dismissable"];

    readonly notifierEl: HTMLDivElement;
    readonly notifications: Map<number, Notification>;
    #currentNotificationId: number;
    readonly queuedNotifications: NotificationOptions[];
    hideButtonElAriaLabelText: string;

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

        this.notifications = new Map<number, Notification>();
        this.#currentNotificationId = 0;
        this.queuedNotifications = [];
        this.hideButtonElAriaLabelText =
            mergedOptions.hideButtonElAriaLabelText ?? "Dismiss notification";

        mergedOptions.parentEl.insertBefore(
            this.notifierEl,
            mergedOptions.parentEl.firstElementChild,
        );

        return;
    }

    get currentNotificationId() {
        return this.#currentNotificationId;
    }

    get notificationIds() {
        return [...this.notifications.keys()];
    }

    #getMergedOptions(options: NotificationOptions): ProcessedNotificationOptions {
        const text = !options?.text
            ? null
            : Array.isArray(options.text)
              ? options.text.map((line) =>
                    typeof line !== "string" ? [line.content, line.el] : [line, "p"],
                )
              : typeof options.text !== "string"
                ? [[options.text.content, options.text.el]]
                : [[options.text, "p"]];
        const title = !options?.title
            ? null
            : typeof options.title !== "string"
              ? [options.title.content, options.title.el]
              : [options.title, "h6"];
        const mergedOptions = {
            hideAfterTime: options?.hideAfterTime ?? this.hideAfterTime,
            hideOlder: options?.hideOlder ?? this.hideOlder,
            dismissable: options?.dismissable ?? this.dismissable,
            // TODO 20251004: Remove type assertions
            text: text as [string, string][] | null,
            title: title as [string, string] | null,
            variant: options?.variant ?? "default",
        };
        console.debug("SN #getMergedOptions - mergedOptions:", mergedOptions);

        return mergedOptions;
    }

    #makeNotificationEl(id: number, notificationWithoutEl: Omit<Notification, "el">) {
        const notificationEl = createEl<HTMLDivElement>("div", {
            class: `simple-notification simple-notification--${notificationWithoutEl.variant} simple-notification--animation-in`,
            role: "alert",
            dataNotificationId: id.toString(),
        });

        const contentEl = createEl("div", {
            class: "simple-notification__part simple-notification__part--main",
        });

        if (notificationWithoutEl.title) {
            const titleEl = createEl(notificationWithoutEl.title[1], {
                class: "simple-notification__title",
                textContent: notificationWithoutEl.title[0],
            });

            contentEl.append(titleEl);
        }

        if (notificationWithoutEl.text) {
            notificationWithoutEl.text.forEach((line) => {
                const textEl = createEl(line[1], {
                    class: "simple-notification__text",
                    textContent: line[0],
                });

                contentEl.append(textEl);
            });
        }

        notificationEl.append(contentEl);

        if (notificationWithoutEl.dismissable) {
            const sideContentEl = createEl("div", {
                class: "simple-notification__part simple-notification__part--side",
            });
            const hideButtonEl = createEl("button", {
                type: "button",
                class: "simple-notification__hide-button",
                ariaLabel: this.hideButtonElAriaLabelText,
            });
            hideButtonEl.addEventListener("click", () => this.hide(id), {
                once: true,
                signal: notificationWithoutEl.abortControllers.hideButtonElEvent.signal,
            });

            sideContentEl.append(hideButtonEl);
            notificationEl.append(sideContentEl);
        }

        console.debug("SN #makeNotificationEl - notificationEl:", notificationEl);

        return notificationEl;
    }

    #processQueuedNotifications() {
        console.debug("SN #processQueuedNotifications: Running...");

        if (this.queuedNotifications.length === 0) {
            console.debug("SN #processQueuedNotifications - No notifications in queue.");
            return;
        }

        // Make a copy of the queue because it's possible to continuously trigger
        // new notifications. Any notifications triggered after a copy of the queue
        // is made are processed on the next run.
        // Process the queue in reverse because all notifications older than the
        // oldest one that has `hideOlder` set should be ignored.
        const queueCopyReversed = [...this.queuedNotifications].reverse();
        this.queuedNotifications.length = 0;

        let notificationsToShowReversed: NotificationOptions[] = [];
        let count = 0;

        for (const notificationOptions of queueCopyReversed) {
            count++;

            if (notificationOptions.hideOlder) {
                notificationsToShowReversed = queueCopyReversed.slice(0, count);

                break;
            }
        }

        // Reverse the queue again so that the oldest notification is the one
        // shown first.
        notificationsToShowReversed
            .reverse()
            .forEach((notificationOptions) => this.show(notificationOptions));

        return;
    }

    show(
        textOrOptions: NotificationOptions["text"] | NotificationOptions,
        variant?: NotificationOptions["variant"],
    ) {
        console.info("SN show: Running...");

        const textOrOptionsAsOptions =
            typeof textOrOptions === "string" ||
            (typeof textOrOptions === "object" && "el" in textOrOptions) ||
            Array.isArray(textOrOptions)
                ? { text: textOrOptions, variant }
                : { ...textOrOptions, variant: variant ?? textOrOptions?.variant };

        if (!textOrOptionsAsOptions) {
            console.warn("Nothing to show as no parameters were provided.");
            return;
        }

        const options = this.#getMergedOptions(textOrOptionsAsOptions);

        if (!options.text && !options.title) {
            console.warn("Nothing to show as neither text nor title is provided.");
            return;
        }

        if ((options.hideOlder && this.notifications.size > 0) || this.queue.length > 0) {
            this.queue.push(textOrOptionsAsOptions);
            this.el.addEventListener("allhidden", () => this.#processQueuedNotifications(), {
                once: true,
            });
            this.hideAll();

            return;
        }

        const currentNotificationId = this.#currentNotificationId;
        this.#currentNotificationId++;

        const notificationWithoutEl = {
            ...options,
            state: NotificationState.SHOW_BUSY,
            abortControllers: {
                hideButtonElEvent: new AbortController(),
                waitForHide: new AbortController(),
            },
        };
        const notification = {
            ...notificationWithoutEl,
            el: this.#makeNotificationEl(currentNotificationId, notificationWithoutEl),
        };
        this.notifications.set(currentNotificationId, notification);

        this.notifierEl.append(notification.el);

        notification.el.addEventListener(
            "animationend",
            () => {
                console.debug(
                    `SN show: Animation of element of notification ${currentNotificationId} completed.`,
                );

                notification.state = NotificationState.SHOWN;

                const notificationShownEvent = new CustomEvent("shown", {
                    detail: {
                        notificationId: currentNotificationId,
                    },
                });
                this.notifierEl.dispatchEvent(notificationShownEvent);

                console.debug(`SN show: Notification ${currentNotificationId} shown.`);

                if (notification.hideAfterTime > 0) {
                    notification.state = NotificationState.WAITING_ON_HIDE;

                    wait(
                        notification.hideAfterTime,
                        true,
                        notification.abortControllers.waitForHide.signal,
                    )
                        .then(() => this.hide(currentNotificationId))
                        .catch((abortReason) => console.info(abortReason));
                }

                return;
            },
            { once: true, signal: notification.abortControllers.waitForHide.signal },
        );

        return;
    }

    hide(notificationId: number) {
        console.info(`SN hide: Running on notification ${notificationId}...`);

        const notification = this.notifications.get(notificationId);

        if (!notification) {
            console.info(`Notification ${notificationId} doesn't exist.`);
            return;
        }

        if (notification.state === NotificationState.HIDE_BUSY) {
            console.info(`Already hiding notification ${notificationId}.`);
            return;
        }

        if (
            notification.state === NotificationState.SHOW_BUSY ||
            notification.state === NotificationState.WAITING_ON_HIDE
        ) {
            console.debug(
                `SN hide: Notification ${notificationId} in show action or waiting on hide action. Aborting any scheduled function calls...`,
            );

            notification.abortControllers.hideButtonElEvent.abort(
                `Hide button event of notification ${notificationId} aborted.`,
            );
            notification.abortControllers.waitForHide.abort(
                `Scheduled hide or active show action of notification ${notificationId} aborted.`,
            );
        }

        notification.state = NotificationState.HIDE_BUSY;

        notification.el.classList.remove("simple-notification--animation-in");
        notification.el.classList.add("simple-notification--animation-out");

        notification.el.addEventListener(
            "animationend",
            () => {
                console.debug(
                    `SN hide: Animation of element of notification ${notificationId} completed.`,
                );

                notification.el.innerHTML = "";
                notification.el.remove();

                this.notifications.delete(notificationId);

                const notificationHiddenEvent = new CustomEvent("hidden", {
                    detail: { notificationId },
                });
                this.notifierEl.dispatchEvent(notificationHiddenEvent);

                console.debug(`SN hide: Notification ${notificationId} hidden.`);

                if (this.notifications.size === 0) {
                    const allNotificationsHiddenEvent = new CustomEvent("allhidden");
                    this.notifierEl.dispatchEvent(allNotificationsHiddenEvent);
                    console.debug(`SN hide: All notifications hidden.`);
                }

                return;
            },
            { once: true },
        );

        return;
    }

    hideAll() {
        console.info("SN hideAll: Running...");

        const notificationIdsToHide = [];

        for (const [id, props] of this.notifications.entries()) {
            if (props.state === NotificationState.HIDE_BUSY) continue;

            notificationIdsToHide.push(id);
        }

        console.debug("SN hideAll - notifications to hide:", notificationIdsToHide);

        if (notificationIdsToHide.length === 0) return;

        notificationIdsToHide.forEach((notificationId) => this.hide(notificationId));

        return;
    }
}

export { type NotifierOptions, type NotificationOptions, SN as default };
