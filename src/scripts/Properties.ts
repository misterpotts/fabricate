const Properties = {
    module: {
        id: "fabricate",
        label: "Fabricate",
        templates: {
            itemSheetCraftingTab: "modules/fabricate/templates/item-sheet-crafting-tab.hbs",
            craftingTab: "modules/fabricate/templates/crafting-tab.hbs",
            craftingMessage: "modules/fabricate/templates/chat-message.hbs",
            craftingSystemManagementApp: "modules/fabricate/templates/crafting-system-manager.hbs",
            componentManagerApp: "modules/fabricate/templates/component-manager.hbs",
            recipeManagerApp: "modules/fabricate/templates/recipe-manager.hbs",
            editEssenceDialog: "modules/fabricate/templates/edit-essence-details.hbs",
            editCraftingSystemDetailDialog: "modules/fabricate/templates/edit-crafting-system-detail.hbs",
            partials: {
                editableSystem: "modules/fabricate/templates/partials/editable-crafting-system.hbs",
                readOnlySystem: "modules/fabricate/templates/partials/readonly-crafting-system.hbs",
                recipesTab: "modules/fabricate/templates/partials/recipes-tab.hbs",
                componentsTab: "modules/fabricate/templates/partials/components-tab.hbs",
                essencesTab: "modules/fabricate/templates/partials/essences-tab.hbs",
                alchemyTab: "modules/fabricate/templates/partials/alchemy-tab.hbs",
                checksTab: "modules/fabricate/templates/partials/checks-tab.hbs",
            }
        },
        compendiums: {
            supportedTypes: ["Item"]
        },
        documents: {
            supportedTypes: ["Item"]
        }
    },
    ui: {
        defaults: {
            essenceIconCode: "fa-solid fa-mortar-pestle",
            itemImageUrl: "icons/containers/bags/pack-simple-leather-tan.webp",
            noItemImageUrl: "icons/svg/cancel.svg",
            recipeImageUrl: "icons/sundries/scrolls/scroll-runed-brown-black.webp"
        },
        buttons: {
            openCraftingSystemManager: {
                class: "open-crafting-system-manager"
            }
        },
        apps: {
            craftingSystemManager: {}
        }
    },
    flags: {
        keys: {
            actor: {
                hopperForSystem: (systemId: string) => `craftingSystems.${systemId}.hopper`,
                knownRecipesForSystem: (systemId: string) => `craftingSystems.${systemId}.knownRecipes`,
            },
            item: {
                id: "id",
                type: (systemId: string) => `craftingSystemData.${systemId}.type`,
                recipe: (systemId: string) => `craftingSystemData.${systemId}.recipeData`,
                componentData: (systemId: string) => `craftingSystemData.${systemId}.componentData`,
            }
        }
    },
    settings: {
        craftingSystems: {
            key: "craftingSystems",
            targetVersion: "2"
        }
    }
};

export default Properties;