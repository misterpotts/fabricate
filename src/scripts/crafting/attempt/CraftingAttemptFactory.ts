import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelectionStrategy} from "../selection/ComponentSelectionStrategy";
import {Recipe} from "../Recipe";
import {CraftingCheck} from "../check/CraftingCheck";
import {CraftingAttempt} from "./CraftingAttempt";
import {AbandonedCraftingAttempt} from "./AbandonedCraftingAttempt";
import {WastefulCraftingAttempt} from "./WastefulCraftingAttempt";
import {ComponentSelection} from "../../component/ComponentSelection";

interface CraftingAttemptFactoryConfig {
    selectionStrategy: ComponentSelectionStrategy,
    availableComponents: Combination<CraftingComponent>,
    recipe: Recipe,
    craftingCheck: CraftingCheck<Actor>,
    actor: Actor
}

class CraftingAttemptFactory {

    private readonly _selectionStrategy: ComponentSelectionStrategy;
    private readonly _availableComponents: Combination<CraftingComponent>;
    private readonly _recipe: Recipe;
    private readonly _craftingCheck: CraftingCheck<Actor>;
    private readonly _actor: Actor;

    constructor(config: CraftingAttemptFactoryConfig) {
        this._selectionStrategy = config.selectionStrategy;
        this._availableComponents = config.availableComponents;
        this._recipe = config.recipe;
        this._craftingCheck = config.craftingCheck;
        this._actor = config.actor
    }

    make(): CraftingAttempt {
        const componentSelection: ComponentSelection = this._selectionStrategy.perform(this._recipe, this._availableComponents);
        if (!componentSelection.isSufficient()) {
            return new AbandonedCraftingAttempt({
                recipe: this._recipe,
                reason: componentSelection.describe()
            });
        }
        return new WastefulCraftingAttempt({
            recipe: this._recipe,
            components: componentSelection.components,
            craftingCheck: this._craftingCheck,
            actor: this._actor
        });
    }

}

export {CraftingAttemptFactory, CraftingAttemptFactoryConfig}