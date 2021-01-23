import {CraftingSystem} from "./core/CraftingSystem.js";

async function init() {
    console.log('Fabricate Module loaded');
    new CraftingSystem("A Test crafting system");
}

init();