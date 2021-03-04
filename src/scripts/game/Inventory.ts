import {GameSystemType} from "../core/GameSystemType";
import {InventoryRecord} from "./InventoryRecord";
import {Ingredient} from "../core/Ingredient";
import {CraftingComponent} from "../core/CraftingComponent";
import {Recipe} from "../core/Recipe";
import {FabricateItem} from "../core/FabricateItem";
import {ActionType} from "../core/ActionType";

class InventoryModification<T extends FabricateItem> {
    private readonly _changedItems: Item[];
    private readonly _action: ActionType;
    private readonly _updatedRecord: InventoryRecord<T>;

    constructor(changedItems: Item[], action: ActionType, updatedRecord: InventoryRecord<T>) {
        this._changedItems = changedItems;
        this._action = action;
        this._updatedRecord = updatedRecord;
    }

    get changedItems(): Item[] {
        return this._changedItems;
    }

    get action(): ActionType {
        return this._action;
    }

    get updatedRecord(): InventoryRecord<FabricateItem> {
        return this._updatedRecord;
    }
}

interface Inventory {
    actor: Actor;
    supportedGameSystems: GameSystemType[];
    contents: InventoryRecord<FabricateItem>[];
    components: InventoryRecord<CraftingComponent>[];
    recipes: InventoryRecord<Recipe>[];
    size: number;
    supportsGameSystem(gameSystem: GameSystemType): boolean;
    containsIngredient(ingredient: Ingredient): boolean;
    containsRecipe(partId: string): boolean;
    denormalizedContainedComponents(): CraftingComponent[];
    hasAllIngredientsFor(recipe: Recipe): boolean;
    addComponent(component: CraftingComponent, quantity?: number, customData?: any): Promise<InventoryModification<CraftingComponent>>;
    removeComponent(component: CraftingComponent, quantity?: number): Promise<InventoryModification<CraftingComponent>>;
    update(): void;
    hasAllComponents(components: CraftingComponent[]): boolean;
    updateQuantityFor(item: any): Promise<boolean>;
}

export {Inventory, InventoryModification}