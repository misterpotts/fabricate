import {InventoryRegistry} from "../registries/InventoryRegistry";
import {CraftingSystemRegistry} from "../registries/CraftingSystemRegistry";

class FabricateApplication {

    private readonly _inventories: InventoryRegistry;
    private readonly _systems: CraftingSystemRegistry;

    constructor() {
        this._inventories = new InventoryRegistry();
        this._systems = new CraftingSystemRegistry();
    }

    get inventories(): InventoryRegistry {
        return this._inventories;
    }

    get systems(): CraftingSystemRegistry {
        return this._systems;
    }

}

export default new FabricateApplication();