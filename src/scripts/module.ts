import {CraftingSystem} from "./core/CraftingSystem";
import Systems from "./systems/Systems"
import Properties from "./Properties";
import {ItemRecipeTab} from "./interface/ItemRecipeTab";

Hooks.once('init', registerModuleSettings);

Hooks.once('ready', loadCraftingSystems);

Hooks.on('createItem', (entity: Entity) => {
    if (entity.data.flags.fabricate) {
        console.log(`(Create Item) Fabricate: ${entity.id} is a Fabricate Item`);
    }
});

Hooks.on('createOwnedItem', (entity: Entity) => {
    if (entity.data.flags.fabricate) {
        console.log(`(Create Owned Item) Fabricate: ${entity.id} is a Fabricate Item`);
    }
});

Hooks.on('renderItemSheet5e', (sheetData: ItemSheet, sheetHtml: any, itemData: Item.Data) => {
    ItemRecipeTab.bind(sheetData, sheetHtml, itemData);
});

async function loadCraftingSystems() {
    console.log(`Loading ${Properties.module.name} crafting systems`);
    Systems.forEach(loadCraftingSystem);
}

async function loadCraftingSystem(system: CraftingSystem) {
    let systemPack: Compendium = game.packs.get(system.compendiumPackKey)
    systemPack.getContent().then((content) => {
        content.forEach((item) => {
            console.log(`Fabricate | compendium: ${system.compendiumPackKey} | id: ${item.id}`);
            console.log(item.data.flags);
        });
    });
    console.log(`Loaded ${system.name}`);
}

async function registerModuleSettings() {
    console.log(`Registering ${Properties.module.name} module settings`);
}