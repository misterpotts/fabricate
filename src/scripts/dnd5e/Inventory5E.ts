import {CraftingInventory} from "../game/CraftingInventory";
import {InventoryRecord} from "../game/InventoryRecord";
import Properties from "../Properties";
import {FabricateItemType} from "../game/CompendiumData";
import {CraftingComponent} from "../core/CraftingComponent";
import {GameSystemType} from "../core/GameSystemType";
import {Ingredient} from "../core/Ingredient";

class Inventory5E extends CraftingInventory {
    private readonly _itemDirectory: Map<string, InventoryRecord> = new Map();

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
        const candidateItems: Item[] = items.filter(this.isCraftingComponent(Properties.types.allowableItems));
        const uniqueComponentTypes: string[] = candidateItems.map((item: Item) => item.getFlag(Properties.module.name, 'component.compendiumEntry.entryId'))
            .filter((entryId: string, index: number, entryIds: string[]) => entryIds.indexOf(entryId) === index);

        uniqueComponentTypes.forEach((entryId: string) => {
            const inventoryRecord: InventoryRecord = candidateItems.filter((candidateItem: Item) => candidateItem.getFlag(Properties.module.name, 'component.compendiumEntry.entryId') === entryId)
                .map((item: any) => InventoryRecord.builder()
                    .withItem(item)
                    .withActor(this.actor)
                    .withTotalQuantity(item.data.data.quantity)
                    .withCraftingComponent(CraftingComponent.fromFlags(item.data.flags.fabricate, item.img))
                    .build())
                .reduce((left: InventoryRecord, right: InventoryRecord) => left.combineWith(right));
            this._itemDirectory.set(entryId, inventoryRecord);
        });
    }

    private isCraftingComponent(allowableItems: string[]) {
        return (item: any) => (allowableItems.indexOf(item.type) >= 0)
            && item.data.flags.fabricate
            && item.data.flags.fabricate.type === FabricateItemType.COMPONENT;
    }

    async add(component: CraftingComponent, amountToAdd: number = 1): Promise<InventoryRecord> {
        const recordForType: InventoryRecord = this._itemDirectory.get(component.compendiumEntry.entryId);
        if (!recordForType) {
            const compendium: Compendium = game.packs.get(component.compendiumEntry.compendiumKey);
            const itemData: any = await compendium.getEntity(component.compendiumEntry.entryId);
            component.imageUrl = itemData.img;
            itemData.quantity = amountToAdd;
            const createdItem = await this._actor.createEmbeddedEntity('OwnedItem', itemData);
            const inventoryRecord: InventoryRecord = InventoryRecord.builder()
                .withActor(this._actor)
                .withItem(createdItem)
                .withTotalQuantity(createdItem.data.quantity)
                .withCraftingComponent(component)
                .build();
            this._itemDirectory.set(component.compendiumEntry.entryId, inventoryRecord);
            return inventoryRecord;
        } else {
            recordForType.itemsOfType.sort((left: any, right: any) => left.data.data.quantity - right.data.data.quantity);
            const item: any = recordForType.itemsOfType[0];
            const updatedQuantityForItem = item.data.data.quantity + amountToAdd;
            // @ts-ignore
            await this.actor.updateEmbeddedEntity('OwnedItem', {_id: item.id, data: {quantity: updatedQuantityForItem}});
            recordForType.totalQuantity = recordForType.totalQuantity + amountToAdd;
            return recordForType;
        }
    }

    get contents(): InventoryRecord[] {
        return Array.from(this._itemDirectory.values());
    }

    async remove(component: CraftingComponent, amountToRemove: number = 1): Promise<boolean> {
        if (!this.contains(Ingredient.builder().withQuantity(amountToRemove).withComponentType(component).build())) {
            throw new Error(`Cannot remove ${amountToRemove} ${component.name} from Inventory for Actor ${this.actorId} - 
            there is not enough of the component in their inventory! `);
        }
        const recordForType: InventoryRecord = this._itemDirectory.get(component.compendiumEntry.entryId);
        // @ts-ignore
        recordForType.itemsOfType = recordForType.itemsOfType.sort((left: any, right: any) => left.data.data.quantity - right.data.data.quantity);
        let removed: number = 0;
        let currentItemIndex = 0;
        while (removed < amountToRemove) {
            const thisItem: any = recordForType.itemsOfType[currentItemIndex];
            const remaining = amountToRemove - removed;
            if (remaining < thisItem.data.data.quantity) {
                const updatedQuantity = thisItem.data.data.quantity - remaining;
                // @ts-ignore
                await this.actor.updateEmbeddedEntity('OwnedItem', {
                    _id: thisItem.id,
                    data: {quantity: updatedQuantity}
                });
                recordForType.totalQuantity = updatedQuantity;
                removed += amountToRemove;
            } else {
                const amountRemoved: number = thisItem.data.data.quantity;
                // @ts-ignore
                await this.actor.deleteEmbeddedEntity('OwnedItem', thisItem.id);
                removed += amountRemoved;
                recordForType.totalQuantity = recordForType.totalQuantity - amountRemoved;
            }
            currentItemIndex++;
        }
        const remainingItems: Item[] = recordForType.itemsOfType.filter((item: any) => item.data.data.quantity > 0);
        recordForType.itemsOfType = remainingItems;
        if (remainingItems.length === 0) {
            this._itemDirectory.delete(component.compendiumEntry.entryId);
        }
        return true;
    }

    public denormalizedContents(): CraftingComponent[] {
        return Array.from(this._itemDirectory.values()).map((record: InventoryRecord) => {
            const denormalizedComponents: CraftingComponent[] = [];
            for (let i = 0; i < record.totalQuantity; i++) {
                const compendiumEntry = record.componentType.compendiumEntry;
                denormalizedComponents.push(CraftingComponent.builder()
                    .withName(record.componentType.name)
                    .withEssences(record.componentType.essences)
                    .withCompendiumEntry(compendiumEntry.compendiumKey, compendiumEntry.entryId)
                    .withImageUrl(record.componentType.imageUrl)
                    .build());
            }
            return denormalizedComponents;
        }).reduce((left: CraftingComponent[], right: CraftingComponent[]) => left.concat(right), []);
    }

    update(): void {
        this.index()
    }
}

export {Inventory5E}