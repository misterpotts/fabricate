import {GameProvider} from "../../scripts/foundry/GameProvider";
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";
import {SelectedComponentStore} from "./stores/SelectedComponentStore";
import {CraftingSystemStore} from "./stores/CraftingSystemStore";
import Properties from "../../scripts/Properties";

class I18NExtension {

    private readonly _i18n: Localization;

    constructor(i18n: Localization) {
        this._i18n = i18n;
    }

    public localizeAll(basePath: string, childPaths: string[], lineBreak = true) {
        return childPaths
            .map(childPath => this._i18n.localize(`${basePath}.${childPath}`))
            .join(lineBreak ? "\n" : ", ");
    }

}

class CraftingSystemManagerApp {

    private static _INSTANCE: CraftingSystemManagerApp;
    private static _ID: string = `${Properties.module.id}-crafting-system-manager`;
    private readonly _craftingSystemsStore: CraftingSystemStore;
    private readonly _selectedComponentStore: SelectedComponentStore;
    //private readonly _selectedRecipeStore;
    //private readonly _essenceStore;
    private readonly _gameProvider: GameProvider;

    protected constructor({
        gameProvider,
        craftingSystemStore,
        selectedComponentStore
    }: {
        gameProvider: GameProvider;
        craftingSystemStore: CraftingSystemStore;
        selectedComponentStore: SelectedComponentStore;
    }) {
        this._gameProvider = gameProvider;
        this._craftingSystemsStore = craftingSystemStore;
        this._selectedComponentStore = selectedComponentStore;
    }

    public static init({
       gameProvider,
       systemRegistry
    }: {
        gameProvider: GameProvider,
        systemRegistry: SystemRegistry
    }) {
        const craftingSystemStore = new CraftingSystemStore({systemRegistry, gameProvider});
        const selectedComponentStore = new SelectedComponentStore({craftingSystemStore});
        this._INSTANCE = new CraftingSystemManagerApp({
            gameProvider,
            craftingSystemStore,
            selectedComponentStore
        });
    }

    public static getInstance(): CraftingSystemManagerApp {
        if (!CraftingSystemManagerApp._INSTANCE) {
            throw new Error("CraftingSystemManagerApp has not been initialised yet. Call CraftingSystemManagerApp::init before CraftingSystemManagerApp::getInstance")
        }
        return CraftingSystemManagerApp._INSTANCE;
    }

    get i18n() {
        return this._gameProvider.globalGameObject().i18n;
    }

    get i18nExtension() {
        return new I18NExtension(this._gameProvider.globalGameObject().i18n);
    }

    get craftingSystemsStore(): CraftingSystemStore {
        return this._craftingSystemsStore;
    }

    get selectedComponentStore(): SelectedComponentStore {
        return this._selectedComponentStore;
    }

    static get ID(): string {
        return CraftingSystemManagerApp._ID;
    }

}

const key = Symbol();

export { CraftingSystemManagerApp, key }
