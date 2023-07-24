import {SvelteApplication} from "../SvelteApplication";
import Properties from "../../scripts/Properties";
import {DefaultLocalizationService} from "../common/LocalizationService";
import RecipeCraftingApp from "./RecipeCraftingApp.svelte";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";

interface RecipeCraftingAppFactory {

    make(recipe: Recipe, actor: Actor, appId: string): SvelteApplication;

}

class DefaultRecipeCraftingAppFactory implements RecipeCraftingAppFactory {

    private readonly localizationService: DefaultLocalizationService;
    private readonly craftingAPI: CraftingAPI;

    constructor({
        craftingAPI,
        localizationService,
    }: {
        craftingAPI: CraftingAPI;
        localizationService: DefaultLocalizationService;
    }) {
        this.craftingAPI = craftingAPI;
        this.localizationService = localizationService;
    }

    make(recipe: Recipe, actor: any, appId: string): SvelteApplication {

        const applicationOptions = {
            title: this.localizationService.format(`${Properties.module.id}.RecipeCraftingApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 680,
            height: 620
        }

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        recipe,
                        craftingAPI: this.craftingAPI,
                        localization: this.localizationService,
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