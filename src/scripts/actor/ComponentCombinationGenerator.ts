import {ComponentCombinationNode} from "./ComponentCombinationNode";
import {Combination, Unit} from "../common/Combination";
import {Essence} from "../common/Essence";
import {CraftingComponent} from "../common/CraftingComponent";

export class ComponentCombinationGenerator {

    private readonly _roots: ComponentCombinationNode[];
    private readonly _requiredEssences: Combination<Essence>;

    constructor(availableComponents: Combination<CraftingComponent>, requiredEssences: Combination<Essence>) {
        this._requiredEssences = requiredEssences;
        this._roots = availableComponents.members
            .map((component: CraftingComponent) => Combination.ofUnit(new Unit<CraftingComponent>(component, 1)))
            .map((combination: Combination<CraftingComponent>) => new ComponentCombinationNode(requiredEssences, combination, availableComponents.subtract(combination)));
    }

    private allCombinations(baseNodes: ComponentCombinationNode[]): ComponentCombinationNode[] {
        const generatedCombinations: ComponentCombinationNode[] = [];
        let treeLevel: ComponentCombinationNode[] = baseNodes;
        while (treeLevel.length > 0) {
            treeLevel.forEach((node: ComponentCombinationNode) => {
                generatedCombinations.push(node);
            });
            treeLevel = treeLevel.filter((node: ComponentCombinationNode) => node.hasChildren())
                .map((node: ComponentCombinationNode) => node.children)
                .reduce((left: ComponentCombinationNode[], right: ComponentCombinationNode[]) => left.concat(right), []);
        }
        return generatedCombinations;
    }

    private excludeInsufficient(allCombinations: ComponentCombinationNode[], requiredEssences: Combination<Essence>): ComponentCombinationNode[] {
        return allCombinations.filter((node: ComponentCombinationNode) => node.essenceCombination.size() >= requiredEssences.size()
            && requiredEssences.isIn(node.essenceCombination));
    }

    private excludeDuplicates(sufficientCombinations: ComponentCombinationNode[]): [Combination<CraftingComponent>, Combination<Essence>][] {
        const suitableCombinationsBySize: Map<number, [Combination<CraftingComponent>, Combination<Essence>][]> = new Map();
        sufficientCombinations.forEach((node: ComponentCombinationNode) => {
            if (!suitableCombinationsBySize.has(node.componentCombination.size())) {
                suitableCombinationsBySize.set(node.componentCombination.size(), [[node.componentCombination, node.essenceCombination]]);
            } else {
                let isDuplicate: boolean = false;
                const existing: [Combination<CraftingComponent>, Combination<Essence>][] = suitableCombinationsBySize.get(node.componentCombination.size());
                for (const existingCombination of existing) {
                    if (existingCombination[0].equals(node.componentCombination)) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    existing.push([node.componentCombination, node.essenceCombination]);
                }
            }
        });
        return Array.from(suitableCombinationsBySize.values(), (combinations: [Combination<CraftingComponent>, Combination<Essence>][]) => combinations)
            .reduce((left: [Combination<CraftingComponent>, Combination<Essence>][], right: [Combination<CraftingComponent>, Combination<Essence>][]) => left.concat(right), []);
    }

    public generate(): [Combination<CraftingComponent>, Combination<Essence>][] {
        this._roots.forEach((node: ComponentCombinationNode) => node.populate());
        const generatedCombinations: ComponentCombinationNode[] = this.allCombinations(this._roots);
        const suitableCombinations: ComponentCombinationNode[] = this.excludeInsufficient(generatedCombinations, this._requiredEssences);
        return this.excludeDuplicates(suitableCombinations);
    }

}