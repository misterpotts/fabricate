import Hello from "../templates/CraftingSystemManager.svelte"
import Properties from "../scripts/Properties";
import {SvelteApplication} from "./SvelteApplication";
import {GameProvider} from "../scripts/foundry/GameProvider";

Hooks.once("ready", () => {
    const applicationOptions = {
        title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.title`),
        id: `${Properties.module.id}-hello-app`,
        resizable: true,
        width: 920,
        height: 740
    }
    const helloApp = new SvelteApplication({
        applicationOptions,
        svelteConfig: {
            options: {
                props: {
                    name: "Foundrah"
                }
            },
            componentType: Hello
        }
    })
    helloApp.render(true);
});
