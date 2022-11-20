import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

interface ComponentSelection{

    isSufficient(): boolean;

    components: Combination<CraftingComponent>;

}

export {ComponentSelection}