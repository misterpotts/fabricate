import {SvelteApplication} from "../../applications/SvelteApplication";
import {ComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {RecipeCraftingAppCatalog} from "../../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {FabricateAPI} from "../api/FabricateAPI";

class FabricateApplication {

    private _fabricateAPI: FabricateAPI;

    private _craftingSystemManagerApp: SvelteApplication;
    private _componentSalvageAppCatalog: ComponentSalvageAppCatalog;
    private _recipeCraftingAppCatalog: RecipeCraftingAppCatalog;

    constructor() {}

    get fabricateAPI(): FabricateAPI {
        return this._fabricateAPI;
    }

    get craftingSystemManagerApp(): SvelteApplication {
        return this._craftingSystemManagerApp;
    }

    get componentSalvageAppCatalog(): ComponentSalvageAppCatalog {
        return this._componentSalvageAppCatalog;
    }

    get recipeCraftingAppCatalog(): RecipeCraftingAppCatalog {
        return this._recipeCraftingAppCatalog;
    }

}

export { FabricateApplication }