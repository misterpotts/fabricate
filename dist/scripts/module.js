var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Systems from "./systems/Systems.js";
import Properties from "./Properties.js";
Hooks.once('init', registerModuleSettings);
Hooks.once('ready', extendItemBehaviour);
Hooks.once('ready', loadCraftingSystems);
Hooks.on('createItem', (entity) => {
    // TODO: Some way to support other systems from the item information?
    if (entity.data.data.source && entity.data.data.source.startsWith(Properties.crafting.itemSourcePrefix)) {
        console.log(`Fabricate: ${entity.id} is a Fabricate Item`);
    }
});
function loadCraftingSystems() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Loading ${Properties.module.name} crafting systems`);
        Systems.forEach(loadCraftingSystem);
    });
}
function loadCraftingSystem(system) {
    return __awaiter(this, void 0, void 0, function* () {
        let systemPack = game.packs.get(system.compendiumPackKey);
        systemPack.getContent().then((content) => {
            content.forEach((item) => {
                system.includedItems.forEach((craftingElement) => {
                    if (craftingElement.itemId == item.id) {
                        console.log(`Fabricate | Matched the item ${craftingElement.name} to the compendium source for ${system.name}`);
                    }
                });
                system.recipes.forEach((recipe) => {
                    if (recipe.itemId == item.id) {
                        console.log(`Fabricate | Matched the recipe ${recipe.name} to the compendium source for ${system.name}`);
                    }
                });
            });
        });
        console.log(`Loaded ${system.name}`);
    });
}
function extendItemBehaviour() {
    return __awaiter(this, void 0, void 0, function* () {
        Object.defineProperty(CONFIG.Item.entityClass.prototype, "fabricate", {
            writable: true,
            configurable: true,
            value: {}
        });
    });
}
function registerModuleSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Registering ${Properties.module.name} module settings`);
    });
}
