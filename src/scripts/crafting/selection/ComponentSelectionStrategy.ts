import {IngredientOption} from "../../common/Recipe";
import {Combination} from "../../common/Combination";
import {ComponentSelection} from "../../component/ComponentSelection";
import {CraftingComponent} from "../../common/CraftingComponent";
import {Essence} from "../../common/Essence";

interface ComponentSelectionStrategy {

    perform(ingredientOption: IngredientOption, requiredEssences: Combination<Essence>, availableComponents: Combination<CraftingComponent>): ComponentSelection;

}

export {ComponentSelectionStrategy}