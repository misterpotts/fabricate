import {SvelteApplication} from "../SvelteApplication";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {GameProvider} from "../../scripts/foundry/GameProvider";
import Properties from "../../scripts/Properties";
import {DefaultLocalizationService} from "../common/LocalizationService";
import RecipeCraftingApp from "./RecipeCraftingApp.svelte";
import {Recipe} from "../../scripts/common/Recipe";
import {DefaultInventoryFactory} from "../../scripts/actor/InventoryFactory";

interface RecipeCraftingAppFactory {

    make(recipe: Recipe, craftingSystem: CraftingSystem, actor: Actor, appId: string): SvelteApplication;

}

class DefaultRecipeCraftingAppFactory implements RecipeCraftingAppFactory {

    make(recipe: Recipe, craftingSystem: CraftingSystem, actor: any, appId: string): SvelteApplication {

        const gameProvider = new GameProvider();
        const GAME = gameProvider.globalGameObject();

        const applicationOptions = {
            title: GAME.i18n.format(`${Properties.module.id}.RecipeCraftingApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 680,
            height: 620
        }

        const inventory = new DefaultInventoryFactory(gameProvider).make(actor, craftingSystem);

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        recipe,
                        craftingSystem,
                        inventory,
                        localization: new DefaultLocalizationService(gameProvider),
                        closeHook: async () => {
                            const svelteApplication: SvelteApplication = <SvelteApplication>Object.values(ui.windows)
                                .find(w => w.id == appId);
                            await svelteApplication.close();
                        }
                    }
                },
                componentType: RecipeCraftingApp
            }
        });
    }

}

export { RecipeCraftingAppFactory, DefaultRecipeCraftingAppFactory }