class Recipe {
    constructor(builder) {
        this._components = builder.components;
        this._results = builder.results;
        this._name = builder.name;
        this._itemId = builder.itemId;
    }
    get name() {
        return this._name;
    }
    get components() {
        return this._components;
    }
    get results() {
        return this._results;
    }
    get itemId() {
        return this._itemId;
    }
    static builder() {
        return new Recipe.RecipeBuilder();
    }
}
(function (Recipe) {
    class RecipeBuilder {
        constructor() {
            this.components = [];
            this.results = [];
        }
        build() {
            return new Recipe(this);
        }
        withName(value) {
            this.name = value;
            return this;
        }
        withComponent(value) {
            this.components.push(value);
            return this;
        }
        withResult(value) {
            this.results.push(value);
            return this;
        }
        withResults(value) {
            this.results = value;
            return this;
        }
        withItemId(value) {
            this.itemId = value;
            return this;
        }
    }
    Recipe.RecipeBuilder = RecipeBuilder;
})(Recipe || (Recipe = {}));
export { Recipe };
