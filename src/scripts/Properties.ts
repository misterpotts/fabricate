import {FabricateItemType} from "./v2/compendium/CompendiumData";

const Properties = {
    module: {
        name: 'fabricate',
        label: 'Fabricate',
        templates: {
            recipeTab: 'modules/fabricate/templates/recipe-tab.html',
            craftingTab: 'modules/fabricate/templates/crafting-tab.html',
            craftingMessage: 'modules/fabricate/templates/chat-message.html'
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
            selectedRecipe: 'crafting.selectedRecipeId',
            hopperForSystem: (systemId: string) => `crafting.${systemId}.hopper`,
            knownRecipesForSystem: (systemId: string) => `crafting.${systemId}.knownRecipes`,
        },
        item: {
            identity: 'identity',
            partId: 'identity.partId',
            systemId: 'identity.systemId',
            fabricateItemType: 'type',
        }
    },
    settingsKeys: {
        craftingSystem: {
            enabled: (systemId: string) => `${systemId}.enabled`
        }
    }
};

export default Properties;