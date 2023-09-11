import {Component} from "../crafting/component/Component";
import {Combination, DefaultCombination} from "../common/Combination";
import {DefaultUnit} from "../common/Unit";
import {InventoryAction} from "./InventoryAction";
import EmbeddedCollection
    from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import {BaseActor, BaseItem} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import {ActorData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {Essence} from "../crafting/essence/Essence";
import {ItemDataManager, SingletonItemDataManager} from "./ItemDataManager";

interface Inventory {

    /**
     * The actor to which this inventory belongs.
     */
    readonly actor: BaseActor;

    /**
     * The components in this inventory.
     *
     * @returns A Promise that resolves with the components in this inventory.
     * @throws Error if the actor does not exist.
     */
    getContents(): Combination<Component>;

    /**
     * Perform the specified action on this inventory, adding and removing components as necessary. Additions and
     *  removals are performed separately. If one fails, the other will be rolled back, or aborted. They are reconciled
     *  before being applied.
     *
     * @param action - The action to perform.
     * @returns A Promise that resolves with the new contents of this inventory.
     * @throws Error if the inventory does not contain the required components, or if the actor does not exist.
     */
    perform(action: InventoryAction): Promise<Combination<Component>>;

    /**
     * Determines whether this inventory contains the specified component in the specified quantity.
     *
     * @param craftingComponent - The component to check for.
     * @param quantity - The quantity of the component to check for. Defaults to 1.
     * @returns A Promise that resolves with true if the inventory contains the specified component in the specified
     *  quantity, false otherwise.
     * @throws Error if the actor does not exist.
     */
    contains(craftingComponent: Component, quantity?: number): boolean;

}

class CraftingInventory implements Inventory {

    private readonly _actor: BaseActor;
    private readonly _localization: LocalizationService;
    private readonly _itemDataManager: ItemDataManager;

    /**
     * A Map of source item UUIDs to the Component that uses it. An inventory expects to be initialised with a complete
     * set of components for a single crafting system. Item UUIDs must therefore map to a single component.
     * @private
     */
    private readonly _knownComponentsByItemUuid: Map<string, Component>;
    private readonly _knownComponentsById: Map<string, Component>;

    constructor({
        actor,
        localization,
        itemDataManager = new SingletonItemDataManager(),
        knownComponents = [],
    }: {
        actor: BaseActor;
        localization: LocalizationService;
        knownEssencesById?: Map<string, Essence>;
        itemDataManager?: ItemDataManager;
        knownComponents?: Component[];
    }) {
        this._actor = actor;
        this._localization = localization;
        this._itemDataManager = itemDataManager;

        this._knownComponentsByItemUuid = new Map();
        this._knownComponentsById = new Map();

        knownComponents.forEach(component => {
            this._knownComponentsByItemUuid.set(component.itemUuid, component);
            this._knownComponentsById.set(component.id, component);
        });
    }

    get actor(): BaseActor {
        if (!this._actor) {
            throw new Error(this._localization.localize(`${Properties.module.id}.inventory.error.invalidActor`));
        }
        return this._actor;
    }

    contains(craftingComponent: Component, quantity: number = 1): boolean {
        const contents = this.getContents();
        return contents.has(craftingComponent, quantity);
    }

    getContents(): Combination<Component> {
        // @ts-ignore
        const contentsWithSourceItems = this.getContentsWithSourceItems();
        return Array.from(contentsWithSourceItems.entries())
            .flatMap(([componentId, items]) => {
                return items.map((item: any) => {
                    const quantity = this._itemDataManager.count(item);
                    return new DefaultUnit(this._knownComponentsById.get(componentId), quantity);
                });
           })
           .reduce((contents, unit) => contents.addUnit(unit), DefaultCombination.EMPTY<Component>());
    }

    private getContentsWithSourceItems(): Map<string, any[]> {
        const actor = this.actor;
        // @ts-ignore
        const ownedItems: EmbeddedCollection<typeof BaseItem, ActorData> = actor.items;
        return Array.from(ownedItems.values())
            .filter((item: any) => this._knownComponentsByItemUuid.has(item.getFlag("core", "sourceId")))
            .flatMap((item: BaseItem) => {
                const sourceItemUuid: string = <string> item.getFlag("core", "sourceId");
                const component = this._knownComponentsByItemUuid.get(sourceItemUuid);
                return { component, item };
            })
            .reduce((contents, entry) => {
                if (!contents.has(entry.component.id)) {
                    contents.set(entry.component.id, []);
                }
                contents.get(entry.component.id)
                    .push(entry.item);
                return contents;
            }, new Map<string, any>());
    }

    async perform(action: InventoryAction): Promise<Combination<Component>> {
        const rationalisedAction = action.rationalise();
        if (rationalisedAction.additions.isEmpty() && rationalisedAction.removals.isEmpty()) {
            return this.getContents();
        }
        await this.apply(action);
        return this.getContents();
    }

    async removeAll(components: Combination<Component>): Promise<void> {

        const sourceItemsByComponentId = this.getContentsWithSourceItems();

        const itemData = this._itemDataManager.prepareRemovals(components, sourceItemsByComponentId);

        if (itemData.updates.length > 0) {
            await this.updateOwnedItems(this._actor, itemData.updates);
        }
        if (itemData.deletes.length > 0) {
            await this.deleteOwnedItems(this._actor, itemData.deletes);
        }

    }

    async addAll(components: Combination<Component>, activeEffects: ActiveEffect[]): Promise<void> {

        const sourceItemsByComponentId = this.getContentsWithSourceItems();

        const itemData = this._itemDataManager.prepareAdditions(components, activeEffects, sourceItemsByComponentId);

        if (itemData.updates.length > 0) {
            await this.updateOwnedItems(this._actor, itemData.updates);
        }
        if (itemData.creates.length > 0) {
            await this.createOwnedItems(this._actor, itemData.creates);
        }

        // @ts-ignore - TODO: FVTT Types are wrong and `actor.name` is missing
        console.log(`Fabricate | Created ${itemData.creates.length} items and updated ${itemData.updates.length} items for actor "${this._actor.name}". `);
    }

    private async apply(action: InventoryAction): Promise<void> {
        await this.addAll(action.additions, action.activeEffects);
        await this.removeAll(action.removals);
    }

    async deleteOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        const ids: string[] = itemsData.map((itemData: any) => {
            if (!itemData.id) {
                throw new Error("Cannot delete item without ID. ");
            }
            return itemData.id;
        });
        return actor.deleteEmbeddedDocuments("Item", ids);
    }

    async createOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        return actor.createEmbeddedDocuments("Item", itemsData);
    }

    async updateOwnedItems(actor: any, itemsData: any[]): Promise<any[]> {
        return actor.updateEmbeddedDocuments("Item", itemsData);
    }

}

export {Inventory, CraftingInventory}