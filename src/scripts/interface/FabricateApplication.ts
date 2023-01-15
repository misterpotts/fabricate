import {SystemRegistry} from "../registries/SystemRegistry";
import {InventoryRegistry} from "../registries/InventoryRegistry";

class FabricateApplication {

    private _systemRegistry: SystemRegistry;
    private _inventoryRegistry: InventoryRegistry;

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

}

const fabricateApplicationInstance = new FabricateApplication();

export default fabricateApplicationInstance;