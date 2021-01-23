import {Recipe} from "./Recipe.js";

class CraftingSystem {
    private name: String;
    private recipes: Recipe[];

    constructor(name:String) {
        this.name = name;
    }
}

export { CraftingSystem };