import {LocalizationService} from "../../applications/common/LocalizationService";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {RecipeAPI} from "./RecipeAPI";
import {CraftingSystemAPI} from "./CraftingSystemAPI";

enum CraftingResultOutcomeType {

    /**
     * The action was successful.
     */
    SUCCESS = "SUCCESS",

    /**
     * The action failed.
     */
    FAILURE = "FAILURE",

}

/**
 * A crafting result.
 */
interface CraftingResult {

    /**
     * The outcome of this result.
     */
    outcome: CraftingResultOutcomeType;

    /**
     * The id of the Actor to which this result applies
     */
    actorId: string;

    /**
     * The components modified (consumed and produced) for this result.
     */
    components: {

        /**
         * The components consumed for this result.
         */
        consumed: Record<string, number>;

        /**
         * The components produced for this result.
         */
        produced: Record<string, number>;

    }

}

interface CraftingArgs {

    /**
     * The id of the recipe to craft.
     */
    recipeId: string;

    /**
     * The id of the requirement option to use. If not specified, the first option is used. This is particularly
     *   useful for recipes with only one requirement option.
     */
    requirementOptionId?: string;

    /**
     * The id of the result option to use. If not specified, the first option is used. This is particularly
     *  useful for recipes with only one result option.
     */
    resultOptionId?: string;

    /**
     * The id of the Actor to which any produced components should be added.
     */
    targetActorId: string;

    /**
     * The id of the Actor from which any consumed components should be removed. If not specified, the targetActorId is
     *   used. Specify a different sourceActorId when crafting from a container or shared inventory.
     */
    sourceActorId?: string;

}

interface SalvageArgs {

    /**
     * The id of the component to salvage.
     */
    componentId: string;

    /**
     * The id of the salvage option to use. If not specified, the first option is used. This is particularly useful
     *  for components with only one salvage option.
     */
    salvageOptionId?: string;

    /**
     * The id of the Actor to which any produced components should be added.
     */
    targetActorId: string;

    /**
     * The id of the Actor from which the component should be removed. If not specified, the targetActorId is used.
     *  Specify a different sourceActorId when salvaging from a container or shared inventory.
     */
    sourceActorId?: string;

}

interface CraftingAPI {

    /**
     * Attempts to salvage a component.
     *
     * @async
     * @param {args} args - The options to use when salvaging the component.
     * @param {string} [args.componentId] - The id of the component to salvage.
     * @param {string} [args.salvageOptionId] - The id of the salvage option to use. If not specified, the first option
     *   is used. This is particularly useful for components with only one salvage option.
     * @param {string} [args.targetActorId] - The id of the Actor to which any produced components should be added.
     * @param {string} [args.sourceActorId=args.targetActorId] - The id of the Actor from which the component should be
     *  removed. If not specified, the targetActorId is used. Specify a different sourceActorId when salvaging from a
     *  container or shared inventory.
     * @returns {Promise<CraftingResult>} A promise that resolves to the result of the salvage attempt.
     */
    salvageComponent({ componentId, salvageOptionId, targetActorId, sourceActorId }: SalvageArgs): Promise<CraftingResult>;

    /**
     * Attempts to craft a recipe.
     *
     * @async
     * @param {args} args - The options to use when crafting the recipe.
     * @param {string} [args.recipeId] - The id of the recipe to craft.
     * @param {string} [args.requirementOptionId] - The id of the requirement option to use. If not specified, the first
     *  option is used. This is particularly useful for recipes with only one requirement option.
     * @param {string} [args.resultOptionId] - The id of the result option to use. If not specified, the first option
     *  is used. This is particularly useful for recipes with only one result option.
     * @param {string} [args.targetActorId] - The id of the Actor to which any produced components should be added.
     * @param {string} [args.sourceActorId=args.targetActorId] - The id of the Actor from which any consumed components
     *  should be removed. If not specified, the targetActorId is used. Specify a different sourceActorId when crafting
     *  from a container or shared inventory.
     * @returns {Promise<CraftingResult>} A promise that resolves to the result of the crafting attempt.
     */
    craftRecipe({ recipeId, requirementOptionId, resultOptionId, targetActorId, sourceActorId }: CraftingArgs): Promise<CraftingResult>;

}

export { CraftingAPI };

class DefaultCraftingAPI implements CraftingAPI {

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

    salvageComponent({
         componentId,
         salvageOptionId,
         targetActorId,
         sourceActorId = targetActorId
    }: SalvageArgs): Promise<CraftingResult> {
        throw new Error("Method not implemented.");
    }

    craftRecipe({
        recipeId,
        requirementOptionId,
        resultOptionId,
        targetActorId,
        sourceActorId = targetActorId
    }: CraftingArgs): Promise<CraftingResult> {
        throw new Error("Method not implemented.");
    }


}

export { DefaultCraftingAPI };