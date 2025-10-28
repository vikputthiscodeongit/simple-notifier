import { createEl, wait } from "@codebundlesbyvik/js-helpers";

enum NotificationState {
    HIDE_BUSY = "HIDE_BUSY",
    SHOW_BUSY = "SHOW_BUSY",
    SHOWN = "SHOWN",
    WAITING_ON_HIDE = "WAITING_ON_HIDE",
}

interface SharedOptions {
    hideAfterTime: number;
    hideOlder: boolean;
    dismissible: boolean;
}

interface NotifierOptions extends SharedOptions {
    parentEl: HTMLElement;
    position: ["start" | "end", "start" | "center" | "end"];
    classNames: string[];
    hideButtonElAriaLabelText?: string;
}

interface NotificationOptions extends Partial<SharedOptions> {
    text?: string | string[];
    title?: string | [string, string];
    variant?: string;
}

interface ProcessedNotificationOptions
    extends Required<Omit<NotificationOptions, "text" | "title">> {
    text: string[] | null;
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
    dismissible: false,
    classNames: [],
};

class SN {
    hideAfterTime: NotifierOptions["hideAfterTime"];
    hideOlder: NotifierOptions["hideOlder"];
    dismissible: NotifierOptions["dismissible"];

    readonly el: HTMLDivElement;
    readonly notifications: Map<number, Notification>;
    #currentId: number;
    readonly queue: NotificationOptions[];
    hideButtonElAriaLabelText: string;

    constructor(options: Partial<NotifierOptions> = {}) {
        const mergedOptions = { ...DEFAULT_INSTANCE_OPTIONS, ...options };

        this.hideAfterTime = mergedOptions.hideAfterTime;
        this.hideOlder = mergedOptions.hideOlder;
        this.dismissible = mergedOptions.dismissible;

        this.el = createEl("div", {
            class: `simple-notifier simple-notifier--position-x-${mergedOptions.position[1]} simple-notifier--position-y-${mergedOptions.position[0]}`,
            ariaLive: "assertive",
        });
        this.el.classList.add(...mergedOptions.classNames);

        this.notifications = new Map<number, Notification>();
        this.#currentId = 0;
        this.queue = [];
        this.hideButtonElAriaLabelText =
            mergedOptions.hideButtonElAriaLabelText ?? "Dismiss notification";

        const notifierElInParentEl = mergedOptions.parentEl.querySelector(".simple-notifier");

        if (notifierElInParentEl) {
            notifierElInParentEl.after(this.el);
        } else {
            mergedOptions.parentEl.before(this.el);
        }

        return;
    }

    get currentId() {
        return this.#currentId;
    }

    get ids() {
        return [...this.notifications.keys()];
    }

    #getMergedOptions(options: NotificationOptions): ProcessedNotificationOptions {
        const mergedOptions = {
            hideAfterTime: options?.hideAfterTime ?? this.hideAfterTime,
            hideOlder: options?.hideOlder ?? this.hideOlder,
            dismissible: options?.dismissible ?? this.dismissible,
            text: typeof options.text === "string" ? [options.text] : (options.text ?? null),
            // TODO 20251026: Remove type assertion
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            title: (typeof options.title === "string"
                ? [options.title, "h6"]
                : (options.title ?? null)) as [string, string] | null,
            variant: options?.variant ?? "default",
        };
        console.debug("SN #getMergedOptions - mergedOptions:", mergedOptions);

        return mergedOptions;
    }

    #makeDomEl(id: number, notificationWithoutEl: Omit<Notification, "el">) {
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
            });
            titleEl.innerHTML = notificationWithoutEl.title[0];

            contentEl.append(titleEl);
        }

        if (notificationWithoutEl.text) {
            notificationWithoutEl.text.forEach((line) => {
                const textEl = createEl("p", {
                    class: "simple-notification__text",
                });
                textEl.innerHTML = line;

                contentEl.append(textEl);
            });
        }

        notificationEl.append(contentEl);

        if (notificationWithoutEl.dismissible) {
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

        console.debug("SN #makeDomEl - notificationEl:", notificationEl);

        return notificationEl;
    }

    #processQueue() {
        console.debug("SN #processQueue: Running...");

        if (this.queue.length === 0) {
            console.debug("SN #processQueue - No notifications in queue.");
            return;
        }

        // Make a copy of the queue because it's possible to continuously trigger
        // new notifications. Any notifications triggered after a copy of the queue
        // is made are processed on the next run.
        // Process the queue in reverse because all notifications older than the
        // oldest one that has `hideOlder` set should be ignored.
        const queueCopyReversed = [...this.queue].reverse();
        console.debug("SN #processQueue - queueCopyReversed:", queueCopyReversed);
        this.queue.length = 0;

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
        notificationsToShowReversed.reverse().forEach((options) => this.show(options));

        return;
    }

    show(
        textOrOptions: NotificationOptions["text"] | NotificationOptions,
        variant?: NotificationOptions["variant"],
    ) {
        console.info("SN show: Running...");

        const textOrOptionsAsOptions =
            typeof textOrOptions === "string" || Array.isArray(textOrOptions)
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
            this.queue.push({ ...textOrOptionsAsOptions, hideOlder: options.hideOlder });
            this.el.addEventListener("allhidden", () => this.#processQueue(), {
                once: true,
            });
            this.hideAll();

            return;
        }

        const currentId = this.#currentId;
        this.#currentId++;

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
            el: this.#makeDomEl(currentId, notificationWithoutEl),
        };
        this.notifications.set(currentId, notification);

        this.el.append(notification.el);

        notification.el.addEventListener(
            "animationend",
            () => {
                console.debug(
                    `SN show: Animation of element of notification ${currentId} completed.`,
                );

                notification.state = NotificationState.SHOWN;

                const notificationShownEvent = new CustomEvent("shown", {
                    detail: {
                        id: currentId,
                    },
                });
                this.el.dispatchEvent(notificationShownEvent);

                console.debug(`SN show: Notification ${currentId} shown.`);

                if (notification.hideAfterTime > 0) {
                    notification.state = NotificationState.WAITING_ON_HIDE;

                    wait(
                        notification.hideAfterTime,
                        true,
                        notification.abortControllers.waitForHide.signal,
                    )
                        .then(() => this.hide(currentId))
                        .catch((abortReason) => console.debug(abortReason));
                }

                return;
            },
            { once: true, signal: notification.abortControllers.waitForHide.signal },
        );

        return;
    }

    hide(id: number) {
        console.info(`SN hide: Running on notification ${id}...`);

        const notification = this.notifications.get(id);

        if (!notification) {
            console.info(`Notification ${id} doesn't exist.`);
            return;
        }

        if (notification.state === NotificationState.HIDE_BUSY) {
            console.info(`Already hiding notification ${id}.`);
            return;
        }

        if (
            notification.state === NotificationState.SHOW_BUSY ||
            notification.state === NotificationState.WAITING_ON_HIDE
        ) {
            console.debug(
                `SN hide: Notification ${id} in show action or waiting on hide action. Aborting any scheduled calls...`,
            );

            notification.abortControllers.hideButtonElEvent.abort(
                `Hide button event of notification ${id} aborted.`,
            );
            notification.abortControllers.waitForHide.abort(
                `Scheduled hide or active show action of notification ${id} aborted.`,
            );
        }

        notification.state = NotificationState.HIDE_BUSY;

        notification.el.classList.remove("simple-notification--animation-in");
        notification.el.classList.add("simple-notification--animation-out");

        notification.el.addEventListener(
            "animationend",
            () => {
                console.debug(`SN hide: Animation of element of notification ${id} completed.`);

                notification.el.innerHTML = "";
                notification.el.remove();

                this.notifications.delete(id);

                const notificationHiddenEvent = new CustomEvent("hidden", {
                    detail: { id },
                });
                this.el.dispatchEvent(notificationHiddenEvent);

                console.debug(`SN hide: Notification ${id} hidden.`);

                if (this.notifications.size === 0) {
                    const allNotificationsHiddenEvent = new CustomEvent("allhidden");
                    this.el.dispatchEvent(allNotificationsHiddenEvent);
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

        notificationIdsToHide.forEach((id) => this.hide(id));

        return;
    }
}

export { type NotifierOptions, type NotificationOptions, SN as default };
