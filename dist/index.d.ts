import "./style.css";
declare enum NotificationState {
    HIDE_BUSY = "HIDE_BUSY",
    SHOW_BUSY = "SHOW_BUSY",
    SHOWN = "SHOWN",
    WAITING_ON_HIDE = "WAITING_ON_HIDE"
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
interface NotificationOptions extends Partial<SharedOptions>, NotificationContent {
}
interface ProcessedNotificationOptions extends SharedOptions, Required<Omit<NotificationContent, "text" | "title">> {
    text: string[] | null;
    title: string | null;
}
interface NotificationInternal {
    abortControllers: {
        hideButtonElEvent: AbortController;
        waitForHide: AbortController;
    };
    state: NotificationState;
}
interface Notification extends ProcessedNotificationOptions, NotificationInternal {
    el: HTMLDivElement;
}
declare class SN {
    #private;
    hideAfterTime: NotifierOptions["hideAfterTime"];
    hideOlder: NotifierOptions["hideOlder"];
    dismissable: NotifierOptions["dismissable"];
    notifierEl: HTMLDivElement;
    notifications: Map<number, Notification>;
    currentNotificationId: number;
    queuedNotifications: NotificationOptions[];
    instanceId: number;
    constructor(options?: Partial<NotifierOptions>);
    get notificationIds(): number[];
    show(textOrOptions: NotificationOptions["text"] | NotificationOptions, variant?: NotificationOptions["variant"]): void;
    hide(notificationId: number): void;
    hideAll(): void;
}
export { type NotifierOptions, type NotificationOptions, SN as default };
