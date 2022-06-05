import {CraftingAttempt} from "./CraftingAttempt";
import {CraftingCheck} from "../check/CraftingCheck";
import {Recipe} from "../Recipe";
import {CraftingResult} from "../result/CraftingResult";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {SuccessfulCraftingResult} from "../result/SuccessfulCraftingResult";
import {UnsuccessfulCraftingResult} from "../result/UnsuccessfulCraftingResult";
import {CraftingCheckResult} from "../check/CraftingCheckResult";

interface GenerousCraftingAttemptConfig {
    recipe: Recipe;
    components: Combination<CraftingComponent>;
    craftingCheck: CraftingCheck<Actor>;
    actor: Actor;
}


class GenerousCraftingAttempt implements CraftingAttempt {

    private readonly _recipe: Recipe;
    private readonly _components: Combination<CraftingComponent>;
    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _actor: Actor;

    constructor(config: GenerousCraftingAttemptConfig) {
        this._recipe = config.recipe;
        this._components = config.components;
        this._craftingCheck = config.craftingCheck;
        this._actor = config.actor;
    }

    perform(): CraftingResult {
        const craftingCheckResult: CraftingCheckResult = this._craftingCheck.perform(this._actor, this._components);
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

export {GenerousCraftingAttempt}