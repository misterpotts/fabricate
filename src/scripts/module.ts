import Properties from "./Properties";
import {CraftingSystemRegistry} from "./registries/CraftingSystemRegistry";
import {FabricateLifecycle} from "./application/FabricateLifecycle";
import {CraftingSystemSpecification} from "./core/CraftingSystemSpecification";
import {CompendiumImportingCraftingSystemFactory, CraftingSystemFactory} from "./core/CraftingSystemFactory";

Hooks.once('ready', loadCraftingSystems);
Hooks.once('ready', () => {
    FabricateLifecycle.init();
});

/**
 * Loads all Crafting Systems with a System Specification declared with the Crafting System Registry.
 * */
async function loadCraftingSystems(): Promise<void> {
    const systemSpecifications = CraftingSystemRegistry.systemSpecifications;
    console.log(`${Properties.module.label} | Loading ${systemSpecifications.length} crafting systems. `);
    systemSpecifications.forEach(FabricateLifecycle.registerCraftingSystemSettings);
    systemSpecifications.forEach(loadCraftingSystem);
    const systemNames = systemSpecifications.map((systemSpec: CraftingSystemSpecification) => systemSpec.name);
    console.log(`${Properties.module.label} | Loaded ${systemSpecifications.length} crafting systems: ${systemNames.join(', ')} `);
}

/**
 * Loads a single Crafting System from a System Specification, which must include a Compendium Pack Key. Item data from
 * the Compendium Pack is used to load the Recipes and Crafting Components into the system from the compendium. The
 * Fabricator, supported systems and name provided in the spec are all preserved.
 *
 * @param systemSpec `CraftingSystemSpecification` that determines how a system behaves and which compendium pack content
 * for the system should be loaded from.
 * */
async function loadCraftingSystem(systemSpec: CraftingSystemSpecification): Promise<void> {
    console.log(`${Properties.module.label} | Loading ${systemSpec.name} from Compendium pack ${systemSpec.compendiumPackKey}. `);
    if (systemSpec.supportedGameSystems.indexOf(game.system.id) < 0) {
        console.log(`${Properties.module.label} | ${systemSpec.name} does not support ${game.system.id}! `);
        return;
    }
    const craftingSystemFactory: CraftingSystemFactory = new CompendiumImportingCraftingSystemFactory(systemSpec);
    const craftingSystem = await craftingSystemFactory.make();
    const enabled = game.settings.get(Properties.module.name, Properties.settingsKeys.craftingSystem.enabled(systemSpec.compendiumPackKey));
    craftingSystem.enabled = enabled;
    CraftingSystemRegistry.register(craftingSystem);
    console.log(`${Properties.module.label} | Loaded ${systemSpec.name}. `);
}

