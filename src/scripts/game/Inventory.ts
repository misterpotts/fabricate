import {GameSystemType} from "../core/GameSystemType";
import {InventoryRecord} from "./InventoryRecord";
import {Ingredient} from "../core/Ingredient";
import {CraftingComponent} from "../core/CraftingComponent";
import {Recipe} from "../core/Recipe";
import {FabricateItem} from "../core/FabricateItem";
import {FabricationActionType} from "../core/FabricationAction";

class InventoryModification<T extends FabricateItem> {
    private readonly _action: FabricationActionType;
    private readonly _updatedRecord: InventoryRecord<T>;
    private readonly _quantityChanged: number;

    constructor(action: FabricationActionType, updatedRecord: InventoryRecord<T>, quantityChanged: number) {
        this._action = action;
        this._updatedRecord = updatedRecord;
        this._quantityChanged = quantityChanged;
    }

    get quantityChanged(): number {
        return this._quantityChanged;
    }

    get action(): FabricationActionType {
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
    hasAllIngredientsFor(recipe: Recipe): boolean;
    addComponent(component: CraftingComponent, quantity?: number, customData?: any): Promise<InventoryModification<CraftingComponent>>;
    removeComponent(component: CraftingComponent, quantity?: number): Promise<InventoryModification<CraftingComponent>>;
    update(): void;
    hasAllComponents(components: CraftingComponent[]): boolean;
    updateQuantityFor(item: any): Promise<boolean>;
}

export {Inventory, InventoryModification}