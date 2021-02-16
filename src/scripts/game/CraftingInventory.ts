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
            .map((candidate: InventoryRecord) => candidate.quantity)
            .reduce((left, right) => left + right, 0);
        return ingredient.quantity <= quantity;
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
                        if (remaining === 1) {
                            outstandingEssencesByType.delete(essence);
                        } else {
                            outstandingEssencesByType.set(essence, remaining - 1);
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

    abstract updateQuantityFor(item: any): Promise<InventoryRecord>;

    public abstract remove(component: CraftingComponent, quantity?: number): Promise<boolean>;

    public abstract update(): void;

    abstract denormalizedContents(): CraftingComponent[];

}

export {CraftingInventory}