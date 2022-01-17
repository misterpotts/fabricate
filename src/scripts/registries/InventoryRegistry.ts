import { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import { Inventory } from '../actor/Inventory';

class InventoryRegistry {
  private _managedInventories: Map<string, Inventory<ItemData, Actor>> = new Map<string, Inventory<ItemData, Actor>>();

  public addFor(actorId: string, inventory: Inventory<ItemData, Actor>): void {
    if (this._managedInventories.has(actorId)) {
      throw new Error(
        `The Crafting Inventory for Actor ID ${actorId} is already managed by Fabricate and should not be overridden. `,
      );
    }
    this._managedInventories.set(actorId, inventory);
  }

  public getFor(actorId: string): Inventory<ItemData, Actor> {
    return <Inventory<ItemData, Actor>>this._managedInventories.get(actorId);
  }
}

export { InventoryRegistry };
