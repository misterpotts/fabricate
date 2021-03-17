import {GameSystemType} from "../core/GameSystemType";
import {InventoryRecord} from "./InventoryRecord";
import {CraftingComponent} from "../core/CraftingComponent";
import {Recipe} from "../core/Recipe";
import {FabricateItem} from "../core/FabricateItem";
import {FabricationAction} from "../core/FabricationAction";

interface Inventory<T extends Item.Data> {
    actor: Actor;
    supportedGameSystems: GameSystemType[];
    contents: InventoryRecord<FabricateItem>[];
    components: InventoryRecord<CraftingComponent>[];
    recipes: InventoryRecord<Recipe>[];
    size: number;
    supportsGameSystem(gameSystem: GameSystemType): boolean;
    containsPart(partId: string, quantity?: number): boolean
    hasAllIngredientsFor(recipe: Recipe): boolean;
    add(item: FabricateItem, quantity?: number, customData?: any): Promise<FabricationAction<T>>;
    remove(item: FabricateItem, quantity?: number): Promise<FabricationAction<T>>;
    update(): void;
    containsAll(item: FabricateItem[]): boolean;
    updateQuantityFor(item: any): Promise<boolean>;
}

export {Inventory}