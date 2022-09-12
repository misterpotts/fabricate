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

    public getSelectedMember(): Combination<CraftingComponent> {
        if (!this._selectedComponent) {
            return Combination.EMPTY();
        }
        if (this._members.distinct() === 1) {
            return this.members;
        }
        if (!this._selectedComponent || this.selectedComponent === CraftingComponent.NONE()) {
            throw new Error("No member has been selected. ");
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

    public hasSpecificIngredients() {
        return Array.from(this._ingredientGroups)
            .map(group => !group.isEmpty())
            .reduce((left, right) => left && right);
    }

    public hasOptions(): boolean {
        return Array.from(this._ingredientGroups)
            .map(group => !group.isSingleton())
            .reduce((left,right) => left || right);
    }

    public hasAllSelectionsMade(): boolean {
        if (!this.hasOptions()) {
            return true;
        }
        return !Array.from(this._ingredientGroups)
            .filter(group => !group.isSingleton())
            .map(group => group.selectedComponent)
            .find(selected => selected === CraftingComponent.NONE())
    }

    public getSelectedIngredients(): Combination<CraftingComponent> {
        return Array.from(this._ingredientGroups)
            .map(group => group.getSelectedMember())
            .reduce((left, right) => left.combineWith(right));
    }

    public requiresCatalysts() {
        return this._catalysts && !this._catalysts.isEmpty();
    }

    public hasNamedComponents(): boolean {
        return this.requiresCatalysts() || this.hasSpecificIngredients();
    }

    public getNamedComponents(): Combination<CraftingComponent> {
        return this.getSelectedIngredients().combineWith(this._catalysts);
    }

    public requiresEssences() {
        return !this._essences || !this._essences.isEmpty();
    }
    
    public select(index: number, component: CraftingComponent) {
        if (index < 0 || index >= this._ingredientGroups.length) {
            throw new Error(`"${index}" is not a valid ingredient group.`);
        }
        this._ingredientGroups[index] = this._ingredientGroups[index].select(component);
    }
    
}

export { Recipe, ComponentGroup }