import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelectionStrategy} from "../selection/ComponentSelectionStrategy";
import {Recipe} from "../../common/Recipe";
import {
    CraftingAttempt
} from "./CraftingAttempt";

class CraftingAttemptFactory {

    private readonly _selectionStrategy: ComponentSelectionStrategy;

    constructor({
        selectionStrategy
    }: {
        selectionStrategy: ComponentSelectionStrategy;
    }) {
        this._selectionStrategy = selectionStrategy;
    }

    make(availableComponents: Combination<CraftingComponent>, recipe: Recipe): CraftingAttempt {
        const options = recipe.ingredientOptions
            .map(ingredientOption => {
                return {
                    selectedComponents: this._selectionStrategy.perform(ingredientOption, recipe.essences, availableComponents),
                    ingredientOption
                }
            });
        // todo: build a crafting attempt
        return undefined;
    }

}

export { CraftingAttemptFactory }