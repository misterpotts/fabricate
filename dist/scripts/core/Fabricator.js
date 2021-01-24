class Fabricator {
    constructor(...actors) {
        this.ingredientSources = actors;
    }
    craft(recipe) {
        // look for ingredient(s) as items in actor inventory
        // remove items
        // create result(s) and add to actor inventory
    }
    ;
}
export { Fabricator };
