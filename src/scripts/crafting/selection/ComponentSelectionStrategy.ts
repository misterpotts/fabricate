import {Combination, Unit} from "../../common/Combination";
import {ComponentSelection, DefaultComponentSelection} from "../../component/ComponentSelection";
import {Component} from "../component/Component";
import {Essence} from "../essence/Essence";
import {TrackedCombination} from "../../common/TrackedCombination";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {Identifiable} from "../../common/Identity";

interface ComponentSelectionStrategy {

    perform(
        requiredCatalysts: Combination<Component>,
        requiredIngredients: Combination<Component>,
        requiredEssences: Combination<Essence>,
        availableComponents: Combination<Component>
    ): ComponentSelection;

}

export {ComponentSelectionStrategy}

class DefaultComponentSelectionStrategy implements ComponentSelectionStrategy {

    perform(requiredCatalysts: Combination<Component>,
            requiredIngredients: Combination<Component>,
            requiredEssences: Combination<Essence>,
            availableComponents: Combination<Component>): ComponentSelection {

        const catalysts = this.selectCombination(requiredCatalysts, availableComponents)

        const catalystAmountToSubtract = catalysts.isSufficient ? catalysts.target : catalysts.actual;
        const componentsForIngredients = availableComponents.subtract(catalystAmountToSubtract);

        const ingredients = this.selectCombination(requiredIngredients, componentsForIngredients);

        const ingredientAmountToSubtract = ingredients.isSufficient ? ingredients.target : ingredients.actual;
        const componentsForEssences = componentsForIngredients.subtract(ingredientAmountToSubtract);

        const essenceSelectionAlgorithm = new EssenceSelection(requiredEssences);
        const essenceSources: Combination<Component> = essenceSelectionAlgorithm.perform(componentsForEssences);
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
        const actualUnits = target.units
            .map(unit => new Unit(unit.part, pool.amountFor(unit.part)));
        const actual = Combination.ofUnits(actualUnits);
        return new TrackedCombination({
            target: target,
            actual
        });
    }

}

export {DefaultComponentSelectionStrategy};