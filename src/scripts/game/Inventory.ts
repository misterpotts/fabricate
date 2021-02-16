import {GameSystemType} from "../core/GameSystemType";
import {InventoryRecord} from "./InventoryRecord";
import {Ingredient} from "../core/Ingredient";
import {CraftingComponent} from "../core/CraftingComponent";
import {Recipe} from "../core/Recipe";

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
}

export {Inventory}