import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {AlchemyFormula} from "./AlchemyFormula";
import {
    AbandonedAlchemyAttempt,
    AlchemyAttempt,
    AlchemyConstraints, DefaultAlchemyAttempt, DefaultAlchemyConstraintEnforcer
} from "./AlchemyAttempt";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalCombiner} from "./AlchemicalCombiner";
import {ComponentConsumptionCalculator} from "../../common/ComponentConsumptionCalculator";

interface AlchemyAttemptFactory {

    make(baseComponent: CraftingComponent, componentSelection: Combination<CraftingComponent>): AlchemyAttempt;

}

interface AlchemyAttemptFactoryConfig {
    componentConsumptionCalculator: ComponentConsumptionCalculator;
    constraints: AlchemyConstraints,
    alchemyFormulae: AlchemyFormula<ItemData>[],
    alchemicalCombiner: AlchemicalCombiner
}

class DefaultAlchemyAttemptFactory implements AlchemyAttemptFactory {

    private readonly _constraints: AlchemyConstraints;
    private readonly _alchemicalCombiner: AlchemicalCombiner;
    private readonly _componentConsumptionCalculator: ComponentConsumptionCalculator;
    private readonly _alchemyFormulaeByBasePartId: Map<string, AlchemyFormula<ItemData>>;

    constructor(config: AlchemyAttemptFactoryConfig) {
        this._componentConsumptionCalculator = config.componentConsumptionCalculator;
        this._constraints = config.constraints;
        this._alchemicalCombiner = config.alchemicalCombiner;
        this._alchemyFormulaeByBasePartId = new Map<string, AlchemyFormula<ItemData>>(config.alchemyFormulae.map(formula => [formula.basePartId, formula]));
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
            alchemicalCombiner: this._alchemicalCombiner,
            componentConsumptionCalculator: this._componentConsumptionCalculator,
            alchemyFormula: this._alchemyFormulaeByBasePartId.get(baseComponent.partId),
            alchemyConstraintEnforcer: new DefaultAlchemyConstraintEnforcer(this._constraints)
        });

    }

}

export { AlchemyAttemptFactory, DefaultAlchemyAttemptFactory }