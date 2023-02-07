import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {ComponentCombinationGenerator, ComponentEssenceCombination} from "./ComponentCombinationGenerator";
import {Essence} from "../common/Essence";
import {TrackedCombination} from "../common/TrackedCombination";

export class EssenceSelection {

    private readonly _essences: Combination<Essence>;

    constructor(essences: Combination<Essence>) {
        this._essences = essences;
    }

    perform(contents: Combination<CraftingComponent>): Combination<CraftingComponent> {
        if (this._essences.isEmpty()) {
            return Combination.EMPTY();
        }
        let availableComponents = contents.clone();
        contents.members.forEach(((thisComponent: CraftingComponent) => {
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

    private selectBestMatch(combinations: ComponentEssenceCombination[]): Combination<CraftingComponent> {
        if (combinations.length === 0) {
            return Combination.EMPTY();
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

    private selectClosestMatch(combinations: ComponentEssenceCombination[], requiredEssences: Combination<Essence>): Combination<CraftingComponent> {
        if (combinations.length === 0) {
            return Combination.EMPTY();
        }
        const sortedComponentEssenceCombinations = combinations.map(combination => {
                const essenceComparison = new TrackedCombination({ target: requiredEssences, actual: combination.essences });
                return { essenceComparison, combination }
            })
            .sort((left, right) => left.essenceComparison.deficit - right.essenceComparison.deficit);
        return sortedComponentEssenceCombinations[0].combination.components;
    }

}