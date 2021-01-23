import {Recipe} from "./Recipe";

class CraftingSystem {
    private name: String;
    private recipes: Recipe[];

    constructor(name:String) {
        this.name = name;
    }
}

export { CraftingSystem };