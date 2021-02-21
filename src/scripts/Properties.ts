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
        allowableItems: ['consumable', 'loot', 'scroll', 'trinket']
    },
    flagKeys: {
        actor: {
            selectedCraftingSystem: 'crafting.selectedSystemId',
            hopperForSystem: (systemId: string) => `crafting.${systemId}.hopper`,
            knownRecipesForSystem: (systemId: string) => `crafting.${systemId}.knownRecipes`,
        },
        item: {
            identity: 'identity',
            partId: 'identity.partId',
            systemId: 'identity.systemId',
            fabricateItemType: 'type',
        }
    }
};

export default Properties;