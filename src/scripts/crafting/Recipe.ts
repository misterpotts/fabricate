import {Identifiable, Identity} from "../common/Identifiable";
import {Combination} from "../common/Combination";
import {CraftingComponentId} from "../common/CraftingComponent";
import {EssenceId} from "../common/Essence";
import Properties from "../Properties";

class ComponentGroup {

    /* ============================
    *  Instance members
    *  ============================ */

    private readonly _members: Combination<CraftingComponentId>;
    private readonly _selectedComponentId: CraftingComponentId;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor(members: Combination<CraftingComponentId>, selectedMember?: CraftingComponentId) {
        this._members = members;
        this._selectedComponentId = selectedMember ?? CraftingComponentId.NO_ID();
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get members(): Combination<CraftingComponentId> {
        return this._members.clone();
    }

    get selectedComponentId(): CraftingComponentId {
        return this._selectedComponentId;
    }

    /* ===========================
    *  Static factory methods
    *  =========================== */
    
    public static EMPTY(): ComponentGroup {
        return new ComponentGroup(Combination.EMPTY(), CraftingComponentId.NO_ID());
    }

    /* ===========================
    *  Instance functions
    *  =========================== */
    
    public select(craftingComponentId: CraftingComponentId): ComponentGroup {
        if (!craftingComponentId) {
            return new ComponentGroup(this._members, CraftingComponentId.NO_ID());
        }
        if (this._members.has(craftingComponentId)) {
            return new ComponentGroup(this._members, craftingComponentId);
        }
        const allowableValues: string = this._members.units.map(unit => unit.part.elementId).join(", ");
        throw new Error(`Cannot select component with ID "${craftingComponentId.value}". It does not exist in this component group.
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
        return this._selectedComponentId !== CraftingComponentId.NO_ID();
    }

    public getSelectedMember(): Combination<CraftingComponentId> {
        if (this._members.distinct() === 1) {
            return this.members;
        }
        if (!this._selectedComponentId || this.selectedComponentId === CraftingComponentId.NO_ID()) {
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

class RecipeId implements Identity {

    private static readonly _NO_ID: RecipeId = new RecipeId("");

    private readonly _value: string;

    constructor(value: string) {
        this._value = value;
    }

    public static NO_ID() {
        return this._NO_ID;
    }

    get value(): string {
        return this._value;
    }

    get elementId(): string {
        return this.value;
    }

}


class Recipe implements Identifiable<RecipeId> {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: RecipeId;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _catalysts: Combination<CraftingComponentId>;
    private readonly _essences: Combination<EssenceId>;
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
        id: RecipeId;
        name: string;
        imageUrl?: string;
        essences?: Combination<EssenceId>;
        catalysts?: Combination<CraftingComponentId>;
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

    get id(): RecipeId {
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

    get essences(): Combination<EssenceId> {
        return this._essences;
    }

    get resultGroups(): ComponentGroup[] {
        return this._resultGroups;
    }

    get catalysts(): Combination<CraftingComponentId> {
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
            .find(selected => selected === CraftingComponentId.NO_ID())
    }

    public getSelectedIngredients(): Combination<CraftingComponentId> {
        return this.makeSelections(this._ingredientGroups);
    }

    public getSelectedResults(): Combination<CraftingComponentId> {
        return this.makeSelections(this._resultGroups);
    }

    private makeSelections(componentGroups: ComponentGroup[]): Combination<CraftingComponentId> {
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

    public getNamedComponents(): Combination<CraftingComponentId> {
        return this.getSelectedIngredients().combineWith(this._catalysts);
    }

    public requiresEssences() {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public selectIngredient(index: number, component: CraftingComponentId) {
        return this.select(this._ingredientGroups, index, component, "ingredient");
    }

    public selectResult(index: number, component: CraftingComponentId) {
        return this.select(this._resultGroups, index, component, "result");
    }

    private select(groups: ComponentGroup[], index: number, component: CraftingComponentId, groupType: string): void {
        if (index < 0 || index >= groups.length) {
            throw new Error(`"${index}" is not a valid ${groupType} group.`);
        }
        groups[index] = groups[index].select(component);
    }

    public toJson(): RecipeJson {
        return {
            itemUuid: this._id.value,
            essences: this._essences.toJson(),
            catalysts: this._catalysts.toJson(),
            resultGroups: this._resultGroups.map(group => group.toJson()),
            ingredientGroups: this._ingredientGroups.map(group => group.toJson())
        };
    }
    
}

export { Recipe, RecipeId, ComponentGroup, RecipeJson }