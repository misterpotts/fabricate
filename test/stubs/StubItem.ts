export class StubItem {

    public readonly id;
    public flags: Record<string, Record<string, string>>;
    public system: { quantity: number };
    public effects: any[];

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
        this.id = id;
        this.flags = flags;
        this.system = system;
        this.effects = effects;
    }

    getFlag(scope: string, key: string) {
        if (scope in this.flags) {
            return this.flags[scope][key];
        }
        return undefined;
    }

    get _id() {
        return this.id;
    }

}