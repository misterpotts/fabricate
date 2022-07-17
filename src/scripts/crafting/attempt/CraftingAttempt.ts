import {
    CraftingResult,
    NoCraftingResult,
    SuccessfulCraftingResult,
    UnsuccessfulCraftingResult
} from "../result/CraftingResult";
import {CraftingCheck} from "../check/CraftingCheck";
import {Recipe} from "../Recipe";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingCheckResult} from "../check/CraftingCheckResult";

interface CraftingAttempt {

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): CraftingResult;

}

export {CraftingAttempt}

interface WastefulCraftingAttemptConfig {
    recipe: Recipe;
    components: Combination<CraftingComponent>;
}

class WastefulCraftingAttempt implements CraftingAttempt {

    private readonly _recipe: Recipe;
    private readonly _components: Combination<CraftingComponent>;

    constructor(config: WastefulCraftingAttemptConfig) {
        this._recipe = config.recipe;
        this._components = config.components;
    }

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): CraftingResult {
        const craftingCheckResult: CraftingCheckResult = craftingCheck.perform(actor, this._components);
        if (!craftingCheckResult.isSuccessful) {
            return new UnsuccessfulCraftingResult({
                checkResult: craftingCheckResult,
                consumed: this._components,
                recipe: this._recipe
            });
        }
        return new SuccessfulCraftingResult({
            checkResult: craftingCheckResult,
            created: this._recipe.results,
            consumed: this._components,
            recipe: this._recipe
        });
    }

}

export {WastefulCraftingAttempt};

interface GenerousCraftingAttemptConfig {
    recipe: Recipe;
    components: Combination<CraftingComponent>;
}

class GenerousCraftingAttempt implements CraftingAttempt {

    private readonly _recipe: Recipe;
    private readonly _components: Combination<CraftingComponent>;

    constructor(config: GenerousCraftingAttemptConfig) {
        this._recipe = config.recipe;
        this._components = config.components;
    }

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): CraftingResult {
        const craftingCheckResult: CraftingCheckResult = craftingCheck.perform(actor, this._components);
        if (!craftingCheckResult.isSuccessful) {
            return new UnsuccessfulCraftingResult({
                checkResult: craftingCheckResult,
                consumed: Combination.EMPTY(),
                recipe: this._recipe
            });
        }
        return new SuccessfulCraftingResult({
            checkResult: craftingCheckResult,
            created: this._recipe.results,
            consumed: this._components,
            recipe: this._recipe
        });
    }

}

export {GenerousCraftingAttempt};

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

    /**
     * AbandonedCraftingAttempt is a no-op implementation of CraftingAttempt. It should not operate on this function's
     * arguments
     * */
    // @ts-ignore
    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): CraftingResult {
        return new NoCraftingResult({
            detail: this.getResultDetail()
        });
    }

    private getResultDetail(): string {
        return `Unable to craft ${this._recipe.name}. ${this._reason}. `;
    }

}

export {AbandonedCraftingAttempt};
export {AbandonedCraftingAttemptConfig};