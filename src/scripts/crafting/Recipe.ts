import {Identifiable} from "../common/Identifiable";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {Essence} from "../common/Essence";

class ComponentGroup {

    /* ============================
    *  Instance members
    *  ============================ */

    private readonly _members: Combination<CraftingComponent>;
    private readonly _selectedComponent: CraftingComponent;

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor(members: Combination<CraftingComponent>, selectedMember?: CraftingComponent) {
        this._members = members;
        this._selectedComponent = selectedMember ?? CraftingComponent.NONE();
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get members(): Combination<CraftingComponent> {
        return this._members.clone();
    }

    get selectedComponent(): CraftingComponent {
        return this._selectedComponent;
    }

    /* ===========================
    *  Static factory methods
    *  =========================== */
    
    public static EMPTY(): ComponentGroup {
        return new ComponentGroup(Combination.EMPTY(), CraftingComponent.NONE());
    }

    /* ===========================
    *  Instance functions
    *  =========================== */
    
    public select(component: CraftingComponent): ComponentGroup {
        if (!component) {
            return new ComponentGroup(this._members, CraftingComponent.NONE());
        }
        if (this._members.has(component)) {
            return new ComponentGroup(this._members, component);
        }
        const allowableValues: string = this._members.units.map(unit => unit.part.id).join(", ");
        throw new Error(`Cannot select component with ID "${component.id}". It does not exist in this component group.
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
        return this._selectedComponent !== CraftingComponent.NONE();
    }

    public getSelectedMember(): Combination<CraftingComponent> {
        if (this._members.distinct() === 1) {
            return this.members;
        }
        if (!this._selectedComponent || this.selectedComponent === CraftingComponent.NONE()) {
            return Combination.EMPTY();
        }
        return this._members.just(this._selectedComponent);
    }

}

class Recipe implements Identifiable {

    /* ===========================
    *  Instance members
    *  =========================== */

    private readonly _id: string;
    private readonly _ingredientGroups: ComponentGroup[];
    private readonly _catalysts: Combination<CraftingComponent>;
    private readonly _essences: Combination<Essence>;
    private readonly _resultGroups: ComponentGroup[];

    /* ===========================
    *  Constructor
    *  =========================== */

    constructor({
        id,
        ingredientGroups,
        catalysts,
        essences, 
        resultGroups
    }: {
        id: string;
        ingredientGroups?: ComponentGroup[];
        catalysts?: Combination<CraftingComponent>;
        essences?: Combination<Essence>;
        resultGroups: ComponentGroup[];
    }) {
        this._id = id;
        this._ingredientGroups = ingredientGroups ?? [ComponentGroup.EMPTY()];
        this._catalysts = catalysts ?? Combination.EMPTY();
        this._essences = essences ?? Combination.EMPTY();
        this._resultGroups = resultGroups ?? [ComponentGroup.EMPTY()];
    }

    /* ===========================
    *  Getters
    *  =========================== */

    get id(): string {
        return this._id;
    }

    get ingredientGroups(): ComponentGroup[] {
        return this._ingredientGroups;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    get resultGroups(): ComponentGroup[] {
        return this._resultGroups;
    }

    get catalysts(): Combination<CraftingComponent> {
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
            .map(group => group.selectedComponent)
            .find(selected => selected === CraftingComponent.NONE())
    }

    public getSelectedIngredients(): Combination<CraftingComponent> {
        return this.makeSelections(this._ingredientGroups);
    }

    public getSelectedResults(): Combination<CraftingComponent> {
        return this.makeSelections(this._resultGroups);
    }

    private makeSelections(componentGroups: ComponentGroup[]): Combination<CraftingComponent> {
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

    public getNamedComponents(): Combination<CraftingComponent> {
        return this.getSelectedIngredients().combineWith(this._catalysts);
    }

    public requiresEssences() {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public selectIngredient(index: number, component: CraftingComponent) {
        return this.select(this._ingredientGroups, index, component, "ingredient");
    }

    public selectResult(index: number, component: CraftingComponent) {
        return this.select(this._resultGroups, index, component, "result");
    }

    private select(groups: ComponentGroup[], index: number, component: CraftingComponent, groupType: string): void {
        if (index < 0 || index >= groups.length) {
            throw new Error(`"${index}" is not a valid ${groupType} group.`);
        }
        groups[index] = groups[index].select(component);
    }
    
}

export { Recipe, ComponentGroup }