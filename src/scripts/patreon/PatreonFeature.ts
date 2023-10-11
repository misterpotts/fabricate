interface PatreonFeature {

    id: string;

    name: string;

    description: string;

    targets: string[];

    includedIn(target: string): boolean;

    addTarget(target: string): void;

}

export { PatreonFeature };

class DefaultPatreonFeature implements PatreonFeature {

    private readonly _id: string;
    private readonly _name: string;
    private readonly _targets: string[];
    private readonly _description: string;

    constructor({
        id,
        name,
        targets,
        description,
    }: {
        id: string;
        name: string;
        targets: string[];
        description: string;
    }) {
        this._id = id;
        this._name = name;
        this._targets = targets;
        this._description = description;
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get targets(): string[] {
        return this._targets;
    }

    includedIn(target: string): boolean {
        return this._targets.includes(target);
    }

    addTarget(target: string): void {
        if (this._targets.includes(target)) {
            return;
        }
        this._targets.push(target);
    }

}

export { DefaultPatreonFeature };