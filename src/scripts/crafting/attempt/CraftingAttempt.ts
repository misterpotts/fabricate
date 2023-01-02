import {
    CraftingResult,
    NoCraftingResult,
    SuccessfulCraftingResult,
    UnsuccessfulCraftingResult
} from "../result/CraftingResult";
import {CraftingCheck} from "../check/CraftingCheck";
import {Recipe} from "../Recipe";
import {Combination} from "../../common/Combination";
import {CraftingCheckResult} from "../check/CraftingCheckResult";
import {CraftingComponent} from "../../common/CraftingComponent";

interface CraftingAttempt {

    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): CraftingResult;

}

export {CraftingAttempt}

class WastefulCraftingAttempt implements CraftingAttempt {

    private readonly _recipe: Recipe;
    private readonly _components: Combination<CraftingComponent>;

    constructor({
        recipe,
        components
    }: {
        recipe: Recipe;
        components: Combination<CraftingComponent>;
    }) {
        this._recipe = recipe;
        this._components = components;
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
            created: this._recipe.getSelectedResults(),
            consumed: this._components,
            recipe: this._recipe
        });
    }

}

export {WastefulCraftingAttempt};

class GenerousCraftingAttempt implements CraftingAttempt {

    private readonly _recipe: Recipe;
    private readonly _components: Combination<CraftingComponent>;

    constructor({
        recipe,
        components
    }: {
        recipe: Recipe;
        components: Combination<CraftingComponent>;
    }) {
        this._recipe = recipe;
        this._components = components;
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
            created: this._recipe.getSelectedResults(),
            consumed: this._components,
            recipe: this._recipe
        });
    }

}

export {GenerousCraftingAttempt};

class AbandonedCraftingAttempt implements CraftingAttempt {

    private readonly _recipe: Recipe;

    constructor({
        recipe
    }: {
        recipe: Recipe;
    }) {
        this._recipe = recipe;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    /**
     * AbandonedCraftingAttempt is a no-op implementation of CraftingAttempt. It should not operate on this function's
     * arguments
     * */
    // @ts-ignore
    perform(actor: Actor, craftingCheck: CraftingCheck<Actor>): CraftingResult {
        return new NoCraftingResult();
    }

}

export {AbandonedCraftingAttempt};