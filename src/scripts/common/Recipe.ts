import {Combination} from "./Combination";
import Properties from "../Properties";
import {Identifiable, Serializable} from "./Identity";
import {CraftingComponent} from "./CraftingComponent";
import {Essence} from "./Essence";
import {SelectableOptions} from "./SelectableOptions";

interface RecipeJson {
    id: string;
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

    private readonly _catalysts: Combination<CraftingComponent>;
    private readonly _ingredients: Combination<CraftingComponent>;
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

    toJson(): IngredientOptionJson {
        return {
            catalysts: this._catalysts.toJson(),
            ingredients: this._ingredients.toJson()
        };
    }

}

class ResultOption implements Identifiable, Serializable<ResultOptionJson> {

    private readonly _results: Combination<CraftingComponent>;
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
    private readonly _itemUuid: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private _essences: Combination<Essence>;
    private _ingredientOptions: SelectableOptions<IngredientOptionJson, IngredientOption>;
    private _resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;
    private _disabled: boolean;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        itemUuid,
        name,
        disabled,
        imageUrl = Properties.ui.defaults.recipeImageUrl,
        essences = Combination.EMPTY(),
        resultOptions = new SelectableOptions({}),
        ingredientOptions = new SelectableOptions({})
    }: {
        id: string;
        itemUuid: string;
        name: string;
        disabled?: boolean;
        imageUrl?: string;
        essences?: Combination<Essence>;
        resultOptions?: SelectableOptions<ResultOptionJson, ResultOption>;
        ingredientOptions?: SelectableOptions<IngredientOptionJson, IngredientOption>;
    }) {
        this._id = id;
        this._itemUuid = itemUuid;
        this._name = name;
        this._disabled = disabled;
        this._imageUrl = imageUrl;
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
        return this._itemUuid;
    }

    get name(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
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

    set disabled(value: boolean) {
        this._disabled = value;
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

    public hasIngredients() {
        return !this._ingredientOptions.isEmpty;
    }

    public hasResults() {
        return !this._resultOptions.isEmpty;
    }

    public requiresEssences() {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public selectIngredientCombination(combinationId: string) {
        return this._ingredientOptions.select(combinationId);
    }

    public selectResultCombination(combinationId: string) {
        return this._resultOptions.select(combinationId);
    }

    public toJson(): RecipeJson {
        return {
            id: this._id,
            itemUuid: this._itemUuid,
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

    deleteIngredientOptionById(id: string) {
        this._ingredientOptions.deleteById(id);
    }

    setResultOption(value: ResultOption) {
        this._resultOptions.set(value);
    }

    deleteResultOptionById(id: string) {
        this._resultOptions.deleteById(id);
    }

}

export { Recipe, RecipeJson, ResultOptionJson, ResultOption, IngredientOptionJson, IngredientOption }