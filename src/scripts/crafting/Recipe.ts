import {CombinableString, Combination} from "../common/Combination";
import Properties from "../Properties";

interface RecipeJson {
    itemUuid: string;
    essences: Record<string, number>,
    catalysts: Record<string, number>,
    resultGroups: Record<string, number>[],
    ingredientGroups: Record<string, number>[]
}

class CombinationChoice {

    private readonly _members: Map<number, Combination<CombinableString>>;
    private _selected: number;

    constructor(members: Combination<CombinableString>[]) {
        this._members = new Map(members.map(combination => [this.combinationIdentity(combination), combination]));
        this._selected = 0;
    }

    public select(member: string | number) {
        const key: number = typeof member === 'number' ? member : parseInt(member);
        if (!this._members.has(key)) {
            throw new Error(`The key "${key} does not map to the identity of an available component group choice. "`)
        }
        this._selected = key;
    }

    public getSelection(): Combination<CombinableString> {
        if (this._members.size === 1) {
            const [singleton] = this._members.values();
            return singleton;
        }
        if (this._members.has(this._selected)) {
            return this._members.get(this._selected);
        }
        return Combination.EMPTY();
    }

    public hasOptions(): boolean {
        return this._members.size > 1;
    }

    public ready() {
        if (!this.hasOptions()) {
            return true;
        }
        return this._members.has(this._selected);
    }

    private combinationIdentity(combination: Combination<CombinableString>): number {
        return combination.units
            .map(unit => this.stringIdentity(unit.part.elementId) * unit.quantity)
            .reduce((left, right) => left + right, 0);
    }

    private stringIdentity(value: string): number {
        return [...value].reduce((left, right) => {
            return Math.imul(31, left) + right.charCodeAt(0) | 0;
        }, 0);
    }

}

class Recipe {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _catalysts: Combination<CombinableString>;
    private readonly _essences: Combination<CombinableString>;
    private readonly _ingredientOptions: CombinationChoice;
    private readonly _resultOptions: CombinationChoice;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.recipeImageUrl,
        essences = Combination.EMPTY(),
        catalysts = Combination.EMPTY(),
        resultOptions,
        ingredientOptions
    }: {
        id: string;
        name: string;
        imageUrl?: string;
        essences?: Combination<CombinableString>;
        catalysts?: Combination<CombinableString>;
        resultOptions: CombinationChoice;
        ingredientOptions: CombinationChoice;
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._ingredientOptions = ingredientOptions;
        this._catalysts = catalysts;
        this._essences = essences;
        this._resultOptions = resultOptions;
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get ingredientOptions(): CombinationChoice {
        return this._ingredientOptions;
    }

    get essences(): Combination<CombinableString> {
        return this._essences;
    }

    get resultOptions(): CombinationChoice {
        return this._resultOptions;
    }

    get catalysts(): Combination<CombinableString> {
        return this._catalysts;
    }

    /* ===========================
    *  Instance Functions
    *  =========================== */

    public hasOptions(): boolean {
        return this._ingredientOptions.hasOptions() && this._resultOptions.hasOptions();
    }

    public ready(): boolean {
        if (!this.hasOptions()) {
            return true;
        }
        return this._ingredientOptions.ready() && this._resultOptions.ready();
    }

    public getSelectedIngredients(): Combination<CombinableString> {
        return this._ingredientOptions.getSelection();
    }

    public getSelectedResults(): Combination<CombinableString> {
        return this._resultOptions.getSelection();
    }

    public hasIngredients() {
        return Array.from(this._ingredientOptions)
            .map(group => !group.isEmpty())
            .reduce((left, right) => left && right);
    }

    public requiresCatalysts() {
        return this._catalysts && !this._catalysts.isEmpty();
    }

    public requiresNamedComponents(): boolean {
        return this.requiresCatalysts() || this.hasIngredients();
    }

    public getNamedComponents(): Combination<CombinableString> {
        return this.getSelectedIngredients().combineWith(this._catalysts);
    }

    public requiresEssences() {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public selectIngredient(index: number, component: string) {
        return this.select(this._ingredientOptions, index, component, "ingredient");
    }

    public selectResult(index: number, component: string) {
        return this.select(this._resultOptions, index, component, "result");
    }

    private select(groups: ComponentGroup[], index: number, component: string, groupType: string): void {
        if (index < 0 || index >= groups.length) {
            throw new Error(`"${index}" is not a valid ${groupType} group.`);
        }
        groups[index] = groups[index].select(component);
    }

    public toJson(): RecipeJson {
        return {
            itemUuid: this._id,
            essences: this._essences.toJson(),
            catalysts: this._catalysts.toJson(),
            resultGroups: this._resultOptions.map(group => group.toJson()),
            ingredientGroups: this._ingredientOptions.map(group => group.toJson())
        };
    }
    
}

export { Recipe, ComponentGroup, RecipeJson }