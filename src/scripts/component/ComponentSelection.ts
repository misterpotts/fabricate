import {Component} from "../crafting/component/Component";
import {TrackedCombination} from "../common/TrackedCombination";
import {Essence} from "../crafting/essence/Essence";
import {Combination} from "../common/Combination";

interface ComponentSelection {

    isSufficient: boolean;
    catalysts: TrackedCombination<Component>;
    ingredients: TrackedCombination<Component>;
    essences: TrackedCombination<Essence>;
    essenceSources: Combination<Component>;

}

class DefaultComponentSelection implements ComponentSelection {

    private readonly _catalysts: TrackedCombination<Component>;
    private readonly _essences: TrackedCombination<Essence>;
    private readonly _ingredients: TrackedCombination<Component>;
    private readonly _essenceSources: Combination<Component>;

    constructor({
        catalysts,
        essences,
        ingredients,
        essenceSources
    }: {
        catalysts: TrackedCombination<Component>;
        essences: TrackedCombination<Essence>;
        ingredients: TrackedCombination<Component>;
        essenceSources: Combination<Component>;
    }) {
        this._catalysts = catalysts;
        this._essences = essences;
        this._ingredients = ingredients;
        this._essenceSources = essenceSources;
    }

    get isSufficient(): boolean {
        return this._catalysts.isSufficient && this._essences.isSufficient && this._ingredients.isSufficient;
    }

    get catalysts(): TrackedCombination<Component> {
        return this._catalysts;
    }

    get essences(): TrackedCombination<Essence> {
        return this._essences;
    }

    get ingredients(): TrackedCombination<Component> {
        return this._ingredients;
    }

    get essenceSources(): Combination<Component> {
        return this._essenceSources;
    }

    get selectedComponents(): Combination<Component> {
        const namedIngredients = this._catalysts.target.combineWith(this._ingredients.target);
        return namedIngredients.combineWith(this._essenceSources);
    }

}

export { ComponentSelection, DefaultComponentSelection }