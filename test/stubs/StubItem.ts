export class StubItem {

    private readonly _id;
    private readonly _flags: Record<string, Record<string, string>>;
    private readonly _system: { quantity: number };

    constructor({
        id,
        flags = {},
        system
    }: {
        id: string;
        flags?: Record<string, Record<string, string>>;
        system?: {
            quantity: number;
        };
    }) {
        this._id = id;
        this._flags = flags;
        this._system = system;
    }

    get id() {
        return this._id;
    }

    get system(): { quantity: number } {
        return this._system;
    }

    getFlag(scope: string, key: string) {
        if (scope in this._flags) {
            return this._flags[scope][key];
        }
        return undefined;
    }

}