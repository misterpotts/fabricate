import {CombinableString, Combination} from "../common/Combination";
import Properties from "../Properties";

class ComponentGroup {

    /* ============================
    *  Instance members
    *  ============================ */

    private readonly _members: Combination<CombinableString>;
    private readonly _selectedComponentId: CombinableString;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor(members: Combination<CombinableString>, selectedMember?: CombinableString) {
        this._members = members;
        this._selectedComponentId = selectedMember ?? CombinableString.NO_VALUE();
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get members(): Combination<CombinableString> {
        return this._members.clone();
    }

    get selectedComponentId(): CombinableString {
        return this._selectedComponentId;
    }

    /* ===========================
    *  Static factory methods
    *  =========================== */
    
    public static EMPTY(): ComponentGroup {
        return new ComponentGroup(Combination.EMPTY(), CombinableString.NO_VALUE());
    }

    /* ===========================
    *  Instance functions
    *  =========================== */
    
    public select(craftingComponentId: string): ComponentGroup {
        if (!craftingComponentId) {
            return new ComponentGroup(this._members, CombinableString.NO_VALUE());
        }
        const asCombinable = new CombinableString(craftingComponentId);
        if (this._members.has(asCombinable)) {
            return new ComponentGroup(this._members, asCombinable);
        }
        const allowableValues: string = this._members.units.map(unit => unit.part.elementId).join(", ");
        throw new Error(`Cannot select component with ID "${craftingComponentId}". It does not exist in this component group.
            Allowable values are: [${allowableValues}]`);
    }

    public isSingleton(): boolean {
        return this._members.distinct() === 1;
    }

    public isEmpty(): boolean {
        return this._members.isEmpty();
    }

    public requiresChoice(): boolean {
        return !(this.isEmpty() || this.isSingleton());
    }

    public isReady(): boolean {
        if (!this.requiresChoice()) {
            return true;
        }
        return this._selectedComponentId !== CombinableString.NO_VALUE();
    }

    public getSelectedMember(): Combination<CombinableString> {
        if (this._members.distinct() === 1) {
            return this.members;
        }
        if (!this._selectedComponentId || this._selectedComponentId === CombinableString.NO_VALUE()) {
            return Combination.EMPTY();
        }
        return this._members.just(this._selectedComponentId);
    }

    public toJson(): Record<string, number> {
        return this._members.toJson();
    }

}

interface RecipeJson {
    itemUuid: string;
    essences: Record<string, number>,
    catalysts: Record<string, number>,
    resultGroups: Record<string, number>[],
    ingredientGroups: Record<string, number>[]
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
    private readonly _ingredientGroups: ComponentGroup[];
    private readonly _resultGroups: ComponentGroup[];

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        name,
        imageUrl = Properties.ui.defaults.recipeImageUrl,
        essences = Combination.EMPTY(),
        catalysts = Combination.EMPTY(),
        resultGroups = [ComponentGroup.EMPTY()],
        ingredientGroups = [ComponentGroup.EMPTY()]
    }: {
        id: string;
        name: string;
        imageUrl?: string;
        essences?: Combination<CombinableString>;
        catalysts?: Combination<CombinableString>;
        resultGroups?: ComponentGroup[];
        ingredientGroups?: ComponentGroup[];
    }) {
        this._id = id;
        this._name = name;
        this._imageUrl = imageUrl;
        this._ingredientGroups = ingredientGroups;
        this._catalysts = catalysts;
        this._essences = essences;
        this._resultGroups = resultGroups;
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

    get ingredientGroups(): ComponentGroup[] {
        return this._ingredientGroups;
    }

    get essences(): Combination<CombinableString> {
        return this._essences;
    }

    get resultGroups(): ComponentGroup[] {
        return this._resultGroups;
    }

    get catalysts(): Combination<CombinableString> {
        return this._catalysts;
    }

    /* ===========================
    *  Instance Functions
    *  =========================== */

    public hasOptions(): boolean {
        return Array.from(this._ingredientGroups.concat(this._resultGroups))
            .map(group => group.requiresChoice())
            .reduce((left,right) => left || right);
    }

    public hasAllSelectionsMade(): boolean {
        if (!this.hasOptions()) {
            return true;
        }
        return !Array.from(this._ingredientGroups.concat(this._resultGroups))
            .filter(group => !group.isReady())
            .map(group => group.selectedComponentId)
            .find(selected => selected === CombinableString.NO_VALUE())
    }

    public getSelectedIngredients(): Combination<CombinableString> {
        return this.makeSelections(this._ingredientGroups);
    }

    public getSelectedResults(): Combination<CombinableString> {
        return this.makeSelections(this._resultGroups);
    }

    private makeSelections(componentGroups: ComponentGroup[]): Combination<CombinableString> {
        return Array.from(componentGroups)
            .map(group => group.getSelectedMember())
            .reduce((left, right) => left.combineWith(right));
    }

    public hasIngredients() {
        return Array.from(this._ingredientGroups)
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
        return this.select(this._ingredientGroups, index, component, "ingredient");
    }

    public selectResult(index: number, component: string) {
        return this.select(this._resultGroups, index, component, "result");
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
            resultGroups: this._resultGroups.map(group => group.toJson()),
            ingredientGroups: this._ingredientGroups.map(group => group.toJson())
        };
    }
    
}

export { Recipe, ComponentGroup, RecipeJson }