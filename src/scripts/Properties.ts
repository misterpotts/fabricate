const Properties = {
    module: {
        id: "fabricate",
        label: "Fabricate",
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
            noItemImageUrl: "modules/fabricate/assets/no-item-icon-4.webp",
            erroredItemImageUrl: "modules/fabricate/assets/item-loading-error-icon.webp",
            recipeImageUrl: "icons/sundries/scrolls/scroll-runed-brown-black.webp"
        },
        banners: {
            componentEditor: "modules/fabricate/assets/components-hero-banner.webp",
            detailsEditor: "modules/fabricate/assets/details-hero-banner.webp",
            recipeEditor: "modules/fabricate/assets/recipes-hero-banner.webp",
            essenceEditor: "modules/fabricate/assets/essences-hero-banner.webp",
            alchemyEditor: "modules/fabricate/assets/alchemy-hero-banner.webp",
        },
        buttons: {
            openCraftingSystemManager: {
                class: "open-crafting-system-manager"
            }
        },
        apps: {
            craftingSystemManager: {
                id: "fabricate-crafting-system-manager"
            }
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
        },
        collectionNames: {
            craftingSystem: "CraftingSystem",
            item: "Item"
        }
    }
};

export default Properties;