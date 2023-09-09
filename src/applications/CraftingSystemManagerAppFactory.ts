import CraftingSystemManager from "./craftingSystemManagerApp/CraftingSystemEditor.svelte"
import Properties from "../scripts/Properties";
import {SvelteApplication} from "./SvelteApplication";
import {LocalizationService} from "./common/LocalizationService";
import {FabricateAPI} from "../scripts/api/FabricateAPI";

class CraftingSystemManagerAppFactory {

    private readonly localizationService: LocalizationService;
    private readonly fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        localizationService,
    }: {
        fabricateAPI: FabricateAPI;
        localizationService: LocalizationService;
    }) {
        this.fabricateAPI = fabricateAPI;
        this.localizationService = localizationService;
    }

    public make(): SvelteApplication {

        const applicationOptions = {
            title: this.localizationService.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
            id: Properties.ui.apps.craftingSystemManager.id,
            resizable: true,
            width: 1020,
            height: 780
        }

        return new SvelteApplication({
            applicationOptions,
            onClose: () => {
                this.fabricateAPI.activateNotifications();
            },
            svelteConfig: {
                options: {
                    props: {
                        localization: this.localizationService,
                        fabricateAPI: this.fabricateAPI
                    }
                },
                componentType: CraftingSystemManager
            }
        });
    }

}

export { CraftingSystemManagerAppFactory }
