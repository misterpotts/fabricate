import {Recipe} from "./Recipe";
import {CraftingElement} from "./CraftingElement";

enum FabricateItemType {
    RECIPE = 'RECIPE',
    COMPONENT = 'COMPONENT'
}

class FabricateFlags {
    public type: FabricateItemType;
    public recipe?: Recipe.Builder;
    public component?: CraftingElement.Builder;
}

export {FabricateFlags, FabricateItemType}