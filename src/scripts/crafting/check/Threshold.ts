import {RollResult} from "../../foundry/DiceRoller";
import {OutcomeType} from "../result/OutcomeType";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ContributionCounter} from "./ContributionCounter";

enum ThresholdType {
    MEET,
    EXCEED
}

interface Threshold {

    target: number;

    test(rollResult: RollResult): OutcomeType;

}

class ExclusiveThreshold implements Threshold {

    private readonly _floor: number;

    constructor(floor: number) {
        this._floor = floor;
    }

    test(rollResult: RollResult): OutcomeType {
        if (rollResult.value > this._floor) {
            return OutcomeType.SUCCESS;
        }
        return OutcomeType.FAILURE;
    }

    get target(): number {
        return this._floor + 1;
    }

}

class InclusiveThreshold implements Threshold {

    private readonly _target: number;

    constructor(target: number) {
        this._target = target;
    }

    test(rollResult: RollResult): OutcomeType {
        if (rollResult.value >= this._target) {
            return OutcomeType.SUCCESS;
        }
        return OutcomeType.FAILURE;
    }

    get target(): number {
        return this._target;
    }

}

export {ThresholdType, InclusiveThreshold, ExclusiveThreshold, Threshold};

interface ThresholdCalculator {

    calculateFor(components: Combination<CraftingComponent>): Threshold;

}

interface ThresholdCalculatorConfig {
    baseValue: number;
    thresholdType: ThresholdType;
    contributionCounter: ContributionCounter;
}

class DefaultThresholdCalculator implements ThresholdCalculator {

    private readonly _baseValue: number;
    private readonly _thresholdType: ThresholdType;
    private readonly _contributionCounter: ContributionCounter;

    constructor(config: ThresholdCalculatorConfig) {
        this._baseValue = config.baseValue;
        this._thresholdType = config.thresholdType;
        this._contributionCounter = config.contributionCounter;
    }

    calculateFor(components: Combination<CraftingComponent>): Threshold {
        const dcModifier: number = this._contributionCounter.determineDCModifier(components);
        const thresholdValue: number = dcModifier + this._baseValue;
        switch (this._thresholdType) {
            case ThresholdType.EXCEED:
                return new ExclusiveThreshold(thresholdValue);
            case ThresholdType.MEET:
                return new InclusiveThreshold(thresholdValue);
        }
    }

}

export {DefaultThresholdCalculator};
export {ThresholdCalculatorConfig};
export {ThresholdCalculator};