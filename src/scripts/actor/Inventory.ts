import {CraftingComponent} from "../common/CraftingComponent";
import {Combination, Unit} from "../common/Combination";
import {FabricateItemType} from "../compendium/CompendiumData";
import {PartDictionary} from "../system/PartDictionary";
import {ObjectUtility} from "../foundry/ObjectUtility";
import {CraftingResult} from "../crafting/result/CraftingResult";
import {GameSystemDocumentManager} from "./GameSystemDocumentManager";
import {InventoryContentsNotFoundError} from "../error/InventoryContentsNotFoundError";
import {AlchemyResult} from "../crafting/alchemy/AlchemyResult";

// @ts-ignore // todo: figure out v10 types
interface Inventory{
    actor: any;
    ownedComponents: Combination<CraftingComponent>;
    acceptCraftingResult(craftingResult: CraftingResult): Promise<any[]>;
    acceptAlchemyResult(alchemyResult: AlchemyResult): Promise<any[]>;
    index(): Combination<CraftingComponent>;
}

interface InventoryActions {
    additions: Combination<CraftingComponent>;
    removals: Combination<CraftingComponent>;
}

class CraftingInventory implements Inventory {

    private readonly _game: Game;
    private readonly _objectUtils: ObjectUtility;
    private readonly _documentManager: GameSystemDocumentManager;

    private readonly _actor: any;
    private _ownedComponents: Combination<CraftingComponent>;
    private readonly _partDictionary: PartDictionary;
    private _managedItems: Map<CraftingComponent, [any, number][]>;

    protected constructor({
            actor,
            partDictionary,
            game,
            objectUtils,
            documentManager,
            ownedComponents,
            managedItems
        }: {
            actor: any;
            partDictionary: PartDictionary;
            game: Game;
            objectUtils: ObjectUtility;
            documentManager: GameSystemDocumentManager;
            ownedComponents?: Combination<CraftingComponent>;
            managedItems?: Map<CraftingComponent, [any, number][]>;
    }) {
        this._actor = actor;
        this._partDictionary = partDictionary;
        this._game = game;
        this._objectUtils = objectUtils;
        this._documentManager = documentManager;
        this._ownedComponents = ownedComponents ?? Combination.EMPTY();
        this._managedItems = managedItems ?? new Map();
    }

    get actor(): any {
        return this._actor;
    }

    get ownedComponents(): Combination<CraftingComponent> {
        return this._ownedComponents.clone();
    }

    async removeAll(components: Combination<CraftingComponent>): Promise<any[]> {
        const updates: any[] = [];
        const deletes: any[] = [];
        for (const unit of components.units) {
            const craftingComponent: CraftingComponent = unit.part;
            if (!this.ownedComponents.has(craftingComponent)) {
                throw new InventoryContentsNotFoundError(unit, 0, this._actor.id);
            }
            const amountOwned = this.ownedComponents.amountFor(craftingComponent);
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
                    const newItemData: any = this._documentManager.writeQuantity(
                        this._objectUtils.duplicate(itemData),
                        quantity - outstandingRemovalAmount);
                    updates.push(newItemData);
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
                const sourceData: any = await this.prepareItemData(craftingComponent);
                const data: any = this._objectUtils.duplicate(sourceData);
                const newItemData: any = this._documentManager.writeQuantity(data, unit.quantity);
                creates.push(newItemData);
                break;
            }
            const records: [any, number][] = this._managedItems.get(craftingComponent)
                .sort((left: [any, number], right: [any, number]) => right[1] - left[1]);
            const itemToUpdate: [any, number] = records[0];
            const newItemData: any = this._documentManager.writeQuantity(
                this._objectUtils.duplicate(itemToUpdate[0].data),
                unit.quantity + itemToUpdate[1]);
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
        const compendium = this._game.packs.get(alchemyResult.baseComponent.compendiumId);
        const compendiumBaseItem = await compendium.getDocument(alchemyResult.baseComponent.partId);
        const customItemData = this._documentManager.customizeItem(compendiumBaseItem, alchemyResult.effects.applyToItemData(compendiumBaseItem));
        // const baseItemData: Entity.Data = duplicate(compendiumBaseItem.data);
        // mergeObject(baseItemData.data, alchemyResult.customItemData);
        // @ts-ignore
        const createdItemData: Entity.Data = await this._actor.createEmbeddedEntity('OwnedItem', customItemData);
        return null; // todo: implement once types are known
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

    private async prepareItemData(component: CraftingComponent): Promise<any> {
        const compendium = this._game.packs.get(component.systemId);
        const entity = await compendium.getDocument(component.partId);
        return entity.data;
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

    index(): Combination<CraftingComponent> {
        const actor: any = this.actor;
        const ownedItems: any[] = this._documentManager.listActorItems(actor);
        const itemsByComponentType: Map<CraftingComponent, [any, number][]> = new Map();
        const ownedComponents: Combination<CraftingComponent> = ownedItems.filter((item: any) => PartDictionary.typeOf(item) === FabricateItemType.COMPONENT)
            .map((item: any) => {
                const component: CraftingComponent = this._partDictionary.componentFrom(item);
                const quantity: number = this._documentManager.readQuantity(item);
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

}

export {Inventory, CraftingInventory}