import {FabricateItemType} from "./compendium/CompendiumData";

const Properties = {
    module: {
        id: 'fabricate',
        label: 'Fabricate',
        templates: {
            recipeTab: 'modules/fabricate/templates/recipe-tab.hbs',
            craftingTab: 'modules/fabricate/templates/crafting-tab.hbs',
            craftingMessage: 'modules/fabricate/templates/chat-message.hbs',
            craftingSystemManagementApp: 'modules/fabricate/templates/crafting-system-manager.hbs'
        },
        compendiums: {
            supportedTypes: ['Item']
        }
    },
    ui: {
        buttons: {
            openCraftingSystemManager: {
                class: "open-crafting-system-manager"
            }
        },
        apps: {
            craftingSystemManager: {}
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
    settings: {
        craftingSystems: {
            key: "craftingSystems"
        },
        craftingSystem: {
            enabled: (systemId: string) => `${systemId}.enabled`
        }
    }
};

export default Properties;