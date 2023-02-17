import {ComponentSelection} from "./ComponentSelection";
import {Recipe} from "../common/Recipe";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

class CompleteComponentSelection implements ComponentSelection {

    private readonly _components: Combination<CraftingComponent>;

    constructor({
        components
    }: {
        components: Combination<CraftingComponent>;
    }) {
        this._components = components;
    }

    isSufficient(): boolean {
        return true;
    }

    get recipe(): Recipe {
        return undefined;
    }

    get components(): Combination<CraftingComponent> {
        return this._components;
    }

}

export {CompleteComponentSelection}