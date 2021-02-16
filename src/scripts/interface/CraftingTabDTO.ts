import {CraftingSystem} from "../core/CraftingSystem";
import {Inventory} from "../game/Inventory";
import {Recipe} from "../core/Recipe";
import {InventoryRecord} from "../game/InventoryRecord";
import Properties from "../Properties";

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

interface InventoryRecordData {
    name: string;
    entryId: string;
    quantity: number;
    imageUrl: string;
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

    private determineSelectedSystemId(enabledSystems: number, craftingSystems: CraftingSystemData[], actor: Actor): string {
        const storedSystemId: string = actor.getFlag(Properties.module.name, 'crafting.selectedSystemId');
        if (storedSystemId && storedSystemId.length > 0) {
            return storedSystemId;
        } else if (!storedSystemId && enabledSystems >= 1) {
            const firstEnabledSystem: CraftingSystemData = craftingSystems.find((system: CraftingSystemData) => !system.disabled);
            firstEnabledSystem.selected = true;
            actor.setFlag(Properties.module.name, 'crafting.selectedSystemId', firstEnabledSystem.compendiumPackKey);
            return firstEnabledSystem.compendiumPackKey;
        }
        return null;
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

    async init(): Promise<void> {
        let enabledSystems: number = 0;
        this._craftingSystems.forEach((system: CraftingSystem) => {
            if (system.enabled) {
                enabledSystems++;
            }
            this._craftingSystemData.push({
                disabled: !system.enabled,
                compendiumPackKey: system.compendiumPackKey,
                name: system.name,
                selected: false
            })
        });
        this._hasEnabledSystems = enabledSystems > 0;
        this._selectedSystemId = this.determineSelectedSystemId(enabledSystems, this._craftingSystemData, this._actor);
        if (this._selectedSystemId && this._selectedSystemId.length > 0) {
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
            }
        }
    }
}

export {CraftingTabDTO}