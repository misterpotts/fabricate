import {ComponentSelection} from "./ComponentSelection";
import {Recipe} from "../crafting/Recipe";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

interface CompleteComponentSelectionConfig {
    recipe: Recipe;
    components: Combination<CraftingComponent>;
}

class CompleteComponentSelection implements ComponentSelection {

    private readonly _recipe: Recipe;
    private readonly _components: Combination<CraftingComponent>;

    constructor(config: CompleteComponentSelectionConfig) {
        this._recipe = config.recipe;
        this._components = config.components;
    }

    isSufficient(): boolean {
        return true;
    }

    describe(): string {
        const componentsDescription = Array.from(this._components.amounts.values())
            .map(unit => `${unit.quantity} ${unit.part.name}`)
            .join(", ");
        return `${this._recipe.name} will use ${componentsDescription}. `;
    }

    get recipe(): Recipe {
        return undefined;
    }

    get components(): Combination<CraftingComponent> {
        return this._components;
    }

}

export {CompleteComponentSelection}