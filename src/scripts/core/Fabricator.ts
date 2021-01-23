import {Recipe} from "./Recipe";

class Fabricator {
    private ingredientSources: Object[];

    constructor(...actors: Object[]) {
        this.ingredientSources = actors;
    }

    public craft(recipe:Recipe) {
        // look for ingredient(s) as items in actor inventory
        // remove items
        // create result(s) and add to actor inventory
    };
}

export { Fabricator };