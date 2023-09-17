import {DefaultObjectUtility, ObjectUtility} from "../foundry/ObjectUtility";
import {Combination} from "../common/Combination";
import {Component} from "../crafting/component/Component";
import {Unit} from "../common/Unit";
import {FabricateItemData} from "../foundry/DocumentManager";
import {InventoryContentsNotFoundError} from "../error/InventoryContentsNotFoundError";
import Properties from "../Properties";

interface ItemDataManager {

    /**
     * Counts the quantity of the specified item.
     *
     * @param item - The item to count the quantity of.
     * @returns The quantity of the specified item.
     */
    count(item: Item): number;

    /**
     * Prepares the additions to be made to the inventory as item update or create operations.
     *
     * @param components - The components to add.
     * @param activeEffects - The active effects to apply to the added items.
     * @param ownedItemsByComponentId - The owned items for each component.
     * @returns The updates and creates to be applied to the inventory.
     */
    prepareAdditions(components: Combination<Component>,
                     activeEffects: ActiveEffect[],
                     ownedItemsByComponentId: Map<string, any[]>
    ): { updates: any[], creates: any[] };

    /**
     * Prepares the removals to be made from the inventory as item update or delete operations.
     *
     * @param components - The components to remove.
     * @param ownedItemsByComponentId - The owned items for each component.
     * @returns The updates and deletes to be applied to the inventory.
     */
    prepareRemovals(components: Combination<Component>, ownedItemsByComponentId: Map<string, any[]>): { updates: any[], deletes: any[] };

}

export { ItemDataManager }

class SingletonItemDataManager implements ItemDataManager {

    private readonly _objectUtils: ObjectUtility;

    constructor({
        objectUtils = new DefaultObjectUtility(),
    }: {
        objectUtils?: ObjectUtility;
    } = {}) {
        this._objectUtils = objectUtils;
    }

    count(): number {
        return 1;
    }

    prepareAdditions(components: Combination<Component>, activeEffects: ActiveEffect[]): {
        updates: any[],
        creates: any[]
    } {
        const creates = components
            .units
            .map(unit => this.buildItemData(unit, activeEffects));
        return {updates: [], creates};
    }

    private buildItemData(unit: Unit<Component>, activeEffects: ActiveEffect[]): any {
        const sourceData: FabricateItemData = unit.element.itemData;
        const itemData: any = this._objectUtils.duplicate(sourceData.sourceDocument);
        itemData.effects = [...itemData.effects, ...activeEffects];
        itemData.flags.core = { sourceId: sourceData.uuid };
        return itemData;
    }

    prepareRemovals(components: Combination<Component>, ownedItemsByComponentId: Map<string, any[]>): {
        updates: any[];
        deletes: any[]
    } {
        const deletes = components.units
            .map(unit => {
                const craftingComponent: Component = unit.element;
                if (!ownedItemsByComponentId.has(craftingComponent.id)) {
                    throw new InventoryContentsNotFoundError(unit, 0);
                }
                const ownedItemsForComponent = ownedItemsByComponentId.get(craftingComponent.id);
                if (unit.quantity > ownedItemsForComponent.length) {
                    throw new InventoryContentsNotFoundError(unit, ownedItemsForComponent.length);
                }
                return ownedItemsForComponent.splice(0, unit.quantity);
            })
            .reduce((allItems, items) => [...allItems, ...items], []);
        return { updates: [], deletes };
    }

}

export { SingletonItemDataManager }

class PropertyPathAwareItemDataManager implements ItemDataManager {

    private readonly _objectUtils: ObjectUtility;
    private readonly _propertyPath: string;

    constructor({
        objectUtils = new DefaultObjectUtility(),
        propertyPath,
    }: {
        objectUtils?: ObjectUtility;
        propertyPath: string;
    }) {
        this._objectUtils = objectUtils;
        this._propertyPath = propertyPath;
    }

    get propertyPath(): string {
        return this._propertyPath;
    }

    count(item: Item): number {
        const quantity = this._objectUtils.getPropertyValue(this._propertyPath, item);
        if (typeof quantity !== "number") {
            throw new Error(`Expected a number, but found ${quantity}`);
        }
        return quantity;
    }

    prepareAdditions(components: Combination<Component>,
                     activeEffects: ActiveEffect[],
                     ownedItemsByComponentId: Map<string, any[]>
    ): { updates: any[]; creates: any[] } {

        const creates = components.units
            .filter(unit => !ownedItemsByComponentId.has(unit.element.id))
            .map(unit => this.buildItemData(unit, activeEffects));

        const updates: any[] = components.units
            .filter(unit => ownedItemsByComponentId.has(unit.element.id))
            .map(unit => {
                const items = ownedItemsByComponentId.get(unit.element.id)
                    .sort((left, right) => this.count(right) - this.count(left));
                const highestQuantityItem = items[0];
                const targetQuantity = unit.quantity + this.count(highestQuantityItem);
                return this.prepareItemUpdate(highestQuantityItem, targetQuantity);
            });

        return {creates, updates};

    }

    private prepareItemUpdate(item: any, targetQuantity: number): any {
        const newItemData: any = this._objectUtils.duplicate(item);
        this._objectUtils.setPropertyValue(this._propertyPath, newItemData, targetQuantity);
        return newItemData;
    }

    private buildItemData(unit: Unit<Component>, activeEffects: ActiveEffect[]): any {
        const sourceData: FabricateItemData = unit.element.itemData;
        const itemData: any = this._objectUtils.duplicate(sourceData.sourceDocument);
        itemData.effects = [...itemData.effects, ...activeEffects];
        itemData.flags.core = { sourceId: sourceData.uuid };
        this._objectUtils.setPropertyValue(this._propertyPath, itemData, unit.quantity);
        return itemData;
    }

    prepareRemovals(components: Combination<Component>, sourceItemsByComponentId: Map<string, any[]>): {
        updates: any[];
        deletes: any[]
    } {
        return components.units
            .map(unit => {

                const craftingComponent: Component = unit.element;
                if (!sourceItemsByComponentId.has(craftingComponent.id)) {
                    throw new InventoryContentsNotFoundError(unit, 0);
                }

                const ownedItemsForComponent = sourceItemsByComponentId.get(craftingComponent.id);
                const ownedQuantity = ownedItemsForComponent
                    .reduce((total, item) => total + this.count(item), 0);
                const amountToRemove = unit.quantity;

                if (amountToRemove > ownedQuantity) {
                    throw new InventoryContentsNotFoundError(unit, ownedItemsForComponent.length);
                }

                if (amountToRemove === ownedQuantity) {
                    return { deletes: ownedItemsForComponent, updates: [] };
                }

                const ownedItemsSortedByLowestQuantity = ownedItemsForComponent
                    .sort((left, right) => this.count(left) - this.count(right));
                let remainingAmountToRemove = amountToRemove;
                const deletes: any[] = [];
                const updates: any[] = [];

                for (const item of ownedItemsSortedByLowestQuantity) {
                    const thisItemQuantity = this.count(item);
                    if (thisItemQuantity > remainingAmountToRemove) {
                        updates.push(this.prepareItemUpdate(item, thisItemQuantity - remainingAmountToRemove));
                        break;
                    }
                    deletes.push(item);
                    remainingAmountToRemove -= thisItemQuantity;
                }

                return { deletes, updates };

            })
            .reduce((allItems, items) => {
                return { deletes: [...allItems.deletes, ...items.deletes], updates: [...allItems.updates, ...items.updates] };
            }, { deletes: [], updates: [] });
    }



}

export { PropertyPathAwareItemDataManager }

/**
 * An item data manager that attempts to read the quantity of an item from a property path on the item. If that fails,
 * it falls back to a singleton item data manager (treating all items as having a quantity of 1).
 */
class OptimisticItemDataManager implements ItemDataManager {

    private readonly _singletonItemDataManager: SingletonItemDataManager;
    private readonly _propertyPathAwareItemDataManager: PropertyPathAwareItemDataManager;

    constructor({
        singletonItemDataManager,
        propertyPathAwareItemDataManager,
    }: {
        singletonItemDataManager: SingletonItemDataManager;
        propertyPathAwareItemDataManager: PropertyPathAwareItemDataManager;
    }) {
        this._singletonItemDataManager = singletonItemDataManager;
        this._propertyPathAwareItemDataManager = propertyPathAwareItemDataManager;
    }

    count(item: Item): number {
        try {
            return this._propertyPathAwareItemDataManager.count(item);
        } catch (e) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            console.warn(`${Properties.module.id} | Unable to read quantity from item using default property path "${this._propertyPathAwareItemDataManager.propertyPath}". Caused by: ${cause.message}`);
            return this._singletonItemDataManager.count();
        }
    }

    prepareAdditions(components: Combination<Component>, activeEffects: ActiveEffect[], ownedItemsByComponentId: Map<string, any[]>): {
        updates: any[];
        creates: any[]
    } {
        try {
            return this._propertyPathAwareItemDataManager.prepareAdditions(components, activeEffects, ownedItemsByComponentId);
        } catch (e) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            console.warn(`${Properties.module.id} | Unable to prepare additions using default property path "${this._propertyPathAwareItemDataManager.propertyPath}". Caused by: ${cause.message}`);
            return this._singletonItemDataManager.prepareAdditions(components, activeEffects);
        }
    }

    prepareRemovals(components: Combination<Component>, ownedItemsByComponentId: Map<string, any[]>): {
        updates: any[];
        deletes: any[]
    } {
        try {
            return this._propertyPathAwareItemDataManager.prepareRemovals(components, ownedItemsByComponentId);
        } catch (e) {
            const cause: Error = e instanceof Error ? e : typeof e === "string" ? new Error(e) : new Error("An unknown error occurred");
            console.warn(`${Properties.module.id} | Unable to prepare removals using default property path "${this._propertyPathAwareItemDataManager.propertyPath}". Caused by: ${cause.message}`);
            return this._singletonItemDataManager.prepareRemovals(components, ownedItemsByComponentId);
        }
    }

}

export { OptimisticItemDataManager }

class OptimisticItemDataManagerFactory {

    private readonly _objectUtils: ObjectUtility;
    private readonly _defaultItemQuantityPropertyPath: string;

    constructor({
        objectUtils = new DefaultObjectUtility(),
        defaultItemQuantityPropertyPath = Properties.settings.defaultItemQuantityPropertyPath
    }: {
        objectUtils?: ObjectUtility;
        defaultItemQuantityPropertyPath?: string;
    } = {}) {
        this._objectUtils = objectUtils;
        this._defaultItemQuantityPropertyPath = defaultItemQuantityPropertyPath;
    }

    make(): OptimisticItemDataManager {
        const singletonItemDataManager = new SingletonItemDataManager({ objectUtils: this._objectUtils });
        const propertyPathAwareItemDataManager = new PropertyPathAwareItemDataManager({
            objectUtils: this._objectUtils,
            propertyPath: this._defaultItemQuantityPropertyPath
        });
        return new OptimisticItemDataManager({ singletonItemDataManager, propertyPathAwareItemDataManager });
    }

}

export { OptimisticItemDataManagerFactory }