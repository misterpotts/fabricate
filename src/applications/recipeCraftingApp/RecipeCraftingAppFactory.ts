import {SvelteApplication} from "../SvelteApplication";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {DefaultGameProvider} from "../../scripts/foundry/GameProvider";
import Properties from "../../scripts/Properties";
import {DefaultLocalizationService} from "../common/LocalizationService";
import RecipeCraftingApp from "./RecipeCraftingApp.svelte";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {DefaultInventoryFactory} from "../../scripts/actor/InventoryFactory";

interface RecipeCraftingAppFactory {

    make(recipe: Recipe, craftingSystem: CraftingSystem, actor: Actor, appId: string): SvelteApplication;

}

class DefaultRecipeCraftingAppFactory implements RecipeCraftingAppFactory {

    make(recipe: Recipe, craftingSystem: CraftingSystem, actor: any, appId: string): SvelteApplication {

        const gameProvider = new DefaultGameProvider();
        const GAME = gameProvider.get();

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