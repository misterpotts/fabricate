import {Inventory} from "../game/Inventory";

class InventoryRegistry {

    private _managedInventories: Map<string, Inventory> = new Map<string, Inventory>();

    public addFor(actorId: string, inventory: Inventory): void {
        if (this._managedInventories.has(actorId)) {
            throw new Error(`The Crafting Inventory for Actor ID ${actorId} is already managed by Fabricate and should not be overridden. `);
        }
        this._managedInventories.set(actorId, inventory);
    }

    public getFor(actorId: string): Inventory {
        return this._managedInventories.get(actorId);
    }

}

export {InventoryRegistry}