import {ComponentCombinationNode} from "./ComponentCombinationNode";
import {Combination, StringIdentity, Unit} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

export class ComponentCombinationGenerator {

    private readonly _roots: ComponentCombinationNode[];
    private readonly _requiredEssences: Combination<StringIdentity>;

    constructor(availableComponents: Combination<CraftingComponent>, requiredEssences: Combination<StringIdentity>) {
        this._requiredEssences = requiredEssences;
        this._roots = availableComponents.members
            .map((component) => Combination.ofUnit(new Unit(component, 1)))
            .map((combination) => new ComponentCombinationNode(requiredEssences, combination, availableComponents.subtract(combination)));
    }

    private allCombinations(baseNodes: ComponentCombinationNode[]): ComponentCombinationNode[] {
        const generatedCombinations: ComponentCombinationNode[] = [];
        let treeLevel = baseNodes;
        while (treeLevel.length > 0) {
            treeLevel.forEach((node: ComponentCombinationNode) => {
                generatedCombinations.push(node);
            });
            treeLevel = treeLevel.filter((node) => node.hasChildren())
                .map((node) => node.children)
                .reduce((left, right) => left.concat(right), []);
        }
        return generatedCombinations;
    }

    private excludeInsufficient(allCombinations: ComponentCombinationNode[], requiredEssences: Combination<StringIdentity>): ComponentCombinationNode[] {
        return allCombinations.filter((node) => node.essenceCombination.size() >= requiredEssences.size()
            && requiredEssences.isIn(node.essenceCombination));
    }

    private excludeDuplicates(sufficientCombinations: ComponentCombinationNode[]): [Combination<CraftingComponent>, Combination<StringIdentity>][] {
        const suitableCombinationsBySize: Map<number, [Combination<CraftingComponent>, Combination<StringIdentity>][]> = new Map();
        sufficientCombinations.forEach((node) => {
            if (!suitableCombinationsBySize.has(node.componentCombination.size())) {
                suitableCombinationsBySize.set(node.componentCombination.size(), [[node.componentCombination, node.essenceCombination]]);
            } else {
                let isDuplicate: boolean = false;
                const existing: [Combination<CraftingComponent>, Combination<StringIdentity>][] = suitableCombinationsBySize.get(node.componentCombination.size());
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
        return Array.from(suitableCombinationsBySize.values(), (combinations) => combinations)
            .reduce((left, right) => left.concat(right), []);
    }

    public generate(): [Combination<CraftingComponent>, Combination<StringIdentity>][] {
        this._roots.forEach((node: ComponentCombinationNode) => node.populate());
        const generatedCombinations = this.allCombinations(this._roots);
        const suitableCombinations = this.excludeInsufficient(generatedCombinations, this._requiredEssences);
        return this.excludeDuplicates(suitableCombinations);
    }

}