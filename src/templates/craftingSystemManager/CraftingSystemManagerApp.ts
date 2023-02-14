import {CraftingSystemsStore} from "./stores/CraftingSystemsStore";
import {SelectedCraftingSystemStore} from "./stores/SelectedCraftingSystemStore";
import {GameProvider} from "../../scripts/foundry/GameProvider";
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";

class CraftingSystemManagerApp {

    private static _INSTANCE: CraftingSystemManagerApp;
    private readonly _craftingSystemsStore: CraftingSystemsStore;
    //private readonly _selectedComponentStore;
    //private readonly _selectedRecipeStore;
    //private readonly _essenceStore;
    private readonly _selectedCraftingSystemStore: SelectedCraftingSystemStore;

    protected constructor({
        craftingSystemStore,
        selectedCraftingSystemStore
    }: {
        craftingSystemStore: CraftingSystemsStore;
        selectedCraftingSystemStore: SelectedCraftingSystemStore;
    }) {
        this._craftingSystemsStore = craftingSystemStore;
        this._selectedCraftingSystemStore = selectedCraftingSystemStore;
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
        this._INSTANCE = new CraftingSystemManagerApp({
            craftingSystemStore,
            selectedCraftingSystemStore
        });
    }

    public static getInstance(): CraftingSystemManagerApp {
        if (!CraftingSystemManagerApp._INSTANCE) {
            throw new Error("CraftingSystemManagerApp has not been initialised yet. CallCraftingSystemManagerApp::init before CraftingSystemManagerApp::getInstance")
        }
        return CraftingSystemManagerApp._INSTANCE;
    }

    get craftingSystemsStore(): CraftingSystemsStore {
        return this._craftingSystemsStore;
    }

    get selectedCraftingSystemStore(): SelectedCraftingSystemStore {
        return this._selectedCraftingSystemStore;
    }

}

export { CraftingSystemManagerApp }
