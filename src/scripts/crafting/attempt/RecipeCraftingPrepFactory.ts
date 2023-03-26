import {Combination} from "../../common/Combination";
import {Component} from "../component/Component";
import {ComponentSelectionStrategy} from "../selection/ComponentSelectionStrategy";
import {RequirementOption, Recipe} from "../recipe/Recipe";
import {CraftingAttempt, DefaultCraftingAttempt} from "./CraftingAttempt";
import {MultipleRecipeCraftingPrep, RecipeCraftingPrep, SingletonRecipeCraftingPrep} from "./RecipeCraftingPrep";
import {Essence} from "../essence/Essence";

class RecipeCraftingPrepFactory {

    private readonly _selectionStrategy: ComponentSelectionStrategy;

    constructor({
        selectionStrategy
    }: {
        selectionStrategy: ComponentSelectionStrategy;
    }) {
        this._selectionStrategy = selectionStrategy;
    }

    make(recipe: Recipe, availableComponents: Combination<Component>): RecipeCraftingPrep {

        if (!recipe.hasIngredients) {
            const componentSelection = this._selectionStrategy.perform(Combination.EMPTY(), Combination.EMPTY(), recipe.essences, availableComponents);
            const singletonCraftingAttempt = new DefaultCraftingAttempt({
                componentSelection,
                possible: componentSelection.isSufficient
            });
            return new SingletonRecipeCraftingPrep({ recipe, singletonCraftingAttempt });
        }

        if (recipe.ingredientOptions.length === 1) {
            const ingredientSelection = recipe.getSelectedIngredients();
            const componentSelection = this._selectionStrategy.perform(ingredientSelection.catalysts, ingredientSelection.ingredients, recipe.essences, availableComponents);
            const singletonCraftingAttempt = new DefaultCraftingAttempt({
                componentSelection,
                possible: componentSelection.isSufficient
            });
            return new SingletonRecipeCraftingPrep({ recipe, singletonCraftingAttempt });
        }

        const craftingAttemptsByIngredientOptionName =  new Map(recipe.ingredientOptions
            .map(ingredientOption => [ingredientOption.id, this.makeCraftingAttempt(
                ingredientOption,
                recipe.essences,
                availableComponents)
            ])
        );

        return new MultipleRecipeCraftingPrep({
            recipe,
            craftingAttemptsByIngredientOptionName
        });

    }

    private makeCraftingAttempt(ingredientOption: RequirementOption,
                                essences: Combination<Essence>,
                                availableComponents: Combination<Component>): CraftingAttempt {

        const componentSelection = this._selectionStrategy.perform(
            ingredientOption.catalysts,
            ingredientOption.ingredients,
            essences,
            availableComponents);

        return new DefaultCraftingAttempt({ componentSelection, possible: componentSelection.isSufficient });

    }

}

export { RecipeCraftingPrepFactory }