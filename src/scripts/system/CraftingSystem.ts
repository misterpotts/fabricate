import {CraftingSystemDetails, CraftingSystemDetailsJson} from "./CraftingSystemDetails";
import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "../api/EntityValidator";

interface CraftingSystemJson {
    id: string;
    embedded: boolean;
    gameSystem: string;
    details: CraftingSystemDetailsJson;
    enabled: boolean;
}

export { CraftingSystemJson }

class CraftingSystemValidator implements EntityValidator<CraftingSystem> {

    async validate(entity: CraftingSystem): Promise<EntityValidationResult<CraftingSystem>> {

        const errors: string[] = [];

        if (!entity) {
            throw new Error(`Cannot validate crafting system. Candidate is ${typeof entity} `);
        }

        if (!entity.details?.name) {
            errors.push("Crafting system name is required");
        }

        if (!entity.details?.summary) {
            errors.push("Crafting system summary is required");
        }

        if (!entity.details?.author) {
            errors.push("Crafting system author is required");
        }

        return new DefaultEntityValidationResult({ entity, errors });

    }

}

export { CraftingSystemValidator }

class CraftingSystem {

    private readonly _id: string;
    private readonly _embedded: boolean;
    private readonly _gameSystem: string;

    private _details: CraftingSystemDetails;
    private _enabled: boolean;

    constructor({
        id,
        embedded = false,
        gameSystem,
        craftingSystemDetails,
        enabled = true,
    }: {
        id: string;
        embedded?: boolean;
        gameSystem: string;
        craftingSystemDetails: CraftingSystemDetails,
        enabled?: boolean;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._gameSystem = gameSystem;
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

    get gameSystem(): string {
        return this._gameSystem;
    }

    toJson(): CraftingSystemJson {
        return {
            id: this._id,
            details: this._details.toJson(),
            enabled: this._enabled,
            embedded: this._embedded,
            gameSystem: this._gameSystem
        };
    }

    get id(): string {
        return this._id;
    }

    clone({id, name, embedded = false}: { name?: string; id: string; embedded?: boolean }): CraftingSystem {
        return new CraftingSystem({
            id,
            embedded,
            gameSystem: this._gameSystem,
            craftingSystemDetails: this._details.clone(name),
            enabled: this._enabled,
        });
    }
}

export { CraftingSystem }