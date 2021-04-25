import {FabricateItem} from "../common/FabricateItem";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {EssenceDefinition} from "../common/EssenceDefinition";

class Recipe extends FabricateItem {

    private readonly _ingredients: Combination<CraftingComponent>;
    private readonly _catalysts: Combination<CraftingComponent>;
    private readonly _essences: Combination<EssenceDefinition>;
    private readonly _results: Combination<CraftingComponent>;

    constructor(builder: Recipe.Builder) {
        super(builder);
        this._ingredients = builder.ingredients;
        this._catalysts = builder.catalysts;
        this._essences = builder.essences;
        this._results = builder.results;
    }

    public static builder() {
        return new Recipe.Builder();
    }

    get hasSpecificIngredients() {
        return this._ingredients && !this._ingredients.isEmpty();
    }

    get ingredients(): Combination<CraftingComponent> {
        return this._ingredients;
    }

    get requiresCatalysts() {
        return this._catalysts && !this._catalysts.isEmpty();
    }

    get hasNamedComponents(): boolean {
        return this.requiresCatalysts || this.hasSpecificIngredients;
    }

    get namedComponents(): Combination<CraftingComponent> {
        return this._ingredients.combineWith(this._catalysts);
    }

    get catalysts(): Combination<CraftingComponent> {
        return this._catalysts;
    }

    get requiresEssences() {
        return !!this._essences;
    }

    get essences(): Combination<EssenceDefinition> {
        return this._essences;
    }

    get results(): Combination<CraftingComponent> {
        return this._results;
    }
}

namespace Recipe {

    export class Builder extends FabricateItem.Builder {

        public ingredients: Combination<CraftingComponent>;
        public catalysts: Combination<CraftingComponent>;
        public essences: Combination<EssenceDefinition>;
        public results: Combination<CraftingComponent>;

        public build(): Recipe {
            return new Recipe(this);
        }

        public withIngredients(value: Combination<CraftingComponent>): Builder {
            this.ingredients = value;
            return this;
        }

        public withCatalysts(value: Combination<CraftingComponent>): Builder {
            this.catalysts = value;
            return this;
        }

        public withEssences(value: Combination<EssenceDefinition>): Builder {
            this.essences = value;
            return this;
        }

        public withResults(value: Combination<CraftingComponent>): Builder {
            this.results = value;
            return this;
        }

        public withSystemId(value: string): Builder {
            this.systemId = value;
            return this;
        }

        public withPartId(value: string): Builder {
            this.partId = value;
            return this;
        }

        public withImageUrl(value: string): Builder {
            this.imageUrl = value;
            return this;
        }

        public withName(value: string): Builder {
            this.name = value;
            return this;
        }

    }

}

export {Recipe}