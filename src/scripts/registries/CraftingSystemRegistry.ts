import {CraftingSystem} from "../core/CraftingSystem";
import {Recipe} from "../core/Recipe";
import {GameSystemType} from "../core/GameSystemType";
import {DefaultFabricator} from "../core/Fabricator";

class CraftingSystemRegistry {
    private static instance: CraftingSystemRegistry = new CraftingSystemRegistry();

    private static craftingSystemsByCompendiumKey: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static craftingSystemsByRecipeId: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static _systemSpecifications: CraftingSystem.Builder[] = [];

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
            CraftingSystemRegistry.craftingSystemsByRecipeId.set(recipe.entryId, system);
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

}

const testSystemSpec: CraftingSystem.Builder = CraftingSystem.builder()
    .withName('Child\'s Play')
    .withEnableHint('Enable the test Crafting System for Fabricate?')
    .withCompendiumPackKey('fabricate.fabricate-test')
    .withSupportedGameSystem(GameSystemType.DND5E)
    .withFabricator(new DefaultFabricator());
CraftingSystemRegistry.declareSpecification(testSystemSpec);

import {AlchemistsSuppliesSystemSpec} from './system_definitions/AlchemistsSuppliesV11'
CraftingSystemRegistry.declareSpecification(AlchemistsSuppliesSystemSpec);

export {CraftingSystemRegistry}