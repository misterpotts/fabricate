import {CraftingResult} from "./CraftingResult";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingChatMessage, IconType} from "../../interface/CraftingChatMessage";
import {Recipe} from "../Recipe";
import {CraftingCheckResult} from "../check/CraftingCheckResult";

interface SuccessfulCraftingResultConfig {

    recipe: Recipe;
    consumed: Combination<CraftingComponent>;
    created: Combination<CraftingComponent>;
    checkResult: CraftingCheckResult;

}

class SuccessfulCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _created: Combination<CraftingComponent>;
    private readonly _checkResult?: CraftingCheckResult;

    constructor(config: SuccessfulCraftingResultConfig) {
        this._recipe = config.recipe;
        this._consumed = config.consumed;
        this._created = config.created;
        this._checkResult = config.checkResult;
    }

    get consumed(): Combination<CraftingComponent> {
        return this._consumed;
    }

    get created(): Combination<CraftingComponent> {
        return this._created;
    }

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            iconType: IconType.RANDOM,
            consumedItems: this._consumed,
            createdItems: this._created,
            description: `Successfully crafted ${this._recipe.name}. Rolled a ${this._checkResult.result}, needed a ${this._checkResult.successThreshold}. `
        });
    }

}

export { SuccessfulCraftingResult }