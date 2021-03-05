import {CraftingInventory} from "../game/CraftingInventory";
import {InventoryRecord} from "../game/InventoryRecord";
import Properties from "../Properties";
import {FabricateCompendiumData, FabricateItemType} from "../game/CompendiumData";
import {CraftingComponent} from "../core/CraftingComponent";
import {GameSystemType} from "../core/GameSystemType";
import {Ingredient} from "../core/Ingredient";
import {Recipe} from "../core/Recipe";
import {FabricateItem} from "../core/FabricateItem";
import {InventoryModification} from "../game/Inventory";
import {ActionType} from "../core/ActionType";

type RecipeConsumer = (fabricateItem: InventoryRecord<Recipe>) => void;
type CraftingComponentConsumer = (fabricateItem: InventoryRecord<CraftingComponent>) => void;

class Inventory5E extends CraftingInventory {
    private readonly _componentDirectory: Map<string, InventoryRecord<CraftingComponent>> = new Map();
    private readonly _recipeDirectory: Map<string, InventoryRecord<Recipe>> = new Map();

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
        this._componentDirectory.clear();
        this._recipeDirectory.clear();

        const candidateItems: Item[] = items.filter(this.shouldIndex(Properties.types.allowableItems));
        const uniqueComponentTypes: string[] = candidateItems.map((item: Item) => item.getFlag(Properties.module.name, Properties.flagKeys.item.partId))
            .filter((partId: string, index: number, partIds: string[]) => partIds.indexOf(partId) === index);

        uniqueComponentTypes.forEach((partId: string) => {
            const inventoryRecord: InventoryRecord<FabricateItem> = candidateItems.filter((candidateItem: Item) => candidateItem.getFlag(Properties.module.name, Properties.flagKeys.item.partId) === partId)
                .map((item: Item<ItemData5e>) => {
                    const fabricateItemType = item.getFlag(Properties.module.name, Properties.flagKeys.item.fabricateItemType);
                    return InventoryRecord.builder()
                        .withItem(item)
                        .withActor(this.actor)
                        .withTotalQuantity(item.data.data.quantity)
                        .withFabricateItemType(fabricateItemType)
                        .withFabricateItem(this.lookUp(item))
                        .build();
                })
                .reduce((left: InventoryRecord<FabricateItem>, right: InventoryRecord<FabricateItem>) => left.combineWith(right));
            this.applyItemTypeTreatment(inventoryRecord,
                (record: InventoryRecord<CraftingComponent>) => this._componentDirectory.set(partId, record),
                (record: InventoryRecord<Recipe>) => this._recipeDirectory.set(partId, record));
        });
    }

    private applyItemTypeTreatment(inventoryRecord: InventoryRecord<FabricateItem>,
                                   craftingComponentConsumer: CraftingComponentConsumer,
                                   recipeConsumer: RecipeConsumer) {
        switch (inventoryRecord.fabricateItemType) {
            case FabricateItemType.COMPONENT:
                craftingComponentConsumer(<InventoryRecord<CraftingComponent>>inventoryRecord);
                break;
            case FabricateItemType.RECIPE:
                recipeConsumer(<InventoryRecord<Recipe>>inventoryRecord);
                break;
            default:
                throw new Error(`Unrecognized Fabricate Item Type '${inventoryRecord.fabricateItemType}' for Inventory 
                    Record ${inventoryRecord.fabricateItem.compendiumEntry}. The allowable values are 'COMPONENT' and 
                    'RECIPE'. `)
        }
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

    async addComponent(component: CraftingComponent, amountToAdd: number = 1, customData?: any): Promise<InventoryModification<CraftingComponent>> {
        if (customData) {
            return this.addCustomItem(component, amountToAdd, customData);
        }
        const recordForType: InventoryRecord<CraftingComponent> = this._componentDirectory.get(component.partId);
        if (!recordForType) {
            const compendium: Compendium = game.packs.get(component.systemId);
            const item: Entity<ItemData5e> = await compendium.getEntity(component.partId);
            item.data.data.quantity = amountToAdd;
            const createdItem: any = await this._actor.createEmbeddedEntity('OwnedItem', item);
            const inventoryRecord: InventoryRecord<CraftingComponent> = InventoryRecord.builder<CraftingComponent>()
                .withActor(this._actor)
                .withItem(createdItem)
                .withTotalQuantity(createdItem.data.quantity)
                .withFabricateItem(component)
                .build();
            this._componentDirectory.set(component.partId, inventoryRecord);
            return new InventoryModification([createdItem], ActionType.ADD, inventoryRecord);
        } else {
            recordForType.itemsOfType.sort((left: Item<ItemData5e>, right: Item<ItemData5e>) => left.data.data.quantity - right.data.data.quantity);
            const item: any = recordForType.itemsOfType[0];
            const updatedQuantityForItem = item.data.quantity + amountToAdd;
            // @ts-ignore
            const updatedItem: Item<ItemData5e> = await this.actor.updateEmbeddedEntity('OwnedItem', {_id: item.id, data: {quantity: updatedQuantityForItem}});
            recordForType.totalQuantity = recordForType.totalQuantity + amountToAdd;
            return new InventoryModification([updatedItem], ActionType.ADD, recordForType);
        }
    }

    private async addCustomItem(component: CraftingComponent, amountToAdd: number, customData: ItemData5e): Promise<InventoryModification<CraftingComponent>> {
        const compendium: Compendium = game.packs.get(component.systemId);
        const item: Entity<ItemData5e> = await compendium.getEntity(component.partId);
        item.data.data.quantity = amountToAdd;
        const data: Entity.Data<ItemData5e> = duplicate(item.data);
        mergeObject(data.data, customData);
        const recordForType: InventoryRecord<CraftingComponent> = this._componentDirectory.get(component.partId);
        const createdItem: Item<ItemData5e> = await this._actor.createEmbeddedEntity('OwnedItem', data);
        if (recordForType) {
            recordForType.totalQuantity = recordForType.totalQuantity + amountToAdd;
            return new InventoryModification([createdItem], ActionType.ADD, recordForType);
        } else {
            const inventoryRecord: InventoryRecord<CraftingComponent> = InventoryRecord.builder<CraftingComponent>()
                .withActor(this._actor)
                .withItem(createdItem)
                .withTotalQuantity(createdItem.data.data.quantity)
                .withFabricateItem(component)
                .build();
            this._componentDirectory.set(component.partId, inventoryRecord);
            return new InventoryModification([createdItem], ActionType.ADD, inventoryRecord);
        }
    }

    get contents(): InventoryRecord<FabricateItem>[] {
        const recipes: InventoryRecord<FabricateItem>[] = this.recipes;
        const components: InventoryRecord<FabricateItem>[] = this.components;
        return recipes.concat(components);
    }

    async removeComponent(component: CraftingComponent, amountToRemove: number = 1): Promise<InventoryModification<CraftingComponent>> {
        if (!this.containsIngredient(Ingredient.builder().withQuantity(amountToRemove).withComponent(component).build())) {
            throw new Error(`Cannot remove ${amountToRemove} ${component.name} from Inventory for Actor ${this.actorId} - 
                there is not enough of the component in their inventory! `);
        }
        const recordForType: InventoryRecord<CraftingComponent> = this._componentDirectory.get(component.partId);
        recordForType.itemsOfType = recordForType.itemsOfType.sort((left: Item<ItemData5e>, right: Item<ItemData5e>) => left.data.data.quantity - right.data.data.quantity);
        let removed: number = 0;
        let currentItemIndex = 0;
        const modifiedItems: Item<ItemData5e>[] = [];
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
        const remainingItems: Item[] = recordForType.itemsOfType.filter((item: any) => item.data.data.quantity > 0);
        recordForType.itemsOfType = remainingItems;
        if (remainingItems.length === 0) {
            this._componentDirectory.delete(component.partId);
        }
        return new InventoryModification<CraftingComponent>(modifiedItems, ActionType.REMOVE, recordForType);
    }

    public async updateQuantityFor(item: Item.Data<ItemData5e>): Promise<boolean> {
        if (!item) {
            throw new Error('Unable to update Inventory quantity for null Item. ');
        }
        const fabricateFlags: FabricateCompendiumData = item.flags.fabricate;
        if (!fabricateFlags) {
            return false; // Not a Fabricate Item
        }
        const partId: string = fabricateFlags.identity.partId;
        if (!partId) {
            throw new Error(`Unable to update Inventory quantity for Item ${item._id} with no Fabricate Part ID set in flag data. `);
        }
        let inventoryRecordForType: InventoryRecord<FabricateItem>;
        if (fabricateFlags.type === FabricateItemType.COMPONENT) {
            inventoryRecordForType = this._componentDirectory.get(partId);
        } else if (fabricateFlags.type === FabricateItemType.RECIPE) {
            inventoryRecordForType = this._recipeDirectory.get(partId);
        }
        if (!inventoryRecordForType) {
            await this.update();
            return true;
        }
        if (inventoryRecordForType.itemsOfType.length === 1) {
            inventoryRecordForType.totalQuantity = item.data.quantity;
            return true;
        }
        const totalExcludingChanged = inventoryRecordForType.itemsOfType.filter((managedItem: Item<ItemData5e>) => managedItem.id !== item._id)
            .map((managedItem: any) => managedItem.data.data.quantity)
            .reduce((left, right) => left + right, 0);
        inventoryRecordForType.totalQuantity = totalExcludingChanged + item.data.quantity;
        return true;
    }

    update(): void {
        this.index()
    }

    get components(): InventoryRecord<CraftingComponent>[] {
        return Array.from(this._componentDirectory.values());
    }

    get recipes(): InventoryRecord<Recipe>[] {
        return Array.from(this._recipeDirectory.values());
    }
}

export {Inventory5E}