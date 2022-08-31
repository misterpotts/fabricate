import Properties from "../Properties";
import {
    CraftingSystemData,
    CraftingSystemInfo,
    InventoryRecordData,
    RecipeCraftingData,
    RecipeData
} from "./InterfaceDataTypes";
import {CraftingSystem} from "../system/CraftingSystem";
import {Inventory} from "../actor/Inventory";
import {Recipe} from "../crafting/Recipe";

interface InventoryContents {
    ownedComponents: InventoryRecordData[];
    preparedComponents: InventoryRecordData[];
}

class CraftingTabData {

    private readonly _craftingSystems: CraftingSystem[];
    private readonly _inventory: Inventory;
    private readonly _actor: any;

    private _craftingSystemData: CraftingSystemData;
    private _recipeData: RecipeCraftingData;
    private _inventoryContents: InventoryContents;

    constructor(craftingSystems: CraftingSystem[], inventory: Inventory, actor: any) {
        this._craftingSystems = craftingSystems;
        this._inventory = inventory;
        this._actor = actor;
    }

    get crafting(): CraftingSystemData {
        return this._craftingSystemData;
    }

    get recipeCrafting(): RecipeCraftingData {
        return this._recipeData;
    }

    get inventory(): InventoryContents {
        return this._inventoryContents;
    }

    get actor(): Actor {
        return this._actor;
    }

    async init(): Promise<void> {
        this._craftingSystemData = await this.prepareCraftingSystemData(this._craftingSystems, this._actor);

        if (this._craftingSystemData.hasEnabledSystems) {
            const selectedCraftingSystem = this._craftingSystems.find((system: CraftingSystem) => system.id === this._craftingSystemData.selectedSystemId);

            this._recipeData = await this.prepareRecipeDataForSystem(selectedCraftingSystem, this._actor, this._inventory);

            this._inventoryContents = this.prepareInventoryDataForSystem(selectedCraftingSystem,this._actor, this._inventory);
        }
    }

    async prepareCraftingSystemData(craftingSystems: CraftingSystem[], actor: any): Promise<CraftingSystemData> {
        let enabledSystems: number = 0;
        const craftingSystemsInfo: CraftingSystemInfo[] = [];
        const storedSystemId = actor.getFlag(Properties.module.id, Properties.flagKeys.actor.selectedCraftingSystem);
        craftingSystems.forEach((system: CraftingSystem) => {
            if (system.enabled) {
                enabledSystems++;
            }
            craftingSystemsInfo.push({
                disabled: !system.enabled,
                compendiumPackKey: system.id,
                name: system.name,
                selected: system.id === storedSystemId
            })
        });
        const hasEnabledSystems: boolean = enabledSystems > 0;
        if (storedSystemId) {
            return {
                systems: craftingSystemsInfo,
                hasEnabledSystems: hasEnabledSystems,
                selectedSystemId: storedSystemId
            }
        } else if (hasEnabledSystems) {
            const firstEnabledSystem = craftingSystemsInfo.find((systemInfo: CraftingSystemInfo) => !systemInfo.disabled);
            firstEnabledSystem.selected = true;
            await actor.setFlag(Properties.module.id, Properties.flagKeys.actor.selectedCraftingSystem, firstEnabledSystem.compendiumPackKey);
            return {
                systems: craftingSystemsInfo,
                hasEnabledSystems: hasEnabledSystems,
                selectedSystemId: firstEnabledSystem.compendiumPackKey
            }
        }
    }

    async prepareRecipeDataForSystem(craftingSystem: CraftingSystem, actor: any, inventory: Inventory): Promise<RecipeCraftingData> {
        const storedKnownRecipes: string[] = actor.getFlag(Properties.module.id, Properties.flagKeys.actor.knownRecipesForSystem(craftingSystem.id));
        const knownRecipes: string[] = storedKnownRecipes ? storedKnownRecipes : [];
        const enabledRecipes: Map<string, RecipeData> = new Map();
        const disabledRecipes: RecipeData[] = [];
        craftingSystem.recipes.forEach((recipe: Recipe) => {
            const isKnown: boolean = knownRecipes.includes(recipe.partId);
            const isOwned: boolean = inventory.contains(recipe.partId);
            const isCraftable: boolean = isKnown || isOwned;
            if (isCraftable) {
                enabledRecipes.set(recipe.partId, {
                    name: recipe.name,
                    partId: recipe.partId,
                    known: isKnown,
                    owned: isOwned,
                    craftable: isCraftable,
                    selected: false
                });
            } else {
                disabledRecipes.push({
                    name: recipe.name,
                    partId: recipe.partId,
                    known: isKnown,
                    owned: isOwned,
                    craftable: isCraftable,
                    selected: false
                });
            }
        });
        const storedRecipeId: string = await this._actor.getFlag(Properties.module.id, Properties.flagKeys.actor.selectedRecipe);
        if (enabledRecipes.has(storedRecipeId)) {
            enabledRecipes.get(storedRecipeId).selected = true;
            return {
                recipes: Array.from(enabledRecipes.values()).concat(disabledRecipes),
                hasCraftableRecipe: true
            }
        } else {
            // await this._actor.unsetFlag(Properties.module.name, Properties.flagKeys.actor.selectedRecipe);
            if (enabledRecipes.size === 0) {
                return {
                    recipes: disabledRecipes,
                    hasCraftableRecipe: false
                }
            }
            const craftableRecipes: RecipeData[] = Array.from(enabledRecipes.values());
            const defaultRecipe: RecipeData = craftableRecipes[0];
            defaultRecipe.selected = true;
            //await this._actor.setFlag(Properties.module.name, Properties.flagKeys.actor.selectedRecipe, defaultRecipe.partId);
            return {
                recipes: craftableRecipes.concat(disabledRecipes),
                hasCraftableRecipe: true
            }
        }
    }

    prepareInventoryDataForSystem(craftingSystem: CraftingSystem, actor: any, inventory: Inventory): InventoryContents {
        const inventoryContents: InventoryContents = {
            ownedComponents: [],
            preparedComponents: []
        }
        inventoryContents.ownedComponents = inventory.ownedComponents.units
            .filter(unit => unit.part.systemId === craftingSystem.id)
            .filter(unit => !unit.part.essences.isEmpty())
            .map(unit => {
                return {
                    name: unit.part.name,
                    partId: unit.part.id,
                    quantity: unit.quantity,
                    imageUrl: unit.part.imageUrl
                }
            });
        const savedHopperContents: InventoryRecordData[] = actor.getFlag(Properties.module.id, Properties.flagKeys.actor.hopperForSystem(craftingSystem.id));
        if (savedHopperContents) {
            inventoryContents.preparedComponents = savedHopperContents;
            savedHopperContents.forEach((hopperItem: InventoryRecordData) => {
                const inventoryItem = inventoryContents.ownedComponents.find((inventoryItem: InventoryRecordData) => inventoryItem.partId === hopperItem.partId);
                if (inventoryItem) {
                    inventoryItem.quantity = inventoryItem.quantity - hopperItem.quantity;
                }
            });
            inventoryContents.ownedComponents = inventoryContents.ownedComponents.filter((inventoryItem: InventoryRecordData) => inventoryItem.quantity > 0);
        }
        return inventoryContents;
    }
}

export {CraftingTabData}