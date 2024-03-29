import {Component} from "../crafting/component/Component";
import {Combination, DefaultCombination} from "../common/Combination";
import {DefaultUnit} from "../common/Unit";
import {InventoryAction} from "./InventoryAction";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {Essence} from "../crafting/essence/Essence";
import {ItemDataManager, SingletonItemDataManager} from "./ItemDataManager";
import {Recipe} from "../crafting/recipe/Recipe";
import {Identifiable} from "../common/Identifiable";

interface Inventory {

    /**
     * The actor to which this inventory belongs.
     */
    readonly actor: Actor;

    /**
     * The components in this inventory.
     *
     * @returns A Promise that resolves with the components in this inventory.
     * @throws Error if the actor does not exist.
     */
    getContents(): Combination<Component>;

    /**
     * The recipes owned by the actor to which this inventory belongs.
     *
     * @returns A Promise that resolves with the recipes owned by the actor to which this inventory belongs.
     * @throws Error if the actor does not exist.
     */
    getOwnedRecipes(): Combination<Recipe>;

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

    private readonly _actor: Actor;
    private readonly _localization: LocalizationService;
    private readonly _itemDataManager: ItemDataManager;

    /**
     * A Map of source item UUIDs to the Component that uses it. An inventory expects to be initialised with a complete
     * set of components for a single crafting system. Item UUIDs must therefore map to a single component.
     * @private
     */
    private readonly _knownComponentsByItemUuid: Map<string, Component>;
    private readonly _knownComponentsById: Map<string, Component>;
    /**
     * A Map of source item UUIDs to the Recipe that uses it. An inventory expects to be initialised with a complete
     * set of recipes for a single crafting system. Item UUIDs must therefore map to a single recipe.
     * @private
     */
    private readonly _knownRecipesByItemUuid: Map<string, Recipe>;
    private readonly _knownRecipesById: Map<string, Recipe>;

    constructor({
        actor,
        localization,
        itemDataManager = new SingletonItemDataManager(),
        knownComponents = [],
        knownRecipes = []
    }: {
        actor: Actor;
        localization: LocalizationService;
        knownEssencesById?: Map<string, Essence>;
        itemDataManager?: ItemDataManager;
        knownComponents?: Component[];
        knownRecipes?: Recipe[];
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

        this._knownRecipesByItemUuid = new Map();
        this._knownRecipesById = new Map();
        knownRecipes.forEach(recipe => {
            this._knownRecipesByItemUuid.set(recipe.itemUuid, recipe);
            this._knownRecipesById.set(recipe.id, recipe);
        });
    }

    get actor(): Actor {
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
        const contentsWithSourceItems = this.identifyItems(this._knownComponentsByItemUuid);
        return Array.from(contentsWithSourceItems.entries())
            .flatMap(([componentId, items]) => {
                return items.map((item: any) => {
                    const quantity = this._itemDataManager.count(item);
                    return new DefaultUnit(this._knownComponentsById.get(componentId), quantity);
                });
           })
           .reduce((contents, unit) => contents.addUnit(unit), DefaultCombination.EMPTY<Component>());
    }

    getOwnedRecipes(): Combination<Recipe> {
        const ownedRecipesWithSourceItems = this.identifyItems(this._knownRecipesByItemUuid);
        return Array.from(ownedRecipesWithSourceItems.entries())
            .flatMap(([recipeId, items]) => {
                return items.map((item: any) => {
                    const quantity = this._itemDataManager.count(item);
                    return new DefaultUnit(this._knownRecipesById.get(recipeId), quantity);
                });
            })
            .reduce((contents, unit) => contents.addUnit(unit), DefaultCombination.EMPTY<Recipe>());
    }

    private identifyItems<T extends Identifiable>(knownItems: Map<string, T>): Map<string, any[]> {
        const actor = this.actor;
        const ownedItems: EmbeddedCollection<Item> = actor.items;
        return Array.from(ownedItems.values())
            .filter((item: Item) => knownItems.has(item.getFlag("core", "sourceId")))
            .flatMap((item: Item) => {
                const sourceItemUuid: string = <string> item.getFlag("core", "sourceId");
                const identifiableItem = knownItems.get(sourceItemUuid);
                return { identifiableItem, item };
            })
            .reduce((contents, entry) => {
                if (!contents.has(entry.identifiableItem.id)) {
                    contents.set(entry.identifiableItem.id, []);
                }
                contents.get(entry.identifiableItem.id)
                    .push(entry.item);
                return contents;
            }, new Map<string, any[]>());
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

        const sourceItemsByComponentId = this.identifyItems(this._knownComponentsByItemUuid);

        const itemData = this._itemDataManager.prepareRemovals(components, sourceItemsByComponentId);

        if (itemData.updates.length > 0) {
            await this.updateOwnedItems(this._actor, itemData.updates);
        }
        if (itemData.deletes.length > 0) {
            await this.deleteOwnedItems(this._actor, itemData.deletes);
        }

    }

    async addAll(components: Combination<Component>, activeEffects: ActiveEffect[]): Promise<void> {

        const sourceItemsByComponentId = this.identifyItems(this._knownComponentsByItemUuid);

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