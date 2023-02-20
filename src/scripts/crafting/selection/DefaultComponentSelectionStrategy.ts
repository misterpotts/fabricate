import {ComponentSelectionStrategy} from "./ComponentSelectionStrategy";
import {Recipe} from "../../common/Recipe";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelection} from "../../component/ComponentSelection";
import {IncompleteComponentSelection} from "../../component/IncompleteComponentSelection";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {CompleteComponentSelection} from "../../component/CompleteComponentSelection";

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    perform(recipe: Recipe, availableComponents: Combination<CraftingComponent>): ComponentSelection {

        const selectedIngredients = recipe.getSelectedIngredients();
        const namedComponents = selectedIngredients.catalysts.combineWith(selectedIngredients.ingredients);
        const namedComponentsSatisfied = namedComponents.isIn(availableComponents);

        if (!namedComponentsSatisfied) {
            return new IncompleteComponentSelection();
        }

        const remainingComponents: Combination<CraftingComponent> = availableComponents.subtract(namedComponents);
        const availableEssences = remainingComponents.explode(component => component.essences);
        const essencesSatisfied = recipe.essences.isIn(availableEssences);
        if (!essencesSatisfied) {
            return new IncompleteComponentSelection();
        }

        const essenceSelection = new EssenceSelection(recipe.essences);
        const essenceContribution: Combination<CraftingComponent> = essenceSelection.perform(remainingComponents);

        const selectedComponents = selectedIngredients.ingredients.combineWith(essenceContribution);

        return new CompleteComponentSelection({
            components: selectedComponents
        });

    }

}

export {DefaultComponentSelectionStrategy}