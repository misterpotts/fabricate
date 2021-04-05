import {BaseCraftingInventory, Inventory} from "./Inventory";
import {FabricationAction} from "./FabricationAction";
import {Combination} from "./Combination";
import {CraftingComponent} from "./CraftingComponent";

class Inventory5e extends BaseCraftingInventory<ItemDataValue5e, Actor5e> {

    addAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]> {
        return null;
    }

    removeAll(components: Combination<CraftingComponent>): Promise<FabricationAction[]> {
        return null;
    }

    createAll(itemData: ItemDataValue5e[]): Promise<FabricationAction[]> {
        return null;
    }

    from(actor: Actor5e, ownedComponents: Combination<CraftingComponent>, managedItems: Map<CraftingComponent, Item.Data<ItemDataValue5e>[]>): Inventory<ItemDataValue5e, Actor5e> {
        return null;
    }


}

export {Inventory5e}