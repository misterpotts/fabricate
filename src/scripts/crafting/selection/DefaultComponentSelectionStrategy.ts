import {ComponentSelectionStrategy} from "./ComponentSelectionStrategy";
import {Recipe} from "../Recipe";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelection} from "../../component/ComponentSelection";
import {IncompleteComponentSelection} from "../../component/IncompleteComponentSelection";
import {EssenceSearch} from "../../actor/EssenceSearch";
import {IngredientSearch} from "../../actor/IngredientSearch";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {CompleteComponentSelection} from "../../component/CompleteComponentSelection";

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    perform(recipe: Recipe, availableComponents: Combination<CraftingComponent>): ComponentSelection {

        const ingredientSearch = new IngredientSearch(recipe.namedComponents);
        const namedComponentsSatisfied = ingredientSearch.perform(availableComponents);

        if (!namedComponentsSatisfied) {
            return new IncompleteComponentSelection({
                recipe: recipe,
                reason: "the supplied components were missing required ingredients"
            });
        }

        const remainingComponents: Combination<CraftingComponent> = availableComponents.subtract(recipe.namedComponents);
        const essenceSearch = new EssenceSearch(recipe.essences);
        const essencesSatisfied = essenceSearch.perform(remainingComponents);
        if (!essencesSatisfied) {
            return new IncompleteComponentSelection({
                recipe: recipe,
                reason: "there weren't enough essences available in the supplied crafting components" });
        }

        const essenceSelection = new EssenceSelection(recipe.essences);
        const essenceContribution: Combination<CraftingComponent> = essenceSelection.perform(remainingComponents);

        const selectedComponents = recipe.ingredients.combineWith(essenceContribution);

        return new CompleteComponentSelection({
            recipe: recipe,
            components: selectedComponents
        });

    }

}

export {DefaultComponentSelectionStrategy}