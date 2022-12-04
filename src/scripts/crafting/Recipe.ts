import {StringIdentity, Combination} from "../common/Combination";
import Properties from "../Properties";
import {Identifiable} from "../common/Identity";

interface RecipeJson {
    itemUuid: string;
    essences: Record<string, number>,
    catalysts: Record<string, number>,
    resultGroups: Record<string, number>[],
    ingredientGroups: Record<string, number>[]
}

class CombinationChoice<T extends Identifiable> {

    private static readonly _NONE = new CombinationChoice([]);

    private readonly _members: Map<string, Combination<T>>;
    private _selected: string;

    constructor(members: Combination<T>[]) {
        this._members = new Map(members.map(combination => [combination.id, combination]));
        this._selected = "";
    }

    public static between<T extends Identifiable>(...members: Combination<T>[]): CombinationChoice<T> {
        return new CombinationChoice<T>(members);
    }

    public static just<T extends Identifiable>(singleton: Combination<T>): CombinationChoice<T> {
        return new CombinationChoice<T>([singleton]);
    }

    public static NONE<T extends Identifiable>(): CombinationChoice<T> {
        return CombinationChoice._NONE as CombinationChoice<T>;
    }

    get size(): number {
        return this._members.size;
    }

    get choices(): { key: string, value: Combination<T> }[] {
        return Array.from(this._members.entries())
            .map(entry => { return { key: entry[0], value: entry[1] } });
    }

    public select(key: string) {
        if (!this._members.has(key)) {
            throw new Error(`The key "${key} does not map to the identity of an available component group choice. "`)
        }
        this._selected = key;
    }

    public getSelection(): Combination<T> {
        if (this._members.size === 1) {
            const [singleton] = this._members.values();
            return singleton;
        }
        if (this._members.has(this._selected)) {
            return this._members.get(this._selected);
        }
        throw new Error("You must make a selection! ");
    }

    public hasOptions(): boolean {
        return this._members.size > 1;
    }

    public ready(): boolean {
        if (!this.hasOptions()) {
            return true;
        }
        return this._members.has(this._selected);
    }

    public isEmpty(): boolean {
        return this._members.size === 0;
    }

    toJson(): Record<string, number>[] {
        return Array.from(this._members.values())
            .map(combination => combination.toJson());
    }
}

class Recipe {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _catalysts: Combination<StringIdentity>;
    private readonly _essences: Combination<StringIdentity>;
    private readonly _ingredientOptions: CombinationChoice<StringIdentity>;
    private readonly _resultOptions: CombinationChoice<StringIdentity>;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.recipeImageUrl,
        essences = Combination.EMPTY(),
        catalysts = Combination.EMPTY(),
        resultOptions = CombinationChoice.NONE<StringIdentity>(),
        ingredientOptions = CombinationChoice.NONE<StringIdentity>()
    }: {
        id: string;
        name: string;
        imageUrl?: string;
        essences?: Combination<StringIdentity>;
        catalysts?: Combination<StringIdentity>;
        resultOptions?: CombinationChoice<StringIdentity>;
        ingredientOptions?: CombinationChoice<StringIdentity>;
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

    get ingredientOptions(): CombinationChoice<StringIdentity> {
        return this._ingredientOptions;
    }

    get essences(): Combination<StringIdentity> {
        return this._essences;
    }

    get resultOptions(): CombinationChoice<StringIdentity> {
        return this._resultOptions;
    }

    get catalysts(): Combination<StringIdentity> {
        return this._catalysts;
    }

    /* ===========================
    *  Instance Functions
    *  =========================== */

    public hasOptions(): boolean {
        return this._ingredientOptions.hasOptions() || this._resultOptions.hasOptions();
    }

    public ready(): boolean {
        if (!this.hasOptions()) {
            return true;
        }
        return this._ingredientOptions.ready() && this._resultOptions.ready();
    }

    public getSelectedIngredients(): Combination<StringIdentity> {
        if (this._ingredientOptions.ready()) {
            return this._ingredientOptions.getSelection();
        }
        throw new Error("You must select an ingredient group. ");
    }

    public getSelectedResults(): Combination<StringIdentity> {
        if (this._resultOptions.ready()) {
            return this._resultOptions.getSelection();
        }
        throw new Error("You must select a result group. ");
    }

    public hasIngredients() {
        return !this._ingredientOptions.isEmpty();
    }

    public hasResults() {
        return !this._resultOptions.isEmpty();
    }

    public requiresCatalysts() {
        return this._catalysts && !this._catalysts.isEmpty();
    }

    public requiresNamedComponents(): boolean {
        return this.requiresCatalysts() || this.hasIngredients();
    }

    public getNamedComponents(): Combination<StringIdentity> {
        return this.getSelectedIngredients().combineWith(this._catalysts);
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
            itemUuid: this._id,
            essences: this._essences.toJson(),
            catalysts: this._catalysts.toJson(),
            resultGroups: this._resultOptions.toJson(),
            ingredientGroups: this._ingredientOptions.toJson()
        };
    }
    
}

export { Recipe, CombinationChoice, RecipeJson }