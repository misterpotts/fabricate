import {CraftingCheck} from "../check/CraftingCheck";
import {AlchemyResult, NoAlchemyResult, SuccessfulAlchemyResult, UnsuccessfulAlchemyResult} from "./AlchemyResult";
import {AlchemicalCombination, AlchemicalCombiner, AlchemicalEffect} from "./AlchemicalEffect";
import {CraftingCheckResult} from "../check/CraftingCheckResult";
import {Combination} from "../../common/Combination";
import {Component} from "../../common/Component";
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
    baseComponent: Component;
    components: Combination<Component>;
    alchemyFormula: AlchemyFormula;
    alchemicalCombiner: AlchemicalCombiner<AlchemicalCombination>;
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
            detail: this._reason,
            consumed: Combination.EMPTY()
        });
    }

}

class DefaultAlchemyAttempt implements AlchemyAttempt {

    private readonly _baseComponent: Component;
    private readonly _alchemicalCombiner: AlchemicalCombiner<AlchemicalCombination>;
    private readonly _alchemyFormula: AlchemyFormula;
    private readonly _components: Combination<Component>;
    private readonly _alchemyConstraintEnforcer: AlchemyConstraintEnforcer;
    private readonly _componentConsumptionCalculator: ComponentConsumptionCalculator;

    constructor(config: AlchemyAttemptConfig) {
        this._components = config.components;
        this._baseComponent = config.baseComponent;
        this._alchemyFormula = config.alchemyFormula;
        this._alchemicalCombiner = config.alchemicalCombiner;
        this._alchemyConstraintEnforcer = config.alchemyConstraintEnforcer;
        this._componentConsumptionCalculator = config.componentConsumptionCalculator;
    }

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): AlchemyResult {
        const consumed = this._componentConsumptionCalculator.calculate(this._components);

        const componentConstraintCheck: ConstraintCheck = this._alchemyConstraintEnforcer.checkComponents(this._components.size);
        if (!componentConstraintCheck.isOk) {
            return new UnsuccessfulAlchemyResult({
                detail: componentConstraintCheck.detail,
                consumed: consumed
            });
        }

        const craftingCheckResult: CraftingCheckResult = craftingCheck.perform(actor, this._components);
        if (!craftingCheckResult.isSuccessful) {
            return new UnsuccessfulAlchemyResult({
                detail: craftingCheckResult.describe(),
                consumed: consumed
            });
        }

        const matchingEffects: AlchemicalEffect<AlchemicalCombination>[] = this._alchemyFormula.getEffectsForComponents(this._components);

        const effectConstraintCheck: ConstraintCheck = this._alchemyConstraintEnforcer.checkEffectMatches(matchingEffects.length);
        if (!effectConstraintCheck.isOk) {
            return new UnsuccessfulAlchemyResult({
                detail: effectConstraintCheck.detail,
                consumed: consumed
            });
        }

        const alchemicalEffect: AlchemicalCombination = this._alchemicalCombiner.mix(matchingEffects);

        return new SuccessfulAlchemyResult({
            consumed: consumed,
            baseComponent: this._baseComponent,
            detail: `Alchemy success! ${matchingEffects.length} effects were applied to the ${this._baseComponent.name}. `,
            alchemicalEffect: alchemicalEffect
        });

    }

}

export { AlchemyAttempt, DefaultAlchemyAttempt, AbandonedAlchemyAttempt, AlchemyConstraints, BoundedNumber, DefaultAlchemyConstraintEnforcer }