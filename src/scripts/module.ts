import Properties from "./Properties";
import {FabricateLifecycle} from "./application/FabricateLifecycle";
import FabricateApplication from "./application/FabricateApplication";
import {CompendiumImporter} from "./system/CompendiumImporter";
import {CraftingSystemDefinition} from "./system_definitions/CraftingSystemDefinition";
import {GameSystem} from "./system/GameSystem";
import {PartDictionary} from "./system/PartDictionary";
import {CraftingSystemFactory} from "./system/CraftingSystemFactory";
import {CraftingSystem} from "./system/CraftingSystem";
import {RollProvider5EFactory} from "./5e/RollProvider5E";
import {GameProvider} from "./foundry/GameProvider";
import {DiceRoller} from "./foundry/DiceRoller";
import {CraftingSystemManagerApp} from "./interface/apps/CraftingSystemManagerApp";

Hooks.on("renderSidebarTab", (app: any, html: any) => {
    const GAME = new GameProvider().globalGameObject();
    if (!(app instanceof ItemDirectory) || !GAME.user.isGM) {
        return;
    }
    const buttons = html.find(`.header-actions.action-buttons`);
    const buttonClass = Properties.ui.buttons.openCraftingSystemManager.class;
    const buttonText = GAME.i18n.localize(`${Properties.module.id}.ui.sidebar.buttons.openCraftingSystemManager`);
    const button = $(`<button class="${buttonClass}"><i class="fa-solid fa-flask-vial"></i> ${buttonText}</button>`);
    button.on('click', async (_event) => {
        new CraftingSystemManagerApp().render();
    });
    buttons.append(button);
});

Hooks.once('init', () => {
    const GAME = new GameProvider().globalGameObject();
    // @ts-ignore
    globalThis.ui.CraftingSystemManagerApp = CraftingSystemManagerApp;
    GAME.settings.register(Properties.module.id, "craftingSystems", {
        name: "",
        hint: "",
        scope: "world",
        config: false,
        type: Array,
        default: FabricateApplication.systems.systemDefinitions,
        onChange: () => {
            Object.values(ui.windows)
                .find(w => w instanceof CraftingSystemManagerApp)
                ?.render(true);
        }
    });
});

// Hooks.once('ready', loadCraftingSystems);
Hooks.once('ready', () => {
    FabricateLifecycle.init();
});

/**
 * Loads all Crafting Systems with a System Specification declared with the Crafting System Registry.
 * */
// @ts-ignore
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
    const enabled: boolean = <boolean> globalGameObject.settings.get(Properties.module.id, Properties.settings.craftingSystem.enabled(systemDefinition.id));
    systemDefinition.enabled = enabled;
    const craftingSystemFactory: CraftingSystemFactory = new CraftingSystemFactory({
        specification: systemDefinition,
        partDictionary: partDictionary,
        rollProviderFactory: new RollProvider5EFactory(),
        diceRoller: new DiceRoller("1d20")
    });
    const craftingSystem: CraftingSystem = craftingSystemFactory.make();
    FabricateApplication.systems.register(craftingSystem);
    console.log(`${Properties.module.label} | Loaded ${systemDefinition.name}. `);
}

