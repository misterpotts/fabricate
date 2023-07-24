import {Combination} from "../common/Combination";
import {Component} from "../crafting/component/Component";
import {Unit} from "../common/Unit";
import {EssenceReference} from "../crafting/essence/EssenceReference";

export class ComponentCombinationNode {
    private readonly _requiredEssences: Combination<EssenceReference>;
    private readonly _componentCombination: Combination<Component>;
    private readonly _essenceCombination: Combination<EssenceReference>;
    private readonly _remainingPicks: Combination<Component>;

    private _children: ComponentCombinationNode[];

    constructor(requiredEssences: Combination<EssenceReference>, nodeCombination: Combination<Component>, remainingPicks: Combination<Component>) {
        this._requiredEssences = requiredEssences;
        this._componentCombination = nodeCombination;
        this._remainingPicks = remainingPicks;
        this._essenceCombination = nodeCombination.explode((component: Component) => component.essences);
    }

    public populate(): void {
        if (this._requiredEssences.isIn(this._essenceCombination)) {
            return;
        }
        this._children = this._remainingPicks.members.map((component: Component) => {
            const deltaUnit = new Unit(component, 1);
            const childComponentCombination: Combination<Component> = this._componentCombination.addUnit(deltaUnit);
            const remainingPicksForChild: Combination<Component> = this._remainingPicks.subtract(Combination.ofUnit(deltaUnit));
            return new ComponentCombinationNode(this._requiredEssences, childComponentCombination, remainingPicksForChild);
        });
        this._children.forEach((child: ComponentCombinationNode) => child.populate());
    }

    get componentCombination(): Combination<Component> {
        return this._componentCombination;
    }

    get essenceCombination(): Combination<EssenceReference> {
        return this._essenceCombination;
    }

    public hasChildren(): boolean {
        return this.children && this.children.length > 0;
    }

    get children(): ComponentCombinationNode[] {
        return this._children;
    }
}