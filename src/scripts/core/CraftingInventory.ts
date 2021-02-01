import {Inventory} from "./Inventory";
import {InventoryRecord} from "./InventoryRecord";
import {GameSystemType} from "./GameSystemType";
import {Ingredient} from "./Ingredient";
import {CraftingComponent} from "./CraftingComponent";
import {Recipe} from "./Recipe";

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
        const ingredientsByType = new Map<string, number>();
        let failedToFind: boolean = false;
        let duplicatedIngredient: boolean = false;
        recipe.components.forEach((ingredient: Ingredient) => {
            const present: boolean = this.contains(ingredient);
            if (!present) {
                failedToFind = true;
                return;
            }
            const occurrences = ingredientsByType.get(ingredient.componentType.compendiumEntry.entryId) +1;
            ingredientsByType.set(ingredient.componentType.compendiumEntry.entryId, occurrences);
            if (occurrences > 1) {
                duplicatedIngredient = true;
            }
        });
        if (duplicatedIngredient) {
            throw new Error(`One or more ingredients were duplicated in a call to CraftingInventory.containsMany(ingredients: Ingredient[]). 
            Recipe[name='${recipe.name}',id='${recipe.itemId}'] seems to be misconfigured! Recipes should be specified as 
            Ingredient[Mud, 2], not [Ingredient[Mud, 1], Ingredient[Mud 1]]. `);
        }
        return !failedToFind;
    }

    public abstract remove(component: CraftingComponent, quantity?: number): Promise<boolean>;

    public abstract update(): void;
}

export {CraftingInventory}