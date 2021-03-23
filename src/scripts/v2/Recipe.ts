import {AbstractFabricateItem, FabricateItem} from "./FabricateItem";
import {ComponentUnit} from "./CraftingComponent";
import {EssenceCombination} from "./EssenceDefinition";

class Recipe extends AbstractFabricateItem {

    private readonly _ingredients: ComponentUnit[];
    private readonly _catalysts: ComponentUnit[];
    private readonly _essences: EssenceCombination;
    private readonly _results: ComponentUnit[];

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
        return this._catalysts.length > 0 || this._ingredients.length > 0;
    }

    get ingredients(): ComponentUnit[] {
        return this._ingredients;
    }

    get requiresCatalysts() {
        return this._catalysts.length > 0;
    }

    get hasNamedComponents(): boolean {
        return this.requiresCatalysts || this.hasSpecificIngredients;
    }

    get namedComponents(): ComponentUnit[] {
        return this._ingredients.concat(this._catalysts);
    }

    get catalysts(): ComponentUnit[] {
        return this._catalysts;
    }

    get requiresEssences() {
        return !!this._essences;
    }

    get essences(): EssenceCombination {
        return this._essences;
    }

    get results(): ComponentUnit[] {
        return this._results;
    }
}

namespace Recipe {

    export class Builder extends FabricateItem.Builder {

        public ingredients: ComponentUnit[] = [];
        public catalysts: ComponentUnit[] = [];
        public essences: EssenceCombination;
        public results: ComponentUnit[] = [];

        public build(): Recipe {
            return new Recipe(this);
        }

        public withIngredient(value: ComponentUnit): Builder {
            this.ingredients.push(value);
            return this;
        }

        public withCatalyst(value: ComponentUnit): Builder {
            this.catalysts.push(value);
            return this;
        }

        public withEssences(value: EssenceCombination): Builder {
            this.essences = value;
            return this;
        }

        public withResult(value: ComponentUnit): Builder {
            this.results.push(value);
            return this;
        }

    }

}

export {Recipe}