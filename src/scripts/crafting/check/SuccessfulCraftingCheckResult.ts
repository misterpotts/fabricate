import {CraftingCheckResult} from "./CraftingCheckResult";

interface SuccessfulCraftingCheckResultConfig {
    expression: string;
    result: number;
    successThreshold: number;
}

class SuccessfulCraftingCheckResult implements CraftingCheckResult {
    private readonly _expression: string;
    private readonly _result: number;
    private readonly _successThreshold: number;

    constructor(config: SuccessfulCraftingCheckResultConfig) {
        this._expression = config.expression;
        this._result = config.result;
        this._successThreshold = config.successThreshold;
    }

    get isSuccessful(): boolean {
        return true;
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

    describe(): string {
        return `The crafting check was a success! You needed ${this._successThreshold} or higher, but rolled ${this.result}. `;
    }

}

export {SuccessfulCraftingCheckResultConfig, SuccessfulCraftingCheckResult};