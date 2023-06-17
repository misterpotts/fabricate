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
    salvageOptions: Record<string, SalvageOptionJson>;
}

type SalvageOptionJson = Record<string, number>;

class SalvageOption implements Identifiable, Serializable<SalvageOptionJson> {

    private _salvage: Combination<Component>;
    private _name: string;

    constructor({
        name,
        salvage
    }: {
        name: string;
        salvage: Combination<Component>;
    }) {
        this._name = name;
        this._salvage = salvage;
    }

    get salvage(): Combination<Component> {
        return this._salvage;
    }

    set salvage(value: Combination<Component>) {
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

    public add(component: Component, quantity = 1) {
        this._salvage = this._salvage.addUnit(new Unit(component, quantity));
    }

    public subtract(component: Component, quantity = 1) {
        this._salvage = this._salvage.subtractUnit(new Unit(component, quantity));
    }

    toJson(): SalvageOptionJson {
        return this._salvage.toJson();
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
    private _itemData: FabricateItemData;
    private _essences: Combination<Essence>;
    private _salvageOptions: SelectableOptions<SalvageOptionJson, SalvageOption>;
    private _isDisabled: boolean;
    private _craftingSystemId: string;

    constructor({
        id,
        craftingSystemId,
        itemData = NoFabricateItemData.INSTANCE(),
        disabled = false,
        essences = Combination.EMPTY<Essence>(),
        salvageOptions = new SelectableOptions({})
    }: {
        id: string;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        essences?: Combination<Essence>;
        salvageOptions?: SelectableOptions<SalvageOptionJson, SalvageOption>;
    }) {
        this._id = id;
        this._craftingSystemId = craftingSystemId;
        this._itemData = itemData;
        this._isDisabled = disabled;
        this._essences = essences;
        this._salvageOptions = salvageOptions;
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

    get selectedSalvage(): Combination<Component> {
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

    get isDisabled(): boolean {
        return this._isDisabled;
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
            disabled: this._isDisabled,
            itemUuid: this._itemData.toJson().uuid,
            essences: this._essences.toJson(),
            salvageOptions: this._salvageOptions.toJson()
        }
    }

    public clone(cloneId: string): Component {
        return new Component({
            id: cloneId,
            craftingSystemId: this._craftingSystemId,
            itemData: NoFabricateItemData.INSTANCE(),
            salvageOptions: this._salvageOptions.clone(),
            disabled: this._isDisabled,
            essences: this._essences.clone()
        });
    }

    set isDisabled(value: boolean) {
        this._isDisabled = value;
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