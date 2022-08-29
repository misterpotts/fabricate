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

    private readonly _unmodifiedRollExpression: string;

    constructor(unmodifiedRollExpression: string) {
        this._unmodifiedRollExpression = unmodifiedRollExpression;
    }

    public createUnmodifiedRoll(): Roll {
        return new Roll(this._unmodifiedRollExpression);
    }

    public evaluate(roll: Roll, modifiers?: RollTerm[]): RollResult {
        if (!modifiers || modifiers.length === 0) {
            const rollResult: Evaluated<Roll> = roll.roll({ async: false });
            return new RollResult(rollResult.total, rollResult.result);
        }
        const preparedModifiers = modifiers
            .flatMap((rollTerm: RollTerm) => [rollTerm, new OperatorTerm({ operator: "+" })]);
        const modifiedRoll = this.combine(roll, Roll.fromTerms(preparedModifiers));
        const rollResult: Evaluated<Roll> = modifiedRoll.roll({ async: false });
        return new RollResult(rollResult.total, rollResult.result);
    }

    public multiply(input: string | Roll, factor: number): Roll {
        if (typeof input === "string") {
            const roll: Roll = new Roll(input, {});
            return roll.alter(factor, 0);
        }
        return input.alter(factor, 0);
    }

    fromExpression(expression: string): Roll {
        return new Roll(expression);
    }

    combine(left: Roll, right: Roll) {
        const simplifiedTerms: RollTerm[] = Roll.simplifyTerms(left.terms.concat(right.terms));
        return Roll.fromTerms(simplifiedTerms);
    }

}

export {DiceRoller, RollResult}