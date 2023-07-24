import {Combination} from "../../common/Combination";
import {Identifiable} from "../../common/Identifiable";
import {SelectableOptions} from "../selection/SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";
import {Serializable} from "../../common/Serializable";
import {ComponentReference} from "../component/ComponentReference";
import {RequirementOption} from "./RequirementOption";
import {RequirementOptionJson} from "./RequirementOption";
import {RequirementOptionConfig} from "./RequirementOption";
import {ResultOption, ResultOptionJson} from "./ResultOption";
import {ResultOptionConfig} from "./ResultOption";
import {EssenceReference} from "../essence/EssenceReference";

interface RecipeJson {
    id: string;
    embedded: boolean;
    itemUuid: string;
    disabled: boolean;
    craftingSystemId: string;
    resultOptions: Record<string, ResultOptionJson>;
    requirementOptions: Record<string, RequirementOptionJson>;
}

class Recipe implements Identifiable, Serializable<RecipeJson> {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _craftingSystemId: string;
    private readonly _embedded: boolean;

    private _itemData: FabricateItemData;
    private _requirementOptions: SelectableOptions<RequirementOptionJson, RequirementOption>;
    private _resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;
    private disabled: boolean;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        embedded = false,
        craftingSystemId,
        disabled = false,
        itemData = NoFabricateItemData.INSTANCE(),
        resultOptions = new SelectableOptions({}),
        requirementOptions = new SelectableOptions({})
    }: {
        id: string;
        embedded?: boolean;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        resultOptions?: SelectableOptions<ResultOptionJson, ResultOption>;
        requirementOptions?: SelectableOptions<RequirementOptionJson, RequirementOption>;
    }) {
        this._id = id;
        this._embedded = embedded;
        this._craftingSystemId = craftingSystemId;
        this._itemData = itemData;
        this.disabled = disabled;
        this._requirementOptions = requirementOptions;
        this._resultOptions = resultOptions;
    }

    /* ===========================
    *  Getters
    *  =========================== */

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

    get name(): string {
        return this._itemData.name;
    }

    get imageUrl(): string {
        return this._itemData.imageUrl;
    }

    get itemData(): FabricateItemData {
        return this._itemData;
    }

    set itemData(value: FabricateItemData) {
        this._itemData = value;
    }

    get requirementOptions(): SelectableOptions<RequirementOptionJson, RequirementOption> {
        return this._requirementOptions;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
    }

    get isDisabled(): boolean {
        return this.disabled;
    }

    get resultOptions(): SelectableOptions<ResultOptionJson, ResultOption> {
        return this._resultOptions;
    }

    public get hasOptions(): boolean {
        return this.hasRequirementOptions || this.hasResultOptions;
    }

    public get hasRequirementOptions(): boolean {
        return this._requirementOptions.requiresUserChoice;
    }

    public get hasResultOptions(): boolean {
        return this._resultOptions.requiresUserChoice
    }

    public ready(): boolean {
        if (!this.hasOptions) {
            return true;
        }
        return this._requirementOptions.isReady && this._resultOptions.isReady;
    }

    public getSelectedIngredients(): RequirementOption {
        if (this._requirementOptions.isReady) {
            return this._requirementOptions.selectedOption;
        }
        throw new Error("You must select an ingredient group. ");
    }

    public getSelectedResults(): ResultOption {
        if (this._resultOptions.isReady) {
            return this._resultOptions.selectedOption;
        }
        throw new Error("You must select a result group. ");
    }

    public get hasRequirements() {
        return !this._requirementOptions.isEmpty;
    }

    public get hasResults(): boolean {
        return !this._resultOptions.isEmpty;
    }
    
    public selectRequirementOption(optionName: string) {
        return this._requirementOptions.select(optionName);
    }

    public selectResultOption(optionName: string) {
        return this._resultOptions.select(optionName);
    }

    get selectedRequirementOptionName(): string {
        return this._requirementOptions.selectedOptionId;
    }

    public selectNextRequirementOption(): string {
        this._requirementOptions.selectNext();
        return this.selectedRequirementOptionName;
    }

    public selectPreviousRequirementOption(): string {
        this._requirementOptions.selectPrevious();
        return this.selectedRequirementOptionName;
    }

    get selectedResultOptionName(): string {
        return this._resultOptions.selectedOptionId;
    }

    public selectNextResultOption(): string {
        this._resultOptions.selectNext();
        return this.selectedResultOptionName;
    }

    public selectPreviousResultOption(): string {
        this._resultOptions.selectPrevious();
        return this.selectedResultOptionName;
    }

    public makeDefaultSelections() {
        this._requirementOptions.selectFirst();
        this._resultOptions.selectFirst();
    }

    public editRequirementOption(requirementOption: RequirementOption) {
        if (!this._requirementOptions.has(requirementOption.id)) {
            throw new Error(`Cannot edit Ingredient Option "${requirementOption.id}". It does not exist in this Recipe.`);
        }
        this._requirementOptions.set(requirementOption);
    }

    set resultOptions(value: SelectableOptions<ResultOptionJson, ResultOption>) {
        this._resultOptions = value;
    }

    addIngredientOption(value: RequirementOption) {
        if (this._requirementOptions.has(value.id)) {
            throw new Error(`Ingredient option ${value.id} already exists in this recipe. `);
        }
        this._requirementOptions.add(value);
    }

    addResultOption(value: ResultOption) {
        if (this._resultOptions.has(value.id)) {
            throw new Error(`Result option ${value.id} already exists in this recipe. `);
        }
        this._resultOptions.add(value);
    }

    setIngredientOption(value: RequirementOption) {
        this._requirementOptions.set(value);
    }

    deleteIngredientOptionByName(id: string) {
        this._requirementOptions.deleteById(id);
    }

    deleteResultOptionByName(id: string) {
        this._resultOptions.deleteById(id);
    }

    setResultOption(value: ResultOptionConfig) {
        const optionId = this._resultOptions.nextId();
        const resultOption = ResultOption.fromJson({
            id: optionId,
            ...value
        });
        this._resultOptions.set(resultOption);
    }

    deleteResultOptionById(id: string) {
        this._resultOptions.deleteById(id);
    }

    get hasErrors(): boolean {
        return this._itemData.hasErrors;
    }

    get errorCodes(): string[] {
        return this._itemData.errors.map(error => error.code);
    }

    get errors(): ItemLoadingError[] {
        return this._itemData.errors;
    }

    deselectIngredients() {
        this._requirementOptions.deselect();
    }

    deselectResults() {
        this._resultOptions.deselect();
    }

    clone(cloneId: string) {
        return new Recipe({
            id: cloneId,
            embedded: false,
            craftingSystemId: this._craftingSystemId,
            itemData: NoFabricateItemData.INSTANCE(),
            disabled: this.disabled,
            resultOptions: this._resultOptions.clone(),
            requirementOptions: this._requirementOptions.clone()
        });
    }

    getUniqueReferencedComponents(): ComponentReference[] {
        const componentsFromResults = this.resultOptions.all
            .map(resultOption => resultOption.results)
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<ComponentReference>());
        const componentFromRequirements = this.requirementOptions.all
            .map(requirementOption => requirementOption.ingredients.combineWith(requirementOption.catalysts))
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<ComponentReference>());
        return componentFromRequirements.combineWith(componentsFromResults).members;
    }

    async load() {
        this.itemData = await this.itemData.load();
    }

    get loaded(): boolean {
        return this.itemData.loaded;
    }

    public toJson(): RecipeJson {
        return {
            id: this._id,
            itemUuid: this._itemData.uuid,
            craftingSystemId: this._craftingSystemId,
            disabled: this.disabled,
            embedded: this._embedded,
            resultOptions: this._resultOptions.toJson(),
            requirementOptions: this._requirementOptions.toJson()
        };
    }

    equals(other: Recipe) {
        if (!this.equalsNotLoaded(other)) {
            return false;
        }
        return this._craftingSystemId === other.craftingSystemId
            && this.isDisabled === other.isDisabled
            && this._itemData.equals(other.itemData)
            && this._requirementOptions.equals(other.requirementOptions)
            && this._resultOptions.equals(other.resultOptions);
    }

    public equalsNotLoaded(other: Recipe): boolean {
        if (!other) {
            return false;
        }
        if (this === other ) {
            return true;
        }
        return this._id === other.id;
    }

    hasComponent(componentId: string): boolean {
        const inRequirements = this.requirementOptions.all
            .map(option => option.ingredients.has(componentId) || option.catalysts.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);

        if (inRequirements) {
            return true;
        }

        return this.resultOptions.all
            .map(option => option.results.has(componentId))
            .reduce((previousValue, currentValue) => {
                return previousValue || currentValue;
            }, false);
    }

    removeComponent(componentId: string) {
        const modifiedRequirementOptions = this.requirementOptions.all.map(option => {
            const ingredients = option.ingredients.without(componentId);
            const catalysts = option.catalysts.without(componentId);
            return new RequirementOption({
                id: option.id,
                name: option.name,
                essences: option.essences,
                catalysts,
                ingredients
            });
        });
        this._requirementOptions = new SelectableOptions<RequirementOptionJson, RequirementOption>({ options: modifiedRequirementOptions });
        const modifiedResultOptions = this.resultOptions.all.map(option => {
            const results = option.results.without(componentId);
            return new ResultOption({
                id: option.id,
                name: option.name,
                results
            });
        });
        this._resultOptions = new SelectableOptions<ResultOptionJson, ResultOption>({ options: modifiedResultOptions });
    }

    removeEssence(essenceIdToRemove: string) {
        const modifiedRequirementOptions = this.requirementOptions.all.map(option => {
            const essences = option.essences.without(essenceIdToRemove);
            return new RequirementOption({
                id: option.id,
                name: option.name,
                essences,
                catalysts: option.catalysts,
                ingredients: option.ingredients
            });
        });
        this._requirementOptions = new SelectableOptions<RequirementOptionJson, RequirementOption>({ options: modifiedRequirementOptions });
    }

    hasEssence(essenceId: string) {
        return this.getUniqueReferencedEssences().some(essence => essence.id === essenceId);
    }

    getUniqueReferencedEssences(): EssenceReference[] {
        return this.requirementOptions.all
            .flatMap(option => option.essences.members)
            .filter((essence, index, array) => array.indexOf(essence) === index);
    }

    setRequirementOption({
         name,
         catalysts = {},
         ingredients = {},
         essences = {}
    }: RequirementOptionConfig) {
        const optionId = this._requirementOptions.nextId();
        const salvageOption = RequirementOption.fromJson({
            id: optionId,
            name,
            catalysts,
            ingredients,
            essences
        });
        this._requirementOptions.set(salvageOption);
    }


    static fromJson(recipeJson: RecipeJson) {
        const resultOptions = SelectableOptions.fromJson<ResultOptionJson, ResultOption>(recipeJson.resultOptions, ResultOption.fromJson);
        const requirementOptions = SelectableOptions.fromJson<RequirementOptionJson, RequirementOption>(recipeJson.requirementOptions, RequirementOption.fromJson);
        return new Recipe({
            id: recipeJson.id,
            embedded: recipeJson.embedded,
            craftingSystemId: recipeJson.craftingSystemId,
            disabled: recipeJson.disabled,
            itemData: NoFabricateItemData.INSTANCE(),
            resultOptions,
            requirementOptions
        });
    }
}

export { Recipe, RecipeJson }