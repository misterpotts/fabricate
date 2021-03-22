import {AbstractFabricateItem, FabricateItem} from "./FabricateItem";
import {Ingredient} from "./CraftingComponent";
import {EssenceUnit} from "./EssenceDefinition";

class Recipe extends AbstractFabricateItem {

    private readonly _ingredients: Ingredient[];
    private readonly _catalysts: Ingredient[];
    private readonly _essences: EssenceUnit[];

    constructor(builder: Recipe.Builder) {
        super(builder);
        this._ingredients = builder.ingredients;
        this._catalysts = builder.catalysts;
    }

    public static builder() {
        return new Recipe.Builder();
    }

    get hasSpecificIngredients() {
        return this._catalysts.length > 0 || this._ingredients.length > 0;
    }

    get ingredients(): Ingredient[] {
        return this._ingredients;
    }

    get requiresCatalysts() {
        return this._catalysts.length > 0;
    }

    get catalysts(): Ingredient[] {
        return this._catalysts;
    }

    get requiresEssences() {
        return this._essences.length > 0;
    }

    get essences(): EssenceUnit[] {
        return this._essences;
    }

}

namespace Recipe {

    export class Builder extends FabricateItem.Builder {

        public ingredients: Ingredient[] = [];
        public catalysts: Ingredient[] = [];
        public essences: EssenceUnit[] = [];

        public build(): Recipe {
            return new Recipe(this);
        }

        public withIngredient(ingredient: Ingredient) {
            this.ingredients.push(ingredient);
            return this;
        }

        public withCatalyst(ingredient: Ingredient) {
            this.catalysts.push(ingredient);
            return this;
        }

        public withEssence(essence: EssenceUnit) {
            this.essences.push(essence);
            return this;
        }

    }

}

export {Recipe}