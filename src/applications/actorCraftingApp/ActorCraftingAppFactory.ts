import {SvelteApplication} from "../SvelteApplication";
import {LocalizationService} from "../common/LocalizationService";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import Properties from "../../scripts/Properties";
import ActorCraftingApp from "./ActorCraftingApp.svelte";
interface MakeOptions {

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
        sourceActorId,
        targetActorId,
        selectedRecipeId,
        selectedComponentId,
     }: MakeOptions): Promise<SvelteApplication> {

        const applicationOptions = {
            title: this.localizationService.localize(`${Properties.module.id}.ActorCraftingApp.title`),
            id: Properties.ui.apps.actorCraftingApp.id,
            resizable: false,
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