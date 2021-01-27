class CraftingSystem {
    constructor(builder) {
        this._name = builder.name;
        this._compendiumPackKey = builder.compendiumPackKey;
        this._fabricator = builder.fabricator;
        this._supportedGameSystems = builder.supportedGameSystems;
        this._recipes = builder.recipes;
    }
    static builder() {
        return new CraftingSystem.Builder();
    }
    getFirstRecipeByName(name) {
        return this._recipes.find((recipe) => { return recipe.name === name; });
    }
    get name() {
        return this._name;
    }
    craft(actor, recipe) {
        if (!this.componentsOwnedBy(actor, recipe)) {
            return;
        }
        this.consumeComponentsFrom(actor, recipe.components);
        let results = this.fabricator.fabricate();
        this.addResultsTo(actor, results);
    }
    get compendiumPackKey() {
        return this._compendiumPackKey;
    }
    get fabricator() {
        return this._fabricator;
    }
    get supportedGameSystems() {
        return this._supportedGameSystems;
    }
    get recipes() {
        return this._recipes;
    }
    get includedItems() {
        return this._includedItems;
    }
    supports(gameSystem) {
        if (!this._supportedGameSystems || this._supportedGameSystems.length == 0) {
            return true;
        }
        return this._supportedGameSystems.indexOf(gameSystem) > -1;
    }
    componentsOwnedBy(actor, recipe) {
        let consumables = actor.data.items.filter(i => i.type == 'consumable');
        return recipe.components.every((component) => {
            console.log(component.ingredient.name);
            console.log(consumables);
        });
        return true;
    }
    consumeComponentsFrom(actor, components) {
        let consumables = actor.data.items.filter(i => i.type == 'consumable');
        components.forEach((recipeComponent) => {
            console.log(recipeComponent.ingredient.name);
            console.log(consumables);
        });
    }
    addResultsTo(actor, results) {
    }
}
(function (CraftingSystem) {
    class Builder {
        constructor() {
            this.supportedGameSystems = [];
            this.recipes = [];
        }
        withName(value) {
            this.name = value;
            return this;
        }
        withCompendiumPackKey(value) {
            this.compendiumPackKey = value;
            return this;
        }
        withFabricator(value) {
            this.fabricator = value;
            return this;
        }
        withSupportedGameSystems(value) {
            this.supportedGameSystems = value;
            return this;
        }
        withSupportedGameSystem(value) {
            this.supportedGameSystems.push(value);
            return this;
        }
        withRecipes(value) {
            this.recipes = value;
            return this;
        }
        withRecipe(value) {
            this.recipes.push(value);
            return this;
        }
        build() {
            return new CraftingSystem(this);
        }
    }
    CraftingSystem.Builder = Builder;
})(CraftingSystem || (CraftingSystem = {}));
export { CraftingSystem };
