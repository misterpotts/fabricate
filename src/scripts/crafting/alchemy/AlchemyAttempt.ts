import {CraftingCheck} from "../check/CraftingCheck";
import {AlchemyResult, NoAlchemyResult, SuccessfulAlchemyResult, UnsuccessfulAlchemyResult} from "./AlchemyResult";
import {AlchemicalCombiner} from "./AlchemicalCombiner";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {AlchemicalEffect} from "./AlchemicalEffect";
import {CraftingCheckResult} from "../check/CraftingCheckResult";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentConsumptionCalculator} from "../../common/ComponentConsumptionCalculator";
import {AlchemyFormula} from "./AlchemyFormula";

interface BoundedNumber {
    min: number;
    max: number;
}

interface AlchemyConstraints {
    components: BoundedNumber;
    effects: BoundedNumber;
}

interface AlchemyAttemptConfig {
    components: Combination<CraftingComponent>;
    alchemyFormula: AlchemyFormula<ItemData>;
    alchemicalCombiner: AlchemicalCombiner;
    componentConsumptionCalculator: ComponentConsumptionCalculator;
    alchemyConstraintEnforcer: AlchemyConstraintEnforcer;
}

interface AlchemyAttempt {

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult;

}

interface ConstraintCheck {
    isOk: boolean;
    detail: string;
}

interface AlchemyConstraintEnforcer {

    checkComponents(componentCount: number): ConstraintCheck;

    checkEffectMatches(effectMatchCount: number): ConstraintCheck;

}

class DefaultAlchemyConstraintEnforcer implements AlchemyConstraintEnforcer {

    private readonly _constraints: AlchemyConstraints;

    constructor(constraints: AlchemyConstraints) {
        this._constraints = constraints;
    }

    checkComponents(componentCount: number): ConstraintCheck {

        if (componentCount < this._constraints.components.min) {
            return { isOk: false, detail: "Too few components provided. " };
        } else if (componentCount > this._constraints.components.max) {
            return { isOk: false, detail: "Too many components provided. " };
        }

        return { isOk: true, detail: "The number of components looks ok! " };

    }

    checkEffectMatches(effectMatchCount: number): ConstraintCheck {

        if (effectMatchCount < this._constraints.effects.min) {
            return { isOk: false, detail: "Too few effects matched. " };
        } else if (effectMatchCount > this._constraints.effects.max) {
            return { isOk: false, detail: "Too many effects matched. " };
        }

        return { isOk: true, detail: "The number of effects looks ok! " };

    }


}

class AbandonedAlchemyAttempt implements AlchemyAttempt {

    private readonly _reason: string;

    constructor(reason: string) {
        this._reason = reason;
    }

    perform(_actor: Actor, _craftingCheck: CraftingCheck<Actor>): NoAlchemyResult {
        return new NoAlchemyResult({
            description: this._reason,
            consumed: Combination.EMPTY()
        });
    }

}

class DefaultAlchemyAttempt implements AlchemyAttempt {

    private readonly _alchemicalCombiner: AlchemicalCombiner;
    private readonly _components: Combination<CraftingComponent>;
    private readonly _alchemyFormula: AlchemyFormula<ItemData>;
    private readonly _alchemyConstraintEnforcer: AlchemyConstraintEnforcer;
    private readonly _componentConsumptionCalculator: ComponentConsumptionCalculator;

    constructor(config: AlchemyAttemptConfig) {
        this._alchemicalCombiner = config.alchemicalCombiner;
        this._components = config.components;
        this._alchemyFormula = config.alchemyFormula;
        this._componentConsumptionCalculator = config.componentConsumptionCalculator;
        this._alchemyConstraintEnforcer = config.alchemyConstraintEnforcer;
    }

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult {
        const consumed = this._componentConsumptionCalculator.calculate(this._components);

        const componentConstraintCheck: ConstraintCheck = this._alchemyConstraintEnforcer.checkComponents(this._components.size());
        if (!componentConstraintCheck.isOk) {
            return new UnsuccessfulAlchemyResult({
                description: componentConstraintCheck.detail,
                consumed: consumed
            });
        }

        const craftingCheckResult: CraftingCheckResult = craftingCheck.perform(actor, this._components);
        if (!craftingCheckResult.isSuccessful) {
            return new UnsuccessfulAlchemyResult({
                description: craftingCheckResult.describe(),
                consumed: consumed
            });
        }

        const matchingEffects: AlchemicalEffect<ItemData>[] = this._alchemyFormula.getAllEffects(this._components);

        const effectConstraintCheck: ConstraintCheck = this._alchemyConstraintEnforcer.checkEffectMatches(matchingEffects.length);
        if (!effectConstraintCheck.isOk) {
            return new UnsuccessfulAlchemyResult({
                description: effectConstraintCheck.detail,
                consumed: consumed
            });
        }

        return new SuccessfulAlchemyResult({
            consumed: consumed,
            description: "Alchemy success!",
            alchemicalCombiner: this._alchemicalCombiner,
            matchingEffects: matchingEffects
        });

    }

}

export { AlchemyAttempt, DefaultAlchemyAttempt, AbandonedAlchemyAttempt, AlchemyConstraints, BoundedNumber, DefaultAlchemyConstraintEnforcer }