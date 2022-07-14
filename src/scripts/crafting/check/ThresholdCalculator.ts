import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ExclusiveThreshold, InclusiveThreshold, Threshold, ThresholdType} from "./Threshold";
import {ContributionCounter} from "./ContributionCounter";

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

export {ThresholdCalculator, ThresholdCalculatorConfig, DefaultThresholdCalculator};