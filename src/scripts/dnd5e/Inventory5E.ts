import {CraftingInventory} from "../core/CraftingInventory";
import {InventoryRecord} from "../core/InventoryRecord";
import Properties from "../Properties";
import {FabricateFlags, FabricateItemType} from "../core/FabricateFlags";
import {CraftingComponent} from "../core/CraftingComponent";
import {GameSystemType} from "../core/GameSystemType";

class Inventory5E extends CraftingInventory {
    private readonly _itemDirectory: Map<string, InventoryRecord[]> = new Map();

    constructor(actor: any) {
        super(actor);
        this._supportedGameSystems = [GameSystemType.DND5E];
        this.index(actor.items);
    }

    private index(items: any[]): void {
        this._itemDirectory.clear();
        const allowableItems: string[] = Properties.types.allowableItems;
        items.filter((item: any) => (allowableItems.indexOf(item.type) >= 0) && item.flags.fabricate && item.flags.fabricate.type === FabricateItemType.COMPONENT)
            .map((item: any) => {
                const itemConfig: FabricateFlags = item.flags.fabricate;
                return InventoryRecord.builder()
                    .withActor(this._actor)
                    .withItem(item)
                    .withQuantity(item.data.quantity)
                    .withCraftingComponent(CraftingComponent.fromFlags(itemConfig))
                    .build();
            })
            .forEach((inventoryRecord: InventoryRecord) => {
                const inventoryRecordsForType: InventoryRecord[] = this._itemDirectory.get(inventoryRecord.componentType.compendiumEntry.entryId);
                if (inventoryRecordsForType) {
                    inventoryRecordsForType.push(inventoryRecord);
                } else {
                    this._itemDirectory.set(inventoryRecord.componentType.compendiumEntry.entryId, [inventoryRecord]);
                }
            });
    }

    async addMany(components: CraftingComponent[]): Promise<InventoryRecord[]> {
        console.log(components);
        return Promise.resolve([]);
    }

    async add(component: CraftingComponent, quantity: number = 1): Promise<InventoryRecord> {
        const itemsOfType: InventoryRecord[] = this._itemDirectory.get(component.compendiumEntry.entryId);
        if (!itemsOfType || itemsOfType.length == 0) {
            const compendium: Compendium = game.packs.get(component.compendiumEntry.compendiumKey);
            const itemData: any = await compendium.getEntity(component.compendiumEntry.entryId);
            itemData.quantity = quantity;
            const createdItem = await this._actor.createOwnedItem(itemData);
            const inventoryRecord = InventoryRecord.builder()
                .withActor(this._actor)
                .withItem(createdItem)
                .withQuantity(createdItem.data.quantity)
                .withCraftingComponent(component)
                .build();
            this._itemDirectory.set(component.compendiumEntry.entryId, [inventoryRecord]);
            return inventoryRecord;
        } else {
            itemsOfType.sort((left, right) => left.quantity - right.quantity);
            const item: any = itemsOfType[0].item;
            const updatedQuantity = item.data.quantity + quantity;
            await item.update({quantity: updatedQuantity});
            itemsOfType[0].quantity = updatedQuantity;
            return itemsOfType[0];
        }
    }

    get contents(): InventoryRecord[] {
        const contents: InventoryRecord[] = [];
        for (const records of this._itemDirectory.values()) {
            contents.push(...records);
        }
        return contents;
    }

    async removeMany(components: CraftingComponent[]): Promise<boolean> {
        console.log(components);
        return Promise.resolve(false);
    }

    async remove(component: CraftingComponent, quantity: number = 1): Promise<boolean> {
        console.log(component);
        console.log(quantity);
        return Promise.resolve(false);
    }

    update(): void {
        this.index(this._actor.items)
    }
}

export {Inventory5E}