import {CraftingSystemDetails, CraftingSystemDetailsJson} from "./CraftingSystemDetails";

interface CraftingSystemJson {
    id: string;
    embedded: boolean;
    details: CraftingSystemDetailsJson;
    disabled: boolean;
}

export { CraftingSystemJson }

class CraftingSystem {

    private readonly _id: string;
    private readonly _embedded: boolean;

    private _details: CraftingSystemDetails;
    private _disabled: boolean;

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
        this._disabled = enabled;
    }

    get embedded(): boolean {
        return this._embedded;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    get id(): string {
        return this._id;
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
            disabled: this._disabled,
            embedded: this._embedded
        };
    }

    clone({id, name, embedded = false}: { name?: string; id: string; embedded?: boolean }): CraftingSystem {
        return new CraftingSystem({
            id,
            embedded,
            craftingSystemDetails: this._details.clone(name),
            enabled: this._disabled,
        });
    }

    static fromJson(craftingSystemJson: CraftingSystemJson) {
        return new CraftingSystem({
            id: craftingSystemJson.id,
            embedded: craftingSystemJson.embedded,
            craftingSystemDetails: CraftingSystemDetails.fromJson(craftingSystemJson.details),
            enabled: craftingSystemJson.disabled,
        });
    }

}

export { CraftingSystem }