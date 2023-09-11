import {Identifiable} from "../../common/Identifiable";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Serializable} from "../../common/Serializable";
import {EssenceReference} from "./EssenceReference";

interface EssenceJson {
    id: string;
    name: string;
    tooltip: string;
    iconCode: string;
    embedded: boolean;
    disabled: boolean;
    description: string;
    craftingSystemId: string;
    activeEffectSourceItemUuid: string;
}

export { EssenceJson }

interface Essence extends Identifiable, Serializable<EssenceJson> {

    /**
     * The unique id of this essence
     */
    readonly id: string;

    /**
     * The unique id of the crafting system this essence belongs to
     */
    readonly craftingSystemId: string;

    /**
     * The display name of this essence
     */
    name: string;

    /**
     * The long-form, detailed description of this essence
     */
    description: string;

    /**
     * The tooltip to display when the user hovers their cursor over the icon for this essence
     */
    tooltip: string;

    /**
     * The Fontawesome icon code for the icon to display for this essence. Free icons, included with Foundry VTT can be
     *  found at https://fontawesome.com/search?m=free&o=r
     */
    iconCode: string;

    /**
     * Indicates whether this essence is embedded in a crafting system
     */
    readonly isEmbedded: boolean;

    /**
     * Indicates whether this essence is disabled. Disabled essences cannot be used in crafting
     */
    disabled: boolean;

    /**
     * Indicates whether this essence's active effect source item data has been loaded, if it has any
     */
    readonly loaded: boolean;

    /**
     * Indicates whether this essence has an active effect source item
     */
    readonly hasActiveEffectSource: boolean;

    /**
     * The active effect source item data for this essence, if it has any. May be an instance of the null object,
     *  `NoFabricateItemData`
     */
    activeEffectSource: FabricateItemData;

    /**
     * Indicates whether this essence has any loading errors in its active effect source item data
     */
    readonly hasErrors: boolean;

    /**
     * The loading errors in this essence's active effect source item data, if it has any
     */
    readonly errors: ItemLoadingError[];

    /**
     * Converts this essence to an essence reference
     *
     * @returns EssenceReference A reference to this essence
     */
    toReference(): EssenceReference;

    /**
     * Clones this essence, returning a new instance with the provided id and crafting system id
     *
     * @param id - The id for the new essence. Must be different to this essence's id
     * @param craftingSystemId - The crafting system id for the new essence
     * @returns Essence A new instance of this essence, with the provided id and crafting system id
     */
    clone({
        id,
        craftingSystemId,
    }: {
        id: string,
        craftingSystemId?: string
    }): Essence;

    /**
     * Loads this essence's active effect source item data, if it has any
     *
     * @param forceReload - Whether to reload the item data. Defaults to false.
     * @returns Promise<Essence> A promise that resolves to this essence, after its active effect source item data has
     */
    load(forceReload?: boolean): Promise<Essence>;

}

export { Essence }

class DefaultEssence implements Essence {

    private readonly _id: string;
    private readonly _craftingSystemId: string;
    private readonly _embedded: boolean;

    private _name: string;
    private _tooltip: string;
    private _iconCode: string;
    private _disabled: boolean;
    private _description: string;
    private _activeEffectSource: FabricateItemData;

    constructor({
        id,
        name,
        tooltip,
        iconCode,
        embedded = false,
        disabled = false,
        description,
        craftingSystemId,
        activeEffectSource = NoFabricateItemData.INSTANCE(),
    }: {
        id: string;
        name: string;
        tooltip: string;
        iconCode: string;
        embedded?: boolean;
        disabled?: boolean;
        description: string;
        craftingSystemId: string;
        activeEffectSource?: FabricateItemData;
    }) {
        this._id = id;
        this._name = name;
        this._tooltip = tooltip;
        this._iconCode = iconCode;
        this._embedded = embedded;
        this._disabled = disabled;
        this._description = description;
        this._craftingSystemId = craftingSystemId;
        this._activeEffectSource = activeEffectSource;
    }

    toJson(): EssenceJson {
        return {
            id: this._id,
            name: this._name,
            tooltip: this._tooltip,
            embedded: this._embedded,
            disabled: this._disabled,
            iconCode: this._iconCode,
            description: this._description,
            craftingSystemId: this._craftingSystemId,
            activeEffectSourceItemUuid: this._activeEffectSource?.uuid
        }
    }

    get loaded(): boolean {
        if (!this.hasActiveEffectSource) {
            return true;
        }
        return this._activeEffectSource.loaded;
    }

    async load(forceReload = false): Promise<Essence> {
        if (!this.hasActiveEffectSource) {
            return;
        }
        if (this.loaded && !forceReload) {
            return this;
        }
        this.activeEffectSource = await this._activeEffectSource.load();
        return this;
    }

    get id(): string {
        return this._id;
    }

    get isEmbedded(): boolean {
        return this._embedded;
    }

    get craftingSystemId(): string {
        return this._craftingSystemId;
    }

    get hasActiveEffectSource(): boolean {
        if (!this._activeEffectSource) {
            return false;
        }
        return this._activeEffectSource.uuid !== NoFabricateItemData.INSTANCE().uuid;
    }

    get activeEffectSource(): FabricateItemData {
        return this._activeEffectSource;
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    get tooltip(): string {
        return this._tooltip;
    }

    get iconCode(): string {
        return this._iconCode;
    }

    get hasErrors(): boolean {
        if (!this._activeEffectSource) {
            return false;
        }
        return this._activeEffectSource.hasErrors;
    }

    get errors(): ItemLoadingError[] {
        return this._activeEffectSource.errors;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    set activeEffectSource(value: FabricateItemData) {
        this._activeEffectSource = value;
    }

    set name(value: string) {
        this._name = value;
    }

    set description(value: string) {
        this._description = value;
    }

    set tooltip(value: string) {
        this._tooltip = value;
    }

    set iconCode(value: string) {
        this._iconCode = value;
    }

    toReference(): EssenceReference {
        return new EssenceReference(this._id);
    }

    clone({
        id,
        craftingSystemId = this._craftingSystemId,
    }: {
        id: string,
        craftingSystemId?: string,
    }): Essence {
        if (id === this._id) {
            throw new Error(`Cannot clone essence with ID "${this._id}" using the same ID`);
        }
        return new DefaultEssence({
            id,
            embedded: false,
            craftingSystemId,
            name: this._name,
            tooltip: this._tooltip,
            iconCode: this._iconCode,
            disabled: this._disabled,
            description: this._description,
        });
    }

}

export { DefaultEssence }
