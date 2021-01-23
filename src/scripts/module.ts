import {CraftingSystem} from "./core/CraftingSystem";

async function init() {
    console.log('Module loaded');
    new CraftingSystem("A Test crafting system");
}

init();