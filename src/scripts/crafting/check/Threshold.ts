import {RollResult} from "../../foundry/DiceRoller";
import {OutcomeType} from "../../core/OutcomeType";

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