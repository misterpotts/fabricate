import {UI, UIProvider} from "./UIProvider";

/**
 * A notification service that can be used to display messages to the user.
 */
interface NotificationService {

    /**
     * Displays an informational message to the user.
     * @param message
     */
    info(message: string): void;

    /**
     * Displays a warning message to the user.
     * @param message
     */
    warn(message: string): void;

    /**
     * Displays an error message to the user.
     * @param message
     */
    error(message: string): void;

    /**
     * If true, all notification messages will print only to the console. If false, notification messages will be
     *   displayed in both the console and the UI.
     */
    suppressed: boolean;

}

export { NotificationService };

class DefaultNotificationService implements NotificationService {

    private _suppressed: boolean;
    private readonly ui: UI;


    constructor(uiProvider: UIProvider, suppressed: boolean = false) {
        this.ui = uiProvider.get();
        this._suppressed = suppressed;
    }

    get suppressed(): boolean {
        return this._suppressed;
    }
    set suppressed(value: boolean) {
        this._suppressed = value;
    }

    error(message: string): void {
        if (this._suppressed) {
            console.error(message);
            return;
        }
        this.ui.notifications.error(message);
    }

    info(message: string): void {
        if (this._suppressed) {
            console.info(message);
            return;
        }
        this.ui.notifications.info(message);
    }

    warn(message: string): void {
        if (this._suppressed) {
            console.warn(message);
            return;
        }
        this.ui.notifications.warn(message);
    }

}

export { DefaultNotificationService };