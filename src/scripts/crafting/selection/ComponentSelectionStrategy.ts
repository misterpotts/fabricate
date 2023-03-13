import {IngredientOption} from "../../common/Recipe";
import {Combination, Unit} from "../../common/Combination";
import {ComponentSelection, DefaultComponentSelection} from "../../component/ComponentSelection";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Essence} from "../../common/Essence";
import {TrackedCombination} from "../../common/TrackedCombination";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {Identifiable} from "../../common/Identity";

interface ComponentSelectionStrategy {

    perform(ingredientOption: IngredientOption, requiredEssences: Combination<Essence>, availableComponents: Combination<CraftingComponent>): ComponentSelection;

}

export {ComponentSelectionStrategy}

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    perform(ingredientOption: IngredientOption, requiredEssences: Combination<Essence>, availableComponents: Combination<CraftingComponent>): ComponentSelection {

        const catalysts = this.selectCombination(ingredientOption.catalysts, availableComponents)

        const componentsForIngredients = availableComponents.subtract(catalysts.actual);

        const ingredients = this.selectCombination(ingredientOption.ingredients, componentsForIngredients);

        const componentsForEssences = componentsForIngredients.subtract(ingredients.actual);

        const essenceSelectionAlgorithm = new EssenceSelection(requiredEssences);
        const essenceSources: Combination<CraftingComponent> = essenceSelectionAlgorithm.perform(componentsForEssences);
        const actualEssences = essenceSources.explode(component => component.essences);
        const essences = new TrackedCombination({ target: requiredEssences, actual: actualEssences })

        return new DefaultComponentSelection({
            catalysts,
            ingredients,
            essences,
            essenceSources
        });

    }

    private selectCombination<T extends Identifiable>(target: Combination<T>, pool: Combination<T>): TrackedCombination<T> {
        if (target.isIn(pool)) {
            return new TrackedCombination({
                target,
                actual: target
            });
        }
        const actualUnits = target.units
            .map(unit => new Unit(unit.part, pool.amountFor(unit.part) < unit.quantity ? pool.amountFor(unit.part) : unit.quantity));
        const actual = Combination.ofUnits(actualUnits);
        return new TrackedCombination({
            target: target,
            actual
        });
    }

}

export {DefaultComponentSelectionStrategy};