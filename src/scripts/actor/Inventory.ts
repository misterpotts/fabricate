import {CraftingComponent} from "../common/CraftingComponent";
import {Combination, Unit} from "../common/Combination";
import {FabricateItemType} from "../compendium/CompendiumData";
import {PartDictionary} from "../system/PartDictionary";
import {ObjectUtility} from "../foundry/ObjectUtility";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {GameSystemDocumentManager} from "./GameSystemDocumentManager";
import {InventoryContentsNotFoundError} from "../error/InventoryContentsNotFoundError";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";

interface Inventory<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {
    actor: A;
    ownedComponents: Combination<CraftingComponent>;
    acceptCraftingResult(craftingResult: CraftingResult): Promise<Item<Item.Data<D>>[]>;
    acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<Item<Item.Data<D>>[]>;
    index(): Combination<CraftingComponent>;
}

interface CraftingInventoryConfig<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> {
    actor: A;
    partDictionary: PartDictionary;
    game: Game;
    objectUtils: ObjectUtility;
    documentManager: GameSystemDocumentManager<D, A>;
    ownedComponents?: Combination<CraftingComponent>;
    managedItems?: Map<CraftingComponent, [Item<Item.Data<D>>, number][]>;
}

interface InventoryActions {
    additions: Combination<CraftingComponent>;
    removals: Combination<CraftingComponent>;
}

class CraftingInventory<D, A extends Actor<Actor.Data, Item<Item.Data<D>>>> implements Inventory<D, A> {

    private readonly _game: Game;
    private readonly _objectUtils: ObjectUtility;
    private readonly _documentManager: GameSystemDocumentManager<D, A>;

    private readonly _actor: A;
    private _ownedComponents: Combination<CraftingComponent>;
    private readonly _partDictionary: PartDictionary;
    private _managedItems: Map<CraftingComponent, [Item<Item.Data<D>>, number][]>;

    protected constructor(config: CraftingInventoryConfig<D, A>) {
        this._actor = config.actor;
        this._partDictionary = config.partDictionary;
        this._game = config.game;
        this._objectUtils = config.objectUtils;
        this._documentManager = config.documentManager;
        this._ownedComponents = config.ownedComponents ? config.ownedComponents : Combination.EMPTY();
        this._managedItems = config.managedItems ? config.managedItems : new Map();
    }

    get actor(): A {
        return this._actor;
    }

    get ownedComponents(): Combination<CraftingComponent> {
        return this._ownedComponents.clone();
    }

    async removeAll(components: Combination<CraftingComponent>): Promise<Item<Item.Data<D>>[]> {
        const updates: Item.Data<D>[] = [];
        const deletes: Item.Data<D>[] = [];
        for (const unit of components.units) {
            const craftingComponent: CraftingComponent = unit.part;
            if (!this.ownedComponents.has(craftingComponent)) {
                throw new InventoryContentsNotFoundError(unit, 0, this._actor.id);
            }
            const amountOwned = this.ownedComponents.amountFor(craftingComponent);
            if (unit.quantity > amountOwned) {
                throw new InventoryContentsNotFoundError(unit, amountOwned, this._actor.id);
            }
            const records: [Item<Item.Data<D>>, number][] = this._managedItems.get(craftingComponent)
                .sort((left: [Item<Item.Data<D>>, number], right: [Item<Item.Data<D>>, number]) => left[1] - right[1]);
            let outstandingRemovalAmount: number = unit.quantity;
            let currentRecordIndex: number = 0;
            while (outstandingRemovalAmount > 0) {
                const currentRecord: [Item<Item.Data<D>>, number] = records[currentRecordIndex];
                const quantity: number = currentRecord[1];
                const itemData: Item.Data<D> = currentRecord[0].data;
                if (quantity <= outstandingRemovalAmount) {
                    deletes.push(itemData);
                    outstandingRemovalAmount -= quantity;
                } else {
                    const newItemData: Item.Data<D> = this.setQuantityFor(this._objectUtils.duplicate(itemData), quantity - outstandingRemovalAmount);
                    updates.push(newItemData);
                    outstandingRemovalAmount = 0;
                }
                currentRecordIndex++;
            }
        }
        const results: Item<Item.Data<D>>[] = [];
        if (updates.length > 0) {
            const updatedItems: Item<Item.Data<D>>[] = await this.updateOwnedItems(this._actor, updates);
            results.push(...updatedItems);
        }
        if (deletes.length > 0) {
            const createdItems: Item<Item.Data<D>>[] = await this.deleteOwnedItems(this._actor, deletes);
            results.push(...createdItems);
        }
        return results;
    }

    async addAll(components: Combination<CraftingComponent>): Promise<Item<Item.Data<D>>[]> {
        const updates: Item.Data<D>[] = [];
        const creates: Item.Data<D>[] = [];
        for (const unit of components.units) {
            const craftingComponent: CraftingComponent = unit.part;
            if (!this.ownedComponents.has(craftingComponent)) {
                const sourceData: Item.Data<D> = await this.prepareItemData(craftingComponent);
                const data: Item.Data<D> = this._objectUtils.duplicate(sourceData);
                const newItemData: Item.Data<D> = this.setQuantityFor(data, unit.quantity);
                creates.push(newItemData);
                break;
            }
            const records: [Item<Item.Data<D>>, number][] = this._managedItems.get(craftingComponent)
                .sort((left: [Item<Item.Data<D>>, number], right: [Item<Item.Data<D>>, number]) => right[1] - left[1]);
            const itemToUpdate: [Item<Item.Data<D>>, number] = records[0];
            const newItemData: Item.Data<D> = this.setQuantityFor(this._objectUtils.duplicate(itemToUpdate[0].data), unit.quantity + itemToUpdate[1]);
            updates.push(newItemData);
        }
        const results: Item<Item.Data<D>>[] = [];
        if (updates.length > 0) {
            const updatedItems: Item<Item.Data<D>>[] = await this.updateOwnedItems(this._actor, updates);
            results.push(...updatedItems);
        }
        if (creates.length > 0) {
            const createdItems: Item<Item.Data<D>>[] = await this.createOwnedItems(this._actor, creates);
            results.push(...createdItems);
        }
        return results;
    }

    async acceptCraftingResult(craftingResult: CraftingResult): Promise<Item<Item.Data<D>>[]> {
        const inventoryActions: InventoryActions = this.rationalise(craftingResult.created, craftingResult.consumed);
        // todo: Can *potentially* optimise further by combining all update operations across both add and remove,
        //  reducing total actions on the actor from 4 (ADD[CREATE, UPDATE], REMOVE[UPDATE, DELETE]) to 3
        //  ([CREATE, UPDATE, DELETE])
        const modifiedItemData: Item<Item.Data<D>>[][] = await Promise.all([
            this.addAll(inventoryActions.additions),
            this.removeAll(inventoryActions.removals)
        ]);
        return modifiedItemData[0].concat(modifiedItemData[1]);
    }

    async acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<Item<Item.Data<D>>[]> {
        const compendium: Compendium = this._game.packs.get(alchemyResult.baseItem.compendiumId);
        const compendiumBaseItem: Entity<Entity.Data, Entity.Data> = await compendium.getEntity(alchemyResult.baseItem.partId);
        const baseItemData: Entity.Data = duplicate(compendiumBaseItem.data);
        mergeObject(baseItemData.data, alchemyResult.customItemData);
        const createdItemData: Entity.Data = await this._actor.createEmbeddedEntity('OwnedItem', baseItemData);
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

    private async prepareItemData(component: CraftingComponent): Promise<Item.Data<D>> {
        const compendium: Compendium = this._game.packs.get(component.systemId);
        const entity: Entity<Item.Data<D>> = <Entity<Item.Data<D>>> await compendium.getEntity(component.partId);
        return entity.data;
    }

    getOwnedItems(actor: A): Item<Item.Data<D>>[] {
        return this._documentManager.listActorItems(actor);
    }

    getQuantityFor(item: Item<Item.Data<D>>): number {
        return this._documentManager.readQuantity(item);
    }

    setQuantityFor(itemData: Item.Data<D>, quantity: number): Item.Data<D> {
        return this._documentManager.writeQuantity(itemData, quantity);
    }

    async deleteOwnedItems(actor: A, itemsData: Item.Data<D>[]): Promise<Item<Item.Data<D>>[]> {
        const ids: string[] = itemsData.map((itemData: Item.Data<D>) => itemData._id);
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.deleteEmbeddedEntity('OwnedItem', ids);
    }

    async createOwnedItems(actor: A, itemsData: Item.Data<D>[]): Promise<Item<Item.Data<D>>[]> {
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.createEmbeddedEntity('OwnedItem', itemsData);
    }

    async updateOwnedItems(actor: A, itemsData: Item.Data<D>[]): Promise<Item<Item.Data<D>>[]> {
        // @ts-ignore todo: This works in foundry but doesn't seem to be supported by VTT Types - check with League
        return actor.updateEmbeddedEntity('OwnedItem', itemsData);
    }

    index(): Combination<CraftingComponent> {
        const actor: A = this.actor;
        const ownedItems: Item<Item.Data<D>>[] = this.getOwnedItems(actor);
        const itemsByComponentType: Map<CraftingComponent, [Item<Item.Data<D>>, number][]> = new Map();
        const ownedComponents: Combination<CraftingComponent> = ownedItems.filter((item: Item<Item.Data<D>>) => PartDictionary.typeOf(item) === FabricateItemType.COMPONENT)
            .map((item: Item<Item.Data<D>>) => {
                const component: CraftingComponent = this._partDictionary.componentFrom(item);
                const quantity: number = this.getQuantityFor(item);
                if (itemsByComponentType.has(component)) {
                    itemsByComponentType.get(component).push([item, quantity]);
                } else {
                    itemsByComponentType.set(component, [[item, quantity]]);
                }
                return Combination.of(component, quantity);
            })
            .reduce((left: Combination<CraftingComponent>, right: Combination<CraftingComponent>) => left.combineWith(right), Combination.EMPTY());
        this._managedItems = itemsByComponentType;
        return ownedComponents;
    }

    // @ts-ignore
    //todo: implement
    add(component: CraftingComponent, customData: Item<Item.Data<D>>): Promise<Item<Item.Data<D>>> {
        return Promise.resolve(undefined);
    }

}

export {Inventory, CraftingInventory}