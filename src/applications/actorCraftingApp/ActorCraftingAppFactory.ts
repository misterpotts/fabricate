import {SvelteApplication} from "../SvelteApplication";
import {ActorCraftingAppViewType} from "./ActorCraftingAppViewType";
import {LocalizationService} from "../common/LocalizationService";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import Properties from "../../scripts/Properties";
import ActorCraftingApp from "./ActorCraftingApp.svelte";
interface MakeOptions {

    view?: ActorCraftingAppViewType;
    sourceActorId: string;
    targetActorId: string;
    selectedRecipeId?: string;
    selectedComponentId?: string;

}

interface ActorCraftingAppFactory {

    make(options: MakeOptions): Promise<SvelteApplication>;

}

export { ActorCraftingAppFactory }

class DefaultActorCraftingAppFactory implements ActorCraftingAppFactory {

    private static readonly DEFAULT_VIEW: ActorCraftingAppViewType = ActorCraftingAppViewType.BROWSE_RECIPES;

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

    async make({
        view = DefaultActorCraftingAppFactory.DEFAULT_VIEW,
        sourceActorId,
        targetActorId,
        selectedRecipeId,
        selectedComponentId,
     }: MakeOptions): Promise<SvelteApplication> {

        const applicationOptions = {
            title: this.localizationService.localize(`${Properties.module.id}.ActorCraftingApp.title`),
            id: Properties.ui.apps.actorCraftingApp.id,
            resizable: true,
            width: 1020,
            height: 780
        }

        return new SvelteApplication({
            applicationOptions,
            preflight: true,
            svelteConfig: {
                options: {
                    props: {
                        localization: this.localizationService,
                        fabricateAPI: this.fabricateAPI,
                        view,
                        sourceActorId,
                        targetActorId,
                        selectedRecipeId,
                        selectedComponentId,
                    }
                },
                componentType: ActorCraftingApp
            }
        });
    }

}

export { DefaultActorCraftingAppFactory }