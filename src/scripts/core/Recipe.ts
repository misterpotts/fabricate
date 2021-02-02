import {Ingredient} from "./Ingredient";
import {CraftingResult} from "./CraftingResult";
import {FabricateFlags, FabricateItemType} from "./FabricateFlags";

class Recipe {
    private readonly _components: Ingredient[];
    private readonly _results: CraftingResult[];
    private readonly _name: string;
    private readonly _itemId: string;

    constructor(builder: Recipe.Builder) {
        this._components = builder.ingredients;
        this._results = builder.results;
        this._name = builder.name;
        this._itemId = builder.itemId;
    }

    public static fromFlags(flags: FabricateFlags): Recipe {
        if (flags.type !== FabricateItemType.RECIPE) {
            throw new Error(`Error attempting to instantiate a Fabricate Recipe from ${flags.type} data. `);
        }
        return Recipe.builder()
            .withName(flags.recipe.name)
            .withItemId(flags.recipe.itemId)
            .withResults(CraftingResult.manyFromFlags(flags.recipe.results))
            .withIngredients(Ingredient.manyFromFlags(flags.recipe.ingredients))
            .build();
    }

    get name(): string {
        return this._name;
    }

    get components(): Ingredient[] {
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
        public ingredients: Ingredient[] = [];
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

        withIngredient(value: Ingredient) {
            this.ingredients.push(value);
            return this;
        }

        withIngredients(value: Ingredient[]) {
            this.ingredients.push(...value);
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