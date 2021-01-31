import {CraftingSystem} from "../core/CraftingSystem";
import {DefaultFabricator} from "../core/Fabricator";
import {Recipe} from "../core/Recipe";
import {GameSystemType} from "../core/GameSystemType";
import {Inventory} from "../core/Inventory";

class CraftingSystemRegistry {
    private static instance: CraftingSystemRegistry = new CraftingSystemRegistry();

    private static craftingSystemsByCompendiumKey: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static craftingSystemsByRecipeId: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static _systemSpecifications: CraftingSystem.Builder[] = [];
    private static _managedInventories: Map<string, Inventory> = new Map<string, Inventory>();

    constructor() {
        if (CraftingSystemRegistry.instance) {
            throw new Error('CraftingSystemRegistry is a singleton. Use `CraftingSystemRegistry.getInstance()` instead. ');
        }
    }

    public static getInstance(): CraftingSystemRegistry {
        return CraftingSystemRegistry.instance;
    }

    public static register(system: CraftingSystem): void {
        CraftingSystemRegistry.craftingSystemsByCompendiumKey.set(system.compendiumPackKey, system);
        CraftingSystemRegistry.resolveRecipesForSystem(system);
    }

    private static resolveRecipesForSystem(system: CraftingSystem): void {
        system.recipes.forEach((recipe: Recipe) => {
            CraftingSystemRegistry.craftingSystemsByRecipeId.set(recipe.itemId, system);
        });
    }

    public static getSystemByCompendiumPackKey(id:string): CraftingSystem {
        if (CraftingSystemRegistry.craftingSystemsByCompendiumKey.has(id)) {
            return CraftingSystemRegistry.craftingSystemsByCompendiumKey.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Compendium Pack Key ${id}. `);
    }

    public static getSystemByRecipeId(id:string): CraftingSystem {
        if (CraftingSystemRegistry.craftingSystemsByRecipeId.has(id)) {
            return CraftingSystemRegistry.craftingSystemsByRecipeId.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Recipe ${id}. `);
    }

    public static get systemSpecifications(): CraftingSystem.Builder[] {
        return this._systemSpecifications;
    }

    public static declareSpecification(spec: CraftingSystem.Builder) {
        CraftingSystemRegistry._systemSpecifications.push(spec);
    }

    public static addManagedInventoryForActor(actorId: string, inventory: Inventory): void {
        if (this._managedInventories.has(actorId)) {
            throw new Error(`The Crafting Inventory for Actor[${actorId}] is already managed by Fabricate and should not be overridden. `);
        }
        this._managedInventories.set(actorId, inventory);
    }

    public static getManagedInventoryForActor(actorId: string): Inventory {
        return this._managedInventories.get(actorId);
    }
}

const testSystemSpec: CraftingSystem.Builder = CraftingSystem.builder()
    .withName('Test System')
    .withCompendiumPackKey('fabricate.fabricate-test')
    .withSupportedGameSystem(GameSystemType.DND5E)
    .withFabricator(new DefaultFabricator());
CraftingSystemRegistry.declareSpecification(testSystemSpec);

export {CraftingSystemRegistry}