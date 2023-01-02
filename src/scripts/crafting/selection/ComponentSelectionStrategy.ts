import {Recipe} from "../Recipe";
import {Combination} from "../../common/Combination";
import {ComponentSelection} from "../../component/ComponentSelection";
import {CraftingComponent} from "../../common/CraftingComponent";

interface ComponentSelectionStrategy {

    perform(recipe: Recipe, availableComponents: Combination<CraftingComponent>): ComponentSelection<CraftingComponent>;

}

export {ComponentSelectionStrategy}