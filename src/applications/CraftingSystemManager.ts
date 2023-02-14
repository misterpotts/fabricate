import CraftingSystemManager from "../templates/craftingSystemManager/CraftingSystemManager.svelte"
import Properties from "../scripts/Properties";
import {SvelteApplication} from "./SvelteApplication";
import {GameProvider} from "../scripts/foundry/GameProvider";

class CraftingSystemManagerAppFactory {

    public static make(): SvelteApplication {

        const GAME = new GameProvider().globalGameObject();

        const applicationOptions = {
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
            id: `${Properties.module.id}-crafting-system-manager`,
            resizable: true,
            width: 980,
            height: 740
        }

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        systems: [
                            {
                                id: "1",
                                name: "Crafting System 1",
                                summary: "Summary details of this crafting system and its themes, component types, etc.",
                                hasErrors: true,
                                isLocked: false
                            },
                            {
                                id: "2",
                                name: "Crafting System 2",
                                summary: "Summary details of this crafting system and its themes, component types, etc.",
                                hasErrors: false,
                                isLocked: false
                            },
                            {
                                id: "3",
                                name: "Crafting System 3",
                                summary: "Summary details of this crafting system and its themes, component types, etc.",
                                hasErrors: false,
                                isLocked: true
                            }
                        ]
                    }
                },
                componentType: CraftingSystemManager
            }
        });
    }

}

export { CraftingSystemManagerAppFactory }
