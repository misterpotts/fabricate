import {Component} from "../crafting/component/Component";
import {TrackedCombination} from "../common/TrackedCombination";
import {Combination, DefaultCombination} from "../common/Combination";
import {Essence} from "../crafting/essence/Essence";

/**
 * Represents a selection of components and a target amount
 */
interface ComponentSelection {

    /**
     * Indicates whether the selection contains enough components to meet the targets
     */
    isSufficient: boolean;

    /**
     * The components that are selected as catalysts, as well as the target amounts for each
     */
    catalysts: TrackedCombination<Component>;

    /**
     * The components that are selected as ingredients, as well as the target amounts for each
     */
    ingredients: TrackedCombination<Component>;

    /**
     * The cumulative essences present in essence sources, as well as the target amounts for each
     */
    essences: TrackedCombination<Essence>;

    /**
     * The components that are selected as sources for the required essences, as well as the target amounts for each
     */
    essenceSources: Combination<Component>;

}

class DefaultComponentSelection implements ComponentSelection {

    private readonly _catalysts: TrackedCombination<Component>;
    private readonly _essences: TrackedCombination<Essence>;
    private readonly _ingredients: TrackedCombination<Component>;
    private readonly _essenceSources: Combination<Component>;

    public static EMPTY = new DefaultComponentSelection({
        catalysts: TrackedCombination.EMPTY(),
        essences: TrackedCombination.EMPTY(),
        ingredients: TrackedCombination.EMPTY(),
        essenceSources: DefaultCombination.EMPTY()
    });

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

class EmptyComponentSelection implements ComponentSelection {

        get catalysts(): TrackedCombination<Component> {
            return TrackedCombination.EMPTY();
        }

        get essences(): TrackedCombination<Essence> {
            return TrackedCombination.EMPTY();
        }

        get ingredients(): TrackedCombination<Component> {
            return TrackedCombination.EMPTY();
        }

        get essenceSources(): Combination<Component> {
            return DefaultCombination.EMPTY();
        }

        get isSufficient(): boolean {
            return false;
        }

        get selectedComponents(): Combination<Component> {
            return DefaultCombination.EMPTY();
        }

}

export { ComponentSelection, DefaultComponentSelection, EmptyComponentSelection }