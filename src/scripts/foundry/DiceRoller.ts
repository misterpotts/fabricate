import {Evaluated} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/client/dice/roll";

class RollResult {
    private readonly _value: number;
    private readonly _expression: string;

    constructor(value: number, expression: string) {
        this._value = value;
        this._expression = expression;
    }

    get value(): number {
        return this._value;
    }

    get expression(): string {
        return this._expression;
    }

}

class DiceRoller {

    public evaluate(roll: Roll): RollResult {
        const rollResult: Evaluated<Roll> = roll.roll({ async: false });
        return new RollResult(rollResult.total, rollResult.result);
    }

    public multiply(expression: string, factor: number): string {
        const roll: Roll = new Roll(expression, {});
        return roll.alter(factor, 0).formula;
    }

}

export {DiceRoller, RollResult}