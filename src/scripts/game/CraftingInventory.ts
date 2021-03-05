import {Inventory, InventoryModification} from "./Inventory";
import {InventoryRecord} from "./InventoryRecord";
import {GameSystemType} from "../core/GameSystemType";
import {Ingredient} from "../core/Ingredient";
import {CraftingComponent} from "../core/CraftingComponent";
import {Recipe} from "../core/Recipe";
import {FabricateItem} from "../core/FabricateItem";
import Properties from "../Properties";
import FabricateApplication from "../application/FabricateApplication";
import {FabricateItemType} from "./CompendiumData";
import {CraftingSystem} from "../core/CraftingSystem";

abstract class CraftingInventory implements Inventory {

    protected readonly _actor: any;
    protected _supportedGameSystems: GameSystemType[];

    protected constructor(actor: Actor) {
        this._actor = actor;
        this._supportedGameSystems = [];
    }

    get actor(): Actor {
        return this._actor;
    }

    get actorId(): string {
        return this._actor.id;
    }

    get supportedGameSystems(): GameSystemType[] {
        return this._supportedGameSystems;
    }

    abstract get contents(): InventoryRecord<FabricateItem>[];

    abstract get components(): InventoryRecord<CraftingComponent>[];

    abstract get recipes(): InventoryRecord<Recipe>[];

    get size(): number {
        return this.contents.length;
    }

    get componentCount(): number {
        return this.components.map((componentRecord: InventoryRecord<CraftingComponent>) => componentRecord.totalQuantity)
            .reduce((left, right) => left + right, 0);
    }

    public supportsGameSystem(gameSystem: GameSystemType): boolean {
        return this._supportedGameSystems.some((supported: GameSystemType) => supported === gameSystem);
    }

    public abstract addComponent(component: CraftingComponent, quantity?: number): Promise<InventoryModification<CraftingComponent>>;

    containsIngredient(ingredient: Ingredient): boolean {
        const quantity = this.components.filter((candidate: InventoryRecord<CraftingComponent>) => candidate.fabricateItem.sharesType(ingredient))
            .map((candidate: InventoryRecord<FabricateItem>) => candidate.totalQuantity)
            .reduce((left, right) => left + right, 0);
        return ingredient.quantity <= quantity;
    }

    containsRecipe(partId: string): boolean {
        const match = this.recipes.find((recipe: InventoryRecord<Recipe>) => recipe.fabricateItem.partId === partId);
        return !!match;
    }

    hasAllComponents(components: CraftingComponent[]): boolean {
        const componentCountById: Map<string, number> = new Map<string, number>();
        components.forEach((component: CraftingComponent) => {
            if (componentCountById.has(component.partId)) {
                const currentCount = componentCountById.get(component.partId);
                componentCountById.set(component.partId, currentCount + 1);
            } else {
                componentCountById.set(component.partId, 1);
            }
        });
        componentCountById.forEach((amountRequired: number, partId: string) => {
            const inventoryRecordForType = this.components.find((record: InventoryRecord<CraftingComponent>) => record.fabricateItem.partId === partId);
            if (!inventoryRecordForType || inventoryRecordForType.totalQuantity < amountRequired) {
                return false;
            }
        });
        return true;
    }

    hasAllIngredientsFor(recipe: Recipe): boolean {
        return this.hasAllNamedIngredients(recipe) && this.hasAllEssences(recipe);
    }

    private hasAllEssences(recipe: Recipe): boolean {
        const outstandingEssencesByType: Map<string, number> = new Map<string, number>();
        if (!recipe.essences || recipe.essences.length === 0) {
            return true;
        }
        recipe.essences.forEach((essence: string) => {
            if (outstandingEssencesByType.has(essence)) {
                outstandingEssencesByType.set(essence, outstandingEssencesByType.get(essence) + 1);
            } else {
                outstandingEssencesByType.set(essence, 1);
            }
        });
        for (let i = 0; i < this.components.length; i++) {
            const thisRecord: InventoryRecord<CraftingComponent> = this.components[i];
            if (thisRecord.fabricateItem.essences) {
                thisRecord.fabricateItem.essences.forEach((essence: string) => {
                    if (outstandingEssencesByType.has(essence)) {
                        const remaining: number = outstandingEssencesByType.get(essence);
                        const contribution = thisRecord.totalQuantity;
                        if (remaining <= contribution) {
                            outstandingEssencesByType.delete(essence);
                        } else {
                            outstandingEssencesByType.set(essence, remaining - contribution);
                        }
                    }
                });
                if (outstandingEssencesByType.size === 0) {
                    return true;
                }
            }
        }
        return false;
    }

    private hasAllNamedIngredients(recipe: Recipe): boolean {
        const ingredientsByType = new Map<string, number>();
        let failedToFind: boolean = false;
        let duplicatedIngredient: boolean = false;
        recipe.ingredients.forEach((ingredient: Ingredient) => {
            const present: boolean = this.containsIngredient(ingredient);
            if (!present) {
                failedToFind = true;
                return;
            }
            const occurrences = ingredientsByType.get(ingredient.component.partId) + 1;
            ingredientsByType.set(ingredient.component.partId, occurrences);
            if (occurrences > 1) {
                duplicatedIngredient = true;
            }
        });
        if (duplicatedIngredient) {
            throw new Error(`One or more ingredients were duplicated in a call to CraftingInventory.containsMany(ingredients: Ingredient[]). 
            Recipe[name='${recipe.name}',id='${recipe.partId}'] seems to be mis-configured! Recipes should be specified as 
            Ingredient[Mud, 2], not [Ingredient[Mud, 1], Ingredient[Mud 1]]. `);
        }
        return !failedToFind;
    }

    protected getOwningCraftingSystemForItem(item: Item): CraftingSystem {
        const systemId = item.getFlag(Properties.module.name, Properties.flagKeys.item.systemId);
        const craftingSystem = FabricateApplication.systems.getSystemByCompendiumPackKey(systemId);
        if (!craftingSystem) {
            throw new Error(`Unable to look up crafting System '${systemId}' when indexing Item '${item._id}'. `);
        }
        return craftingSystem;
    }

    protected lookUp(item: Item): FabricateItem {
        const craftingSystem: CraftingSystem = this.getOwningCraftingSystemForItem(item);
        const itemType: FabricateItemType = item.getFlag(Properties.module.name, Properties.flagKeys.item.fabricateItemType);
        const partId: string = item.getFlag(Properties.module.name, Properties.flagKeys.item.partId);
        switch (itemType) {
            case FabricateItemType.RECIPE:
                const recipe: Recipe = craftingSystem.getRecipeByPartId(partId);
                if (recipe) {
                    return recipe;
                }
                throw new Error(`Unable to look up Recipe with Part ID '${partId}' from Crafting System 
                    '${craftingSystem.compendiumPackKey}. '`);
            case FabricateItemType.COMPONENT:
                const craftingComponent: CraftingComponent = craftingSystem.getComponentByPartId(partId);
                if (craftingComponent) {
                    return craftingComponent;
                }
                throw new Error(`Unable to look up Crafting Component with Part ID '${partId}' from Crafting System 
                    '${craftingSystem.compendiumPackKey}. '`);
            default:
                throw new Error(`Unrecognized Fabricate Item Type of '${itemType}' for Item '${item._id}'. 
                    The allowable values are 'COMPONENT' and 'RECIPE'. `)
        }
    }

    public abstract removeComponent(component: CraftingComponent, quantity?: number): Promise<InventoryModification<CraftingComponent>>;

    public abstract update(): void;

    public abstract updateQuantityFor(item: any): Promise<boolean>;

}

export {CraftingInventory}