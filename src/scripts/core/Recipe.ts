import {RecipeComponent} from "./RecipeComponent.js";

class Recipe {
    private readonly _components: RecipeComponent[];
    private readonly _results: Item[];
    private readonly _name: String;

    constructor(builder: Recipe.RecipeBuilder) {
        this._components = builder.components;
        this._results = builder.results;
        this._name = builder.name;
    }

    get name(): String {
        return this._name;
    }

    get components(): RecipeComponent[] {
        return this._components;
    }

    get results(): Item[] {
        return this._results;
    }

    public static builder() {
        return new Recipe.RecipeBuilder();
    }
}

namespace Recipe {
    export class RecipeBuilder {
        public components: RecipeComponent[];
        public results: Item[];
        public name: String;

        constructor() {
            this.components = [];
            this.results = [];
        }

        public build() {
            return new Recipe(this);
        }

        withName(value: String) {
            this.name = value;
            return this;
        }

        withComponent(value: RecipeComponent) {
            this.components.push(value);
            return this;
        }

        withResult(value: Item) {
            this.results.push(value);
            return this;
        }
    }
}

export { Recipe };