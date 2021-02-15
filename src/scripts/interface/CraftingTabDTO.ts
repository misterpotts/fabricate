import {CraftingSystem} from "../core/CraftingSystem";
import {Inventory} from "../game/Inventory";
import {Recipe} from "../core/Recipe";
import {InventoryRecord} from "../game/InventoryRecord";

interface CraftingSystemData {
    enabled: boolean;
    compendiumPackKey: string;
    name: string;
    selected: boolean;
}

interface RecipeData {
    name: string;
    entryId: string;
}

interface InventoryRecordData {
    name: string;
    entryId: string;
    quantity: number;
}

class CraftingTabDTO {

    private _selectedSystemId: string;

    private readonly _craftingSystems: CraftingSystemData[] = [];
    private readonly _craftableRecipes: RecipeData[] = [];
    private readonly _inventoryContents: InventoryRecordData[] = [];
    private readonly _hopperContents: InventoryRecordData[] = [];

    constructor(craftingSystems: CraftingSystem[], inventory: Inventory) {
        craftingSystems.forEach((system: CraftingSystem) => {
            this._craftingSystems.push({
                enabled: system.enabled,
                compendiumPackKey: system.compendiumPackKey,
                name: system.name,
                selected: false
            })
        });
        if (this._selectedSystemId && this._selectedSystemId.length > 0) {
            const selectedSystem = craftingSystems.find((system: CraftingSystem) => system.compendiumPackKey === this._selectedSystemId);
            selectedSystem.recipes.filter((recipe: Recipe) => inventory.hasAllIngredientsFor(recipe))
                .forEach((recipe: Recipe) => {
                    this._craftableRecipes.push({name: recipe.name, entryId: recipe.entryId});
                });
            inventory.contents.filter((inventoryRecord: InventoryRecord) => inventoryRecord.componentType.compendiumEntry.compendiumKey === this._selectedSystemId)
                .forEach((inventoryRecord: InventoryRecord) => {
                    this._inventoryContents.push({
                        name: inventoryRecord.componentType.name,
                        entryId: inventoryRecord.componentType.compendiumEntry.entryId,
                        quantity: inventoryRecord.quantity
                    });
                });
        }
    }

    get craftingSystems(): CraftingSystemData[] {
        return this._craftingSystems;
    }

    get craftableRecipes(): RecipeData[] {
        return this._craftableRecipes;
    }

    get inventoryContents(): InventoryRecordData[] {
        return this._inventoryContents;
    }

    get hopperContents(): InventoryRecordData[] {
        return this._hopperContents;
    }

    get selectedSystemId(): string {
        return this._selectedSystemId;
    }

    set selectedSystemId(value: string) {
        this._selectedSystemId = value;
    }

}

export {CraftingTabDTO}