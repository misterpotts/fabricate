import {CraftingSystemDetails, CraftingSystemDetailsJson} from "./CraftingSystemDetails";

interface CraftingSystemJson {
    id: string;
    embedded: boolean;
    details: CraftingSystemDetailsJson;
    enabled: boolean;
}

export { CraftingSystemJson }

class CraftingSystem {

    private readonly _id: string;
    private readonly _embedded: boolean;

    private _details: CraftingSystemDetails;
    private _enabled: boolean;

    constructor({
        id,
        embedded = false,
        craftingSystemDetails,
        enabled = true,
    }: {
        id: string;
        embedded?: boolean;
        craftingSystemDetails: CraftingSystemDetails,
        enabled?: boolean;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._details = craftingSystemDetails;
        this._enabled = enabled;
    }

    get embedded(): boolean {
        return this._embedded;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
    }

    get details(): CraftingSystemDetails {
        return this._details;
    }

    set details(value: CraftingSystemDetails) {
        this._details = value;
    }

    toJson(): CraftingSystemJson {
        return {
            id: this._id,
            details: this._details.toJson(),
            enabled: this._enabled,
            embedded: this._embedded
        };
    }

    get id(): string {
        return this._id;
    }

    clone({id, name, embedded = false}: { name?: string; id: string; embedded?: boolean }): CraftingSystem {
        return new CraftingSystem({
            id,
            embedded,
            craftingSystemDetails: this._details.clone(name),
            enabled: this._enabled,
        });
    }
}

export { CraftingSystem }