import {Inventory} from "../game/Inventory";
import {InventoryRecord} from "../game/InventoryRecord";
import {GameSystemType} from "../core/GameSystemType";
import {Ingredient} from "../core/Ingredient";
import {CraftingComponent} from "../core/CraftingComponent";
import {Recipe} from "../core/Recipe";

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

    abstract get contents(): InventoryRecord[];

    get size(): number {
        return this.contents.length;
    }

    public supportsGameSystem(gameSystem: GameSystemType): boolean {
        return this._supportedGameSystems.some((supported: GameSystemType) => supported === gameSystem);
    }

    public abstract add(component: CraftingComponent, quantity?: number): Promise<InventoryRecord>;

    contains(ingredient: Ingredient): boolean {
        const quantity = this.contents.filter((candidate: InventoryRecord) => candidate.componentType.equals(ingredient.componentType))
            .map((candidate: InventoryRecord) => candidate.totalQuantity)
            .reduce((left, right) => left + right, 0);
        return ingredient.quantity <= quantity;
    }

    hasAll(components: CraftingComponent[]): boolean {
        const componentCountById: Map<string, number> = new Map<string, number>();
        components.forEach((component: CraftingComponent) => {
            if (componentCountById.has(component.compendiumEntry.entryId)) {
                const currentCount = componentCountById.get(component.compendiumEntry.entryId);
                componentCountById.set(component.compendiumEntry.entryId, currentCount + 1);
            } else {
                componentCountById.set(component.compendiumEntry.entryId, 1);
            }
        });
        componentCountById.forEach((amountRequired: number, entryId: string) => {
            const inventoryRecordForType = this.contents.find((record: InventoryRecord) => record.componentType.compendiumEntry.entryId === entryId);
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
        for (let i = 0; i < this.contents.length; i++) {
            const thisRecord: InventoryRecord = this.contents[i];
            if (thisRecord.componentType.essences) {
                thisRecord.componentType.essences.forEach((essence: string) => {
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
            const present: boolean = this.contains(ingredient);
            if (!present) {
                failedToFind = true;
                return;
            }
            const occurrences = ingredientsByType.get(ingredient.componentType.compendiumEntry.entryId) + 1;
            ingredientsByType.set(ingredient.componentType.compendiumEntry.entryId, occurrences);
            if (occurrences > 1) {
                duplicatedIngredient = true;
            }
        });
        if (duplicatedIngredient) {
            throw new Error(`One or more ingredients were duplicated in a call to CraftingInventory.containsMany(ingredients: Ingredient[]). 
            Recipe[name='${recipe.name}',id='${recipe.entryId}'] seems to be misconfigured! Recipes should be specified as 
            Ingredient[Mud, 2], not [Ingredient[Mud, 1], Ingredient[Mud 1]]. `);
        }
        return !failedToFind;
    }

    public abstract remove(component: CraftingComponent, quantity?: number): Promise<boolean>;

    public abstract update(): void;

    public abstract updateQuantityFor(item: any): Promise<InventoryRecord | void>;

    abstract denormalizedContents(): CraftingComponent[];

}

export {CraftingInventory}