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

    public roll(termData: DiceTerm.TermData): RollResult {
        const die: Die = new Die(termData);
        const roll: DiceTerm.Result = die.roll();
        return new RollResult(roll.result, die.expression);
    }

}

export {DiceRoller, RollResult}