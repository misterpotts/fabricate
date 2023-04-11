import {ComponentCombinationNode} from "./ComponentCombinationNode";
import {Combination} from "../common/Combination";
import {Component} from "../crafting/component/Component";
import {Essence} from "../crafting/essence/Essence";
import {Unit} from "../common/Unit";

interface ComponentEssenceCombination {
    components: Combination<Component>;
    essences: Combination<Essence>;
    isSufficientFor(requiredEssences: Combination<Essence>): boolean;
}

interface CombinationGenerationResult {

    isSuccessful: boolean;
    sufficientCombinations: ComponentEssenceCombination[];
    insufficientCombinations: ComponentEssenceCombination[];

}

class FailedCombinationGenerationResult implements CombinationGenerationResult {

    private readonly _insufficientCombinations: ComponentEssenceCombination[];

    constructor({ insufficientCombinations = []}: { insufficientCombinations?: ComponentEssenceCombination[] }) {
        this._insufficientCombinations = insufficientCombinations;
    }

    get insufficientCombinations(): ComponentEssenceCombination[] {
        return this._insufficientCombinations;
    }
    get isSuccessful(): boolean {
        return false;
    }
    get sufficientCombinations(): ComponentEssenceCombination[] {
        return []
    }

}

class SuccessfulCombinationGenerationResult implements CombinationGenerationResult {

    private readonly _sufficientCombinations: ComponentEssenceCombination[];
    private readonly _insufficientCombinations: ComponentEssenceCombination[];

    constructor({
        insufficientCombinations = [],
        sufficientCombinations
    }: {
        insufficientCombinations?: ComponentEssenceCombination[];
        sufficientCombinations: ComponentEssenceCombination[];
    }) {
        this._insufficientCombinations = insufficientCombinations;
        this._sufficientCombinations = sufficientCombinations;
    }

    get insufficientCombinations(): ComponentEssenceCombination[] {
        return this._insufficientCombinations;
    }

    get isSuccessful(): boolean {
        return true;
    }

    get sufficientCombinations(): ComponentEssenceCombination[] {
        return this._sufficientCombinations;
    }

}

class DefaultComponentEssenceCombination implements ComponentEssenceCombination {

    private readonly _components: Combination<Component>;
    private readonly _essences: Combination<Essence>;

    constructor(components: Combination<Component>, essences: Combination<Essence>) {
        this._components = components;
        this._essences = essences;
    }

    get components(): Combination<Component> {
        return this._components;
    }

    get essences(): Combination<Essence> {
        return this._essences;
    }

    public isSufficientFor(requiredEssences: Combination<Essence>): boolean {
        return this._essences.size >= requiredEssences.size
            && requiredEssences.isIn(this._essences);
    }

}

class ComponentCombinationGenerator {

    private readonly _roots: ComponentCombinationNode[];
    private readonly _requiredEssences: Combination<Essence>;

    constructor(availableComponents: Combination<Component>, requiredEssences: Combination<Essence>) {
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

    private excludeDuplicates(nonUniqueCombinations: ComponentCombinationNode[]): ComponentEssenceCombination[] {
        const uniqueCombinationsBySize: Map<number, ComponentEssenceCombination[]> = new Map();
        nonUniqueCombinations.forEach((node) => {
            if (!uniqueCombinationsBySize.has(node.componentCombination.size)) {
                uniqueCombinationsBySize.set(node.componentCombination.size, [new DefaultComponentEssenceCombination(node.componentCombination, node.essenceCombination)]);
            } else {
                let isDuplicate: boolean = false;
                const existing: ComponentEssenceCombination[] = uniqueCombinationsBySize.get(node.componentCombination.size);
                for (const existingCombination of existing) {
                    if (existingCombination.components.equals(node.componentCombination)) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    existing.push(new DefaultComponentEssenceCombination(node.componentCombination, node.essenceCombination));
                }
            }
        });
        return Array.from(uniqueCombinationsBySize.values(), (combinations) => combinations)
            .reduce((left, right) => left.concat(right), []);
    }

    public generate(): CombinationGenerationResult {
        this._roots.forEach((node: ComponentCombinationNode) => node.populate());
        const generatedCombinations = this.allCombinations(this._roots);
        if (generatedCombinations.length === 0) {
            return new FailedCombinationGenerationResult({});
        }
        const uniqueCombinations = this.excludeDuplicates(generatedCombinations);
        const sufficientCombinations: ComponentEssenceCombination[] = [];
        const insufficientCombinations: ComponentEssenceCombination[] = [];
        uniqueCombinations.forEach(combination => {
            if (combination.isSufficientFor(this._requiredEssences)) {
                sufficientCombinations.push(combination);
            } else {
                insufficientCombinations.push(combination);
            }
        });
        if (sufficientCombinations.length > 0) {
            return new SuccessfulCombinationGenerationResult({
                sufficientCombinations,
                insufficientCombinations
            });
        }
        return new FailedCombinationGenerationResult({
            insufficientCombinations
        });
    }

}

export { ComponentCombinationGenerator, ComponentEssenceCombination, CombinationGenerationResult }