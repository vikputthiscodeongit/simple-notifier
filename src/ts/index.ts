import { createEl, getPseudoRandomIntBelow } from "@codebundlesbyvik/js-helpers";
import wait from "./helpers/wait.ts";

type PositionY = "top" | "bottom";
type PositionX = "left" | "center" | "right";

interface AllInstanceOptions {
    parentEl: HTMLElement;
    hideAfter: number;
    position: [PositionY, PositionX];
    dismissable: boolean;
    singleNotification: boolean;
}
interface InstanceOptions extends Partial<AllInstanceOptions> {}
interface NotificationOptions
    extends Partial<Pick<AllInstanceOptions, "dismissable" | "hideAfter" | "singleNotification">> {
    type?: string;

const DEFAULT_INSTANCE_OPTIONS: AllInstanceOptions = {
    parentEl: document.body,
    hideAfter: 3500,
    position: ["top", "center"],
    dismissable: false,
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
    activeNotifications: {
        [id: number]: {
            abortController: AbortController;
            el: HTMLElement;
        };
    };
    currentId: number;

    constructor(options: InstanceOptions = {}) {
        this.mergedOptions = {
            ...DEFAULT_INSTANCE_OPTIONS,
            ...options,
        };

        this.parentEl = this.mergedOptions.parentEl;
        this.hideAfter = this.mergedOptions.hideAfter;
        this.position = this.mergedOptions.position;

        this.dismissable = this.mergedOptions.dismissable;
        this.singleNotification = this.mergedOptions.singleNotification;

        this.notifierEl;
        this.instanceId = null;
        this.activeNotifications = {};
        this.currentId = 0;
    }

    static instanceIds: number[] = [];

    init() {
        console.log("SN: Running .init()...");

        try {
            if (this.instanceId !== null) {
                throw new Error(
                    `SN: .init() has already been called on this instance (${this.instanceId}).`,
                );
            }

            // TODO: Fix in js-helpers.
            this.instanceId = getPseudoRandomIntBelow(100000, false);

            if (SN.instanceIds.includes(this.instanceId)) {

                return;
            }

            SN.instanceIds.push(this.instanceId);

            this.notifierEl = createEl("div", {
                class: `simple-notifier simple-notifier--pos-y-${this.position[0]} simple-notifier--pos-x-${this.position[1]}`,
            });
            this.parentEl.insertBefore(this.notifierEl, this.parentEl.firstElementChild);

            // TODO: Fire initialized event.
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error("FormMc init(): Failed to initialize!");
        }
    }

    show(
        text: string,
        titleOrOptions?: string | NotificationOptions,
        options?: NotificationOptions,
    ) {
        if (this.singleNotification) {
            this.hideAll();
        }

        const abortController = new AbortController();

        const title = typeof titleOrOptions === "string" ? titleOrOptions : undefined;
        options =
            options || (arguments.length === 2 && typeof titleOrOptions !== "string")
                ? (titleOrOptions as NotificationOptions)
                : undefined;
        const notificationEl = this.makeNotificationEl({
            currentId: this.currentId,
            text,
            title,
            options,
        });

        this.parentEl.append(notificationEl);

        this.activeNotifications = {
            ...this.activeNotifications,
            [this.currentId]: {
                abortController,
                el: notificationEl,
            },
        };

        const hideAfterMs = options?.hideAfter ?? this.hideAfter;

        if (hideAfterMs > 0) {
            (async () => await wait(hideAfterMs))();

            this.hide(this.currentId);
        }

        this.currentId++;
    }

    hide(notificationId: number) {
        this.activeNotifications[notificationId].abortController.abort();

        // TOOD: Fade out first.
        this.activeNotifications[notificationId].el.remove();

        delete this.activeNotifications[notificationId];
    }

    hideAll() {
        for (const notificationId of Object.keys(this.activeNotifications)) {
            this.hide(Number.parseInt(notificationId));
        }
    }

    makeNotificationEl({
        currentId,
        text,
        title,
        options,
    }: {
        currentId: number;
        text: string;
        title?: string;
        options?: NotificationOptions;
    }) {
        const dismissable = options?.dismissable ?? this.dismissable;

        const notificationEl = createEl("div", {
            class: "simple-notification",
            role: "alert",
        });

        const mainContainerEl = createEl("div", {
            class: "simple-notification__partial simple-notification__partial--main",
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
                class: "simple-notification__partial simple-notification__partial--side",
            });

            const closeButtonEl = createEl("button", { type: "button" });
            closeButtonEl.addEventListener("click", () => this.hide(currentId), { once: true });

            sideContainerEl.append(closeButtonEl);
            notificationEl.append(sideContainerEl);
        }

        return notificationEl;
    }
}

export default SN;
