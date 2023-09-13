import {SvelteApplication} from "../SvelteApplication";
import Properties from "../../scripts/Properties";
import {DefaultLocalizationService} from "../common/LocalizationService";
import RecipeCraftingApp from "./RecipeCraftingApp.svelte";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";
import {CraftingAPI} from "../../scripts/api/CraftingAPI";
import {DefaultRecipeCraftingManager} from "./RecipeCraftingManager";
import {ComponentAPI} from "../../scripts/api/ComponentAPI";

interface RecipeCraftingAppFactory {

    make(recipe: Recipe, actor: Actor, appId: string): Promise<SvelteApplication>;

}

class DefaultRecipeCraftingAppFactory implements RecipeCraftingAppFactory {

    private readonly localizationService: DefaultLocalizationService;
    private readonly craftingAPI: CraftingAPI;
    private readonly _componentAPI: ComponentAPI;

    constructor({
        craftingAPI,
        componentAPI,
        localizationService,
    }: {
        craftingAPI: CraftingAPI;
        componentAPI: ComponentAPI;
        localizationService: DefaultLocalizationService;
    }) {
        this.craftingAPI = craftingAPI;
        this._componentAPI = componentAPI;
        this.localizationService = localizationService;
    }

    async make(recipe: Recipe, actor: any, appId: string): Promise<SvelteApplication> {

        const applicationOptions = {
            title: this.localizationService.format(`${Properties.module.id}.RecipeCraftingApp.title`, { actorName: actor.name }),
            id: appId,
            resizable: false,
            width: 680,
            height: 720
        }

        const allCraftingSystemComponentsById = await this._componentAPI.getAllByCraftingSystemId(recipe.craftingSystemId);

        const recipeCraftingManager = new DefaultRecipeCraftingManager({
            recipeToCraft: recipe,
            craftingAPI: this.craftingAPI,
            sourceActor: actor,
            targetActor: actor,
            allCraftingSystemComponentsById
        });

        return new SvelteApplication({
            applicationOptions,
            svelteConfig: {
                options: {
                    props: {
                        recipeCraftingManager,
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