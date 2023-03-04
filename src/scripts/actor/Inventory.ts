import {CraftingComponent} from "../common/CraftingComponent";
import {Combination, Unit} from "../common/Combination";
import {ObjectUtility} from "../foundry/ObjectUtility";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {InventoryContentsNotFoundError} from "../error/InventoryContentsNotFoundError";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";
import {GameProvider} from "../foundry/GameProvider";
import {DocumentManager, FabricateItemData} from "../foundry/DocumentManager";
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
import {SalvageResult} from "../crafting/result/SalvageResult";

interface Inventory {
    actor: any;
    ownedComponents: Combination<CraftingComponent>;
    acceptCraftingResult(craftingResult: CraftingResult): Promise<any[]>;
    acceptSalvageResult(salvageResult: SalvageResult): Promise<any[]>;
    acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<any[]>;
    index(): Promise<void>;
    contains(craftingComponent: CraftingComponent, quantity: number): boolean;
    size: number
    amountFor(craftingComponent: CraftingComponent): number;
}

interface InventoryActions {
    additions: Combination<CraftingComponent>;
    removals: Combination<CraftingComponent>;
}

class CraftingInventory implements Inventory {

    private readonly _documentManager: DocumentManager;
    private readonly _objectUtils: ObjectUtility;
    private readonly _actor: any;
    private readonly _craftingSystem: CraftingSystem;
    private _managedItems: Map<CraftingComponent, { item: any, quantity: number }[]>;
    private readonly _itemQuantityReader: ItemQuantityReader;
    private readonly _itemQuantityWriter: ItemQuantityWriter;

    constructor({
        actor,
        documentManager,
        objectUtils,
        craftingSystem,
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
        managedItems?: Map<CraftingComponent, { item: any, quantity: number }[]>;
        itemQuantityReader?: ItemQuantityReader;
        itemQuantityWriter?: ItemQuantityWriter;
    }) {
        this._actor = actor;
        this._craftingSystem = craftingSystem;
        this._documentManager = documentManager;
        this._objectUtils = objectUtils;
        this._managedItems = managedItems;
        this._itemQuantityReader = itemQuantityReader;
        this._itemQuantityWriter = itemQuantityWriter;

    }

    get actor(): any {
        return this._actor;
    }

    contains(craftingComponent: CraftingComponent, quantity: number = 1): boolean {
        if (!this._managedItems.has(craftingComponent)) {
            return false;
        }
        return quantity <= this.amountFor(craftingComponent);
    }

    amountFor(craftingComponent: CraftingComponent) {
        if (!this._managedItems.has(craftingComponent)) {
            return 0;
        }
        return this._managedItems.get(craftingComponent).reduce((previousValue, currentValue) => {
            return previousValue + currentValue.quantity;
        }, 0);
    }

    async removeAll(components: Combination<CraftingComponent>): Promise<any[]> {
        const updates: any[] = [];
        const deletes: any[] = [];
        for (const unit of components.units) {
            const craftingComponent: CraftingComponent = unit.part;
            if (!this.contains(craftingComponent)) {
                throw new InventoryContentsNotFoundError(unit, 0, this._actor.id);
            }
            const amountOwned = this.amountFor(craftingComponent);
            if (unit.quantity > amountOwned) {
                throw new InventoryContentsNotFoundError(unit, amountOwned, this._actor.id);
            }
            const records = this._managedItems.get(craftingComponent)
                .sort((left, right) => left.quantity - right.quantity);
            let outstandingRemovalAmount: number = unit.quantity;
            let currentRecordIndex: number = 0;
            while (outstandingRemovalAmount > 0) {
                const currentRecord = records[currentRecordIndex];
                const quantity: number = currentRecord.quantity;
                const itemData: any = currentRecord.item;
                if (quantity <= outstandingRemovalAmount) {
                    deletes.push(itemData);
                    outstandingRemovalAmount -= quantity;
                } else {
                    const copiedItemData =  this._objectUtils.duplicate(itemData);
                    await this._itemQuantityWriter.write(quantity - outstandingRemovalAmount, copiedItemData)
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
            if (!this.contains(craftingComponent)) {
                const sourceData: FabricateItemData = await this._documentManager.getDocumentByUuid(craftingComponent.itemUuid);
                const itemData: any = this._objectUtils.duplicate(sourceData.sourceDocument);
                itemData.flags.core = { sourceId: sourceData.uuid };
                await this._itemQuantityWriter.write(unit.quantity, itemData);
                creates.push(itemData);
                break;
            }
            const records = this._managedItems.get(craftingComponent)
                .sort((left, right) => right.quantity - left.quantity);
            const itemToUpdate: { item: any, quantity: number } = records[0];
            const newItemData: any = this._objectUtils.duplicate(itemToUpdate.item);
            await this._itemQuantityWriter.write(unit.quantity + itemToUpdate.quantity, newItemData);
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

    async acceptSalvageResult(salvageResult: SalvageResult): Promise<any[]> {
        await this.index();
        const inventoryActions: InventoryActions = this.rationalise(salvageResult.created, salvageResult.consumed);
        const modifiedItemData: any[][] = await Promise.all([
            this.addAll(inventoryActions.additions),
            this.removeAll(inventoryActions.removals)
        ]);
        const results = modifiedItemData[0].concat(modifiedItemData[1]);
        await this.index();
        return results;
    }

    async acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<any[]> {
        const baseItem = await this._documentManager.getDocumentByUuid(alchemyResult.baseComponent.itemUuid)
        const baseItemData = this._objectUtils.duplicate(baseItem);
        // todo: implement once types and process are known
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
        return actor.deleteEmbeddedDocuments('Item', ids);
    }

    async createOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.createEmbeddedDocuments('Item', itemsData);
    }

    async updateOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.updateEmbeddedDocuments('Item', itemsData);
    }

    async index(): Promise<void> {
        const actor: any = this.actor;
        const ownedItems: EmbeddedCollection<typeof BaseItem, ActorData> = actor.items;
        const itemsByComponentType: Map<CraftingComponent, { item: any, quantity: number }[]> = new Map();
        await Promise.all(Array.from(ownedItems.values())
            .filter((item: any) => this._craftingSystem.includesComponentByItemUuid(item.getFlag("core", "sourceId")))
            .map(async (item: BaseItem) => {
                const sourceItemUuid: string = <string>item.getFlag("core", "sourceId");
                const component = this._craftingSystem.getComponentByItemUuid(sourceItemUuid);
                const quantity = await this._itemQuantityReader.read(item);
                if (itemsByComponentType.has(component)) {
                    itemsByComponentType.get(component).push({ item, quantity });
                } else {
                    itemsByComponentType.set(component, [{ item, quantity }]);
                }
            }))
        this._managedItems = itemsByComponentType;
    }

    get size(): number {
        return Array.from(this._managedItems.keys())
            .map(component => this.amountFor(component))
            .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
    }

    get ownedComponents(): Combination<CraftingComponent> {
        return Array.from(this._managedItems.keys())
            .flatMap(component => this._managedItems.get(component).map(itemRecord => Combination.of(component, itemRecord.quantity)))
            .reduce((previousValue, currentValue) => previousValue.combineWith(currentValue), Combination.EMPTY());
    }

}

export {Inventory, CraftingInventory}