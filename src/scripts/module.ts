import Properties from "./Properties";
import {FabricateLifecycle} from "./application/FabricateLifecycle";
import FabricateApplication from "./application/FabricateApplication";
import {CompendiumImporter} from "./system/CompendiumImporter";
import {CraftingSystemDefinition} from "./registries/system_definitions/interface/CraftingSystemDefinition";
import {GameSystem} from "./system/GameSystem";
import {PartDictionary} from "./system/PartDictionary";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystem} from "./system/CraftingSystem";
import {RollProvider5EFactory} from "./5e/RollProvider5E";

Hooks.once('ready', loadCraftingSystems);
Hooks.once('ready', () => {
    FabricateLifecycle.init();
});

/**
 * Loads all Crafting Systems with a System Specification declared with the Crafting System Registry.
 * */
async function loadCraftingSystems(): Promise<void> {
    const systemSpecifications = FabricateApplication.systems.systemDefinitions;
    console.log(`${Properties.module.label} | Loading ${systemSpecifications.length} crafting systems. `);
    systemSpecifications.forEach(FabricateLifecycle.registerCraftingSystemSettings);
    systemSpecifications.forEach(loadCraftingSystem);
    const systemNames = systemSpecifications.map((systemSpec: CraftingSystemDefinition) => systemSpec.name);
    console.log(`${Properties.module.label} | Loaded ${systemSpecifications.length} crafting systems: ${systemNames.join(', ')} `);
}

/**
 * Loads a single Crafting System from a System Specification, which must include a Compendium Pack Key. Item data from
 * the Compendium Pack is used to load the Recipes and Crafting Components into the system from the compendium. The
 * Fabricator, supported systems and name provided in the spec are all preserved.
 *
 * @param systemDefinition `CraftingSystemDefinition` that determines how a system behaves and which compendium packs
 * content for the system should be loaded from.
 * */
async function loadCraftingSystem(systemDefinition: CraftingSystemDefinition): Promise<void> {
    console.log(`${Properties.module.label} | Loading ${systemDefinition.name} from Compendium pack(s) ${systemDefinition.compendia.join(', ')}. `);
    const globalGameObject = new GameProvider().globalGameObject();
    const gameSystemId = globalGameObject.system.id;
    if (systemDefinition.gameSystem !== gameSystemId as GameSystem) {
        console.log(`${Properties.module.label} | ${systemDefinition.name} does not support the current game system (${gameSystemId}), and will not be loaded. `);
        return;
    }
    const compendiumImporter: CompendiumImporter = new CompendiumImporter();
    const partDictionary: PartDictionary = await compendiumImporter.import(systemDefinition.id, systemDefinition.compendia, systemDefinition.essences);
    const enabled: boolean = <boolean> globalGameObject.settings.get(Properties.module.name, Properties.settingsKeys.craftingSystem.enabled(systemDefinition.id));
    systemDefinition.enabled = enabled;
    const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory({
        specification: systemDefinition,
        partDictionary: partDictionary,
        rollProviderFactory: new RollProvider5EFactory()
    });
    const craftingSystem: CraftingSystem = craftingSystemFactory.make();
    FabricateApplication.systems.register(craftingSystem);
    console.log(`${Properties.module.label} | Loaded ${systemDefinition.name}. `);
}

