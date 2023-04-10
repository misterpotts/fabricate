import {Component} from "../crafting/component/Component";
import {Combination, Unit} from "../common/Combination";
import {ObjectUtility} from "../foundry/ObjectUtility";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {InventoryContentsNotFoundError} from "../error/InventoryContentsNotFoundError";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";
import {GameProvider} from "../foundry/GameProvider";
import {DocumentManager, FabricateItemData} from "../foundry/DocumentManager";
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
    ownedComponents: Combination<Component>;
    acceptCraftingResult(craftingResult: CraftingResult): Promise<void>;
    acceptSalvageResult(salvageResult: SalvageResult): Promise<void>;
    acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<void>;
    index(): Promise<void>;
    contains(craftingComponent: Component, quantity: number): boolean;
    size: number
    amountFor(craftingComponent: Component): number;
}

interface InventoryActions {
    additions: Combination<Component>;
    removals: Combination<Component>;
}

interface InventoryRecord {
    item: any;
    quantity: number;
}

class CraftingInventory implements Inventory {

    private readonly _documentManager: DocumentManager;
    private readonly _objectUtils: ObjectUtility;
    private readonly _actor: any;
    private readonly _knownComponentsByItemUuid: Map<string, Component>;
    private _managedItems: Map<Component, InventoryRecord[]>;
    private readonly _itemQuantityReader: ItemQuantityReader;
    private readonly _itemQuantityWriter: ItemQuantityWriter;

    constructor({
        actor,
        documentManager,
        objectUtils,
        managedItems = new Map(),
        knownComponentsByItemUuid = new Map(),
        itemQuantityReader = new AlwaysOneItemQuantityReader(),
        itemQuantityWriter = new NoItemQuantityWriter()
    }: {
        actor: any;
        gameProvider: GameProvider;
        documentManager: DocumentManager;
        objectUtils: ObjectUtility;
        knownComponentsByItemUuid?: Map<string, Component>;
        ownedComponents?: Combination<Component>;
        managedItems?: Map<Component, InventoryRecord[]>;
        itemQuantityReader?: ItemQuantityReader;
        itemQuantityWriter?: ItemQuantityWriter;
    }) {
        this._actor = actor;
        this._knownComponentsByItemUuid = knownComponentsByItemUuid;
        this._documentManager = documentManager;
        this._objectUtils = objectUtils;
        this._managedItems = managedItems;
        this._itemQuantityReader = itemQuantityReader;
        this._itemQuantityWriter = itemQuantityWriter;

    }

    get actor(): any {
        return this._actor;
    }

    contains(craftingComponent: Component, quantity: number = 1): boolean {
        if (!this._managedItems.has(craftingComponent)) {
            return false;
        }
        return quantity <= this.amountFor(craftingComponent);
    }

    amountFor(craftingComponent: Component) {
        if (!this._managedItems.has(craftingComponent)) {
            return 0;
        }
        return this._managedItems.get(craftingComponent).reduce((previousValue, currentValue) => {
            return previousValue + currentValue.quantity;
        }, 0);
    }

    async removeAll(components: Combination<Component>): Promise<void> {
        const updates: any[] = [];
        const deletes: any[] = [];
        for (const unit of components.units) {
            const craftingComponent: Component = unit.part;
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
                    const remainingQuantity = quantity - outstandingRemovalAmount;
                    const itemData = await this.prepareItemUpdate(currentRecord, remainingQuantity);
                    updates.push(itemData);
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

    }

    async addAll(components: Combination<Component>, activeEffects: ActiveEffect[]): Promise<void> {

        const creates: any[] = await Promise.all(components.units
            .filter(unit => !this.contains(unit.part))
            .map(unit => {
                return this.buildItemData(unit, activeEffects);
            })
        );

        const updates: any[] = await Promise.all(components.units
            .filter(unit => this.contains(unit.part))
            .map(unit => {
                const records = this._managedItems.get(unit.part)
                    .sort((left, right) => right.quantity - left.quantity);
                const inventoryRecord: InventoryRecord = records[0];
                const targetQuantity = unit.quantity + inventoryRecord.quantity;
                return this.prepareItemUpdate(inventoryRecord, targetQuantity);
            })
        );

        if (updates.length > 0) {
            await this.updateOwnedItems(this._actor, updates);
        }
        if (creates.length > 0) {
            await this.createOwnedItems(this._actor, creates);
        }

        console.log(`Fabricate | Created ${creates.length} items and updated ${updates.length} items for actor "${this._actor.name}". `);
    }

    private async prepareItemUpdate(inventoryRecord: InventoryRecord, targetQuantity: number): Promise<any> {
        const newItemData: any = this._objectUtils.duplicate(inventoryRecord.item);
        await this._itemQuantityWriter.write(targetQuantity, newItemData);
        return newItemData;
    }

    private async buildItemData(unit: Unit<Component>, activeEffects: ActiveEffect[]): Promise<any> {
        const sourceData: FabricateItemData = unit.part.itemData;
        const itemData: any = this._objectUtils.duplicate(sourceData.sourceDocument);
        itemData.effects = [...itemData.effects, ...activeEffects];
        itemData.flags.core = {sourceId: sourceData.uuid};
        await this._itemQuantityWriter.write(unit.quantity, itemData);
        return itemData;
    }

    async acceptCraftingResult(craftingResult: CraftingResult): Promise<void> {
        return this.acceptResult(craftingResult.created, craftingResult.consumed);
    }

    async acceptSalvageResult(salvageResult: SalvageResult): Promise<void> {
        return this.acceptResult(salvageResult.created, salvageResult.consumed);
    }

    private async acceptResult(created: Combination<Component>, consumed: Combination<Component>): Promise<void> {
        await this.index();

        const activeEffects = consumed
            .explode(craftingComponent => craftingComponent.essences)
            .members
            .filter(essence => essence.hasActiveEffectSource)
            .flatMap(essence => essence.activeEffectSource.sourceDocument.effects.contents)
            .map(activeEffect => this._objectUtils.duplicate(activeEffect));

        const inventoryActions: InventoryActions = this.rationalise(created, consumed);
        await Promise.all([
            this.addAll(inventoryActions.additions, activeEffects),
            this.removeAll(inventoryActions.removals)
        ]);
        await this.index();
    }

    async acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<void> {
        const baseItem = await this._documentManager.loadItemDataByDocumentUuid(alchemyResult.baseComponent.itemUuid)
        const baseItemData = this._objectUtils.duplicate(baseItem);
        // todo: implement once types and process are known
        // @ts-ignore
        const createdItemData: Entity.Data = await this._actor.createEmbeddedEntity('OwnedItem', baseItemData);
        return null;
    }

    private rationalise(created: Combination<Component>, consumed: Combination<Component>): InventoryActions {
        if (!consumed.intersects(created)) {
            return ({
                additions: created,
                removals: consumed
            });
        }
        let rationalisedCreated: Combination<Component> = created;
        let rationalisedConsumed: Combination<Component> = Combination.EMPTY();
        consumed.units.forEach(consumedUnit => {
            if (!created.has(consumedUnit.part)) {
                rationalisedConsumed = rationalisedCreated.add(consumedUnit);
            }
            if (created.containsAll(consumedUnit)) {
                rationalisedCreated = rationalisedCreated.minus(consumedUnit);
            } else {
                const updatedConsumedUnit: Unit<Component> = rationalisedCreated.amounts.get(consumedUnit.part.id)
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
        return actor.deleteEmbeddedDocuments("Item", ids);
    }

    async createOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        return actor.createEmbeddedDocuments("Item", itemsData);
    }

    async updateOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        return actor.updateEmbeddedDocuments("Item", itemsData);
    }

    async index(): Promise<void> {
        const actor: any = this.actor;
        const ownedItems: EmbeddedCollection<typeof BaseItem, ActorData> = actor.items;
        const itemsByComponentType: Map<Component, InventoryRecord[]> = new Map();
        await Promise.all(Array.from(ownedItems.values())
            .filter((item: any) => this._knownComponentsByItemUuid.has(item.getFlag("core", "sourceId")))
            .map(async (item: BaseItem) => {
                const sourceItemUuid: string = <string>item.getFlag("core", "sourceId");
                const component = this._knownComponentsByItemUuid.get(sourceItemUuid);
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

    get ownedComponents(): Combination<Component> {
        return Array.from(this._managedItems.keys())
            .flatMap(component => this._managedItems.get(component).map(itemRecord => Combination.of(component, itemRecord.quantity)))
            .reduce((previousValue, currentValue) => previousValue.combineWith(currentValue), Combination.EMPTY());
    }

}

export {Inventory, CraftingInventory}