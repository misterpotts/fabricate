import {Combination} from "../common/Combination";
import {CraftingComponent} from "../common/CraftingComponent";

export interface ComponentSearch {

    perform(contents: Combination<CraftingComponent>): boolean;

}