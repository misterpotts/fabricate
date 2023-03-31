import {CraftingSystemDetails, CraftingSystemDetailsJson} from "./CraftingSystemDetails";
import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "../api/EntityValidator";

interface CraftingSystemJson {
    id: string;
    details: CraftingSystemDetailsJson;
    locked: boolean;
    enabled: boolean;
}

export { CraftingSystemJson }

interface CraftingSystem {

    readonly id: string;
    readonly isLocked: boolean;
    isEnabled: boolean;
    details: CraftingSystemDetails;
    clone({id, name}: { name: string; id: string; locked: boolean }): CraftingSystem;
    toJson(): CraftingSystemJson;

}

export { CraftingSystem }

class CraftingSystemValidator implements EntityValidator<CraftingSystem> {

    async validate(entity: CraftingSystem): Promise<EntityValidationResult<CraftingSystem>> {

        const errors: string[] = [];

        if (!entity) {
            throw new Error(`Cannot validate crafting system. Candidate is ${typeof entity} `);
        }

        if (entity.isLocked) {
            errors.push("Locked systems cannot be modified");
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

class UserDefinedCraftingSystem implements CraftingSystem{

    private readonly _id: string;
    private craftingSystemDetails: CraftingSystemDetails;
    private enabled: boolean;
    private static readonly IS_LOCKED: boolean = false;

    constructor({
        id,
        craftingSystemDetails,
        enabled = true
    }: {
        id: string;
        craftingSystemDetails: CraftingSystemDetails,
        enabled?: boolean;
    }) {
        this._id = id;
        this.craftingSystemDetails = craftingSystemDetails;
        this.enabled = enabled;
    }

    get isLocked(): boolean {
        return UserDefinedCraftingSystem.IS_LOCKED;
    }

    get isEnabled(): boolean {
        return this.enabled;
    }

    set isEnabled(value: boolean) {
        this.enabled = value;
    }

    get details(): CraftingSystemDetails {
        return this.craftingSystemDetails;
    }

    set details(value: CraftingSystemDetails) {
        this.craftingSystemDetails = value;
    }

    toJson(): CraftingSystemJson {
        return {
            id: this._id,
            details: this.craftingSystemDetails.toJson(),
            enabled: this.enabled,
            locked: UserDefinedCraftingSystem.IS_LOCKED
        };
    }

    get id(): string {
        return this._id;
    }

    clone({id, name}: { name: string; id: string; locked: boolean }): CraftingSystem {
        return new UserDefinedCraftingSystem({
            id,
            craftingSystemDetails: new CraftingSystemDetails({
                name,
                summary: this.craftingSystemDetails.summary,
                description: this.craftingSystemDetails.description,
                author: this.craftingSystemDetails.author,
            }),
            enabled: this.enabled
        });
    }
}

export { UserDefinedCraftingSystem }

class EmbeddedCraftingSystem implements CraftingSystem{

    private readonly _id: string;
    private readonly craftingSystemDetails: CraftingSystemDetails;
    private enabled: boolean;
    private static readonly IS_LOCKED: boolean = true;

    constructor({
        id,
        craftingSystemDetails,
        enabled
    }: {
        id: string;
        craftingSystemDetails: CraftingSystemDetails,
        enabled: boolean;
    }) {
        this._id = id;
        this.craftingSystemDetails = craftingSystemDetails;
        this.enabled = enabled;
    }

    get isLocked(): boolean {
        return EmbeddedCraftingSystem.IS_LOCKED;
    }

    get isEnabled(): boolean {
        return this.enabled;
    }

    set isEnabled(value: boolean) {
        this.enabled = value;
    }

    get details(): CraftingSystemDetails {
        return this.craftingSystemDetails;
    }

    get id(): string {
        return this._id;
    }

    toJson(): CraftingSystemJson {
        return {
            id: this._id,
            details: this.details.toJson(),
            enabled: this.enabled,
            locked: EmbeddedCraftingSystem.IS_LOCKED
        };
    }

    clone({id, name}: { name: string; id: string; locked: boolean }): CraftingSystem {
        return new UserDefinedCraftingSystem({
            id,
            craftingSystemDetails: new CraftingSystemDetails({
                name,
                summary: this.details.summary,
                description: this.details.description,
                author: this.details.author,
            }),
            enabled: this.enabled
        });
    }

}

export { EmbeddedCraftingSystem }