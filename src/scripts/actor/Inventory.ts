import {CraftingComponent} from "../common/CraftingComponent";
import {Combination, Unit} from "../common/Combination";
import {ObjectUtility} from "../foundry/ObjectUtility";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {InventoryContentsNotFoundError} from "../error/InventoryContentsNotFoundError";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";
import {GameProvider} from "../foundry/GameProvider";
import {DocumentManager} from "../foundry/DocumentManager";
import {CraftingSystem} from "../system/CraftingSystem";
import EmbeddedCollection
    from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import {BaseItem} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {ActorData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {
    AlwaysOneItemQuantityReader,
    ItemQuantityReader,
    ItemQuantityWriter,
    NoItemQuantityWriter
} from "./ItemQuantity";

// @ts-ignore // todo: figure out v10 types
interface Inventory {
    actor: any;
    ownedComponents: Combination<CraftingComponent>;
    acceptCraftingResult(craftingResult: CraftingResult): Promise<any[]>;
    acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<any[]>;
    index(): Promise<Combination<CraftingComponent>>;
    contains(partId: string): boolean;
    size: number
}

interface InventoryActions {
    additions: Combination<CraftingComponent>;
    removals: Combination<CraftingComponent>;
}

class CraftingInventory implements Inventory {

    private readonly _documentManager: DocumentManager;
    private readonly _objectUtils: ObjectUtility;
    private readonly _actor: any;
    private _ownedComponents: Combination<CraftingComponent>;
    private readonly _craftingSystem: CraftingSystem;
    private _managedItems: Map<CraftingComponent, [any, number][]>;
    private readonly _itemQuantityReader: ItemQuantityReader;
    private readonly _itemQuantityWriter: ItemQuantityWriter;

    constructor({
        actor,
        documentManager,
        objectUtils,
        craftingSystem,
        ownedComponents = Combination.EMPTY(),
        managedItems = new Map(),
        itemQuantityReader = new AlwaysOneItemQuantityReader(),
        itemQuantityWriter = new NoItemQuantityWriter()
    }: {
        actor: any;
        gameProvider: GameProvider;
        documentManager: DocumentManager;
        objectUtils: ObjectUtility;
        craftingSystem: CraftingSystem;
        ownedComponents?: Combination<CraftingComponent>;
        managedItems?: Map<CraftingComponent, [any, number][]>;
        itemQuantityReader?: ItemQuantityReader;
        itemQuantityWriter?: ItemQuantityWriter;
    }) {
        this._actor = actor;
        this._craftingSystem = craftingSystem;
        this._documentManager = documentManager;
        this._objectUtils = objectUtils;
        this._ownedComponents = ownedComponents;
        this._managedItems = managedItems;
        this._itemQuantityReader = itemQuantityReader;
        this._itemQuantityWriter = itemQuantityWriter;

    }

    get actor(): any {
        return this._actor;
    }

    get ownedComponents(): Combination<CraftingComponent> {
        return this._ownedComponents.clone();
    }

    contains(partId: string, quantity: number = 1): boolean {
        return this._ownedComponents.hasPart(partId, quantity);
    }

    async removeAll(components: Combination<CraftingComponent>): Promise<any[]> {
        const updates: any[] = [];
        const deletes: any[] = [];
        for (const unit of components.units) {
            const craftingComponent: CraftingComponent = unit.part;
            if (!this.ownedComponents.has(craftingComponent)) {
                throw new InventoryContentsNotFoundError(unit, 0, this._actor.id);
            }
            const amountOwned = this.ownedComponents.amountFor(craftingComponent.id);
            if (unit.quantity > amountOwned) {
                throw new InventoryContentsNotFoundError(unit, amountOwned, this._actor.id);
            }
            const records: [any, number][] = this._managedItems.get(craftingComponent)
                .sort((left: [any, number], right: [any, number]) => left[1] - right[1]);
            let outstandingRemovalAmount: number = unit.quantity;
            let currentRecordIndex: number = 0;
            while (outstandingRemovalAmount > 0) {
                const currentRecord: [any, number] = records[currentRecordIndex];
                const quantity: number = currentRecord[1];
                const itemData: any = currentRecord[0].data;
                if (quantity <= outstandingRemovalAmount) {
                    deletes.push(itemData);
                    outstandingRemovalAmount -= quantity;
                } else {
                    const copiedItemData =  this._objectUtils.duplicate(itemData);
                    copiedItemData.quantity = quantity - outstandingRemovalAmount;
                    updates.push(copiedItemData);
                    outstandingRemovalAmount = 0;
                }
                currentRecordIndex++;
            }
        }
        const results: any[] = [];
        if (updates.length > 0) {
            const updatedItems: any[] = await this.updateOwnedItems(this._actor, updates);
            results.push(...updatedItems);
        }
        if (deletes.length > 0) {
            const createdItems: any[] = await this.deleteOwnedItems(this._actor, deletes);
            results.push(...createdItems);
        }
        return results;
    }

    async addAll(components: Combination<CraftingComponent>): Promise<any[]> {
        const updates: any[] = [];
        const creates: any[] = [];
        for (const unit of components.units) {
            const craftingComponent: CraftingComponent = unit.part;
            if (!this.ownedComponents.has(craftingComponent)) {
                const sourceData: any = await this._documentManager.getDocumentByUuid(craftingComponent.id);
                const itemData: any = this._objectUtils.duplicate(sourceData);
                itemData.quantity = unit.quantity;
                creates.push(itemData);
                break;
            }
            const records: [any, number][] = this._managedItems.get(craftingComponent)
                .sort((left: [any, number], right: [any, number]) => right[1] - left[1]);
            const itemToUpdate: [any, number] = records[0];
            const newItemData: any = this._objectUtils.duplicate(itemToUpdate[0]);
            await this._itemQuantityWriter.write(unit.quantity + itemToUpdate[1], newItemData);
            updates.push(newItemData);
        }
        const results: any[] = [];
        if (updates.length > 0) {
            const updatedItems: any[] = await this.updateOwnedItems(this._actor, updates);
            results.push(...updatedItems);
        }
        if (creates.length > 0) {
            const createdItems: any[] = await this.createOwnedItems(this._actor, creates);
            results.push(...createdItems);
        }
        return results;
    }

    async acceptCraftingResult(craftingResult: CraftingResult): Promise<any[]> {
        const inventoryActions: InventoryActions = this.rationalise(craftingResult.created, craftingResult.consumed);
        // todo: Can *potentially* optimise further by combining all update operations across both add and remove,
        //  reducing total actions on the actor from 4 (ADD[CREATE, UPDATE], REMOVE[UPDATE, DELETE]) to 3
        //  ([CREATE, UPDATE, DELETE])
        const modifiedItemData: any[][] = await Promise.all([
            this.addAll(inventoryActions.additions),
            this.removeAll(inventoryActions.removals)
        ]);
        return modifiedItemData[0].concat(modifiedItemData[1]);
    }

    async acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<any[]> {
        const baseItem = await this._documentManager.getDocumentByUuid(alchemyResult.baseComponent.id)
        const baseItemData = this._objectUtils.duplicate(baseItem);
        // todo: implement once types and process are known
        // const customItemData = this._documentManager.customizeItem(compendiumBaseItem, alchemyResult.effects.applyToItemData(compendiumBaseItem));
        // const baseItemData: Entity.Data = duplicate(compendiumBaseItem.data);
        // mergeObject(baseItemData.data, alchemyResult.customItemData);
        // @ts-ignore
        const createdItemData: Entity.Data = await this._actor.createEmbeddedEntity('OwnedItem', baseItemData);
        return null;
    }

    private rationalise(created: Combination<CraftingComponent>, consumed: Combination<CraftingComponent>): InventoryActions {
        if (!consumed.intersects(created)) {
            return ({
                additions: created,
                removals: consumed
            });
        }
        let rationalisedCreated: Combination<CraftingComponent> = created;
        let rationalisedConsumed: Combination<CraftingComponent> = Combination.EMPTY();
        consumed.units.forEach(consumedUnit => {
            if (!created.has(consumedUnit.part)) {
                rationalisedConsumed = rationalisedCreated.add(consumedUnit);
            }
            if (created.containsAll(consumedUnit)) {
                rationalisedCreated = rationalisedCreated.minus(consumedUnit);
            } else {
                const updatedConsumedUnit: Unit<CraftingComponent> = rationalisedCreated.amounts.get(consumedUnit.part.id)
                    .minus(consumedUnit.quantity);
                rationalisedCreated = rationalisedCreated.minus(consumedUnit);
                rationalisedConsumed = rationalisedConsumed.add(updatedConsumedUnit.invert());
            }
        });
        return ({
            additions: rationalisedCreated,
            removals: rationalisedConsumed
        });
    }

    async deleteOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        const ids: string[] = itemsData.map((itemData: any) => itemData._id);
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.deleteEmbeddedEntity('OwnedItem', ids);
    }

    async createOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.createEmbeddedEntity('OwnedItem', itemsData);
    }

    async updateOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.updateEmbeddedEntity('OwnedItem', itemsData);
    }

    async index(): Promise<Combination<CraftingComponent>> {
        const actor: any = this.actor;
        const ownedItems: EmbeddedCollection<typeof BaseItem, ActorData> = actor.items;
        const itemsByComponentType: Map<CraftingComponent, [any, number][]> = new Map();
        const allComponents: Combination<CraftingComponent>[] = await Promise.all(Array.from(ownedItems.values())
            .filter((item: any) => this._craftingSystem.includesComponentByItemUuid(item.getFlag("core", "sourceId")))
            .map(async (item: BaseItem) => {
                const sourceItemUuid: string = <string>item.getFlag("core", "sourceId");
                const component = this._craftingSystem.getComponentByItemUuid(sourceItemUuid);
                const quantity = await this._itemQuantityReader.read(item);
                if (itemsByComponentType.has(component)) {
                    itemsByComponentType.get(component).push([item, quantity]);
                } else {
                    itemsByComponentType.set(component, [[item, quantity]]);
                }
                return Combination.of(component, quantity);
            }))
        const rationalisedComponents = allComponents.reduce((left: Combination<CraftingComponent>, right: Combination<CraftingComponent>) => left.combineWith(right), Combination.EMPTY());
        this._managedItems = itemsByComponentType;
        this._ownedComponents = rationalisedComponents;
        return this._ownedComponents;
    }

    get size(): number {
        return this._ownedComponents.size;
    }

}

export {Inventory, CraftingInventory}