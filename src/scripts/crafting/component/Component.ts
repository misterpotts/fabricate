import {Combination, DefaultCombination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {FabricateItemData, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Serializable} from "../../common/Serializable";
import {ComponentReference} from "./ComponentReference";
import {Salvage, SalvageJson, SalvageOptionJson} from "./Salvage";
import {EssenceReference} from "../essence/EssenceReference";
import {DefaultUnit} from "../../common/Unit";
import {
    DefaultOption,
    DefaultSerializableOption,
    DefaultSerializableOptions,
    Options,
    SerializableOption,
    SerializableOptions
} from "../../common/Options";

interface SalvageOptionConfig {

    id?: string;

    name: string;

    results?: Record<string, number>;

    catalysts?: Record<string, number>;

}

export { SalvageOptionConfig }

interface ComponentJson {

    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: Record<string, SalvageOptionJson>;
    craftingSystemId: string;

}

export { ComponentJson }

interface Component extends Identifiable, Serializable<ComponentJson> {

    /**
     * The component's unique ID
     */
    readonly id: string;

    /**
     * The ID of the crafting system this component belongs to
     */
    readonly craftingSystemId: string;

    /**
     * The ID of the item this component is associated with
     */
    readonly itemUuid: string;

    /**
     * Indicates whether this component is embedded with Fabricate
     */
    readonly isEmbedded: boolean;

    /**
     * The name of the item this component is associated with
     */
    readonly name: string;

    /**
     * The URL of the image for the item this component is associated with
     */
    readonly imageUrl: string;

    /**
     * Indicates whether this component has Salvage options
     */
    readonly isSalvageable: boolean;

    /**
     * Indicates whether this component has any essences. This is a convenience function for checking if the component's
     *  essence Combination is empty.
     */
    readonly hasEssences: boolean;

    /**
     * The essences that this component contains, if any. Might be an empty Combination.
     */
    essences: Combination<EssenceReference>;

    /**
     * Indicates whether this component is disabled. Disabled components cannot be used in crafting.
     */
    isDisabled: boolean;

    /**
     * The Salvage options for this component
     */
    salvageOptions: Options<Salvage>;

    /**
     * The Fabricate item data for this component, containing the item's name, image URL, and any errors that occurred
     *  while loading the item.
     */
    itemData: FabricateItemData;

    /**
     * Indicates whether this component has any errors. This is a convenience function for checking if the item data
     *  has any errors.
     */
    readonly hasErrors: boolean;

    /**
     * Indicates whether this component's item data has been loaded
     */
    readonly loaded: boolean;

    /**
     * Converts this component to a ComponentReference
     *
     * @returns {ComponentReference} - The ComponentReference for this component
     */
    toReference(): ComponentReference;

    /**
     * Removes the essence with the given ID from this component, regardless of quantity
     *
     * @param essenceIdToDelete - The ID of the essence to remove
     */
    removeEssence(essenceIdToDelete: string): void;

    /**
     * Loads the item data for this component
     *
     * @param forceReload - Whether to reload the item data. Defaults to false.
     * @returns {Promise<Component>} - A promise that resolves to this component, once the item data has been loaded
     */
    load(forceReload?: boolean): Promise<Component>;

    /**
     * Sets the Salvage option for this component. If the Salvage option has an ID, it will be used to attempt to
     * overwrite an existing salvage option. Otherwise, a new Salvage option will be created with a new ID.
     *
     * @param {SerializableOption<SalvageJson, Salvage> | SalvageOptionConfig} salvageOption - The Salvage option to set.
     *  Accepts a SerializableOption instance or a SalvageOptionConfig object.
     */
    setSalvageOption(salvageOption: SerializableOption<SalvageJson, Salvage> | SalvageOptionConfig): void;

    /**
     * Adds the given quantity of the essence with the given ID to this component
     *
     * @param essenceId - The ID of the essence to add
     * @param quantity - The quantity of the essence to add. Defaults to 1.
     */
    addEssence(essenceId: string, quantity?: number): void;

    /**
     * Subtracts the given quantity of the essence with the given ID from this component
     *
     * @param essenceId - The ID of the essence to subtract
     * @param quantity - The quantity of the essence to subtract. Defaults to 1.
     */
    subtractEssence(essenceId: string, quantity?: number): void;

    /**
     * Lists all the components referenced by this component's Salvage options. Might be an empty array.
     *
     * @returns {ComponentReference[]} - The components referenced by this component, if any
     */
    getUniqueReferencedComponents(): ComponentReference[];

    /**
     * Lists all the essences referenced by this component. Might be an empty array.
     *
     * @returns {EssenceReference[]} - The essences referenced by this component, if any
     */
    getUniqueReferencedEssences(): EssenceReference[];

    /**
     * Removes the given component from this component's Salvage options
     *
     * @param componentId - The ID of the component to remove
     */
    removeComponentFromSalvageOptions(componentId: string): void;

    /**
     * Deletes the Salvage option with the given ID from this component
     *
     * @param id - The ID of the Salvage option to delete
     */
    deleteSalvageOptionById(id: string): void;

    /**
     * Clones this component, optionally with a new ID, crafting system ID, and/or substitute essence IDs
     *
     * @param id - The ID for the cloned component. Must not be the ID of this component.
     * @param embedded - Whether the cloned component should be embedded with Fabricate. Defaults to false.
     * @param craftingSystemId - The ID of the crafting system for the cloned component. Defaults to the ID of this
     *  component's crafting system.
     * @param substituteEssenceIds - A map of essence IDs to substitute with new IDs. Defaults to an empty map. This is
     *  used when cloning a component into a new crafting system, to ensure that the cloned component's essences are
     *  unique to the new crafting system.
     */
    clone({
        id,
        craftingSystemId,
        substituteEssenceIds,
    }: {
        id: string;
        craftingSystemId?: string;
        substituteEssenceIds?: Map<string, string>;
    }): Component;

}

export { Component }

class DefaultComponent implements Component {

    private readonly _id: string;
    private readonly _embedded: boolean;
    private readonly _craftingSystemId: string;

    private _itemData: FabricateItemData;
    private _essences: Combination<EssenceReference>;
    private _salvageOptions: SerializableOptions<SalvageJson, Salvage>;
    private _disabled: boolean;

    constructor({
        id,
        craftingSystemId,
        disabled = false,
        embedded = false,
        itemData = NoFabricateItemData.INSTANCE(),
        essences = DefaultCombination.EMPTY<EssenceReference>(),
        salvageOptions = new DefaultSerializableOptions()
    }: {
        id: string;
        disabled?: boolean;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        essences?: Combination<EssenceReference>;
        salvageOptions?: SerializableOptions<SalvageJson, Salvage>;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._itemData = itemData;
        this._disabled = disabled;
        this._essences = essences;
        this._salvageOptions = salvageOptions;
        this._craftingSystemId = craftingSystemId;
    }

    set itemData(itemData: FabricateItemData) {
        this._itemData = itemData;
    }

    get itemData(): FabricateItemData {
        return this._itemData;
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

    get itemUuid(): string {
        return this._itemData.uuid;
    }

    get name(): string {
        return this._itemData.name;
    }

    get imageUrl(): string {
        return this._itemData.imageUrl;
    }

    get essences(): Combination<EssenceReference> {
        return this._essences;
    }

    get isDisabled(): boolean {
        return this._disabled;
    }

    get isSalvageable(): boolean {
        if (this._salvageOptions.isEmpty) {
            return false;
        }
        return this._salvageOptions.all
            .map(option => !option.value.products.isEmpty())
            .reduce((left, right) => left || right, false);
    }

    get hasEssences(): boolean {
        return !this.essences.isEmpty();
    }

    public toJson(): ComponentJson {
        return {
            id: this._id,
            embedded: false,
            disabled: this._disabled,
            essences: this._essences.toJson(),
            itemUuid: this._itemData.toJson().uuid,
            craftingSystemId: this._craftingSystemId,
            salvageOptions: this.serializeSalvageLegacy()
        }
    }

    // todo: BREAKING remove this method and perform data migration
    private serializeSalvageLegacy(): Record<string, SalvageOptionJson> {
        return this._salvageOptions.all
            .map(option => {
                return {
                    id: option.id,
                    name: option.name,
                    results: option.value.products.toJson(),
                    catalysts: option.value.catalysts.toJson()
                }
            })
            .reduce((result, salvageOption) => {
                result[salvageOption.id] = salvageOption;
                return result;
            }, <Record<string, SalvageOptionJson>>{});
    }

    public toReference(): ComponentReference {
        return new ComponentReference(this._id);
    }

    clone({
      id,
      craftingSystemId = this._craftingSystemId,
      substituteEssenceIds = new Map<string, string>(),
    }: {
        id: string;
        craftingSystemId?: string;
        substituteEssenceIds?: Map<string, string>;
    }): Component {
        if (id === this._id) {
            throw new Error(`Cannot clone component with ID "${this._id}" using the same ID`);
        }
        const itemData = craftingSystemId === this._craftingSystemId ? NoFabricateItemData.INSTANCE() : this._itemData;
        const essences = this._essences
            .map(essenceUnit => {
                if (!substituteEssenceIds.has(essenceUnit.element.id)) {
                    return essenceUnit;
                }
                const substituteId = substituteEssenceIds.get(essenceUnit.element.id);
                return new DefaultUnit(new EssenceReference(substituteId), essenceUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), DefaultCombination.EMPTY<EssenceReference>());
        return new DefaultComponent({
            id,
            embedded: false,
            itemData,
            essences,
            craftingSystemId,
            salvageOptions: this._salvageOptions.clone(),
            disabled: this._disabled,
        });
    }

    set isDisabled(value: boolean) {
        this._disabled = value;
    }

    set essences(value: Combination<EssenceReference>) {
        this._essences = value;
    }

    get salvageOptions(): Options<Salvage> {
        return this._salvageOptions;
    }

    deleteSalvageOptionById(id: string) {
        this._salvageOptions.remove(id);
    }

    get hasErrors(): boolean {
        return this._itemData.hasErrors;
    }

    removeEssence(essenceIdToDelete: string) {
        this._essences = this._essences.without(essenceIdToDelete);
    }

    removeComponentFromSalvageOptions(componentId: string) {
        this._salvageOptions = this._salvageOptions.clone((salvage) => {
            salvage.products = salvage.products.without(componentId);
            salvage.catalysts = salvage.catalysts.without(componentId);
            return salvage;
        });
    }

    async load(forceReload: boolean = false) {
        if (this.loaded && !forceReload) {
            return;
        }
        this.itemData = await this.itemData.load();
        return this;
    }

    get loaded(): boolean {
        return this.itemData.loaded;
    }

    setSalvageOption(salvageOption: SerializableOption<SalvageJson, Salvage> | SalvageOptionConfig) {

        // Create a SerializableOption from the SalvageOptionConfig if one was provided
        if (this.isSalvageOptionConfig(salvageOption)) {
            salvageOption = new DefaultSerializableOption({
                id: salvageOption.id,
                name: salvageOption.name,
                value: Salvage.fromJson({
                    results: salvageOption.results,
                    catalysts: salvageOption.catalysts,
                }),
            });
        }

        // We don't accept user-defined identifiers for new salvage options
        // If the salvage option has an ID, assert that it exists to overwrite
        if (salvageOption.id && !this._salvageOptions.has(salvageOption.id)) {
            throw new Error(`Unable to find salvage option with id ${salvageOption.id} to overwrite`);
        }

        if (!(salvageOption instanceof DefaultSerializableOption)) {
            throw new Error(`Unable to set salvage option ${salvageOption.id} as it is not an instance of DefaultSerializableOption`);
        }

        this._salvageOptions.set(salvageOption);

    }

    addEssence(essenceId: string, quantity: number = 1) {
        this._essences = this._essences.addUnit(new DefaultUnit(new EssenceReference(essenceId), quantity));
    }

    subtractEssence(essenceId: string, quantity: number = 1) {
        this._essences = this._essences.subtractUnit(new DefaultUnit(new EssenceReference(essenceId), quantity));
    }

    getUniqueReferencedComponents(): ComponentReference[] {
        return this._salvageOptions.all
            .map(salvageOption => salvageOption.value.products.combineWith(salvageOption.value.catalysts))
            .reduce((left, right) => left.combineWith(right), DefaultCombination.EMPTY<ComponentReference>())
            .members;
    }

    getUniqueReferencedEssences(): EssenceReference[] {
        return this._essences.members;
    }

    private isSalvageOptionConfig(salvageOption: any): salvageOption is SalvageOptionConfig {
        if (salvageOption instanceof DefaultSerializableOption || salvageOption instanceof DefaultOption) {
            return false;
        }
        return salvageOption
            && typeof salvageOption === "object"
            && typeof salvageOption.name === "string";
    }
}

export { DefaultComponent }