import {Combination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {Essence} from "../essence/Essence";
import {SelectableOptions} from "../recipe/SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Unit} from "../../common/Unit";
import {Serializable} from "../../common/Serializable";

interface ComponentJson {
    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: SalvageOptionJson[];
    craftingSystemId: string;
}

interface SalvageOptionJson {
    name: string;
    salvage: Record<string, number>;
}

interface ComponentReferenceJson {
    id: string;
    craftingSystemId: string;
}

class ComponentReference implements Identifiable, Serializable<ComponentReferenceJson> {

    private readonly _id: string;
    private readonly _craftingSystemId: string;

    constructor({
        id,
        craftingSystemId
    }: {
        id: string;
        craftingSystemId: string;
    }) {
        this._id = id;
        this._craftingSystemId = craftingSystemId;
    }

    get id(): string {
        return this._id;
    }

    get craftingSystemId() {
        return this._craftingSystemId;
    }

    toJson(): ComponentReferenceJson {
        return {
            id: this._id,
            craftingSystemId: this._craftingSystemId
        };
    }

}

class SalvageOption implements Identifiable, Serializable<SalvageOptionJson> {

    private _salvage: Combination<ComponentReference>;
    private _name: string;

    constructor({
        name,
        salvage
    }: {
        name: string;
        salvage: Combination<ComponentReference>;
    }) {
        this._name = name;
        this._salvage = salvage;
    }

    get salvage(): Combination<ComponentReference> {
        return this._salvage;
    }

    set salvage(value: Combination<ComponentReference>) {
        this._salvage = value;
    }

    set name(value: string) {
        this._name = value;
    }

    get isEmpty(): boolean {
        return this._salvage.isEmpty();
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._name;
    }

    public add(component: ComponentReference, quantity = 1) {
        this._salvage = this._salvage.addUnit(new Unit(component, quantity));
    }

    public subtract(component: ComponentReference, quantity = 1) {
        this._salvage = this._salvage.subtractUnit(new Unit(component, quantity));
    }

    toJson(): SalvageOptionJson {
        return {
            name: this._name,
            salvage: this._salvage.toJson()
        };
    }

    static fromJson(salvageOptionJson: SalvageOptionJson, craftingSystemId: string): SalvageOption {
        const salvage = Object.keys(salvageOptionJson.salvage)
            .map(componentId => {
                const reference = new ComponentReference({
                    id: componentId,
                    craftingSystemId
                });
                return new Unit(reference, salvageOptionJson.salvage[componentId]);
            });
        return new SalvageOption({
            name: salvageOptionJson.name,
            salvage: Combination.ofUnits(salvage)
        });
    }

}

class Component implements Identifiable, Serializable<ComponentJson> {

    private static readonly _NONE: Component = new Component({
        id: "NO_ID",
        craftingSystemId: "NO_CRAFTING_SYSTEM_ID",
        itemData: NoFabricateItemData.INSTANCE(),
        disabled: true,
        essences: Combination.EMPTY(),
        salvageOptions: new SelectableOptions({})
    });

    private readonly _id: string;
    private readonly _embedded: boolean;

    private _itemData: FabricateItemData;
    private _essences: Combination<Essence>;
    private _salvageOptions: SelectableOptions<SalvageOptionJson, SalvageOption>;
    private _disabled: boolean;
    private _craftingSystemId: string;

    constructor({
        id,
        craftingSystemId,
        disabled = false,
        embedded = false,
        itemData = NoFabricateItemData.INSTANCE(),
        essences = Combination.EMPTY<Essence>(),
        salvageOptions = new SelectableOptions({})
    }: {
        id: string;
        disabled?: boolean;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        essences?: Combination<Essence>;
        salvageOptions?: SelectableOptions<SalvageOptionJson, SalvageOption>;
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

    get embedded(): boolean {
        return this._embedded;
    }

    get craftingSystemId(): string {
        return this._craftingSystemId;
    }

    get itemUuid(): string {
        return this._itemData.uuid;
    }

    public static NONE() {
        return this._NONE;
    }

    get name(): string {
        return this._itemData.name;
    }

    get imageUrl(): string {
        return this._itemData.imageUrl;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    get selectedSalvage(): Combination<ComponentReference> {
        return this._salvageOptions.selectedOption.salvage;
    }

    get selectedSalvageOptionName(): string {
        return this._salvageOptions.selectedOptionId;
    }

    public selectSalvageOption(combinationId: string) {
        this._salvageOptions.select(combinationId);
    }

    public selectNextSalvageOption(): void {
        this._salvageOptions.selectNext();
    }

    public selectPreviousSalvageOption(): void {
        this._salvageOptions.selectPrevious();
    }

    get disabled(): boolean {
        return this._disabled;
    }

    get isSalvageable(): boolean {
        if (this._salvageOptions.isEmpty) {
            return false;
        }
        return this._salvageOptions.options
            .map(option => !option.salvage.isEmpty())
            .reduce((left, right) => left || right, false);
    }

    public get hasEssences(): boolean {
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
            salvageOptions: this._salvageOptions.toJson()
        }
    }

    public toReference(): ComponentReference {
        return new ComponentReference({
            id: this._id,
            craftingSystemId: this._craftingSystemId
        });
    }

    public clone(cloneId: string): Component {
        return new Component({
            id: cloneId,
            craftingSystemId: this._craftingSystemId,
            itemData: NoFabricateItemData.INSTANCE(),
            salvageOptions: this._salvageOptions.clone(),
            disabled: this._disabled,
            essences: this._essences.clone()
        });
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    set essences(value: Combination<Essence>) {
        this._essences = value;
    }

    public addSalvageOption(value: SalvageOption) {
        if (this._salvageOptions.has(value.id)) {
            throw new Error(`Result option ${value.id} already exists in this recipe. `);
        }
        this._salvageOptions.add(value);
    }

    set salvageOptions(options: SalvageOption[]) {
        this._salvageOptions = new SelectableOptions<SalvageOptionJson, SalvageOption>({ options });
    }

    get salvageOptions(): SalvageOption[] {
        return this._salvageOptions.options.filter(option => !option.isEmpty);
    }

    get firstOptionName(): string {
        if (this._salvageOptions.isEmpty) {
            return "";
        }
        return this.salvageOptions[0].name;
    }

    public selectFirstOption(): void {
        this.selectSalvageOption(this.firstOptionName);
    }

    get salvageOptionsById(): Map<string, SalvageOption> {
        return this._salvageOptions.optionsByName;
    }

    public setSalvageOption(value: SalvageOption) {
        this._salvageOptions.set(value);
    }

    public deleteSalvageOptionByName(id: string) {
        this._salvageOptions.deleteById(id);
    }

    get hasErrors(): boolean {
        return this._itemData.hasErrors;
    }

    get errors(): ItemLoadingError[] {
        return this._itemData.errors;
    }

    get errorCodes(): string[] {
        return this._itemData.errors.map(error => error.code);
    }

    deselectSalvage() {
        this._salvageOptions.deselect();
    }

}

export { Component, ComponentJson, SalvageOptionJson, SalvageOption }