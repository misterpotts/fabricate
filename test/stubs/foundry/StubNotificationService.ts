class StubNotificationService implements NotificationService {

    private _suppressed: boolean;
    private _invocations: { level: string, message: string; }[] = [];

    constructor(suppressed: boolean = false) {
        this._suppressed = suppressed;
    }

    get isSuppressed(): boolean {
        return this._suppressed;
    }

    set isSuppressed(value: boolean) {
        this._suppressed = value;
    }

    error(message: string): void {
        this._invocations.push({ level: "error", message });
    }

    info(message: string): void {
        this._invocations.push({ level: "info", message });
    }

    warn(message: string): void {
        this._invocations.push({ level: "warn", message });
    }

    get invocations(): { level: string; message: string }[] {
        return Array.from(this._invocations);
    }

}

export  { StubNotificationService }