import {Ingredient} from "./Ingredient";
import {FabricationAction} from "./FabricationAction";
import {FabricateCompendiumData, FabricateItemType} from "../game/CompendiumData";
import {FabricateItem} from "./FabricateItem";

class Recipe extends FabricateItem {
    private readonly _ingredients: Ingredient[];
    private readonly _essences: string[];
    private readonly _results: FabricationAction[];

    constructor(builder: Recipe.Builder) {
        super(builder.systemId, builder.partId, builder.imageUrl, builder.name);
        this._ingredients = builder.ingredients;
        this._essences = builder.essences;
        this._results = builder.results;
    }

    public static fromFlags(flags: FabricateCompendiumData, name: string, imageUrl: string): Recipe {
        if (flags.type !== FabricateItemType.RECIPE) {
            throw new Error(`Error attempting to instantiate a Fabricate Recipe from ${flags.type} data. `);
        }
        return Recipe.builder()
            .withName(name)
            .withImageUrl(imageUrl)
            .withPartId(flags.identity.partId)
            .withEssences(flags.recipe.essences)
            .withSystemId(flags.identity.systemId)
            .withResults(FabricationAction.manyFromFlags(flags.recipe.results, flags.identity.systemId))
            .withIngredients(Ingredient.manyFromFlags(flags.recipe.ingredients, flags.identity.systemId))
            .build();
    }

    get ingredients(): Ingredient[] {
        return this._ingredients;
    }

    get results(): FabricationAction[] {
        return this._results;
    }

    get essences(): string[] {
        return this._essences;
    }

    public static builder() {
        return new Recipe.Builder();
    }

    isValid(): boolean {
        const nameValid = this.name != null && this.name.length > 0;
        const idValid = this.partId && this.systemId;
        let ingredientsValid = true;
        this.ingredients.forEach((ingredient: Ingredient) => {
            if (!ingredient.isValid()) {
                ingredientsValid = false;
            }
        });
        let resultsValid = true;
        this.results.forEach((result: FabricationAction) => {
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
        public results: FabricationAction[] = [];
        public name!: string;
        public systemId!: string;
        public partId!: string;
        public imageUrl: string;

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

        withResult(value: FabricationAction) {
            this.results.push(value);
            return this;
        }

        withResults(value: FabricationAction[]) {
            this.results = value;
            return this;
        }

        withSystemId(value: string) {
            this.systemId = value
            return this;
        }

        withPartId(value: string) {
            this.partId = value
            return this;
        }

        withImageUrl(value: string) {
            this.imageUrl = value
            return this;
        }

    }
}

export {Recipe};