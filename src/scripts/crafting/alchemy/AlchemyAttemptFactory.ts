import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {AlchemyFormula} from "./AlchemyFormula";
import {
    AbandonedAlchemyAttempt,
    AlchemyAttempt,
    AlchemyConstraints,
    DefaultAlchemyAttempt,
    DefaultAlchemyConstraintEnforcer
} from "./AlchemyAttempt";
import {ComponentConsumptionCalculator} from "../../common/ComponentConsumptionCalculator";
import {AlchemicalCombination, AlchemicalCombiner} from "./AlchemicalEffect";

interface AlchemyAttemptFactory {

    formulaeByBasePartId: Map<string, AlchemyFormula>;

    make(baseComponent: CraftingComponent, componentSelection: Combination<CraftingComponent>): AlchemyAttempt;

    isEnabled(): boolean;

}

class DefaultAlchemyAttemptFactory implements AlchemyAttemptFactory {

    private readonly _constraints: AlchemyConstraints;
    private readonly _alchemicalCombiner: AlchemicalCombiner<AlchemicalCombination>;
    private readonly _componentConsumptionCalculator: ComponentConsumptionCalculator;
    private readonly _alchemyFormulaeByBasePartId: Map<string, AlchemyFormula>;

    constructor({
        componentConsumptionCalculator,
        constraints,
        alchemyFormulae,
        alchemicalCombiner
    }: {
        componentConsumptionCalculator: ComponentConsumptionCalculator;
        constraints: AlchemyConstraints,
        alchemyFormulae: AlchemyFormula[],
        alchemicalCombiner: AlchemicalCombiner<AlchemicalCombination>
    }) {
        this._componentConsumptionCalculator = componentConsumptionCalculator;
        this._constraints = constraints;
        this._alchemicalCombiner = alchemicalCombiner;
        this._alchemyFormulaeByBasePartId = new Map<string, AlchemyFormula>(alchemyFormulae.map(formula => [formula.basePartId, formula]));
    }

    get formulaeByBasePartId(): Map<string, AlchemyFormula> {
        return this._alchemyFormulaeByBasePartId;
    }

    isEnabled(): boolean {
        return true;
    }

    make(baseComponent: CraftingComponent, components: Combination<CraftingComponent>): AlchemyAttempt {

        if (!this._alchemyFormulaeByBasePartId.has(baseComponent.partId)) {
            throw new Error(`There is no Alchemy Formula specified for the base component with ID: ${baseComponent.partId}. `);
        }

        if (components.isEmpty()) {
            return new AbandonedAlchemyAttempt("You cannot perform Alchemy without any ingredients. ");
        }

        return new DefaultAlchemyAttempt({
            components: components,
            baseComponent: baseComponent,
            alchemicalCombiner: this._alchemicalCombiner,
            componentConsumptionCalculator: this._componentConsumptionCalculator,
            alchemyFormula: this._alchemyFormulaeByBasePartId.get(baseComponent.partId),
            alchemyConstraintEnforcer: new DefaultAlchemyConstraintEnforcer(this._constraints)
        });

    }

}

class DisabledAlchemyAttemptFactory implements AlchemyAttemptFactory {

    isEnabled(): boolean {
        return false;
    }

    make(_baseComponent: CraftingComponent, _componentSelection: Combination<CraftingComponent>): AlchemyAttempt {
        return new AbandonedAlchemyAttempt("This crafting system does not support Alchemy. ");
    }

    get formulaeByBasePartId(): Map<string, AlchemyFormula> {
        return new Map();
    }

}

export { AlchemyAttemptFactory, DefaultAlchemyAttemptFactory, DisabledAlchemyAttemptFactory }