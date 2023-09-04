import {Component} from "../crafting/component/Component";
import {TrackedCombination} from "../common/TrackedCombination";
import {Combination} from "../common/Combination";
import {EssenceReference} from "../crafting/essence/EssenceReference";

interface ComponentSelection {

    isSufficient: boolean;
    catalysts: TrackedCombination<Component>;
    ingredients: TrackedCombination<Component>;
    essences: TrackedCombination<EssenceReference>;
    essenceSources: Combination<Component>;

}

class DefaultComponentSelection implements ComponentSelection {

    private readonly _catalysts: TrackedCombination<Component>;
    private readonly _essences: TrackedCombination<EssenceReference>;
    private readonly _ingredients: TrackedCombination<Component>;
    private readonly _essenceSources: Combination<Component>;

    constructor({
        catalysts,
        essences,
        ingredients,
        essenceSources
    }: {
        catalysts: TrackedCombination<Component>;
        essences: TrackedCombination<EssenceReference>;
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

    get essences(): TrackedCombination<EssenceReference> {
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

class EmptyComponentSelection implements ComponentSelection {

        get catalysts(): TrackedCombination<Component> {
            return TrackedCombination.EMPTY();
        }

        get essences(): TrackedCombination<EssenceReference> {
            return TrackedCombination.EMPTY();
        }

        get ingredients(): TrackedCombination<Component> {
            return TrackedCombination.EMPTY();
        }

        get essenceSources(): Combination<Component> {
            return Combination.EMPTY();
        }

        get isSufficient(): boolean {
            return false;
        }

        get selectedComponents(): Combination<Component> {
            return Combination.EMPTY();
        }

}

export { ComponentSelection, DefaultComponentSelection, EmptyComponentSelection }