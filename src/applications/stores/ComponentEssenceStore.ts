import {derived, Readable, Subscriber} from "svelte/store";
import {Essence} from "../../scripts/crafting/essence/Essence";
import {Component} from "../../scripts/crafting/component/Component";
import {Unit} from "../../scripts/common/Unit";

/**
 * This store provides the current and available essences for the selected component by combining the essences of the
 * selected crafting system with the essences of the selected component.
 */
class ComponentEssenceStore implements Readable<Unit<Essence>[]> {

    /**
     * The essences for the selected component, including essences that are available in the selected crafting system
     * but not yet included in the selected component.
     * @private
     */
    private readonly _componentEssences: Readable<Unit<Essence>[]>;

    constructor({
        allEssences,
        selectedComponent
    }: {
        allEssences: Readable<Essence[]>;
        selectedComponent: Readable<Component>;
    }) {
        this._componentEssences = derived(
            [allEssences, selectedComponent],
            ([$allEssences, $selectedComponent], set) => {
                if ($allEssences.length === 0 || !$selectedComponent) {
                    set([]);
                    return;
                }
                const essences = $allEssences
                    .map(essence => {
                        return new Unit(essence, $selectedComponent.essences.amountFor(essence.id));
                    });
                set(essences);
            });
    }

    public subscribe(subscriber: Subscriber<Unit<Essence>[]>) {
        return this._componentEssences.subscribe(subscriber);
    }

}

export {ComponentEssenceStore }