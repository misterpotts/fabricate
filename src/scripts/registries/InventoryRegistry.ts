import {Inventory} from "../actor/Inventory";
import {InventoryFactory} from "../actor/InventoryFactory";

interface InventoryRegistry {

    getForActor(actorId: string): Inventory;

}

class DefaultInventoryRegistry implements InventoryRegistry {

    private readonly _managedInventories: Map<string, Inventory>;
    private readonly _inventoryFactory: InventoryFactory;

    constructor({
        managedInventories = new Map(),
        inventoryFactory
    }: {
        managedInventories?: Map<string, Inventory>;
        inventoryFactory: InventoryFactory;
    }) {
        this._managedInventories = managedInventories;
        this._inventoryFactory = inventoryFactory;
    }

    getForActor(actorId: string) {
        if (this._managedInventories.has(actorId)) {
            return this._managedInventories.get(actorId);
        }
        const inventory = this._inventoryFactory.make(actorId);
        this._managedInventories.set(actorId, inventory);
        return inventory;
    }

}

export { InventoryRegistry, DefaultInventoryRegistry }