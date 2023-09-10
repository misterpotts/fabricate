import {Combination} from "../../common/Combination";
import {ComponentSelection, DefaultComponentSelection} from "../../component/ComponentSelection";
import {Component} from "../component/Component";
import {TrackedCombination} from "../../common/TrackedCombination";
import {EssenceSelection} from "../../actor/EssenceSelection";
import {Identifiable} from "../../common/Identifiable";
import {Unit} from "../../common/Unit";
import {EssenceReference} from "../essence/EssenceReference";
import {Essence} from "../essence/Essence";

type SelectionStrategyName = "CONSERVATIVE_ESSENCE_SOURCING";

interface ComponentSelectionStrategyFactory {

    /**
     * Creates a new component selection strategy.
     *
     * @param craftingSystemEssencesById - Map of all essences in the crafting system, keyed by their ID
     * @returns ComponentSelectionStrategy The new component selection strategy
     */
    make(craftingSystemEssencesById: Map<string, Essence>): ComponentSelectionStrategy;

    /**
     * The name of the selection strategy to use. Defaults to "CONSERVATIVE_ESSENCE_SOURCING"
     */
    selectionStrategyName: string;

}

export { ComponentSelectionStrategyFactory }

class DefaultComponentSelectionStrategyFactory implements ComponentSelectionStrategyFactory {

    private static readonly _DEFAULT_SELECTION_STRATEGY_NAME = "CONSERVATIVE_ESSENCE_SOURCING";

    private static readonly _SELECTION_STRATEGY_FACTORIES_BY_NAME: Map<SelectionStrategyName, (craftingSystemEssencesById: Map<string, Essence>) => ComponentSelectionStrategy> = new Map([
        ["CONSERVATIVE_ESSENCE_SOURCING", DefaultComponentSelectionStrategyFactory.makeConservativeEssenceSourcingStrategy]
    ]);

    private _selectionStrategyName: SelectionStrategyName;

    constructor(selectionStrategyName?: SelectionStrategyName) {
        this._selectionStrategyName = selectionStrategyName ?? DefaultComponentSelectionStrategyFactory._DEFAULT_SELECTION_STRATEGY_NAME;
    }

    get selectionStrategyName(): SelectionStrategyName {
        return this._selectionStrategyName;
    }

    set selectionStrategyName(selectionStrategyName: SelectionStrategyName) {
        this._selectionStrategyName = selectionStrategyName;
    }

    make(craftingSystemEssencesById: Map<string, Essence>): ComponentSelectionStrategy {
        return DefaultComponentSelectionStrategyFactory._SELECTION_STRATEGY_FACTORIES_BY_NAME.get(this.selectionStrategyName ?? DefaultComponentSelectionStrategyFactory._DEFAULT_SELECTION_STRATEGY_NAME)(craftingSystemEssencesById);
    }

    private static makeConservativeEssenceSourcingStrategy(craftingSystemEssencesById: Map<string, Essence>): ComponentSelectionStrategy {
        return new ConservativeEssenceSourcingComponentSelectionStrategy(craftingSystemEssencesById);
    }

}

export { DefaultComponentSelectionStrategyFactory }

interface ComponentSelectionStrategy {

    perform(
        requiredCatalysts: Combination<Component>,
        requiredIngredients: Combination<Component>,
        requiredEssences: Combination<EssenceReference>,
        availableComponents: Combination<Component>
    ): ComponentSelection;

}

export {ComponentSelectionStrategy}

class ConservativeEssenceSourcingComponentSelectionStrategy implements ComponentSelectionStrategy {

    private readonly _craftingSystemEssencesById: Map<string, Essence>;

    constructor(craftingSystemEssencesById: Map<string, Essence>) {
        this._craftingSystemEssencesById = craftingSystemEssencesById;
    }

    perform(requiredCatalysts: Combination<Component>,
            requiredIngredients: Combination<Component>,
            requiredEssencesByReference: Combination<EssenceReference>,
            availableComponents: Combination<Component>): ComponentSelection {

        const catalysts = this.selectCombination(requiredCatalysts, availableComponents)

        const catalystAmountToSubtract = catalysts.isSufficient ? catalysts.target : catalysts.actual;
        const componentsForIngredients = availableComponents.subtract(catalystAmountToSubtract);

        const ingredients = this.selectCombination(requiredIngredients, componentsForIngredients);

        const ingredientAmountToSubtract = ingredients.isSufficient ? ingredients.target : ingredients.actual;
        const componentsForEssences = componentsForIngredients.subtract(ingredientAmountToSubtract);

        const essenceSelectionAlgorithm = new EssenceSelection(requiredEssencesByReference);
        const essenceSources: Combination<Component> = essenceSelectionAlgorithm.perform(componentsForEssences);
        const actualEssences = essenceSources
            .explode(component => component.essences)
            .convertElements(essenceReference => this._craftingSystemEssencesById.get(essenceReference.id));
        const essences = new TrackedCombination({
            target: requiredEssencesByReference.convertElements(essenceReference => this._craftingSystemEssencesById.get(essenceReference.id)),
            actual: actualEssences
        });

        return new DefaultComponentSelection({
            catalysts,
            ingredients,
            essences,
            essenceSources
        });

    }

    private selectCombination<T extends Identifiable>(target: Combination<T>, pool: Combination<T>): TrackedCombination<T> {
        const actualUnits = target.units
            .map(unit => new Unit(unit.element, pool.amountFor(unit.element)));
        const actual = Combination.ofUnits(actualUnits);
        return new TrackedCombination({
            target: target,
            actual
        });
    }

}

export {ConservativeEssenceSourcingComponentSelectionStrategy};