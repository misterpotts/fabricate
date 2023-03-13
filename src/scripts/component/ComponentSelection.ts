import {CraftingComponent} from "../common/CraftingComponent";
import {TrackedCombination} from "../common/TrackedCombination";
import {Essence} from "../common/Essence";
import {Combination} from "../common/Combination";

interface ComponentSelection {

    isSufficient: boolean;
    catalysts: TrackedCombination<CraftingComponent>;
    ingredients: TrackedCombination<CraftingComponent>;
    essences: TrackedCombination<Essence>;
    essenceSources: Combination<CraftingComponent>;

}

class DefaultComponentSelection implements ComponentSelection {

    private readonly _catalysts: TrackedCombination<CraftingComponent>;
    private readonly _essences: TrackedCombination<Essence>;
    private readonly _ingredients: TrackedCombination<CraftingComponent>;
    private readonly _essenceSources: Combination<CraftingComponent>;

    constructor({
        catalysts,
        essences,
        ingredients,
        essenceSources
    }: {
        catalysts: TrackedCombination<CraftingComponent>;
        essences: TrackedCombination<Essence>;
        ingredients: TrackedCombination<CraftingComponent>;
        essenceSources: Combination<CraftingComponent>;
    }) {
        this._catalysts = catalysts;
        this._essences = essences;
        this._ingredients = ingredients;
        this._essenceSources = essenceSources;
    }

    get isSufficient(): boolean {
        return this._catalysts.isSufficient && this._essences.isSufficient && this._ingredients.isSufficient;
    }

    get catalysts(): TrackedCombination<CraftingComponent> {
        return this._catalysts;
    }

    get essences(): TrackedCombination<Essence> {
        return this._essences;
    }

    get ingredients(): TrackedCombination<CraftingComponent> {
        return this._ingredients;
    }

    get essenceSources(): Combination<CraftingComponent> {
        return this._essenceSources;
    }

    get selectedComponents(): Combination<CraftingComponent> {
        const namedIngredients = this._catalysts.target.combineWith(this._ingredients.target);
        return namedIngredients.combineWith(this._essenceSources);
    }

}

export { ComponentSelection, DefaultComponentSelection }