import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {ComponentCombinationGenerator} from "./ComponentCombinationGenerator";
import {Essence} from "../common/Essence";

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
        return this.selectBestMatch(this.matchingCombinationsFor(availableComponents, this._essences));
    }

    private selectBestMatch(combinations: [Combination<CraftingComponent>, Combination<Essence>][]): Combination<CraftingComponent> {
        if (combinations.length === 0) {
            return Combination.EMPTY();
        }
        const sortedCombinations = combinations
            .sort((left, right) => {
                return left[1].size() - right[1].size();
            });
        return sortedCombinations[0][0];
    }

    private matchingCombinationsFor(availableComponents: Combination<CraftingComponent>, requiredEssences: Combination<Essence>): [Combination<CraftingComponent>, Combination<Essence>][] {
        const combinationGenerator = new ComponentCombinationGenerator(availableComponents, requiredEssences);
        return combinationGenerator.generate();
    }

}