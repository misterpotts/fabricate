import {derived, Readable, Subscriber} from "svelte/store";
import {Essence} from "../../scripts/crafting/essence/Essence";
import {Unit} from "../../scripts/common/Unit";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";

/**
 * This store provides the current and available essences for each requirement option by combining the essences of the
 * selected crafting system with the essences of the selected recipe's requirement options.
 */
class RecipeRequirementOptionEssenceStore implements Readable<Map<string, Unit<Essence>[]>> {

    /**
     * The essences for each requirement option by id, including essences that are available in the selected crafting
     * system but not yet included in the selected component.
     * @private
     */
    private readonly _recipeRequirementOptionEssences: Readable<Map<string, Unit<Essence>[]>>;

    constructor({
        allEssences,
        selectedRecipe,
    }: {
        allEssences: Readable<Essence[]>;
        selectedRecipe: Readable<Recipe>;
    }) {
        this._recipeRequirementOptionEssences = derived(
            [allEssences, selectedRecipe],
            ([$allEssences, $selectedRecipe], set) => {
                if ($allEssences.length === 0 || !$selectedRecipe) {
                    set(new Map());
                    return;
                }
                const result = $selectedRecipe.requirementOptions.all
                    .map(requirementOption => {
                        const essences = $allEssences
                            .map(essence => {
                                return new Unit(essence, requirementOption.essences.amountFor(essence.id));
                            });
                        return {
                            requirementOption,
                            essences
                        }
                    })
                    .reduce((map, {requirementOption, essences}) => {
                        map.set(requirementOption.id, essences);
                        return map;
                    }, new Map<string, Unit<Essence>[]>());
                set(result);
            });
    }

    public subscribe(subscriber: Subscriber<Map<string, Unit<Essence>[]>>) {
        return this._recipeRequirementOptionEssences.subscribe(subscriber);
    }

}

export {RecipeRequirementOptionEssenceStore }