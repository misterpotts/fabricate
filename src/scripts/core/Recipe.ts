import {RecipeComponent} from "./RecipeComponent";
import {CraftingResult} from "./CraftingResult";
import {FabricateFlags, FabricateItemType} from "./FabricateFlags";

class Recipe {
    private readonly _components: RecipeComponent[];
    private readonly _results: CraftingResult[];
    private readonly _name: string;
    private readonly _itemId: string;

    constructor(builder: Recipe.Builder) {
        this._components = builder.components;
        this._results = builder.results;
        this._name = builder.name;
        this._itemId = builder.itemId;
    }

    public static fromFabricateFlags(fabricateFlags: FabricateFlags): Recipe {
        if (fabricateFlags.type !== FabricateItemType.RECIPE) {
            throw new Error(`Error attempting to instantiate a Fabricate Recipe from ${fabricateFlags.type} data. `);
        }
        return new Recipe(fabricateFlags.recipe);
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
        return new Recipe.Builder();
    }
}

namespace Recipe {
    export class Builder {
        public components: RecipeComponent[] = [];
        public results: CraftingResult[] = [];
        public name!: string;
        public itemId!: string;

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