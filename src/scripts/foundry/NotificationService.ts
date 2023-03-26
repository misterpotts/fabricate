interface NotificationService {

    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    isSuppressed: boolean;

}

class DefaultNotificationService implements NotificationService {

    private suppressed: boolean;

    constructor(suppressed: boolean = false) {
        this.suppressed = suppressed;
    }

    get isSuppressed(): boolean {
        return this.suppressed;
    }
    set isSuppressed(value: boolean) {
        this.suppressed = value;
    }

    error(message: string): void {
        if (this.isSuppressed) {
            console.error(message);
            return;
        }
        ui.notifications.error(message);
    }

    info(message: string): void {
        if (this.isSuppressed) {
            console.info(message);
            return;
        }
        ui.notifications.info(message);
    }

    warn(message: string): void {
        if (this.isSuppressed) {
            console.warn(message);
            return;
        }
        ui.notifications.warn(message);
    }

}