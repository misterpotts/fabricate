import {Combination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {SelectableOptions} from "../selection/SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Serializable} from "../../common/Serializable";
import {ComponentReference} from "./ComponentReference";
import {SalvageOption, SalvageOptionConfig, SalvageOptionJson} from "./SalvageOption";
import {EssenceReference} from "../essence/EssenceReference";
import {Unit} from "../../common/Unit";

interface ComponentJson {
    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: Record<string, SalvageOptionJson>;
    craftingSystemId: string;
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
    private readonly _craftingSystemId: string;

    private _itemData: FabricateItemData;
    private _essences: Combination<EssenceReference>;
    private _salvageOptions: SelectableOptions<SalvageOptionJson, SalvageOption>;
    private _disabled: boolean;

    constructor({
        id,
        craftingSystemId,
        disabled = false,
        embedded = false,
        itemData = NoFabricateItemData.INSTANCE(),
        essences = Combination.EMPTY<EssenceReference>(),
        salvageOptions = new SelectableOptions({})
    }: {
        id: string;
        disabled?: boolean;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        essences?: Combination<EssenceReference>;
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

    get essences(): Combination<EssenceReference> {
        return this._essences;
    }

    get selectedSalvage(): Combination<ComponentReference> {
        return this._salvageOptions.selectedOption.results;
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
        return this._disabled;
    }

    get isSalvageable(): boolean {
        if (this._salvageOptions.isEmpty) {
            return false;
        }
        return this._salvageOptions.all
            .map(option => !option.results.isEmpty())
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
        return new ComponentReference(this._id);
    }

    public clone({
         id,
         embedded = false,
         craftingSystemId = this._craftingSystemId,
         substituteEssenceIds = new Map<string, string>(),
     }: {
        id: string;
        embedded?: boolean;
        craftingSystemId?: string;
        substituteEssenceIds?: Map<string, string>;
    }): Component {
        const itemData = craftingSystemId === this._craftingSystemId ? NoFabricateItemData.INSTANCE() : this._itemData;
        const essences = this._essences
            .map(essenceUnit => {
                if (!substituteEssenceIds.has(essenceUnit.element.id)) {
                    return essenceUnit;
                }
                const substituteId = substituteEssenceIds.get(essenceUnit.element.id);
                return new Unit(new EssenceReference(substituteId), essenceUnit.quantity);
            })
            .reduce((left, right) => left.addUnit(right), Combination.EMPTY<EssenceReference>());
        return new Component({
            id,
            embedded,
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

    public addSalvageOption(value: SalvageOption) {
        if (this._salvageOptions.has(value.id)) {
            throw new Error(`Result option ${value.id} already exists in this recipe. `);
        }
        this._salvageOptions.add(value);
    }

    set salvageOptions(options: SelectableOptions<SalvageOptionJson, SalvageOption>) {
        this._salvageOptions = options
    }

    get salvageOptions(): SelectableOptions<SalvageOptionJson, SalvageOption> {
        return this._salvageOptions;
    }

    public selectFirstOption(): void {
        this._salvageOptions.selectFirst()
    }

    get salvageOptionsById(): Map<string, SalvageOption> {
        return this._salvageOptions.byId;
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

    removeEssence(essenceIdToDelete: string) {
        this._essences = this._essences.without(essenceIdToDelete);
    }

    removeComponentFromSalvageOptions(componentId: string) {
        const options = this._salvageOptions.all
            .map(option => option.without(componentId));
        this._salvageOptions = new SelectableOptions({ options });
    }

    async load() {
        this.itemData = await this.itemData.load();
    }

    get loaded(): boolean {
        return this.itemData.loaded;
    }

    public setSalvageOption(value: SalvageOptionConfig) {
        const optionId = this._salvageOptions.nextId();
        const salvageOption = SalvageOption.fromJson({
            id: optionId,
            ...value
        });
        this._salvageOptions.set(salvageOption);
    }

    addEssence(essenceId: string, quantity: number = 1) {
        this._essences = this._essences.addUnit(new Unit(new EssenceReference(essenceId), quantity));
    }

    subtractEssence(essenceId: string, quantity: number = 1) {
        this._essences = this._essences.subtractUnit(new Unit(new EssenceReference(essenceId), quantity));
    }

    getUniqueReferencedComponents(): ComponentReference[] {
        return this._salvageOptions.all
            .map(salvageOption => salvageOption.results.combineWith(salvageOption.catalysts))
            .reduce((left, right) => left.combineWith(right), Combination.EMPTY<ComponentReference>())
            .members;
    }

    getUniqueReferencedEssences(): EssenceReference[] {
        return this._essences.members;
    }

}

export { Component, ComponentJson }