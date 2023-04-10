import {Combination, Unit} from "../../common/Combination";
import {Identifiable, Serializable} from "../../common/Identity";
import {Component} from "../component/Component";
import {Essence} from "../essence/Essence";
import {SelectableOptions} from "./SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../../foundry/DocumentManager";

interface RecipeJson {
    itemUuid: string;
    id: string;
    craftingSystemId: string;
    disabled: boolean;
    essences: Record<string, number>,
    resultOptions: Record<string, ResultOptionJson>;
    ingredientOptions: Record<string, RequirementOptionJson>;
}

type ResultOptionJson = Record<string, number>;

interface RequirementOptionJson {
    catalysts: Record<string, number>;
    ingredients: Record<string, number>;
}

class RequirementOption implements Identifiable, Serializable<RequirementOptionJson> {

    private _catalysts: Combination<Component>;
    private _ingredients: Combination<Component>;
    private _name: string;

    constructor({
        name,
        catalysts = Combination.EMPTY(),
        ingredients = Combination.EMPTY()
    }: {
        name: string;
        catalysts?: Combination<Component>;
        ingredients?: Combination<Component>;
    }) {
        this._name = name;
        this._catalysts = catalysts;
        this._ingredients = ingredients;
    }

    get requiresCatalysts(): boolean {
        return !this._catalysts.isEmpty();
    }

    get requiresIngredients(): boolean {
        return !this._ingredients.isEmpty();
    }

    set catalysts(value: Combination<Component>) {
        this._catalysts = value;
    }

    set ingredients(value: Combination<Component>) {
        this._ingredients = value;
    }

    get catalysts(): Combination<Component> {
        return this._catalysts;
    }

    get ingredients(): Combination<Component> {
        return this._ingredients;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get id(): string {
        return this._name;
    }

    public addCatalyst(component: Component, amount = 1) {
        this._catalysts = this._catalysts.add(new Unit<Component>(component, amount));
    }

    public subtractCatalyst(component: Component, amount = 1) {
        this._catalysts = this._catalysts.minus(new Unit<Component>(component, amount));
    }

    public addIngredient(component: Component, amount = 1) {
        this._ingredients = this._ingredients.add(new Unit<Component>(component, amount));
    }

    public subtractIngredient(component: Component, amount = 1) {
        this._ingredients = this._ingredients.minus(new Unit<Component>(component, amount));
    }

    public get isEmpty(): boolean {
        return this._ingredients.isEmpty() && this._catalysts.isEmpty();
    }

    toJson(): RequirementOptionJson {
        return {
            catalysts: this._catalysts.toJson(),
            ingredients: this._ingredients.toJson()
        };
    }

}

class ResultOption implements Identifiable, Serializable<ResultOptionJson> {

    private _results: Combination<Component>;
    private _name: string;

    constructor({
        name,
        results
    }: {
        name: string;
        results: Combination<Component>;
    }) {
        this._name = name;
        this._results = results;
    }

    get isEmpty(): boolean {
        return this._results.isEmpty();
    }

    get results(): Combination<Component> {
        return this._results;
    }

    set results(value: Combination<Component>) {
        this._results = value;
    }

    set name(value: string) {
        this._name = value;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._name;
    }

    public add(component: Component, amount = 1) {
        this._results = this._results.add(new Unit<Component>(component, amount));
    }

    public subtract(component: Component, amount = 1) {
        this._results = this._results.minus(new Unit<Component>(component, amount));
    }

    toJson(): ResultOptionJson {
        return this._results.toJson()
    }

}

class Recipe implements Identifiable, Serializable<RecipeJson> {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _craftingSystemId: string;
    private _itemData: FabricateItemData;
    private _essences: Combination<Essence>;
    private _requirementOptions: SelectableOptions<RequirementOptionJson, RequirementOption>;
    private _resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;
    private disabled: boolean;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        craftingSystemId,
        disabled,
        essences = Combination.EMPTY(),
        itemData = NoFabricateItemData.INSTANCE(),
        resultOptions = new SelectableOptions({}),
        ingredientOptions = new SelectableOptions({})
    }: {
        id: string;
        craftingSystemId: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        essences?: Combination<Essence>;
        resultOptions?: SelectableOptions<ResultOptionJson, ResultOption>;
        ingredientOptions?: SelectableOptions<RequirementOptionJson, RequirementOption>;
    }) {
        this._id = id;
        this._craftingSystemId = craftingSystemId;
        this._itemData = itemData;
        this.disabled = disabled;
        this._requirementOptions = ingredientOptions;
        this._essences = essences;
        this._resultOptions = resultOptions;
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get id(): string {
        return this._id;
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

    get requirementOptionsById(): Map<string, RequirementOption> {
        return this._requirementOptions.optionsByName;
    }

    get requirementOptions(): RequirementOption[] {
        return this._requirementOptions.options;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    set essences(value: Combination<Essence>) {
        this._essences = value;
    }

    set isDisabled(value: boolean) {
        this.disabled = value;
    }

    get isDisabled(): boolean {
        return this.disabled;
    }

    get resultOptionsById(): Map<string, ResultOption> {
        return this._resultOptions.optionsByName;
    }

    get resultOptions(): ResultOption[] {
        return this._resultOptions.options;
    }

    public get hasOptions(): boolean {
        return this.hasIngredientOptions || this.hasResultOptions;
    }

    public get hasIngredientOptions(): boolean {
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

    public get requiresEssences(): boolean {
        return !this._essences || !this._essences.isEmpty();
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

    public selectNextIngredientOption(): string {
        this._requirementOptions.selectNext();
        return this.selectedRequirementOptionName;
    }

    public selectPreviousIngredientOption(): string {
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

    get firstIngredientOptionName(): string {
        if (this._requirementOptions.isEmpty) {
            return "";
        }
        return this.ingredientOptions[0].name;
    }

    get firstResultOptionName(): string {
        if (this._resultOptions.isEmpty) {
            return "";
        }
        return this.resultOptions[0].name;
    }

    public makeDefaultSelections() {
        if (!this._requirementOptions.isEmpty) {
            this.selectRequirementOption(this.ingredientOptions[0].name);
        }
        if (!this._resultOptions.isEmpty) {
            this.selectResultOption(this.resultOptions[0].name);
        }
    }

    public editIngredientOption(ingredientOption: RequirementOption) {
        if (!this._requirementOptions.has(ingredientOption.id)) {
            throw new Error(`Cannot edit Ingredient Option "${ingredientOption.id}". It does not exist in this Recipe.`);
        }
        this._requirementOptions.set(ingredientOption);
    }

    set ingredientOptions(options: RequirementOption[]) {
        this._requirementOptions = new SelectableOptions<RequirementOptionJson, RequirementOption>({
            options
        });
    }

    set resultOptions(options: ResultOption[]) {
        this._resultOptions = new SelectableOptions<ResultOptionJson, ResultOption>({
            options
        });
    }

    public toJson(): RecipeJson {
        return {
            id: this._id,
            itemUuid: this._itemData.uuid,
            craftingSystemId: this._craftingSystemId,
            disabled: this.disabled,
            essences: this._essences.toJson(),
            resultOptions: this._resultOptions.toJson(),
            ingredientOptions: this._requirementOptions.toJson()
        };
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

    setResultOption(value: ResultOption) {
        this._resultOptions.set(value);
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
            craftingSystemId: this._craftingSystemId,
            itemData: NoFabricateItemData.INSTANCE(),
            disabled: this.disabled,
            essences: this._essences.clone(),
            resultOptions: this._resultOptions.clone(),
            ingredientOptions: this._requirementOptions.clone()
        });
    }

    getIncludedComponents(): Component[] {
        const componentsFromResults = this.resultOptions
            .map(resultOption => resultOption.results)
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<Component>());
        const componentFromRequirements = this.requirementOptions
            .map(requirementOption => requirementOption.ingredients.combineWith(requirementOption.catalysts))
            .reduce((previousValue, currentValue) => {
                return previousValue.combineWith(currentValue);
            }, Combination.EMPTY<Component>());
        return componentFromRequirements.combineWith(componentsFromResults).members;
    }

    async load() {
        this.itemData = await this.itemData.load();
    }

    get isLoaded(): boolean {
        return this.itemData.isLoaded;
    }

}

export { Recipe, RecipeJson, ResultOptionJson, ResultOption, RequirementOptionJson, RequirementOption }