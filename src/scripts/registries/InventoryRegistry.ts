import {Inventory} from "../game/Inventory";

class InventoryRegistry {

    private static instance: InventoryRegistry = new InventoryRegistry();

    private static _managedInventories: Map<string, Inventory> = new Map<string, Inventory>();

    constructor() {
        if (InventoryRegistry.instance) {
            throw new Error('InventoryRegistry is a singleton. Use `InventoryRegistry.getInstance()` instead. ');
        }
    }

    public static getInstance(): InventoryRegistry {
        return InventoryRegistry.instance;
    }

    public static addFor(actorId: string, inventory: Inventory): void {
        if (this._managedInventories.has(actorId)) {
            throw new Error(`The Crafting Inventory for Actor[${actorId}] is already managed by Fabricate and should not be overridden. `);
        }
        this._managedInventories.set(actorId, inventory);
    }

    public static getFor(actorId: string): Inventory {
        return this._managedInventories.get(actorId);
    }
}

export {InventoryRegistry}