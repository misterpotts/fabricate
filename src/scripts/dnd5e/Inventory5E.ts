import {CraftingInventory} from "../game/CraftingInventory";
import {InventoryRecord} from "../game/InventoryRecord";
import Properties from "../Properties";
import {ActionType, FabricateCompendiumData, FabricateItemType} from "../game/CompendiumData";
import {CraftingComponent} from "../core/CraftingComponent";
import {GameSystemType} from "../core/GameSystemType";
import {Recipe} from "../core/Recipe";
import {FabricateItem} from "../core/FabricateItem";
import {FabricationAction} from "../core/FabricationAction";

class Inventory5E extends CraftingInventory<Item.Data<ItemData5e>> {
    private readonly _partDirectory: Map<string, InventoryRecord<FabricateItem, Item5e>> = new Map();

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
        this._partDirectory.clear();

        const candidateItems: Item5e[] = items.filter(this.shouldIndex(Properties.types.allowableItems));
        const uniqueComponentTypes: string[] = candidateItems.map((item: Item5e) => item.getFlag(Properties.module.name, Properties.flagKeys.item.partId))
            .filter((partId: string, index: number, partIds: string[]) => partIds.indexOf(partId) === index);

        uniqueComponentTypes.forEach((partId: string) => {
            const inventoryRecord: InventoryRecord<FabricateItem, Item5e> = candidateItems.filter((candidateItem: Item5e) => candidateItem.getFlag(Properties.module.name, Properties.flagKeys.item.partId) === partId)
                .map((item: Item5e) => {
                    const fabricateItemType = item.getFlag(Properties.module.name, Properties.flagKeys.item.fabricateItemType);
                    return InventoryRecord.builder<FabricateItem, Item5e>()
                        .withItem(item)
                        .withActor(this.actor)
                        .withTotalQuantity(item.data.data.quantity)
                        .withFabricateItemType(fabricateItemType)
                        .withFabricateItem(this.lookUp(item))
                        .build();
                })
                .reduce((left: InventoryRecord<FabricateItem, Item5e>, right: InventoryRecord<FabricateItem, Item5e>) => left.combineWith(right));
            this._partDirectory.set(partId, inventoryRecord)
        });
    }

    private shouldIndex(allowableItems: string[]) {
        return (item: Item) => {
            if (allowableItems.indexOf(item.type) < 0) {
                return false;
            }
            const type = item.getFlag(Properties.module.name, Properties.flagKeys.item.fabricateItemType);
            if (!type) {
                return false;
            }
            return type === FabricateItemType.COMPONENT || type === FabricateItemType.RECIPE;
        };
    }

    async add(fabricateItem: FabricateItem, amountToAdd: number = 1, customData?: Item.Data<ItemData5e>): Promise<FabricationAction<Item.Data<ItemData5e>>> {
        if (customData) {
            return this.addCustomItem(fabricateItem, amountToAdd, customData);
        }
        if (!this._partDirectory.has(fabricateItem.partId)) {
            return this.addNewRecord(fabricateItem, amountToAdd);
        } else {
            const existingRecord: InventoryRecord<FabricateItem, Item5e> = this._partDirectory.get(fabricateItem.partId);
            return this.updateExistingRecord(fabricateItem, existingRecord, amountToAdd);
        }
    }

    private async addNewRecord(fabricateItem: FabricateItem, amountToAdd: number): Promise<FabricationAction<Item.Data<ItemData5e>>> {
        const compendium: Compendium = game.packs.get(fabricateItem.systemId);
        const item: Entity<ItemData5e> = <Entity<ItemData5e>> await compendium.getEntity(fabricateItem.partId);
        item.data.data.quantity = amountToAdd;
        const createdItemData: Entity.Data<ItemData5e> = await this._actor.createEmbeddedEntity('OwnedItem', item);
        const createdItem: Item5e = this._actor.getOwnedItem(createdItemData._id);
        const inventoryRecord: InventoryRecord<FabricateItem, Item5e> = InventoryRecord.builder<FabricateItem, Item5e>()
            .withActor(this._actor)
            .withItem(createdItem)
            .withTotalQuantity(createdItem.data.data.quantity)
            .withFabricateItem(fabricateItem)
            .withFabricateItemType(FabricateItemType.COMPONENT)// Todo - this prevents the addNewRecord method from supporting recipes. It doesn't need to yet, but it probably should
            .build();
        this._partDirectory.set(fabricateItem.partId, inventoryRecord);
        return FabricationAction.builder<Item.Data<ItemData5e>>()
            .withItemType(fabricateItem)
            .withQuantity(amountToAdd)
            .withActionType(ActionType.ADD)
            .build();
    }

    private async updateExistingRecord(fabricateItem: FabricateItem, record: InventoryRecord<FabricateItem, Item5e>, amountToAdd: number): Promise<FabricationAction<Item.Data<ItemData5e>>> {
        record.itemsOfType.sort((left: Item<ItemData5e>, right: Item<ItemData5e>) => left.data.data.quantity - right.data.data.quantity);
        const itemToModify: Item<ItemData5e> = record.itemsOfType[0];
        const updatedQuantityForItem = itemToModify.data.data.quantity + amountToAdd;
        // @ts-ignore
        const updatedItem: Item<ItemData5e> = await this.actor.updateEmbeddedEntity('OwnedItem', {_id: itemToModify._id, data: {quantity: updatedQuantityForItem}});
        record.totalQuantity = record.totalQuantity + amountToAdd;
        return FabricationAction.builder<Item.Data<ItemData5e>>()
            .withItemType(fabricateItem)
            .withQuantity(amountToAdd)
            .withActionType(ActionType.ADD)
            .build();
    }

    private async addCustomItem(fabricateItem: FabricateItem, amountToAdd: number, customData: ItemData5e): Promise<FabricationAction<Item.Data<ItemData5e>>> {
        const compendium: Compendium = game.packs.get(fabricateItem.systemId);
        const compendiumBaseItem: Entity<ItemData5e> = <Entity<ItemData5e>> await compendium.getEntity(fabricateItem.partId);
        const baseItemData: Entity.Data<ItemData5e> = duplicate(compendiumBaseItem.data);
        mergeObject(baseItemData.data, customData);
        const createdItemData: Entity.Data<ItemData5e> = await this._actor.createEmbeddedEntity('OwnedItem', baseItemData);
        const createdItem: Item5e = this._actor.getOwnedItem(createdItemData._id);
        const existingRecord: InventoryRecord<FabricateItem, Item5e> = this._partDirectory.get(fabricateItem.partId);
        if (existingRecord) {
            existingRecord.totalQuantity = existingRecord.totalQuantity + amountToAdd;
            return FabricationAction.builder<Item.Data<ItemData5e>>()
                .withItemType(fabricateItem)
                .withQuantity(amountToAdd)
                .withActionType(ActionType.ADD)
                .build();
        } else {
            const inventoryRecord: InventoryRecord<CraftingComponent, Item5e> = InventoryRecord.builder<CraftingComponent, Item5e>()
                .withActor(this._actor)
                .withItem(createdItem)
                .withTotalQuantity(createdItem.data.data.quantity)
                .withFabricateItem(CraftingComponent.fromFlags(compendiumBaseItem.data.flags.fabricate, createdItem.data.name, createdItem.img))
                .build();
            this._partDirectory.set(fabricateItem.partId, inventoryRecord);
            return FabricationAction.builder<Item.Data<ItemData5e>>()
                .withItemType(fabricateItem)
                .withQuantity(amountToAdd)
                .withActionType(ActionType.ADD)
                .build();
        }
    }

    get contents(): InventoryRecord<FabricateItem, Item5e>[] {
        const recipes: InventoryRecord<FabricateItem, Item5e>[] = this.recipes;
        const components: InventoryRecord<FabricateItem, Item5e>[] = this.components;
        return recipes.concat(components);
    }

    async remove(component: CraftingComponent, amountToRemove: number = 1): Promise<FabricationAction<Item.Data<ItemData5e>>> {
        if (!this.containsPart(component.partId, amountToRemove)) {
            throw new Error(`Cannot remove ${amountToRemove} ${component.name} from Inventory for Actor ${this.actorId} - 
                there is not enough of the component in their inventory! `);
        }
        const recordForType: InventoryRecord<FabricateItem, Item5e> = this._partDirectory.get(component.partId);
        recordForType.itemsOfType = recordForType.itemsOfType.sort((left: Item<ItemData5e>, right: Item<ItemData5e>) => left.data.data.quantity - right.data.data.quantity);
        let removed: number = 0;
        let currentItemIndex = 0;
        const modifiedItems: Item5e[] = [];
        while (removed < amountToRemove) {
            const thisItem: any = recordForType.itemsOfType[currentItemIndex];
            modifiedItems.push(thisItem);
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
        const remainingItems: Item5e[] = recordForType.itemsOfType.filter((item: any) => item.data.data.quantity > 0);
        recordForType.itemsOfType = remainingItems;
        if (remainingItems.length === 0) {
            this._partDirectory.delete(component.partId);
        }
        return FabricationAction.builder<Item.Data<ItemData5e>>()
            .withItemType(component)
            .withQuantity(amountToRemove)
            .withActionType(ActionType.REMOVE)
            .build();
    }

    public async updateQuantityFor(itemData: Item.Data<ItemData5e>): Promise<boolean> {
        if (!itemData) {
            throw new Error('Unable to update Inventory quantity for null Item. ');
        }
        const fabricateFlags: FabricateCompendiumData = itemData.flags.fabricate;
        if (!fabricateFlags) {
            return false; // Not a Fabricate Item
        }
        const partId: string = fabricateFlags.identity.partId;
        if (!partId) {
            throw new Error(`Unable to update Inventory quantity for Item ${itemData._id} with no Fabricate Part ID set in flag data. `);
        }
        let inventoryRecordForType: InventoryRecord<FabricateItem, Item5e> = this._partDirectory.get(partId);
        if (!inventoryRecordForType) {
            await this.update();
            return true;
        }
        if (inventoryRecordForType.itemsOfType.length === 1) {
            inventoryRecordForType.totalQuantity = itemData.data.quantity;
            return true;
        }
        const totalExcludingChanged = inventoryRecordForType.itemsOfType.filter((managedItem: Item<ItemData5e>) => managedItem.id !== itemData._id)
            .map((managedItem: any) => managedItem.data.data.quantity)
            .reduce((left, right) => left + right, 0);
        inventoryRecordForType.totalQuantity = totalExcludingChanged + itemData.data.quantity;
        return true;
    }

    update(): void {
        this.index()
    }

    get components(): InventoryRecord<CraftingComponent, Item5e>[] {
        return <InventoryRecord<CraftingComponent, Item5e>[]>Array.from(this._partDirectory.values())
            .filter((record: InventoryRecord<FabricateItem, Item5e>) => record.fabricateItemType === FabricateItemType.COMPONENT);
    }

    get recipes(): InventoryRecord<Recipe, Item5e>[] {
        return <InventoryRecord<Recipe, Item5e>[]>Array.from(this._partDirectory.values())
            .filter((record: InventoryRecord<FabricateItem, Item5e>) => record.fabricateItemType === FabricateItemType.RECIPE);
    }
}

export {Inventory5E}