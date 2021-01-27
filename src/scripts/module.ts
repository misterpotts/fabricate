import {CraftingSystem} from "./core/CraftingSystem.js";
import Systems from "./systems/Systems.js"
import Properties from "./Properties.js";
import {CraftingElement} from "./core/CraftingElement.js";
import {Recipe} from "./core/Recipe.js";

Hooks.once('init', registerModuleSettings);

Hooks.once('ready', loadCraftingSystems);

Hooks.on('createItem', (entity) => {
    if (entity.data.flags.fabricate) {
        console.log(`(Create Item) Fabricate: ${entity.id} is a Fabricate Item`);
    }
});

Hooks.on('createOwnedItem', (entity) => {
    if (entity.data.flags.fabricate) {
        console.log(`(Create Owned Item) Fabricate: ${entity.id} is a Fabricate Item`);
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
                if (craftingElement.compendiumEntry.itemId == item.id) {
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

async function registerModuleSettings() {
    console.log(`Registering ${Properties.module.name} module settings`);
}