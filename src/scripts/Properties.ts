import {SettingVersion} from "./repository/migration/SettingVersion";

const Properties = {
    module: {
        id: "fabricate",
        label: "Fabricate",
        compendiums: {
            supportedTypes: ["Item"]
        },
        documents: {
            supportedTypes: ["Item"]
        },
    },
    ui: {
        defaults: {
            essence: {
                name: "My new essence",
                tooltip: "A new essence",
                iconCode: "fa-solid fa-mortar-pestle",
                description: "A magical essence that can be used to craft items",
            },
            itemImageUrl: "icons/containers/bags/pack-simple-leather-tan.webp",
            noItemImageUrl: "modules/fabricate/assets/no-item-icon-4.webp",
            erroredItemImageUrl: "modules/fabricate/assets/item-loading-error-icon.webp",
            recipeImageUrl: "icons/sundries/scrolls/scroll-runed-brown-black.webp",
            craftingSystem: {
                name: "My New Crafting System",
                description: "This crafting system is a collection of recipes and components that can be used to craft items.",
                author: (user?: string) => {
                    if (!user) {
                        return "Author";
                    }
                    return user
                },
                summary: "Summary"
            }
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

    },
    settings: {
        collectionNames: {
            craftingSystem: "CraftingSystem",
            item: "Item",
            gameSystem: "Game System"
        },
        craftingSystems: {
            key: "craftingSystems",
        },
        essences: {
            key: "essences",
        },
        components: {
            key: "components",
        },
        recipes: {
            key: "recipes",
        },
        modelVersion: {
            key: "modelVersion",
            targetValue: SettingVersion.V3
        },
    }
};

export default Properties;