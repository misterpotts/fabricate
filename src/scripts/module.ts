import {ItemRecipeTab} from "./interface/ItemRecipeTab";
import {CraftingSystem} from "./core/CraftingSystem";
import Properties from "./Properties";
import {FabricateFlags, FabricateItemType} from "./core/FabricateFlags";
import {Recipe} from "./core/Recipe";
import {CraftingComponent} from "./core/CraftingComponent";
import {CraftingSystemRegistry} from "./systems/CraftingSystemRegistry";

Hooks.once('ready', loadCraftingSystems);

async function loadCraftingSystems() {
    let systemSpecifications = CraftingSystemRegistry.systemSpecifications;
    console.log(`${Properties.module.label} | Loading ${systemSpecifications.length} crafting systems. `);
    systemSpecifications.forEach(loadCraftingSystem);
}

async function loadCraftingSystem(systemSpec: CraftingSystem.Builder) {
    console.log(`${Properties.module.label} | Loading ${systemSpec.name} from Compendium pack ${systemSpec.compendiumPackKey}. `);
    let systemPack: Compendium = game.packs.get(systemSpec.compendiumPackKey)
    systemPack.getContent().then((content) => {
        content.forEach((item) => {
            let itemConfig: FabricateFlags = item.data.flags.fabricate;
            switch (itemConfig.type) {
                case FabricateItemType.COMPONENT:
                    systemSpec.withComponent(CraftingComponent.fromFlags(itemConfig));
                    break;
                case FabricateItemType.RECIPE:
                    systemSpec.withRecipe(Recipe.fromFlags(itemConfig));
                    break;
                default:
                    throw new Error(`Unable to load item ${item.id}. Could not determine Fabricate Entity Type. `);
            }
        });
    });
    let system: CraftingSystem = systemSpec.build();
    CraftingSystemRegistry.register(system); // todo - investigate missing recipes and stuff
    console.log(`${Properties.module.label} | Loaded ${systemSpec.name}. `);
}

Hooks.on('renderItemSheet5e', (sheetData: ItemSheet, sheetHtml: any, itemData: Item.Data) => {
    ItemRecipeTab.bind(sheetData, sheetHtml, itemData);
});