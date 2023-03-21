export class StubItem {

    private readonly _id;
    private readonly _flags: Record<string, Record<string, string>>;
    private readonly _system: { quantity: number };
    private readonly _effects: any[];

    constructor({
        id,
        flags = {},
        system,
        effects = []
    }: {
        id: string;
        flags?: Record<string, Record<string, string>>;
        system?: {
            quantity: number;
        };
        effects?: any[];
    }) {
        this._id = id;
        this._flags = flags;
        this._system = system;
        this._effects = effects;
    }

    get id() {
        return this._id;
    }

    get flags(): Record<string, Record<string, string>> {
        return this._flags;
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

    get effects(): any[] {
        return this._effects;
    }

}