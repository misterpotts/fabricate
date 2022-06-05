import {ComponentSelection} from "./ComponentSelection";
import {Recipe} from "../crafting/Recipe";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

interface IncompleteComponentSelectionConfig {
    recipe: Recipe;
    reason: string;
}

class IncompleteComponentSelection implements ComponentSelection {

    private readonly _recipe: Recipe;
    private readonly _reason: string;

    constructor(config: IncompleteComponentSelectionConfig) {
        this._recipe = config.recipe;
        this._reason = config.reason;
    }

    isSufficient(): boolean {
        return false;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    describe(): string {
        return `You don't have enough components to craft ${this._recipe.name}, because ${this._reason}. `;
    }

    get components(): Combination<CraftingComponent> {
        return Combination.EMPTY();
    }

}

export {IncompleteComponentSelection}