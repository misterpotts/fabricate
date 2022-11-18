import {Recipe} from "../Recipe";
import {Combination} from "../../common/Combination";
import {CraftingComponent} from "../../common/CraftingComponent";
import {ComponentSelection} from "../../component/ComponentSelection";

interface ComponentSelectionStrategy {

    perform(recipe: Recipe, availableComponents: Combination<CraftingComponent>): ComponentSelection;

}

export {ComponentSelectionStrategy}