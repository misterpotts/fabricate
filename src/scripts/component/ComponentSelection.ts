import {Recipe} from "../crafting/Recipe";
import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

interface ComponentSelection {

    describe(): string;

    isSufficient(): boolean;

    recipe: Recipe;

    components: Combination<CraftingComponent>;

}

export {ComponentSelection}