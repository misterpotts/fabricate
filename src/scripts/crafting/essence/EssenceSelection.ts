import {Combination, DefaultCombination} from "../../common/Combination";
import {Component} from "../component/Component";
import {ComponentCombinationGenerator, ComponentEssenceCombination} from "../../common/ComponentCombinationGenerator";
import {TrackedCombination} from "../../common/TrackedCombination";
import {EssenceReference} from "./EssenceReference";

export class EssenceSelection {

    private readonly _essences: Combination<EssenceReference>;

    constructor(essences: Combination<EssenceReference>) {
        this._essences = essences;
    }

    perform(contents: Combination<Component>): Combination<Component> {
        if (this._essences.isEmpty()) {
            return DefaultCombination.EMPTY();
        }
        let availableComponents = contents.clone();
        contents.members.forEach(((thisComponent: Component) => {
            if (thisComponent.essences.isEmpty() || !thisComponent.essences.intersects(this._essences)) {
                availableComponents = availableComponents.subtract(availableComponents.just(thisComponent));
            }
        }));
        const combinationGenerator = new ComponentCombinationGenerator(availableComponents, this._essences);
        const generationResult = combinationGenerator.generate();
        if (generationResult.isSuccessful) {
            return this.selectBestMatch(generationResult.sufficientCombinations);
        }
        return this.selectClosestMatch(generationResult.insufficientCombinations, this._essences);
    }

    private selectBestMatch(combinations: ComponentEssenceCombination[]): Combination<Component> {
        if (combinations.length === 0) {
            return DefaultCombination.EMPTY();
        }
        const sortedCombinations = combinations
            .sort((left, right) => {
                const componentCountComparison = left.components.size - right.components.size;
                if (componentCountComparison != 0) {
                    return componentCountComparison;
                }
                return left.essences.size - right.essences.size;
            });
        return sortedCombinations[0].components;
    }

    private selectClosestMatch(combinations: ComponentEssenceCombination[], requiredEssences: Combination<EssenceReference>): Combination<Component> {
        if (combinations.length === 0) {
            return DefaultCombination.EMPTY();
        }
        const sortedComponentEssenceCombinations = combinations.map(combination => {
                const essenceComparison = new TrackedCombination({ target: requiredEssences, actual: combination.essences });
                return { essenceComparison, combination }
            })
            .sort((left, right) => left.essenceComparison.deficit - right.essenceComparison.deficit);
        return sortedComponentEssenceCombinations[0].combination.components;
    }

}