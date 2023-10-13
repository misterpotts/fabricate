import Properties from "./Properties";
import {DefaultGameProvider} from "./foundry/GameProvider";
import {itemCreated, itemDeleted, itemUpdated} from "../applications/common/EventBus";
import {DefaultFabricateAPIFactory, FabricateAPIFactory} from "./api/FabricateAPIFactory";
import {FabricateAPI} from "./api/FabricateAPI";
import {DefaultIdentityFactory} from "./foundry/IdentityFactory";
import {DefaultDocumentManager} from "./foundry/DocumentManager";
import {DefaultSettingsRegistry, SettingsRegistry} from "./repository/SettingsRegistry";
import {DefaultFabricateUserInterfaceAPIFactory} from "./api/FabricateUserInterfaceAPIFactory";
import {DefaultUIProvider} from "./foundry/UIProvider";
import {FabricateUserInterfaceAPI} from "./api/FabricateUserInterfaceAPI";
import {DefaultFabricatePatreonAPIFactory} from "./patreon/PatreonAPIFactory";
import {DefaultPatreonFeature} from "./patreon/PatreonFeature";
import {FabricatePatreonAPI} from "./patreon/FabricatePatreonAPI";

let fabricateAPI: FabricateAPI;
let fabricateUserInterfaceAPI: FabricateUserInterfaceAPI;
let fabricatePatreonAPI: FabricatePatreonAPI;

Hooks.once('ready', async () => {

    const gameProvider = new DefaultGameProvider();
    const uiProvider = new DefaultUIProvider();
    const gameObject = gameProvider.get();

    const settingsRegistry: SettingsRegistry = new DefaultSettingsRegistry({
        gameProvider,
        clientSettings: gameObject.settings,
        settingKeys: [
            Properties.settings.recipes.key,
            Properties.settings.essences.key,
            Properties.settings.components.key,
            Properties.settings.craftingSystems.key,
            Properties.settings.modelVersion.key
        ],
        defaultValuesBySettingKey: new Map<string, any>([
            [Properties.settings.recipes.key, { entities: {}, collections: {} }],
            [Properties.settings.essences.key, { entities: {}, collections: {} }],
            [Properties.settings.components.key, { entities: {}, collections: {} }],
            [Properties.settings.craftingSystems.key, { entities: {}, collections: {} }],
            [Properties.settings.modelVersion.key, ""],
        ])
    });

    settingsRegistry.registerAll();

    const fabricateAPIFactory: FabricateAPIFactory = new DefaultFabricateAPIFactory({
        gameProvider,
        uiProvider,
        settingsRegistry,
        user: gameObject.user.name,
        gameSystem: gameObject.system.id,
        clientSettings: gameObject.settings,
        identityFactory: new DefaultIdentityFactory(),
        documentManager: new DefaultDocumentManager(),
    });

    fabricateAPI = fabricateAPIFactory.make();

    const patreonAPIFactory = new DefaultFabricatePatreonAPIFactory({
        clientSettings: gameObject.settings,
    });
    fabricatePatreonAPI = patreonAPIFactory.make([
        new DefaultPatreonFeature({
            id: "new-ui",
            name: "New UI",
            description: "Fabricate's new user interface, including the Actor sheet crafting application.",
            targets: [ "88a8dcd4bf1ff9207228bcbf47e8f2a2606847cc4cf83d9e5d9016a4f7c251f0" ]
        }),
    ]);

    const fabricateUserInterfaceAPIFactory = new DefaultFabricateUserInterfaceAPIFactory({
        fabricateAPI,
        gameProvider,
        fabricatePatreonAPI,
    });

    fabricateUserInterfaceAPI = fabricateUserInterfaceAPIFactory.make();

    // Sets the default value of game.fabricate to an empty object
    // @ts-ignore
    gameObject[Properties.module.id] = {};
    // Makes the Fabricate API available globally as game.fabricate.api
    // @ts-ignore
    gameObject[Properties.module.id].api = fabricateAPI;
    // Makes the Fabricate User Interface API available globally as game.fabricate.ui
    // @ts-ignore
    gameObject[Properties.module.id].ui = fabricateUserInterfaceAPI;
    // Makes the Patreon API available globally as game.fabricate.patreon
    // @ts-ignore
    gameObject[Properties.module.id].patreon = fabricatePatreonAPI;

    Hooks.callAll(`${Properties.module.id}.ready`, fabricateAPI, fabricateUserInterfaceAPI, fabricatePatreonAPI);

});

Hooks.once(`${Properties.module.id}.ready`, async (fabricateAPI: FabricateAPI) => {

    const migrationNeeded = await fabricateAPI.migration.isMigrationNeeded();
    if (migrationNeeded) {
        await fabricateAPI.migration.migrateAll();
    }

});

Hooks.on("deleteItem", async (item: any) => {
    itemDeleted(item);
});

Hooks.on("updateItem", async (item: Item) => {
    itemUpdated(item);
});

Hooks.on("createItem", async (item: Item) => {
    itemCreated(item);
});

Hooks.on("renderActorSheet", async (actorSheet: ActorSheet, html: any) => {

    const newUiFeatureEnabled = await fabricatePatreonAPI.isEnabled("new-ui");
    if (!newUiFeatureEnabled) {
        return;
    }

    if (!actorSheet.actor) {
        return;
    }

    const header = html.find(".window-header");
    if (!header) {
        throw new Error("Fabricate was unable to render header buttons for the Actor Sheet application");
    }
    let title = header.children(".window-title");
    const headerButton = {
        label: "Crafting",
        tooltip: "Fabricate Crafting",
        class: "fab-actor-sheet-header-button",
        icon: "fa-solid fa-screwdriver-wrench",
        onclick: async () => {
            await fabricateUserInterfaceAPI.renderActorCraftingApp({
                targetActorId: actorSheet.actor.id
            });
        }
    };
    const button = $(`<a class="${headerButton.class}" data-tooltip="${headerButton.tooltip}"><i class="${headerButton.icon}"></i>${headerButton.label}</a>`);
    button.on("click", headerButton.onclick);
    button.insertAfter(title);

});

Hooks.on("renderItemSheet", async (itemSheet: ItemSheet, html: any) => {

    if (!itemSheet.actor) {
        return;
    }

    const document = itemSheet.document;
    if (!Properties.module.documents.supportedTypes.includes(document.documentName)) {
        return;
    }

    const sourceItemUuid = document.getFlag("core", "sourceId");
    if (!sourceItemUuid) {
        return;
    }

    const craftingSystemsById = await fabricateAPI.systems.getAll();
    const componentsForSourceItem = await fabricateAPI.components.getAllByItemUuid(sourceItemUuid);
    await Promise.all(Array.from(componentsForSourceItem.values()).map(component => component.load()));
    const recipesForSourceItem = await fabricateAPI.recipes.getAllByItemUuid(sourceItemUuid);
    await Promise.all(Array.from(recipesForSourceItem.values()).map(recipe => recipe.load()));
    if (componentsForSourceItem.size === 0 && recipesForSourceItem.size === 0) {
        return;
    }

    const additionalHeaderButtons = [];

    const salvageButtons = Array.from(componentsForSourceItem.values())
        .filter(component => !component.isDisabled && component.isSalvageable && !component.hasErrors)
        .map(component => {
            return {
                label: "Salvage",
                tooltip: craftingSystemsById.get(component.craftingSystemId).details.name,
                class: "fab-item-sheet-header-button",
                icon: "fa-solid fa-recycle",
                onclick: async () => {
                    await fabricateUserInterfaceAPI.renderComponentSalvageApp(document.actor.id, component.id);
                }
            };
        });
    additionalHeaderButtons.push(...salvageButtons);

    const craftingButtons = Array.from(recipesForSourceItem.values())
        .filter(recipe => !recipe.isDisabled && recipe.hasResults && !recipe.hasErrors)
        .map(recipe => {
            return {
                label: "Craft",
                tooltip: craftingSystemsById.get(recipe.craftingSystemId).details.name,
                class: "fab-item-sheet-header-button",
                icon: "fa-solid fa-screwdriver-wrench",
                onclick: async () => {
                    await fabricateUserInterfaceAPI.renderRecipeCraftingApp(document.actor.id, recipe.id);
                }
            };
        });
    additionalHeaderButtons.push(...craftingButtons);

    const header = html.find(".window-header");
    if (!header) {
        throw new Error("Fabricate was unable to render header buttons for the Item Sheet application");
    }
    let title = header.children(".window-title");
    additionalHeaderButtons.forEach(headerButton => {
        const button = $(`<a class="${headerButton.class}" data-tooltip="${headerButton.tooltip}"><i class="${headerButton.icon}"></i>${headerButton.label}</a>`);
        button.on("click", () => headerButton.onclick());
        button.insertAfter(title);
    });
});

Hooks.on("renderSidebarTab", async (app: any, html: any) => {
    const GAME = new DefaultGameProvider().get();
    if (!(app instanceof ItemDirectory) || !GAME.user.isGM) {
        return;
    }
    const buttons = html.find(`.header-actions.action-buttons`);
    const buttonClass = Properties.ui.buttons.openCraftingSystemManager.class;
    const buttonText = GAME.i18n.localize(`${Properties.module.id}.ui.sidebar.buttons.openCraftingSystemManager`);
    const button = $(`<button class="${buttonClass}"><i class="fa-solid fa-flask-vial"></i> ${buttonText}</button>`);

    button.on('click', async (_event) => {
        await fabricateUserInterfaceAPI.renderCraftingSystemManagerApp();
        fabricateAPI.suppressNotifications();
    });

    buttons.append(button);
});