import {CraftingAttempt} from "./CraftingAttempt";
import {CraftingResult} from "../result/CraftingResult";
import {NoCraftingResult} from "../result/NoCraftingResult";
import {Recipe} from "../Recipe";

interface AbandonedCraftingAttemptConfig {
    recipe: Recipe;
    reason: string;
}

class AbandonedCraftingAttempt implements CraftingAttempt {

    private readonly _reason: string;
    private readonly _recipe: Recipe;

    constructor(config: AbandonedCraftingAttemptConfig) {
        this._reason = config.reason;
        this._recipe = config.recipe;
    }

    perform(): CraftingResult {
        return new NoCraftingResult({
            detail: this.getResultDetail()
        });
    }

    private getResultDetail(): string {
        return `Unable to craft ${this._recipe.name}. ${this._reason}. `;
    }

}

export {AbandonedCraftingAttempt, AbandonedCraftingAttemptConfig}