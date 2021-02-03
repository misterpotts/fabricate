import {Ingredient} from "./Ingredient";
import {CraftingResult} from "./CraftingResult";
import {FabricateFlags, FabricateItemType} from "./FabricateFlags";

class Recipe {
    private readonly _components: Ingredient[];
    private readonly _results: CraftingResult[];
    private readonly _name: string;
    private readonly _entryId: string;

    constructor(builder: Recipe.Builder) {
        this._components = builder.ingredients;
        this._results = builder.results;
        this._name = builder.name;
        this._entryId = builder.entryId;
    }

    public static fromFlags(flags: FabricateFlags): Recipe {
        if (flags.type !== FabricateItemType.RECIPE) {
            throw new Error(`Error attempting to instantiate a Fabricate Recipe from ${flags.type} data. `);
        }
        return Recipe.builder()
            .withName(flags.recipe.name)
            .withEntryId(flags.recipe.entryId)
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


    get entryId(): string {
        return this._entryId;
    }

    public static builder() {
        return new Recipe.Builder();
    }

    isValid(): boolean {
        const nameValid = this.name != null && this.name.length > 0;
        const idValid = this.entryId != null && this.entryId.length > 0;
        let ingredientsValid = true;
        this.components.forEach((ingredient: Ingredient) => {
            if (!ingredient.isValid()) {
                ingredientsValid = false;
            }
        });
        let resultsValid = true;
        this.results.forEach((result: CraftingResult) => {
            if (!result.isValid()) {
                resultsValid = false;
            }
        });
        return nameValid && idValid && ingredientsValid && resultsValid;
    }
}

namespace Recipe {
    export class Builder {
        public ingredients: Ingredient[] = [];
        public results: CraftingResult[] = [];
        public name!: string;
        public entryId!: string;

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

        withEntryId(value: string) {
            this.entryId = value;
            return this;
        }
    }
}

export {Recipe};