declare enum NotificationState {
    HIDE_BUSY = "HIDE_BUSY",
    SHOW_BUSY = "SHOW_BUSY",
    SHOWN = "SHOWN",
    WAITING_ON_HIDE = "WAITING_ON_HIDE"
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
interface ProcessedNotificationOptions extends Required<Omit<NotificationOptions, "text" | "title">> {
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
declare class SN {
    #private;
    hideAfterTime: NotifierOptions["hideAfterTime"];
    hideOlder: NotifierOptions["hideOlder"];
    dismissible: NotifierOptions["dismissible"];
    readonly el: HTMLDivElement;
    readonly notifications: Map<number, Notification>;
    readonly queue: NotificationOptions[];
    hideButtonElAriaLabelText: string;
    constructor(options?: Partial<NotifierOptions>);
    get currentId(): number;
    get ids(): number[];
    show(textOrOptions: NotificationOptions["text"] | NotificationOptions, variant?: NotificationOptions["variant"]): void;
    hide(id: number): void;
    hideAll(): void;
}
export { type NotifierOptions, type NotificationOptions, SN as default };
