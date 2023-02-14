import {SystemRegistry} from "../registries/SystemRegistry";
import {InventoryRegistry} from "../registries/InventoryRegistry";
import {SvelteApplication} from "../../applications/SvelteApplication";

class FabricateApplication {

    private _systemRegistry: SystemRegistry;
    private _inventoryRegistry: InventoryRegistry;
    private _craftingSystemManagerApp: SvelteApplication;

    constructor() {}

    get systemRegistry(): SystemRegistry {
        return this._systemRegistry;
    }

    set systemRegistry(value: SystemRegistry) {
        this._systemRegistry = value;
    }

    get inventoryRegistry(): InventoryRegistry {
        return this._inventoryRegistry;
    }

    set inventoryRegistry(value: InventoryRegistry) {
        this._inventoryRegistry = value;
    }

    get craftingSystemManagerApp(): SvelteApplication {
        return this._craftingSystemManagerApp;
    }

    set craftingSystemManagerApp(value: SvelteApplication) {
        this._craftingSystemManagerApp = value;
    }

}

const fabricateApplicationInstance = new FabricateApplication();

export default fabricateApplicationInstance;