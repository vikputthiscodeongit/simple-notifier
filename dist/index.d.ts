import "../scss/simple-notifier.scss";
declare enum NotificationState {
    HIDE_BUSY = "HIDE_BUSY",
    SHOW_BUSY = "SHOW_BUSY",
    SHOWN = "SHOWN",
    WAITING_ON_HIDE = "WAITING_ON_HIDE"
}
type PositionY = "top" | "bottom";
type PositionX = "left" | "center" | "right";
interface SharedOptions {
    hideAfterTime: number;
    hideOlder: boolean;
    dismissable: boolean;
    animationClasses: [string, string];
    animationDuration: number;
}
interface NotifierOptions extends SharedOptions {
    parentEl: HTMLElement;
    position: [PositionY, PositionX];
}
interface NotificationContent {
    text?: string;
    title?: string;
    type?: string;
}
interface NotificationOptions extends Partial<SharedOptions>, NotificationContent {
}
interface NotificationProps extends SharedOptions, NotificationContent {
    abortController: AbortController;
    el: HTMLDivElement;
    state?: NotificationState;
}
declare class SN {
    #private;
    parentEl: NotifierOptions["parentEl"];
    position: NotifierOptions["position"];
    hideAfterTime: NotifierOptions["hideAfterTime"];
    hideOlder: NotifierOptions["hideOlder"];
    dismissable: NotifierOptions["dismissable"];
    animationClasses: NotifierOptions["animationClasses"];
    animationDuration: NotifierOptions["animationDuration"];
    notifierEl: HTMLDivElement;
    notifications: {
        [id: string]: NotificationProps;
    };
    currentNotificationId: number;
    queuedNotifications: NotificationOptions[];
    waitingForHideOlderHideAll: boolean;
    instanceId: number;
    constructor(options?: Partial<NotifierOptions>);
    get notificationIds(): number[];
    show(textOrOptions: string | NotificationOptions, type?: string): void;
    hide(notificationId: number): void;
    hideAll(): void;
}
export { type NotifierOptions, type NotificationOptions, SN as default };
