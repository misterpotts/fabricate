import CraftingSystemManager from "./craftingSystemManagerApp/CraftingSystemManager.svelte"
import Properties from "../scripts/Properties";
import {SvelteApplication} from "./SvelteApplication";
import {GameProvider} from "../scripts/foundry/GameProvider";
import {DefaultSystemRegistry} from "../scripts/registries/SystemRegistry";
import {CraftingSystemManagerApp} from "./craftingSystemManagerApp/CraftingSystemManagerApp";
import {DefaultLocalizationService} from "./common/LocalizationService";

class CraftingSystemManagerAppFactory {

    public static make(systemRegistry: DefaultSystemRegistry): SvelteApplication {

        const gameProvider = new GameProvider();
        const GAME = gameProvider.globalGameObject();

        const applicationOptions = {
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
            id: `${Properties.module.id}-crafting-system-manager`,
            resizable: false,
            width: 980,
            height: 740
        }

        CraftingSystemManagerApp.init({gameProvider, systemRegistry});

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        localization: new DefaultLocalizationService(gameProvider)
                    }
                },
                componentType: CraftingSystemManager
            }
        });
    }

}

export { CraftingSystemManagerAppFactory }
