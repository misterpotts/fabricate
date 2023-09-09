import {CraftingSystemDetails, CraftingSystemDetailsJson} from "./CraftingSystemDetails";

interface CraftingSystemJson {
    id: string;
    embedded: boolean;
    details: CraftingSystemDetailsJson;
    disabled: boolean;
}

export { CraftingSystemJson }

/**
 * A crafting system is a set of rules that define how items can be crafted. Crafting systems contain additional
 *   details that can be used to display information about the crafting system to the user.
 */
interface CraftingSystem {

    /**
     * The unique identifier for the crafting system.
     */
    readonly id: string;

    /**
     * Whether the crafting system is embedded with Fabricate. Embedded crafting systems are not editable, except
     *   for the `isDisabled` property.
     */
    readonly isEmbedded: boolean;

    /**
     * Whether the crafting system is disabled. Disabled crafting systems are not available for use in Fabricate.
     *   Their components cannot be salvaged, and their recipes cannot be crafted.
     */
    isDisabled: boolean;

    /**
     * The details of the crafting system.
     */
    details: CraftingSystemDetails;

    /**
     * Converts the crafting system to a JSON object.
     */
    toJson(): CraftingSystemJson;

    /**
     * Creates a clone of the crafting system.
     *
     * @param id - The unique identifier for the new crafting system.
     * @param name - The name of the new crafting system.
     * @param embedded - Whether the new crafting system should be embedded with Fabricate. Defaults to `false`.
     */
    clone({id, name, embedded}: { name?: string; id: string; embedded?: boolean }): CraftingSystem;

    /**
     * Determines whether the crafting system is equal to another crafting system.
     *
     * @param other - The other crafting system to compare to this one.
     * @param excludeDisabled - Whether to exclude the `isDisabled` property from the comparison. Defaults to `false`.
     */
    equals(other: CraftingSystem, excludeDisabled: boolean): boolean;

}

export { CraftingSystem }

class DefaultCraftingSystem implements CraftingSystem {

    private readonly _id: string;
    private readonly _embedded: boolean;

    private _details: CraftingSystemDetails;
    private _disabled: boolean;

    constructor({
        id,
        embedded = false,
        craftingSystemDetails,
        disabled = false,
    }: {
        id: string;
        embedded?: boolean;
        craftingSystemDetails: CraftingSystemDetails,
        disabled?: boolean;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._details = craftingSystemDetails;
        this._disabled = disabled;
    }

    get isEmbedded(): boolean {
        return this._embedded;
    }

    get isDisabled(): boolean {
        return this._disabled;
    }

    set isDisabled(value: boolean) {
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

    clone({id, name, embedded = false}: { name?: string; id: string; embedded?: boolean }): DefaultCraftingSystem {
        return new DefaultCraftingSystem({
            id,
            embedded,
            craftingSystemDetails: this._details.clone(name),
            disabled: this._disabled,
        });
    }

    static fromJson(craftingSystemJson: CraftingSystemJson) {
        return new DefaultCraftingSystem({
            id: craftingSystemJson.id,
            embedded: craftingSystemJson.embedded,
            craftingSystemDetails: CraftingSystemDetails.fromJson(craftingSystemJson.details),
            disabled: craftingSystemJson.disabled,
        });
    }

    equals(other: CraftingSystem, excludeDisabled: boolean = false): boolean {
        return this._id === other.id
            && this._embedded === other.isEmbedded
            && this._details.equals(other.details)
            && (excludeDisabled || this._disabled === other.isDisabled);
    }

}

export { DefaultCraftingSystem }