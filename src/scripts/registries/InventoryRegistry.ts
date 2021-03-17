import {Inventory} from "../game/Inventory";

class InventoryRegistry {

    private _managedInventories: Map<string, Inventory<Item.Data>> = new Map<string, Inventory<Item.Data>>();

    public addFor(actorId: string, inventory: Inventory<Item.Data>): void {
        if (this._managedInventories.has(actorId)) {
            throw new Error(`The Crafting Inventory for Actor ID ${actorId} is already managed by Fabricate and should not be overridden. `);
        }
        this._managedInventories.set(actorId, inventory);
    }

    public getFor(actorId: string): Inventory<Item.Data> {
        return this._managedInventories.get(actorId);
    }

}

export {InventoryRegistry}