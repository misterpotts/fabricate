import {Ingredient} from "./Ingredient";
import {CraftingResult} from "./CraftingResult";
import {FabricateCompendiumData, FabricateItemType} from "../game/CompendiumData";

class Recipe {
    private readonly _ingredients: Ingredient[];
    private readonly _essences: string[];
    private readonly _results: CraftingResult[];
    private readonly _name: string;
    private readonly _entryId: string;

    constructor(builder: Recipe.Builder) {
        this._ingredients = builder.ingredients;
        this._essences = builder.essences;
        this._results = builder.results;
        this._name = builder.name;
        this._entryId = builder.entryId;
    }

    public static fromFlags(flags: FabricateCompendiumData): Recipe {
        if (flags.type !== FabricateItemType.RECIPE) {
            throw new Error(`Error attempting to instantiate a Fabricate Recipe from ${flags.type} data. `);
        }
        return Recipe.builder()
            .withName(flags.recipe.name)
            .withEntryId(flags.recipe.entryId)
            .withEssences(flags.recipe.essences)
            .withResults(CraftingResult.manyFromFlags(flags.recipe.results))
            .withIngredients(Ingredient.manyFromFlags(flags.recipe.ingredients))
            .build();
    }

    get name(): string {
        return this._name;
    }

    get ingredients(): Ingredient[] {
        return this._ingredients;
    }

    get results(): CraftingResult[] {
        return this._results;
    }

    get essences(): string[] {
        return this._essences;
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
        this.ingredients.forEach((ingredient: Ingredient) => {
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
        const essencesValid: boolean = this.essences !== null;
        const hasInputSpecified: boolean = this.essences.length > 0 || this.ingredients.length > 0;
        return nameValid && idValid && ingredientsValid && resultsValid && essencesValid && hasInputSpecified;
    }
}

namespace Recipe {
    export class Builder {
        public ingredients: Ingredient[] = [];
        public essences: string[] = [];
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

        withEssence(value: string) {
            this.essences.push(value)
            return this;
        }

        withEssences(values: string[]) {
            this.essences.push(...values);
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