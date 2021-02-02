import {CraftingInventory} from "../core/CraftingInventory";
import {InventoryRecord} from "../core/InventoryRecord";
import Properties from "../Properties";
import {FabricateFlags, FabricateItemType} from "../core/FabricateFlags";
import {CraftingComponent} from "../core/CraftingComponent";
import {GameSystemType} from "../core/GameSystemType";
import {Ingredient} from "../core/Ingredient";

class Inventory5E extends CraftingInventory {
    private readonly _itemDirectory: Map<string, InventoryRecord[]> = new Map();

    constructor(actor: any) {
        super(actor);
        this._supportedGameSystems = [GameSystemType.DND5E];
        this.index();
    }

    private index(): void {
        if (!this._actor) {
            throw new Error(`No Actor was set for this Inventory to index`);
        }
        const items: any = Array.from(this._actor.items.values());
        this._itemDirectory.clear();
        const allowableItems: string[] = Properties.types.allowableItems;
        items.filter((item: any) => (allowableItems.indexOf(item.type) >= 0)
            && item.data.flags.fabricate
            && item.data.flags.fabricate.type === FabricateItemType.COMPONENT)
            .map((item: any) => {
                const itemConfig: FabricateFlags = item.data.flags.fabricate;
                return InventoryRecord.builder()
                    .withActor(this._actor)
                    .withItem(item)
                    .withQuantity(item.data.data.quantity)
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

    async add(component: CraftingComponent, amountToAdd: number = 1): Promise<InventoryRecord> {
        const itemsOfType: InventoryRecord[] = this._itemDirectory.get(component.compendiumEntry.entryId);
        if (!itemsOfType || itemsOfType.length == 0) {
            const compendium: Compendium = game.packs.get(component.compendiumEntry.compendiumKey);
            const itemData: any = await compendium.getEntity(component.compendiumEntry.entryId);
            itemData.quantity = amountToAdd;
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
            const updatedQuantity = item.data.data.quantity + amountToAdd;
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

    async remove(component: CraftingComponent, amountToRemove: number = 1): Promise<boolean> {
        if (!this.contains(Ingredient.builder().withQuantity(amountToRemove).withComponentType(component).build())) {
            throw new Error(`Cannot remove ${amountToRemove} ${component.name} from Inventory for Actor ${this.actorId} - 
            there is not enough of the component in their inventory! `);
        }
        const itemsOfType: InventoryRecord[] = this._itemDirectory.get(component.compendiumEntry.entryId);
        itemsOfType.sort((left, right) => left.quantity - right.quantity);
        let removed: number = 0;
        let currentItemIndex = 0;
        while (removed < amountToRemove) {
            const thisRecord = itemsOfType[currentItemIndex];
            const remaining = amountToRemove - removed;
            if (remaining < thisRecord.quantity) {
                const updatedQuantity = thisRecord.quantity - remaining;
                await thisRecord.item.update({data:{quantity: updatedQuantity}});
                thisRecord.quantity = updatedQuantity;
                removed += amountToRemove;
            } else {
                await thisRecord.item.delete({});
                removed += thisRecord.quantity;
                thisRecord.quantity = 0;
            }
            currentItemIndex++;
        }
        const remainingInventoryRecords = itemsOfType.filter((inventoryRecord: InventoryRecord) => inventoryRecord.quantity > 0);
        this._itemDirectory.set(component.compendiumEntry.entryId, remainingInventoryRecords);
        return true;
    }

    public async updateQuantityFor(updatedItem: any): Promise<InventoryRecord> {
        if (!updatedItem.flags.fabricate || (updatedItem.flags.fabricate.type !== FabricateItemType.COMPONENT)) {
            return;
        }
        const flags: FabricateFlags = updatedItem.flags.fabricate;
        const matches = this._itemDirectory.get(flags.component.compendiumEntry.entryId)
            .filter((candidate: InventoryRecord) => candidate.item.id === updatedItem._id);
        if (matches.length === 0) {
            throw new Error(`Found no Inventory Records for Item ID ${updatedItem.id} owned by Actor ${this._actor.id}. 
            Could not update Item quantity.`);
        } else if (matches.length > 1) {
            throw new Error(`Found no Inventory Records for Item ID ${updatedItem.id} owned by Actor ${this._actor.id}. 
            This is a strange place to find ourselves in, but here we are. `);
        } else {
            const inventoryRecord = matches[0];
            inventoryRecord.quantity = updatedItem.data.quantity;
            return inventoryRecord;
        }
    }

    update(): void {
        this.index()
    }
}

export {Inventory5E}