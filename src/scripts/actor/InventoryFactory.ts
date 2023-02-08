import {Inventory} from "./Inventory";

interface InventoryFactory {

    make(actorId: string): Inventory;

}

class DefaultInventoryFactory implements InventoryFactory {

    make(_actorId: string): Inventory {
        return undefined;
    }

}

export { InventoryFactory, DefaultInventoryFactory }