import {FabricateItemType} from "./game/CompendiumData";

const Properties = {
    module: {
        name: 'fabricate',
        label: 'Fabricate',
        templates: {
            recipeTab: 'modules/fabricate/templates/recipe-tab.html',
            craftingTab: 'modules/fabricate/templates/crafting-tab.html'
        }
    },
    types: {
        recipe: FabricateItemType.RECIPE,
        component: FabricateItemType.COMPONENT,
        allowableItems: ['consumable', 'loot']
    }
};

export default Properties;