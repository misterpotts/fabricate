import {CraftingResult} from "./CraftingResult";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Combination} from "../../common/Combination";
import {CraftingChatMessage, IconType} from "../../interface/CraftingChatMessage";
import {Recipe} from "../Recipe";
import {CraftingCheckResult} from "../check/CraftingCheckResult";

interface UnsuccessfulCraftingResultConfig {

    recipe: Recipe;
    consumed: Combination<CraftingComponent>;
    checkResult: CraftingCheckResult;

}

class UnsuccessfulCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _checkResult: CraftingCheckResult;

    constructor(config: UnsuccessfulCraftingResultConfig) {
        this._recipe = config.recipe;
        this._consumed = config.consumed;
        this._checkResult = config.checkResult;
    }

    get created(): Combination<CraftingComponent> {
        return Combination.EMPTY<CraftingComponent>();
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            iconType: IconType.FAILURE,
            description: `Failed to craft ${this._recipe.name}. Rolled a ${this._checkResult.result}, but needed a ${this._checkResult.successThreshold}. `
        });
    }

}

export { UnsuccessfulCraftingResult }