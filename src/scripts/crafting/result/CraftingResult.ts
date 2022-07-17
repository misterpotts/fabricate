import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingChatMessage, IconType} from "../../interface/CraftingChatMessage";
import {Recipe} from "../Recipe";
import {CraftingCheckResult} from "../check/CraftingCheckResult";

interface CraftingResult {

    consumed: Combination<CraftingComponent>;
    created: Combination<CraftingComponent>;
    describe(): CraftingChatMessage;

}

export { CraftingResult }

interface NoCraftingResultConfig {

    detail: string

}

class NoCraftingResult implements CraftingResult {

    private readonly _detail: string;

    constructor(config: NoCraftingResultConfig) {
        this._detail = config.detail;
    }

    get created(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    get consumed(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

    describe(): CraftingChatMessage {
        return new CraftingChatMessage({
            title: "Crafting not attempted",
            description: this._detail,
            iconType: IconType.FAILURE
        });
    }

}

export {NoCraftingResult};

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

export {SuccessfulCraftingResult};

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

export {UnsuccessfulCraftingResult};