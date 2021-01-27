import {RecipeComponent} from "./RecipeComponent";
import {CraftingResult} from "./CraftingResult";

class Recipe {
    private readonly _components: RecipeComponent[];
    private readonly _results: CraftingResult[];
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

    get results(): CraftingResult[] {
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
        public results: CraftingResult[];
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

        withResult(value: CraftingResult) {
            this.results.push(value);
            return this;
        }

        withResults(value: CraftingResult[]) {
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