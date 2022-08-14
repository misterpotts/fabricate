import Properties from "./Properties";
import {FabricateLifecycle} from "./application/FabricateLifecycle";
import FabricateApplication from "./application/FabricateApplication";
import {CompendiumImporter} from "./system/CompendiumImporter";
import {CraftingSystemSpecification} from "./system/specification/CraftingSystemSpecification";
import {GameSystem} from "./system/GameSystem";
import {PartDictionary} from "./system/PartDictionary";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystem} from "./system/CraftingSystem";

Hooks.once('ready', loadCraftingSystems);
Hooks.once('ready', () => {
    FabricateLifecycle.init();
});

/**
 * Loads all Crafting Systems with a System Specification declared with the Crafting System Registry.
 * */
async function loadCraftingSystems(): Promise<void> {
    const systemSpecifications = FabricateApplication.systems.systemSpecifications;
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
    console.log(`${Properties.module.label} | Loading ${systemSpec.name} from Compendium pack(s) ${systemSpec.compendiumPacks.join(', ')}. `);
    if (systemSpec.gameSystem !== game.system.id as GameSystem) {
        console.log(`${Properties.module.label} | ${systemSpec.name} does not support the current game system (${game.system.id}), and will not be loaded. `);
        return;
    }
    const compendiumImporter: CompendiumImporter = new CompendiumImporter();
    const partDictionary: PartDictionary = await compendiumImporter.import(systemSpec);
    const enabled: boolean = <boolean> game.settings.get(Properties.module.name, Properties.settingsKeys.craftingSystem.enabled(systemSpec.id));
    const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory(systemSpec, partDictionary, enabled);
    const craftingSystem: CraftingSystem = craftingSystemFactory.make();
    FabricateApplication.systems.register(craftingSystem);
    console.log(`${Properties.module.label} | Loaded ${systemSpec.name}. `);
}

