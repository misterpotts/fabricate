import {Recipe} from "./Recipe";
import {CraftingComponent} from "./CraftingComponent";

enum FabricateItemType {
    RECIPE = 'RECIPE',
    COMPONENT = 'COMPONENT'
}

class FabricateFlags {
    public type: FabricateItemType;
    public recipe?: Recipe.Builder;
    public component?: CraftingComponent.Builder;
}

export {FabricateFlags, FabricateItemType}