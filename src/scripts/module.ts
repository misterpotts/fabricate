import {ItemRecipeTab} from "./interface/ItemRecipeTab";
import {CraftingSystem} from "./core/CraftingSystem";
import Properties from "./Properties";
import {FabricateFlags, FabricateItemType} from "./core/FabricateFlags";
import {Recipe} from "./core/Recipe";
import {CraftingComponent} from "./core/CraftingComponent";
import {CraftingSystemRegistry} from "./systems/CraftingSystemRegistry";
import {CraftingTab} from "./interface/CraftingTab";

// Enable as needed for dev. Do not release!
// CONFIG.debug.hooks = true;

Hooks.once('ready', loadCraftingSystems);

async function loadCraftingSystems() {
    let systemSpecifications = CraftingSystemRegistry.systemSpecifications;
    console.log(`${Properties.module.label} | Loading ${systemSpecifications.length} crafting systems. `);
    systemSpecifications.forEach(loadCraftingSystem);
}

/**
 * Loads a single Crafting System from a System Specification, which must include a Compendium Pack Key. Item data from
 * the Compendium Pack is used to load the Recipes and Crafting Components into the system from the compendium. The
 * Fabricator, supported systems and name provided in the spec are all preserved
 *
 * @param systemSpec A partially populated `CraftingSystem.Builder` to which the Recipes and Components will be added
 * once imported from the Compendium. Must specify a Compendium Pack Key.
 * */
async function loadCraftingSystem(systemSpec: CraftingSystem.Builder) {
    console.log(`${Properties.module.label} | Loading ${systemSpec.name} from Compendium pack ${systemSpec.compendiumPackKey}. `);
    if (systemSpec.supportedGameSystems.indexOf(game.system.id) < 0) {
        console.log(`${Properties.module.label} | ${systemSpec.name} does not support ${game.system.id}! `);
        return;
    }
    let systemPack: Compendium = game.packs.get(systemSpec.compendiumPackKey)
    let content = await loadCompendiumContent(systemPack, 10);
    content.forEach((item: Entity) => {
        let itemConfig: FabricateFlags = item.data.flags.fabricate;
        switch (itemConfig.type) {
            case FabricateItemType.COMPONENT:
                systemSpec.withComponent(CraftingComponent.fromFlags(itemConfig));
                break;
            case FabricateItemType.RECIPE:
                systemSpec.withRecipe(Recipe.fromFlags(itemConfig));
                break;
            default:
                throw new Error(`${Properties.module.label} | Unable to load item ${item.id}. Could not determine Fabricate Entity Type. `);
        }
    });
    let system: CraftingSystem = systemSpec.build();
    CraftingSystemRegistry.register(system);
    console.log(`${Properties.module.label} | Loaded ${systemSpec.name}. `);
}

/**
 * Fallback awaiter for loading compendium content, as this was observed to be unreliable during development after the
 * game 'ready' Hook was fired
 *
 * @param compendium The Compendium from which to reliably load the Content
 * @param maxAttempts The maximum number of times to attempt loading Compendium Content
 * */
async function loadCompendiumContent(compendium: Compendium, maxAttempts: number): Promise<Entity<{}>[]> {
    let content: Entity[] = await compendium.getContent();
    let attempts: number = 0;
    while ((!content || (content.length === 0)) && (attempts <= maxAttempts)) {
        console.log(`${Properties.module.label} | Waiting for content in Compendium Pack ${compendium.id} (Attempt ${attempts} of ${maxAttempts}. `);
        await wait(1000);
        attempts++;
        content = await compendium.getContent();
    }
    return content;
}

/**
 * Simple async awaiter delay function
 * @param delay The number of millis to wait before resolving
 * @return a promise that resolves once the delay period has elapsed
 * */
async function wait(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
}

Hooks.on('renderItemSheet5e', (sheetData: ItemSheet, sheetHtml: any) => {
    ItemRecipeTab.bind(sheetData, sheetHtml);
});

Hooks.on('renderActorSheet5e', (sheetData: ItemSheet, sheetHtml: any, eventData: any) => {
    CraftingTab.bind(sheetData, sheetHtml, eventData);
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    // @ts-ignore
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});