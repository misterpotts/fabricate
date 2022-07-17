import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {
    CraftingCheckResult,
    FailedCraftingCheckResult,
    NoCraftingCheckResult,
    SuccessfulCraftingCheckResult
} from "./CraftingCheckResult";
import {DiceRoller, RollResult} from "../../foundry/DiceRoller";
import {OutcomeType} from "../result/OutcomeType";
import {Threshold, ThresholdCalculator} from "./Threshold";
import {RollTermProvider} from "./RollTermProvider";

interface CraftingCheck<A extends Actor> {

    perform(actor: A, components: Combination<CraftingComponent>): CraftingCheckResult;

}

interface CraftingCheckConfig<A extends Actor> {
    diceRoller: DiceRoller;
    rollTermProvider: RollTermProvider<A>;
    thresholdCalculator: ThresholdCalculator;
}

class DefaultCraftingCheck<A extends Actor> implements CraftingCheck<A> {

    private readonly _diceRoller: DiceRoller;
    private readonly _rollTermProvider: RollTermProvider<A>;
    private readonly _thresholdCalculator: ThresholdCalculator;

    constructor(craftingCheckConfig: CraftingCheckConfig<A>) {
        this._diceRoller = craftingCheckConfig.diceRoller;
        this._rollTermProvider = craftingCheckConfig.rollTermProvider;
        this._thresholdCalculator = craftingCheckConfig.thresholdCalculator;
    }

    perform(actor: A, components: Combination<CraftingComponent>): CraftingCheckResult {

        const dieData: DiceTerm.TermData = this._rollTermProvider.getFor(actor);
        const rollResult: RollResult = this._diceRoller.roll(dieData);
        const threshold: Threshold = this._thresholdCalculator.calculateFor(components);
        const outcome: OutcomeType = threshold.test(rollResult);

        switch (outcome) {
            case OutcomeType.FAILURE:
                return new FailedCraftingCheckResult({
                    expression: rollResult.expression,
                    result: rollResult.value,
                    successThreshold: threshold.target
                });
            case OutcomeType.SUCCESS:
                return new SuccessfulCraftingCheckResult({
                    expression: rollResult.expression,
                    result: rollResult.value,
                    successThreshold: threshold.target
                });
            default:
                return new NoCraftingCheckResult();
        }

    }

}

export {CraftingCheck, CraftingCheckConfig, DefaultCraftingCheck}

class NoCraftingCheck implements CraftingCheck<Actor> {

    constructor() {
    }

    // @ts-ignore This no-op implementation does not need to use variables passed to the implementation of perform
    perform(actor: Actor, components: Combination<CraftingComponent>): CraftingCheckResult {
        return new NoCraftingCheckResult();
    }

}

export {NoCraftingCheck};