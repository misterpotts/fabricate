import {CraftingSystem} from "../core/CraftingSystem";
import {DefaultFabricator} from "../core/Fabricator";

class CraftingSystemRegistry {
    private static instance: CraftingSystemRegistry = new CraftingSystemRegistry();

    private static craftingSystemsByCompendiumKey: Map<string, CraftingSystem> = new Map<string, CraftingSystem>();
    private static _systemSpecifications: CraftingSystem.Builder[] = [];

    constructor() {
        if (CraftingSystemRegistry.instance) {
            throw new Error('CraftingSystemRegistry is a singleton. Use `CraftingSystemRegistry.getInstance()` instead. ');
        }
    }

    public static getInstance(): CraftingSystemRegistry {
        return CraftingSystemRegistry.instance;
    }

    public static register(system: CraftingSystem) {
        CraftingSystemRegistry.craftingSystemsByCompendiumKey.set(system.compendiumPackKey, system);
    }

    public static get(id:string): CraftingSystem {
        if (CraftingSystemRegistry.craftingSystemsByCompendiumKey.has(id)) {
            return CraftingSystemRegistry.craftingSystemsByCompendiumKey.get(id);
        }
        throw new Error(`No Crafting system is registered with Fabricate for the Compendium Pack Key ${id}. `);
    }

    public static get systemSpecifications(): CraftingSystem.Builder[] {
        return this._systemSpecifications;
    }

    public static declareSpecification(spec: CraftingSystem.Builder) {
        CraftingSystemRegistry._systemSpecifications.push(spec);
    }
}

const testSystemSpec: CraftingSystem.Builder = CraftingSystem.builder()
    .withName('Test System')
    .withCompendiumPackKey('fabricate.fabricate-test')
    .withSupportedGameSystem('dnd5e')
    .withFabricator(new DefaultFabricator());
CraftingSystemRegistry.declareSpecification(testSystemSpec);

export {CraftingSystemRegistry}