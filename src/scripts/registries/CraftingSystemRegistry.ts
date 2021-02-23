import {CraftingSystem} from "../core/CraftingSystem";
import {Recipe} from "../core/Recipe";
import {GameSystemType} from "../core/GameSystemType";
import {DefaultFabricator} from "../core/Fabricator";
import {CraftingSystemSpecification} from "../core/CraftingSystemSpecification";
import {AlchemistsSuppliesSystemSpec} from "./system_definitions/AlchemistsSuppliesV11";

class CraftingSystemRegistry {
    private static _instance: CraftingSystemRegistry = new CraftingSystemRegistry();

    private static _craftingSystemsByCompendiumKey: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static _craftingSystemsByRecipeId: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static _systemSpecifications: CraftingSystemSpecification[] = CraftingSystemRegistry.staticSystemSpecifications();

    constructor() {
        if (CraftingSystemRegistry._instance) {
            throw new Error('CraftingSystemRegistry is a singleton. Use `CraftingSystemRegistry.getInstance()` instead. ');
        }
    }

    public static getInstance(): CraftingSystemRegistry {
        return CraftingSystemRegistry._instance;
    }

    public static register(system: CraftingSystem): void {
        CraftingSystemRegistry._craftingSystemsByCompendiumKey.set(system.compendiumPackKey, system);
        CraftingSystemRegistry.resolveRecipesForSystem(system);
    }

    private static resolveRecipesForSystem(system: CraftingSystem): void {
        system.recipes.forEach((recipe: Recipe) => {
            CraftingSystemRegistry._craftingSystemsByRecipeId.set(recipe.partId, system);
        });
    }

    public static getSystemByCompendiumPackKey(id:string): CraftingSystem {
        if (CraftingSystemRegistry._craftingSystemsByCompendiumKey.has(id)) {
            return CraftingSystemRegistry._craftingSystemsByCompendiumKey.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Compendium Pack Key ${id}. `);
    }

    public static getSystemByRecipeId(id:string): CraftingSystem {
        if (CraftingSystemRegistry._craftingSystemsByRecipeId.has(id)) {
            return CraftingSystemRegistry._craftingSystemsByRecipeId.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Recipe ${id}. `);
    }

    public static getAllSystems(): CraftingSystem[] {
        return Array.from(CraftingSystemRegistry._craftingSystemsByCompendiumKey.values());
    }

    public static get systemSpecifications(): CraftingSystemSpecification[] {
        return CraftingSystemRegistry._systemSpecifications;
    }

    public static declareSpecification(spec: CraftingSystemSpecification) {
        CraftingSystemRegistry._systemSpecifications.push(spec);
    }

    public static staticSystemSpecifications(): CraftingSystemSpecification[] {

        const systemSpecifications: CraftingSystemSpecification[] = [];

        const testSystemSpec: CraftingSystemSpecification = CraftingSystemSpecification.builder()
            .withName('Child\'s Play')
            .withEnableHint('Enable the test Crafting System for Fabricate?')
            .withDescription('A simple tech demo used for the early development of Fabricate. ')
            .withCompendiumPackKey('fabricate.fabricate-test')
            .withSupportedGameSystem(GameSystemType.DND5E)
            .withFabricator(new DefaultFabricator())
            .build();
        systemSpecifications.push(testSystemSpec);

        systemSpecifications.push(AlchemistsSuppliesSystemSpec);

        return systemSpecifications;
    }

}



export {CraftingSystemRegistry}