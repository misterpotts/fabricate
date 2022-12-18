import {Combination} from "../common/Combination";
import Properties from "../Properties";
import {Identifiable, Serializable} from "../common/Identity";
import {CraftingComponent} from "../common/CraftingComponent";
import {Essence} from "../common/Essence";

interface RecipeJson {
    itemUuid: string;
    essences: Record<string, number>,
    catalysts: Record<string, number>,
    resultGroups: Record<string, number>[],
    ingredientGroups: Record<string, number>[]
}

class CombinationChoice<T extends Identifiable> {

    private static readonly _NONE = new CombinationChoice({});

    private readonly _members: Map<string, Combination<T>>;
    private _selected: string;

    constructor({
        members = new Map(),
        selected = ""
    }: {
        members?: Map<string, Combination<T>>;
        selected?: string;
    }) {
        this._members = members;
        this._selected = selected;
    }

    public static between<T extends Identifiable>(...values: Combination<T>[]): CombinationChoice<T> {
        const members = new Map(values.map((value, index) => [String(index + 1), value]));
        return new CombinationChoice<T>({members});
    }

    public static of<T extends Identifiable>(...entries: [string, Combination<T>][]): CombinationChoice<T> {
        const members = new Map(entries);
        return new CombinationChoice<T>({members});
    }

    public static just<T extends Identifiable>(singleton: Combination<T>, id: string = "1"): CombinationChoice<T> {
        const members = new Map([[id, singleton]]);
        return new CombinationChoice<T>({members});
    }

    public static NONE<T extends Identifiable>(): CombinationChoice<T> {
        return CombinationChoice._NONE as CombinationChoice<T>;
    }

    get size(): number {
        return this._members.size;
    }

    public addChoice(combination: Combination<T>, id: string): void {
        id = id ?? this.generateId(Array.from(this._members.keys()));
        this._members.set(id, combination);
    }

    private generateId(assigned: string[]) {
        let id = 1;
        let found = false;
        do {
            const idString = String(id);
            if (!assigned.includes(idString)) {
                found = true;
                return idString;
            }
            id++;
        } while (!found);
    }

    get choices(): { id: string, value: Combination<T> }[] {
        return Array.from(this._members.entries()).map(entry => { return { id: entry[0], value: entry[1] } });
    }

    public select(key: string) {
        if (!this._members.has(key)) {
            throw new Error(`The key "${key} does not map to the identity of an available component group choice. "`)
        }
        this._selected = key;
    }

    public getSelection(): Combination<T> {
        if (this._members.size === 0) {
            return Combination.EMPTY();
        }
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

    contains(optionId: string) {
        return this._members.has(optionId);
    }

    getChoice(optionId: string) {
        if (!this.contains(optionId)) {
            throw new Error(`"${optionId}" is not part of of this combination choice. `)
        }
        return this._members.get(optionId).clone();
    }

    set(optionId: string, value: Combination<T>) {
        this._members.set(optionId, value);
    }

    delete(optionId: string) {
        this._members.delete(optionId);
    }
}

class Recipe implements Identifiable, Serializable<RecipeJson> {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _catalysts: Combination<CraftingComponent>;
    private readonly _essences: Combination<Essence>;
    private _ingredientOptions: CombinationChoice<CraftingComponent>;
    private readonly _resultOptions: CombinationChoice<CraftingComponent>;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.recipeImageUrl,
        essences = Combination.EMPTY(),
        catalysts = Combination.EMPTY(),
        resultOptions = CombinationChoice.NONE(),
        ingredientOptions = CombinationChoice.NONE()
    }: {
        id: string;
        name: string;
        imageUrl?: string;
        essences?: Combination<Essence>;
        catalysts?: Combination<CraftingComponent>;
        resultOptions?: CombinationChoice<CraftingComponent>;
        ingredientOptions?: CombinationChoice<CraftingComponent>;
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

    get ingredientOptions(): CombinationChoice<CraftingComponent> {
        return this._ingredientOptions;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    get resultOptions(): CombinationChoice<CraftingComponent> {
        return this._resultOptions;
    }

    get catalysts(): Combination<CraftingComponent> {
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

    public getSelectedIngredients(): Combination<CraftingComponent> {
        if (this._ingredientOptions.ready()) {
            return this._ingredientOptions.getSelection();
        }
        throw new Error("You must select an ingredient group. ");
    }

    public getSelectedResults(): Combination<CraftingComponent> {
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

    public getNamedComponents(): Combination<CraftingComponent> {
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

    addIngredientOption(combination: Combination<CraftingComponent>, id?: string) {
        if (this._ingredientOptions === CombinationChoice.NONE()) {
            this._ingredientOptions = CombinationChoice.just(combination, id);
        } else {
            this._ingredientOptions.addChoice(combination, id);
        }
    }

    setIngredientOption(optionId: string, value: Combination<CraftingComponent>) {
        if (value.isEmpty()) {
            this._ingredientOptions.delete(optionId);
        } else {
            this._ingredientOptions.set(optionId, value);
        }
    }
}

export { Recipe, CombinationChoice, RecipeJson }