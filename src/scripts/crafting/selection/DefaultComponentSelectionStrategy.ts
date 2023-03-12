import {ComponentSelectionStrategy} from "./ComponentSelectionStrategy";
import {IngredientOption} from "../../common/Recipe";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelection, DefaultComponentSelection} from "../../component/ComponentSelection";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {TrackedCombination} from "../../common/TrackedCombination";
import {Essence} from "../../common/Essence";

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    perform(ingredientOption: IngredientOption, requiredEssences: Combination<Essence>, availableComponents: Combination<CraftingComponent>): ComponentSelection {

        const catalysts = new TrackedCombination({
            target: ingredientOption.catalysts,
            actual: availableComponents
        });

        const componentsForIngredients = availableComponents.subtract(ingredientOption.catalysts);

        const ingredients = new TrackedCombination({
            target: ingredientOption.ingredients,
            actual: componentsForIngredients
        });

        const componentsForEssences = componentsForIngredients.subtract(ingredientOption.ingredients);
        const availableEssences = componentsForEssences.explode(component => component.essences);

        const essences = new TrackedCombination({
            target: requiredEssences,
            actual: availableEssences
        });

        const essenceSelection = new EssenceSelection(requiredEssences);
        const essenceSources: Combination<CraftingComponent> = essenceSelection.perform(componentsForEssences);

        return new DefaultComponentSelection({
            catalysts,
            ingredients,
            essences,
            essenceSources
        });

    }

}

export {DefaultComponentSelectionStrategy}