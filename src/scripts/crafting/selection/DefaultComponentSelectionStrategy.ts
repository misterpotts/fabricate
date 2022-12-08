import {ComponentSelectionStrategy} from "./ComponentSelectionStrategy";
import {Recipe} from "../Recipe";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelection} from "../../component/ComponentSelection";
import {IncompleteComponentSelection} from "../../component/IncompleteComponentSelection";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {CompleteComponentSelection} from "../../component/CompleteComponentSelection";

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    perform(recipe: Recipe, availableComponents: Combination<CraftingComponent>): ComponentSelection {

        const namedComponentsSatisfied = recipe.getSelectedIngredients().isIn(availableComponents);

        if (!namedComponentsSatisfied) {
            return new IncompleteComponentSelection();
        }

        const remainingComponents: Combination<CraftingComponent> = availableComponents.subtract(recipe.getNamedComponents());
        const availableEssences = remainingComponents.explode(component => component.essences);
        const essencesSatisfied = recipe.essences.isIn(availableEssences);
        if (!essencesSatisfied) {
            return new IncompleteComponentSelection();
        }

        const essenceSelection = new EssenceSelection(recipe.essences);
        const essenceContribution: Combination<CraftingComponent> = essenceSelection.perform(remainingComponents);

        const selectedComponents = recipe.getSelectedIngredients().combineWith(essenceContribution);

        return new CompleteComponentSelection({
            components: selectedComponents
        });

    }

}

export {DefaultComponentSelectionStrategy}