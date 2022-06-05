import {CraftingResult} from "./CraftingResult";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {CraftingChatMessage, IconType} from "../../interface/CraftingChatMessage";
import {Recipe} from "../Recipe";

interface UncheckedCraftingResultConfig {

    recipe: Recipe;
    consumed: Combination<CraftingComponent>;
    created: Combination<CraftingComponent>;

}

class UncheckedCraftingResult implements CraftingResult {

    private readonly _recipe: Recipe;
    private readonly _consumed: Combination<CraftingComponent>;
    private readonly _created: Combination<CraftingComponent>;

    constructor(config: UncheckedCraftingResultConfig) {
        this._recipe = config.recipe;
        this._consumed = config.consumed;
        this._created = config.created;
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
            description: `Crafted ${this._recipe.name}. `
        });
    }

}

export { UncheckedCraftingResult }