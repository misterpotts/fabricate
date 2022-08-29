import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {
    CraftingCheckResult,
    FailedCraftingCheckResult,
    NoCraftingCheckResult,
    SuccessfulCraftingCheckResult
} from "./CraftingCheckResult";
import {DiceRoller} from "../../foundry/DiceRoller";
import {OutcomeType} from "../result/OutcomeType";
import {ThresholdCalculator} from "./Threshold";
import {GameSystemRollModifierProvider} from "./GameSystemRollModifierProvider";

interface CraftingCheck<A extends Actor> {

    perform(actor: A, components: Combination<CraftingComponent>): CraftingCheckResult;

}

interface CraftingCheckConfig<A extends Actor> {
    diceRoller: DiceRoller;
    gameSystemRollModifierProvider: GameSystemRollModifierProvider<A>;
    thresholdCalculator: ThresholdCalculator;
}

class DefaultCraftingCheck<A extends Actor> implements CraftingCheck<A> {

    private readonly _diceRoller: DiceRoller;
    private readonly _gameSystemRollModifierProvider: GameSystemRollModifierProvider<A>;
    private readonly _thresholdCalculator: ThresholdCalculator;

    constructor(craftingCheckConfig: CraftingCheckConfig<A>) {
        this._diceRoller = craftingCheckConfig.diceRoller;
        this._gameSystemRollModifierProvider = craftingCheckConfig.gameSystemRollModifierProvider;
        this._thresholdCalculator = craftingCheckConfig.thresholdCalculator;
    }

    perform(actor: A, components: Combination<CraftingComponent>): CraftingCheckResult {

        const roll = this._diceRoller.createUnmodifiedRoll();
        const modifiers = this._gameSystemRollModifierProvider.getForActor(actor);
        const rollResult = this._diceRoller.evaluate(roll, modifiers);
        const threshold = this._thresholdCalculator.calculateFor(components);
        const outcome = threshold.test(rollResult);

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

    constructor() {}

    perform(_actor: Actor, _components: Combination<CraftingComponent>): CraftingCheckResult {
        return new NoCraftingCheckResult();
    }

}

export {NoCraftingCheck};