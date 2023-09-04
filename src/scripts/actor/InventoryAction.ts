import {Combination} from "../common/Combination";
import {Component} from "../crafting/component/Component";

interface InventoryAction {

    /**
     * The components to add to the inventory.
     */
    readonly additions: Combination<Component>;

    /**
     * The components to remove from the inventory.
     */
    readonly removals: Combination<Component>;

    /**
     * The active effects to apply to the added components.
     */
    readonly activeEffects: ActiveEffect[];

    /**
     * Rationalises the action to remove any components that are added and removed in the same action.
     */
    rationalise(): InventoryAction;

    withoutAdditions(): InventoryAction;

    withoutRemovals(): InventoryAction;

}

export { InventoryAction }

class SimpleInventoryAction implements InventoryAction {

    private readonly _additions: Combination<Component>;
    private readonly _removals: Combination<Component>;
    private readonly _activeEffects: ActiveEffect[];

    constructor({
        additions = Combination.EMPTY(),
        removals = Combination.EMPTY(),
        activeEffects = [],
    }: {
        additions?: Combination<Component>;
        removals?: Combination<Component>;
        activeEffects?: ActiveEffect[];
    }) {
        this._additions = additions;
        this._removals = removals;
        this._activeEffects = activeEffects;
    }

    get additions(): Combination<Component> {
        return this._additions;
    }

    get removals(): Combination<Component> {
        return this._removals;
    }

    get activeEffects(): ActiveEffect[] {
        return this._activeEffects;
    }

    rationalise(): InventoryAction {
        const consumedInCreated = this._additions.intersectionWith(this._removals);
        const rationalisedRemovals = this._removals.subtract(consumedInCreated);
        const rationalisedAdditions = this._additions.subtract(consumedInCreated);
        return new SimpleInventoryAction({
            additions: rationalisedAdditions,
            removals: rationalisedRemovals,
            activeEffects: this._activeEffects
        });
    }

    withoutAdditions(): InventoryAction {
        return new SimpleInventoryAction({
            additions: Combination.EMPTY(),
            removals: this._removals,
            activeEffects: this._activeEffects
        });
    }

    withoutRemovals(): InventoryAction {
        return new SimpleInventoryAction({
            additions: this._additions,
            removals: Combination.EMPTY(),
            activeEffects: this._activeEffects
        });
    }

}

export { SimpleInventoryAction };
