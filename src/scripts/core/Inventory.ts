import {GameSystemType} from "./GameSystemType";
import {InventoryRecord} from "./InventoryRecord";
import {Ingredient} from "./Ingredient";
import {CraftingComponent} from "./CraftingComponent";
import {Recipe} from "./Recipe";

interface Inventory {
    actor: Actor;
    supportedGameSystems: GameSystemType[];
    contents: InventoryRecord[];
    size: number;
    supportsGameSystem(gameSystem: GameSystemType): boolean;
    contains(ingredient: Ingredient): boolean;
    denormalizedContents(): CraftingComponent[];
    hasAllIngredientsFor(recipe: Recipe): boolean;
    add(component: CraftingComponent, quantity?: number): Promise<InventoryRecord>;
    remove(component: CraftingComponent, quantity?: number): Promise<boolean>;
    update(): void;
    updateQuantityFor(item: any): Promise<InventoryRecord>;
}

export {Inventory}