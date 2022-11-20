import {Combination, StringIdentity, Unit} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

export class ComponentCombinationNode {
    private readonly _requiredEssences: Combination<StringIdentity>;
    private readonly _componentCombination: Combination<CraftingComponent>;
    private readonly _essenceCombination: Combination<StringIdentity>;
    private readonly _remainingPicks: Combination<CraftingComponent>;

    private _children: ComponentCombinationNode[];

    constructor(requiredEssences: Combination<StringIdentity>, nodeCombination: Combination<CraftingComponent>, remainingPicks: Combination<CraftingComponent>) {
        this._requiredEssences = requiredEssences;
        this._componentCombination = nodeCombination;
        this._remainingPicks = remainingPicks;
        this._essenceCombination = nodeCombination.explode((component: CraftingComponent) => component.essences);
    }

    public populate(): void {
        if (this._requiredEssences.isIn(this._essenceCombination)) {
            return;
        }
        this._children = this._remainingPicks.members.map((component: CraftingComponent) => {
            const deltaUnit = new Unit(component, 1);
            const childComponentCombination: Combination<CraftingComponent> = this._componentCombination.add(deltaUnit);
            const remainingPicksForChild: Combination<CraftingComponent> = this._remainingPicks.subtract(Combination.ofUnit(deltaUnit));
            return new ComponentCombinationNode(this._requiredEssences, childComponentCombination, remainingPicksForChild);
        });
        this._children.forEach((child: ComponentCombinationNode) => child.populate());
    }

    get componentCombination(): Combination<CraftingComponent> {
        return this._componentCombination;
    }

    get essenceCombination(): Combination<StringIdentity> {
        return this._essenceCombination;
    }

    public hasChildren(): boolean {
        return this.children && this.children.length > 0;
    }

    get children(): ComponentCombinationNode[] {
        return this._children;
    }
}