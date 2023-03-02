import {SystemRegistry} from "../registries/SystemRegistry";
import {SvelteApplication} from "../../applications/SvelteApplication";
import {ComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";

class FabricateApplication {

    private _systemRegistry: SystemRegistry;
    private _craftingSystemManagerApp: SvelteApplication;
    private _componentSalvageAppCatalog: ComponentSalvageAppCatalog;
    constructor() {}

    get systemRegistry(): SystemRegistry {
        return this._systemRegistry;
    }

    set systemRegistry(value: SystemRegistry) {
        this._systemRegistry = value;
    }

    get craftingSystemManagerApp(): SvelteApplication {
        return this._craftingSystemManagerApp;
    }

    set craftingSystemManagerApp(value: SvelteApplication) {
        this._craftingSystemManagerApp = value;
    }

    get componentSalvageAppCatalog(): ComponentSalvageAppCatalog {
        return this._componentSalvageAppCatalog;
    }

    set componentSalvageAppCatalog(value: ComponentSalvageAppCatalog) {
        this._componentSalvageAppCatalog = value;
    }

}

const fabricateApplicationInstance = new FabricateApplication();

export default fabricateApplicationInstance;