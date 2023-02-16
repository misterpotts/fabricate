import {CraftingSystemsStore} from "./stores/CraftingSystemsStore";
import {SelectedCraftingSystemStore} from "./stores/SelectedCraftingSystemStore";
import {GameProvider} from "../../scripts/foundry/GameProvider";
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";
import {SelectedComponentStore} from "./stores/SelectedComponentStore";

class CraftingSystemManagerApp {

    private static _INSTANCE: CraftingSystemManagerApp;
    private readonly _craftingSystemsStore: CraftingSystemsStore;
    private readonly _selectedComponentStore: SelectedComponentStore;
    //private readonly _selectedRecipeStore;
    //private readonly _essenceStore;
    private readonly _selectedCraftingSystemStore: SelectedCraftingSystemStore;
    private readonly _gameProvider: GameProvider;

    protected constructor({
        gameProvider,
        craftingSystemStore,
        selectedCraftingSystemStore,
        selectedComponentStore
    }: {
        gameProvider: GameProvider;
        craftingSystemStore: CraftingSystemsStore;
        selectedCraftingSystemStore: SelectedCraftingSystemStore;
        selectedComponentStore: SelectedComponentStore;
    }) {
        this._gameProvider = gameProvider;
        this._craftingSystemsStore = craftingSystemStore;
        this._selectedCraftingSystemStore = selectedCraftingSystemStore;
        this._selectedComponentStore = selectedComponentStore;
    }

    public static init({
       gameProvider,
       systemRegistry
    }: {
        gameProvider: GameProvider,
        systemRegistry: SystemRegistry
    }) {
        const craftingSystemStore = new CraftingSystemsStore({systemRegistry, gameProvider});
        const selectedCraftingSystemStore = new SelectedCraftingSystemStore({craftingSystemStore});
        const selectedComponentStore = new SelectedComponentStore({selectedCraftingSystemStore});
        this._INSTANCE = new CraftingSystemManagerApp({
            gameProvider,
            craftingSystemStore,
            selectedCraftingSystemStore,
            selectedComponentStore
        });
    }

    public static getInstance(): CraftingSystemManagerApp {
        if (!CraftingSystemManagerApp._INSTANCE) {
            throw new Error("CraftingSystemManagerApp has not been initialised yet. CallCraftingSystemManagerApp::init before CraftingSystemManagerApp::getInstance")
        }
        return CraftingSystemManagerApp._INSTANCE;
    }

    get i18n() {
        return this._gameProvider.globalGameObject().i18n;
    }

    get craftingSystemsStore(): CraftingSystemsStore {
        return this._craftingSystemsStore;
    }

    get selectedCraftingSystemStore(): SelectedCraftingSystemStore {
        return this._selectedCraftingSystemStore;
    }

    get selectedComponentStore(): SelectedComponentStore {
        return this._selectedComponentStore;
    }

}

export { CraftingSystemManagerApp }
