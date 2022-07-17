import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelectionStrategy} from "../selection/ComponentSelectionStrategy";
import {Recipe} from "../Recipe";
import {
    AbandonedCraftingAttempt,
    CraftingAttempt,
    GenerousCraftingAttempt,
    WastefulCraftingAttempt
} from "./CraftingAttempt";
import {ComponentSelection} from "../../component/ComponentSelection";
import {WastageType} from "../../system/specification/CraftingSystemSpecification";

interface CraftingAttemptFactoryConfig {
    selectionStrategy: ComponentSelectionStrategy;
    wastageType: WastageType;
}

class CraftingAttemptFactory {

    private readonly _selectionStrategy: ComponentSelectionStrategy;
    private readonly _wastageType: WastageType;

    constructor(config: CraftingAttemptFactoryConfig) {
        this._selectionStrategy = config.selectionStrategy;
        this._wastageType = config.wastageType;
    }

    make(availableComponents: Combination<CraftingComponent>, recipe: Recipe): CraftingAttempt {
        const componentSelection: ComponentSelection = this._selectionStrategy.perform(recipe, availableComponents);
        if (!componentSelection.isSufficient()) {
            return new AbandonedCraftingAttempt({
                recipe: recipe,
                reason: componentSelection.describe()
            });
        }
        switch (this._wastageType) {
            case WastageType.PUNITIVE:
                return new WastefulCraftingAttempt({
                    recipe: recipe,
                    components: componentSelection.components
                });
            case WastageType.NONPUNITIVE:
                return new GenerousCraftingAttempt({
                    recipe: recipe,
                    components: componentSelection.components
                });
        }

    }

}

export {CraftingAttemptFactory, CraftingAttemptFactoryConfig, WastageType}