import {CraftingSystem} from "./core/CraftingSystem.js";
import Systems from "./systems/Systems.js"
import Properties from "./Properties.js";
import {CraftingElement} from "./core/CraftingElement";
import {Recipe} from "./core/Recipe.js";

Hooks.once('init', registerModuleSettings);

Hooks.once('ready', extendItemBehaviour);
Hooks.once('ready', loadCraftingSystems);

Hooks.on('createItem', (entity) => {
    // TODO: Some way to support other systems from the item information?
    if (entity.data.data.source && entity.data.data.source.startsWith(Properties.crafting.itemSourcePrefix)) {
        console.log(`Fabricate: ${entity.id} is a Fabricate Item`);
    }
});

Hooks.on('createOwnedItem', (entity) => {
    // TODO: Some way to support other systems from the item information?
    if (entity.data.data.source && entity.data.data.source.startsWith(Properties.crafting.itemSourcePrefix)) {
        console.log(`Fabricate: ${entity.id} is a Fabricate Item`);
    }
});

async function loadCraftingSystems() {
    console.log(`Loading ${Properties.module.name} crafting systems`);
    Systems.forEach(loadCraftingSystem);
}

async function loadCraftingSystem(system: CraftingSystem) {
    let systemPack: Compendium = game.packs.get(system.compendiumPackKey)
    systemPack.getContent().then((content) => {
        content.forEach((item) => {
            system.includedItems.forEach((craftingElement: CraftingElement) => {
                if (craftingElement.itemId == item.id) {
                    console.log(`Fabricate | Matched the item ${craftingElement.name} to the compendium source for ${system.name}`);
                }
            });
            system.recipes.forEach((recipe: Recipe) => {
                if (recipe.itemId == item.id) {
                    console.log(`Fabricate | Matched the recipe ${recipe.name} to the compendium source for ${system.name}`);
                }
            })
        });
    });
    console.log(`Loaded ${system.name}`);
}

async function extendItemBehaviour() {
    Object.defineProperty(CONFIG.Item.entityClass.prototype, "fabricate", {
        writable: true,
        configurable: true,
        value: {}
    });
}

async function registerModuleSettings() {
    console.log(`Registering ${Properties.module.name} module settings`);
}