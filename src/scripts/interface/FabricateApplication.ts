import {SystemRegistry} from "../registries/SystemRegistry";

class FabricateApplication {

    private _systemRegistry: SystemRegistry;

    constructor() {}

    get systemRegistry(): SystemRegistry {
        return this._systemRegistry;
    }

    set systemRegistry(value: SystemRegistry) {
        this._systemRegistry = value;
    }

}

const fabricateApplicationInstance = new FabricateApplication();

export default fabricateApplicationInstance;