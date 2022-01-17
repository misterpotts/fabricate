import { OutcomeType } from '../core/OutcomeType';

class CraftingCheckResult {
  private readonly _outcome: OutcomeType;
  private readonly _expression: string;
  private readonly _result: number;
  private readonly _successThreshold: number;

  constructor(outcome: OutcomeType, expression: string, result: number, successThreshold: number) {
    this._outcome = outcome;
    this._expression = expression;
    this._result = result;
    this._successThreshold = successThreshold;
  }

  get outcome(): OutcomeType {
    return this._outcome;
  }

  get expression(): string {
    return this._expression;
  }

  get result(): number {
    return this._result;
  }

  get successThreshold(): number {
    return this._successThreshold;
  }
}

export { CraftingCheckResult };
