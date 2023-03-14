import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelectionStrategy} from "../selection/ComponentSelectionStrategy";
import {IngredientOption} from "../../common/Recipe";
import {
    CraftingAttempt,
    DefaultCraftingAttempt
} from "./CraftingAttempt";
import {Essence} from "../../common/Essence";
class CraftingAttemptFactory {

    private readonly _selectionStrategy: ComponentSelectionStrategy;

    constructor({
        selectionStrategy
    }: {
        selectionStrategy: ComponentSelectionStrategy;
    }) {
        this._selectionStrategy = selectionStrategy;
    }

    make(ingredientOption: IngredientOption, essences: Combination<Essence>, availableComponents: Combination<CraftingComponent>): CraftingAttempt {
        const componentSelection = this._selectionStrategy.perform(ingredientOption, essences, availableComponents);
        return new DefaultCraftingAttempt({
            componentSelection,
            ingredientOptionName: ingredientOption.name,
            possible: componentSelection.isSufficient
        });
    }

}

export { CraftingAttemptFactory }