import {CraftingSystem} from "../core/CraftingSystem";
import {Inventory} from "../game/Inventory";
import {Recipe} from "../core/Recipe";
import {InventoryRecord} from "../game/InventoryRecord";
import Properties from "../Properties";
import {InventoryRecordData} from "./CraftingTab";

interface CraftingSystemData {
    disabled: boolean;
    compendiumPackKey: string;
    name: string;
    selected: boolean;
}

interface RecipeData {
    name: string;
    entryId: string;
}

class CraftingTabDTO {

    private readonly _craftingSystems: CraftingSystem[];
    private readonly _inventory: Inventory;
    private readonly _actor: Actor;

    private _selectedSystemId: string;
    private _hasEnabledSystems: boolean;
    private _craftingSystemData: CraftingSystemData[] = [];
    private _craftableRecipes: RecipeData[] = [];
    private _inventoryContents: InventoryRecordData[] = [];
    private _hopperContents: InventoryRecordData[] = [];

    constructor(craftingSystems: CraftingSystem[], inventory: Inventory, actor: Actor) {
        this._craftingSystems = craftingSystems;
        this._inventory = inventory;
        this._actor = actor;
    }

    get craftingSystems(): CraftingSystemData[] {
        return this._craftingSystemData;
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

    get hasEnabledSystems(): boolean {
        return this._hasEnabledSystems;
    }

    get actor(): Actor {
        return this._actor;
    }

    async init(): Promise<void> {
        let enabledSystems: number = 0;
        this._selectedSystemId = this._actor.getFlag(Properties.module.name, 'crafting.selectedSystemId');
        this._craftingSystems.forEach((system: CraftingSystem) => {
            if (system.enabled) {
                enabledSystems++;
            }
            this._craftingSystemData.push({
                disabled: !system.enabled,
                compendiumPackKey: system.compendiumPackKey,
                name: system.name,
                selected: system.compendiumPackKey === this._selectedSystemId
            })
        });
        this._hasEnabledSystems = enabledSystems > 0;
        if (!this._hasEnabledSystems) {
            return;
        }
        if (this.hasEnabledSystems && !this._selectedSystemId) {
            this._selectedSystemId = this._craftingSystemData[0].compendiumPackKey;
        }
        const selectedSystem = this._craftingSystems.find((system: CraftingSystem) => system.compendiumPackKey === this._selectedSystemId);
        selectedSystem.recipes.filter((recipe: Recipe) => this._inventory.hasAllIngredientsFor(recipe))
            .forEach((recipe: Recipe) => {
                this._craftableRecipes.push({name: recipe.name, entryId: recipe.entryId});
            });
        this._inventory.contents.filter((inventoryRecord: InventoryRecord) => inventoryRecord.componentType.compendiumEntry.compendiumKey === this._selectedSystemId)
            .forEach((inventoryRecord: InventoryRecord) => {
                this._inventoryContents.push({
                    name: inventoryRecord.componentType.name,
                    entryId: inventoryRecord.componentType.compendiumEntry.entryId,
                    quantity: inventoryRecord.totalQuantity,
                    imageUrl: inventoryRecord.componentType.imageUrl
                });
            });
        const savedHopperContents: InventoryRecordData[] = this._actor.getFlag(Properties.module.name, `crafting.${this._selectedSystemId}.hopper`);
        if (savedHopperContents) {
            this._hopperContents = savedHopperContents;
            savedHopperContents.forEach((hopperItem: InventoryRecordData) => {
                const inventoryItem = this._inventoryContents.find((inventoryItem: InventoryRecordData) => inventoryItem.entryId === hopperItem.entryId);
                if (inventoryItem) {
                    inventoryItem.quantity = inventoryItem.quantity - hopperItem.quantity;
                }
            });
            this._inventoryContents = this._inventoryContents.filter((inventoryItem: InventoryRecordData) => inventoryItem.quantity > 0);
        }
    }
}

export {CraftingTabDTO}