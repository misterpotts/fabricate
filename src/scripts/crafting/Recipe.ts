import {FabricateItem, FabricateItemConfig} from "../common/FabricateItem";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";
import {EssenceDefinition} from "../common/EssenceDefinition";

interface RecipeMutation {
    ingredients?: Combination<CraftingComponent>;
    catalysts?: Combination<CraftingComponent>;
    essences?: Combination<EssenceDefinition>;
    results?: Combination<CraftingComponent>;
}

class Recipe extends FabricateItem {

    private readonly _ingredients: Combination<CraftingComponent>;
    private readonly _catalysts: Combination<CraftingComponent>;
    private readonly _essences: Combination<EssenceDefinition>;
    private readonly _results: Combination<CraftingComponent>;

    constructor({
        gameItem,
        ingredients,
        catalysts,
        essences,
        results
    }: {
        gameItem: FabricateItemConfig,
        ingredients?: Combination<CraftingComponent>;
        catalysts?: Combination<CraftingComponent>;
        essences?: Combination<EssenceDefinition>;
        results: Combination<CraftingComponent>;
    }) {
        super(gameItem);
        this._ingredients = ingredients ?? Combination.EMPTY();
        this._catalysts = catalysts ?? Combination.EMPTY();
        this._essences = essences ?? Combination.EMPTY();
        this._results = results;
    }

    public mutate(mutation: RecipeMutation): Recipe {
        return new Recipe({
            gameItem: {
                systemId: this.systemId,
                partId: this.partId,
                compendiumId: this.compendiumId,
                name: this.name,
                imageUrl: this.imageUrl
            },
            ingredients: mutation.ingredients ? mutation.ingredients : this._ingredients,
            catalysts: mutation.catalysts ? mutation.catalysts : this._catalysts,
            essences: mutation.essences ? mutation.essences : this._essences,
            results: mutation.results ? mutation.results : this._results,
        })
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

export {Recipe}