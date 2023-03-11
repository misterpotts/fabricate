import {Combination, Unit} from "./Combination";
import {Identifiable, Serializable} from "./Identity";
import {CraftingComponent} from "./CraftingComponent";
import {Essence} from "./Essence";
import {SelectableOptions} from "./SelectableOptions";
import {FabricateItemData, ItemLoadingError, NoFabricateItemData} from "../foundry/DocumentManager";

interface RecipeJson {
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>,
    resultOptions: Record<string, ResultOptionJson>;
    ingredientOptions: Record<string, IngredientOptionJson>;
}

type ResultOptionJson = Record<string, number>;

interface IngredientOptionJson {
    catalysts: Record<string, number>;
    ingredients: Record<string, number>;
}

class IngredientOption implements Identifiable, Serializable<IngredientOptionJson> {

    private _catalysts: Combination<CraftingComponent>;
    private _ingredients: Combination<CraftingComponent>;
    private readonly _name: string;

    constructor({
        name,
        catalysts = Combination.EMPTY(),
        ingredients = Combination.EMPTY()
    }: {
        name: string;
        catalysts?: Combination<CraftingComponent>;
        ingredients?: Combination<CraftingComponent>;
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

    set catalysts(value: Combination<CraftingComponent>) {
        this._catalysts = value;
    }

    set ingredients(value: Combination<CraftingComponent>) {
        this._ingredients = value;
    }

    get catalysts(): Combination<CraftingComponent> {
        return this._catalysts;
    }

    get ingredients(): Combination<CraftingComponent> {
        return this._ingredients;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._name;
    }

    public addCatalyst(component: CraftingComponent, amount = 1) {
        this._catalysts = this._catalysts.add(new Unit<CraftingComponent>(component, amount));
    }

    public subtractCatalyst(component: CraftingComponent, amount = 1) {
        this._catalysts = this._catalysts.minus(new Unit<CraftingComponent>(component, amount));
    }

    public addIngredient(component: CraftingComponent, amount = 1) {
        this._ingredients = this._ingredients.add(new Unit<CraftingComponent>(component, amount));
    }

    public subtractIngredient(component: CraftingComponent, amount = 1) {
        this._ingredients = this._ingredients.minus(new Unit<CraftingComponent>(component, amount));
    }

    public get isEmpty(): boolean {
        return this._ingredients.isEmpty() && this._catalysts.isEmpty();
    }

    toJson(): IngredientOptionJson {
        return {
            catalysts: this._catalysts.toJson(),
            ingredients: this._ingredients.toJson()
        };
    }

}

class ResultOption implements Identifiable, Serializable<ResultOptionJson> {

    private _results: Combination<CraftingComponent>;
    private readonly _name: string;

    constructor({
        name,
        results
    }: {
        name: string;
        results: Combination<CraftingComponent>;
    }) {
        this._name = name;
        this._results = results;
    }

    get results(): Combination<CraftingComponent> {
        return this._results;
    }

    set results(value: Combination<CraftingComponent>) {
        this._results = value;
    }

    get name(): string {
        return this._name;
    }

    get id(): string {
        return this._name;
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
    private _itemData: FabricateItemData;
    private _essences: Combination<Essence>;
    private _ingredientOptions: SelectableOptions<IngredientOptionJson, IngredientOption>;
    private _resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;
    private _disabled: boolean;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        disabled,
        essences = Combination.EMPTY(),
        itemData = NoFabricateItemData.INSTANCE(),
        resultOptions = new SelectableOptions({}),
        ingredientOptions = new SelectableOptions({})
    }: {
        id: string;
        itemData?: FabricateItemData;
        disabled?: boolean;
        essences?: Combination<Essence>;
        resultOptions?: SelectableOptions<ResultOptionJson, ResultOption>;
        ingredientOptions?: SelectableOptions<IngredientOptionJson, IngredientOption>;
    }) {
        this._id = id;
        this._itemData = itemData;
        this._disabled = disabled;
        this._ingredientOptions = ingredientOptions;
        this._essences = essences;
        this._resultOptions = resultOptions;
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get id(): string {
        return this._id;
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

    get ingredientOptionsById(): Map<string, IngredientOption> {
        return this._ingredientOptions.optionsByName;
    }

    get ingredientOptions(): IngredientOption[] {
        return this._ingredientOptions.options;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    set essences(value: Combination<Essence>) {
        this._essences = value;
    }

    set isDisabled(value: boolean) {
        this._disabled = value;
    }

    get isDisabled(): boolean {
        return this._disabled;
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
        return this._ingredientOptions.requiresUserChoice;
    }

    public get hasResultOptions(): boolean {
        return this._resultOptions.requiresUserChoice
    }

    public ready(): boolean {
        if (!this.hasOptions) {
            return true;
        }
        return this._ingredientOptions.isReady && this._resultOptions.isReady;
    }

    public getSelectedIngredients(): IngredientOption {
        if (this._ingredientOptions.isReady) {
            return this._ingredientOptions.selectedOption
        }
        throw new Error("You must select an ingredient group. ");
    }

    public getSelectedResults(): Combination<CraftingComponent> {
        if (this._resultOptions.isReady) {
            return this._resultOptions.selectedOption.results;
        }
        throw new Error("You must select a result group. ");
    }

    public get hasIngredients() {
        return !this._ingredientOptions.isEmpty;
    }

    public hasResults() {
        return !this._resultOptions.isEmpty;
    }

    public get requiresEssences(): boolean {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public selectIngredientCombination(combinationId: string) {
        return this._ingredientOptions.select(combinationId);
    }

    public selectResultCombination(combinationId: string) {
        return this._resultOptions.select(combinationId);
    }

    set ingredientOptions(options: IngredientOption[]) {
        this._ingredientOptions = new SelectableOptions<IngredientOptionJson, IngredientOption>({
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
            itemUuid: this._itemData.uuid,
            disabled: this._disabled,
            essences: this._essences.toJson(),
            resultOptions: this._resultOptions.toJson(),
            ingredientOptions: this._ingredientOptions.toJson()
        };
    }

    addIngredientOption(value: IngredientOption) {
        if (this._ingredientOptions.has(value.id)) {
            throw new Error(`Ingredient option ${value.id} already exists in this recipe. `);
        }
        this._ingredientOptions.add(value);
    }

    addResultOption(value: ResultOption) {
        if (this._resultOptions.has(value.id)) {
            throw new Error(`Result option ${value.id} already exists in this recipe. `);
        }
        this._resultOptions.add(value);
    }

    setIngredientOption(value: IngredientOption) {
        this._ingredientOptions.set(value);
    }

    deleteIngredientOptionByName(id: string) {
        this._ingredientOptions.deleteById(id);
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
        this._ingredientOptions.deselect();
    }

    deselectResults() {
        this._resultOptions.deselect();
    }

    clone(cloneId: string) {
        return new Recipe({
            id: cloneId,
            itemData: NoFabricateItemData.INSTANCE(),
            disabled: this._disabled,
            essences: this._essences.clone(),
            resultOptions: this._resultOptions.clone(),
            ingredientOptions: this._ingredientOptions.clone()
        });
    }
}

export { Recipe, RecipeJson, ResultOptionJson, ResultOption, IngredientOptionJson, IngredientOption }