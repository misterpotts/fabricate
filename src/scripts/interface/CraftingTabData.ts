import type {
  CraftingSystemData,
  CraftingSystemInfo,
  InventoryRecordData,
  RecipeCraftingData,
  RecipeData,
} from './InterfaceDataTypes';
import CONSTANTS from '../constants';
import type { CraftingSystem } from '../system/CraftingSystem';
import type { Inventory } from '../actor/Inventory';
import type { InventoryRecord } from '../actor/InventoryRecord';
import type { CraftingComponent } from '../common/CraftingComponent';
import type { ItemData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';
import type { Recipe } from '../crafting/Recipe';

interface InventoryContents {
  ownedComponents: InventoryRecordData[];
  preparedComponents: InventoryRecordData[];
}

class CraftingTabData {
  private readonly _craftingSystems: CraftingSystem[];
  private readonly _inventory: Inventory<ItemData,Actor>;
  private readonly _actor: Actor;

  private _craftingSystemData: CraftingSystemData;
  private _recipeData: RecipeCraftingData;
  private _inventoryContents: InventoryContents;

  constructor(craftingSystems: CraftingSystem[], inventory: Inventory<ItemData,Actor>, actor: Actor) {
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
    this._craftingSystemData = <CraftingSystemData>await this.prepareCraftingSystemData(this._craftingSystems, this._actor);

    if (this._craftingSystemData.hasEnabledSystems) {
      const selectedCraftingSystem = <CraftingSystem>this._craftingSystems.find(
        (system: CraftingSystem) => system.compendiumPackKey === this._craftingSystemData.selectedSystemId
      );

      this._recipeData = await this.prepareRecipeDataForSystem(selectedCraftingSystem, this._actor, this._inventory);

      this._inventoryContents = this.prepareInventoryDataForSystem(
        selectedCraftingSystem,
        this._actor,
        this._inventory,
      );
    }
  }

  async prepareCraftingSystemData(craftingSystems: CraftingSystem[], actor: Actor): Promise<CraftingSystemData|undefined> {
    let enabledSystems: number = 0;
    const craftingSystemsInfo: CraftingSystemInfo[] = [];
    const storedSystemId = <string>actor.getFlag(CONSTANTS.module.name, CONSTANTS.flagKeys.actor.selectedCraftingSystem);
    craftingSystems.forEach((system: CraftingSystem) => {
      if (system.enabled) {
        enabledSystems++;
      }
      craftingSystemsInfo.push({
        disabled: !system.enabled,
        compendiumPackKey: <string>system.compendiumPackKey,
        name: system.name,
        selected: system.compendiumPackKey === storedSystemId
      });
    });
    const hasEnabledSystems: boolean = enabledSystems > 0;
    if (storedSystemId) {
      return <CraftingSystemData>{
        systems: craftingSystemsInfo,
        hasEnabledSystems: hasEnabledSystems,
        selectedSystemId: storedSystemId
      };
    } else if (hasEnabledSystems) {
      const firstEnabledSystem = <CraftingSystemInfo>craftingSystemsInfo.find((systemInfo: CraftingSystemInfo) => !systemInfo.disabled);
      firstEnabledSystem.selected = true;
      await actor.setFlag(
        CONSTANTS.module.name,
        CONSTANTS.flagKeys.actor.selectedCraftingSystem,
        firstEnabledSystem.compendiumPackKey,
      );
      return <CraftingSystemData>{
        systems: craftingSystemsInfo,
        hasEnabledSystems: hasEnabledSystems,
        selectedSystemId: firstEnabledSystem.compendiumPackKey,
      };
    }else {
      return undefined;
    }
  }

  async prepareRecipeDataForSystem(
    craftingSystem: CraftingSystem,
    actor: Actor,
    inventory: Inventory<ItemData,Actor>,
  ): Promise<RecipeCraftingData> {
    const storedKnownRecipes: string[] = <string[]>actor.getFlag(
      CONSTANTS.module.name,
      CONSTANTS.flagKeys.actor.knownRecipesForSystem(craftingSystem.compendiumPackKey),
    );
    const knownRecipes: string[] = storedKnownRecipes ? storedKnownRecipes : [];
    const enabledRecipes: Map<string, RecipeData> = new Map<string, RecipeData>();
    const disabledRecipes: RecipeData[] = [];
    craftingSystem.recipes.forEach((recipe: Recipe) => {
      const isKnown: boolean = knownRecipes.includes(recipe.partId);
      const isOwned: boolean = inventory.containsPart(recipe.partId);
      const isCraftable: boolean = isKnown || isOwned ? inventory.hasAllIngredientsFor(recipe) : false;
      if (isCraftable) {
        enabledRecipes.set(recipe.partId, {
          name: recipe.name,
          partId: recipe.partId,
          known: isKnown,
          owned: isOwned,
          craftable: isCraftable,
          selected: false,
        });
      } else {
        disabledRecipes.push({
          name: recipe.name,
          partId: recipe.partId,
          known: isKnown,
          owned: isOwned,
          craftable: isCraftable,
          selected: false,
        });
      }
    });
    const storedRecipeId: string = <string>await this._actor.getFlag(
      CONSTANTS.module.name,
      CONSTANTS.flagKeys.actor.selectedRecipe,
    );
    if (enabledRecipes.has(storedRecipeId)) {
      (<RecipeData>enabledRecipes.get(storedRecipeId)).selected = true;
      return {
        recipes: Array.from(enabledRecipes.values()).concat(disabledRecipes),
        hasCraftableRecipe: true,
      };
    } else {
      // await this._actor.unsetFlag(CONSTANTS.module.name, CONSTANTS.flagKeys.actor.selectedRecipe);
      if (enabledRecipes.size === 0) {
        return {
          recipes: disabledRecipes,
          hasCraftableRecipe: false,
        };
      }
      const craftableRecipes: RecipeData[] = Array.from(enabledRecipes.values());
      const defaultRecipe: RecipeData = <RecipeData>craftableRecipes[0];
      defaultRecipe.selected = true;
      //await this._actor.setFlag(CONSTANTS.module.name, CONSTANTS.flagKeys.actor.selectedRecipe, defaultRecipe.partId);
      return {
        recipes: craftableRecipes.concat(disabledRecipes),
        hasCraftableRecipe: true,
      };
    }
  }

  prepareInventoryDataForSystem(
    craftingSystem: CraftingSystem,
    actor: Actor,
    inventory: Inventory<ItemData>,
  ): InventoryContents {
    const inventoryContents: InventoryContents = {
      ownedComponents: [],
      preparedComponents: [],
    };
    inventory.components
      .filter(
        (inventoryRecord: InventoryRecord<CraftingComponent>) =>
          inventoryRecord.fabricateItem.systemId === craftingSystem.compendiumPackKey &&
          inventoryRecord.fabricateItem.essences &&
          inventoryRecord.fabricateItem.essences.length > 0,
      )
      .forEach((inventoryRecord: InventoryRecord<CraftingComponent>) => {
        inventoryContents.ownedComponents.push({
          name: inventoryRecord.fabricateItem.name,
          entryId: inventoryRecord.fabricateItem.partId,
          quantity: inventoryRecord.totalQuantity,
          imageUrl: inventoryRecord.fabricateItem.imageUrl,
        });
      });
    const savedHopperContents: InventoryRecordData[] = <InventoryRecordData[]>actor.getFlag(
      CONSTANTS.module.name,
      CONSTANTS.flagKeys.actor.hopperForSystem(craftingSystem.compendiumPackKey),
    );
    if (savedHopperContents) {
      inventoryContents.preparedComponents = savedHopperContents;
      savedHopperContents.forEach((hopperItem: InventoryRecordData) => {
        const inventoryItem = inventoryContents.ownedComponents.find(
          (inventoryItem: InventoryRecordData) => inventoryItem.entryId === hopperItem.entryId
        );
        if (inventoryItem) {
          inventoryItem.quantity = inventoryItem.quantity - hopperItem.quantity;
        }
      });
      inventoryContents.ownedComponents = inventoryContents.ownedComponents.filter(
        (inventoryItem: InventoryRecordData) => inventoryItem.quantity > 0,
      );
    }
    return inventoryContents;
  }
}

export { CraftingTabData };
