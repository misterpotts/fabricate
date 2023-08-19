import {LocalizationService} from "../../applications/common/LocalizationService";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {RecipeAPI} from "./RecipeAPI";
import {CraftingSystemAPI} from "./CraftingSystemAPI";
import {SalvageResult} from "../crafting/result/SalvageResult";
import {DefaultSalvageAttempt, ImpossibleSalvageAttempt, SalvageAttempt} from "../crafting/attempt/SalvageAttempt";
import Properties from "../Properties";

interface CraftingAPI {

    /**
     * Counts the number of components of a given type owned by the specified actor.
     *
     * @param actorId - The id of the actor to check.
     * @param componentId - The id of the component to count.
     * @returns A Promise that resolves with the number of components of this type owned by the actor.
     */
    countOwnedComponents(actorId: string, componentId: string): Promise<number>;

    /**
     * Prepares a Salvage Attempt for the specified component.
     *
     * @param componentId - The id of the component to salvage.
     * @param sourceActorId - The id of the Actor from which the component should be removed. If not specified, the
     *   targetActorId is used. Specify a different sourceActorId when salvaging from a container or shared inventory.
     * @param targetActorId - The id of the Actor to which any produced components should be added.
     * @returns A Promise that resolves with the prepared Salvage Attempt.
     */
    prepareSalvageAttempt({ componentId, sourceActorId, targetActorId }: { componentId: string, sourceActorId: string, targetActorId: string }): Promise<SalvageAttempt>;

    /**
     * Accepts the specified Salvage Result, applying changes to actors and their owned items as necessary.
     *
     * @param salvageResult - The Salvage Result to accept.
     * @returns A Promise that resolves with the accepted Salvage Result.
     */
    acceptSalvageResult(salvageResult: SalvageResult): Promise<SalvageResult>;

}

export { CraftingAPI };

class DefaultCraftingAPI implements CraftingAPI {

    private static readonly _LOCALIZATION_PATH = `${Properties.module.id}.crafting`;

    private readonly localizationService: LocalizationService;
    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly recipeAPI: RecipeAPI;

    constructor({
        localizationService,
        craftingSystemAPI,
        essenceAPI,
        componentAPI,
        recipeAPI,
    }: {
        localizationService: LocalizationService;
        craftingSystemAPI: CraftingSystemAPI;
        essenceAPI: EssenceAPI;
        componentAPI: ComponentAPI;
        recipeAPI: RecipeAPI;
    }) {
        this.localizationService = localizationService;
        this.craftingSystemAPI = craftingSystemAPI;
        this.essenceAPI = essenceAPI;
        this.componentAPI = componentAPI;
        this.recipeAPI = recipeAPI;
    }

    countOwnedComponents(actorId: string, componentId: string): Promise<number> {
        return Promise.resolve(0);
    }

    async prepareSalvageAttempt({ componentId, sourceActorId, targetActorId }: { componentId: string, sourceActorId: string, targetActorId: string }): Promise<SalvageAttempt> {

        const component = await this.componentAPI.getById(componentId);
        await component.load();

        if (component.itemData.hasErrors) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.invalidItemData`,
                    { componentId, cause: component.itemData.errors.join(", ") }
                )
            });
        }

        if (component.isDisabled) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.disabledComponent`,
                    { componentName: component.name }
                )
            });
        }

        if (!component.isSalvageable) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.unsalvageableComponent`,
                    { componentName: component.name }
                )
            });
        }

        const craftingSystem = await this.craftingSystemAPI.getById(component.craftingSystemId);

        if (craftingSystem.isDisabled) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.disabledCraftingSystem`,
                    {
                        craftingSystemName: craftingSystem.details.name,
                        componentName: component.name
                    }
                )
            });
        }

        return new DefaultSalvageAttempt({
            sourceActorId,
            targetActorId,
            componentId: component.id,
            options: component.salvageOptions,
            description: this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.prepared`,
                {
                    craftingSystemName: craftingSystem.details.name,
                    componentName: component.name
                }
            )
        });

    }

    acceptSalvageResult(salvageResult: SalvageResult): Promise<SalvageResult> {
        return Promise.resolve(undefined);
    }

}

export { DefaultCraftingAPI };