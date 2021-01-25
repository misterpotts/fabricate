import {RecipeComponent} from "./RecipeComponent.js";
import {RecipeResult} from "./RecipeResult";

class Recipe {
    private readonly _components: RecipeComponent[];
    private readonly _results: RecipeResult[];
    private readonly _name: string;
    private readonly _itemId: string;

    constructor(builder: Recipe.RecipeBuilder) {
        this._components = builder.components;
        this._results = builder.results;
        this._name = builder.name;
        this._itemId = builder.itemId;
    }

    get name(): string {
        return this._name;
    }

    get components(): RecipeComponent[] {
        return this._components;
    }

    get results(): RecipeResult[] {
        return this._results;
    }


    get itemId(): string {
        return this._itemId;
    }

    public static builder() {
        return new Recipe.RecipeBuilder();
    }
}

namespace Recipe {
    export class RecipeBuilder {
        public components: RecipeComponent[];
        public results: RecipeResult[];
        public name: string;
        public itemId: string;

        constructor() {
            this.components = [];
            this.results = [];
        }

        public build() {
            return new Recipe(this);
        }

        withName(value: string) {
            this.name = value;
            return this;
        }

        withComponent(value: RecipeComponent) {
            this.components.push(value);
            return this;
        }

        withResult(value: RecipeResult) {
            this.results.push(value);
            return this;
        }

        withResults(value: RecipeResult[]) {
            this.results = value;
            return this;
        }

        withItemId(value: string) {
            this.itemId = value;
            return this;
        }
    }
}

export {Recipe};