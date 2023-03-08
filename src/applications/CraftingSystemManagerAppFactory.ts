import CraftingSystemManager from "./craftingSystemManagerApp/CraftingSystemEditor.svelte"
import Properties from "../scripts/Properties";
import {SvelteApplication} from "./SvelteApplication";
import {GameProvider} from "../scripts/foundry/GameProvider";
import {DefaultSystemRegistry} from "../scripts/registries/SystemRegistry";
import {DefaultLocalizationService} from "./common/LocalizationService";

class CraftingSystemManagerAppFactory {

    public static async make(systemRegistry: DefaultSystemRegistry): Promise<SvelteApplication> {

        const gameProvider = new GameProvider();
        const GAME = gameProvider.globalGameObject();

        const applicationOptions = {
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
            id: Properties.ui.apps.craftingSystemManager.id,
            resizable: false,
            width: 980,
            height: 740
        }

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        localization: new DefaultLocalizationService(gameProvider),
                        systemRegistry,
                        gameProvider
                    }
                },
                componentType: CraftingSystemManager
            }
        });
    }

}

export { CraftingSystemManagerAppFactory }
