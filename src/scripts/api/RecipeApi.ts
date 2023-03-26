import {
    Recipe,
    RecipeJson,
    RequirementOption,
    RequirementOptionJson, ResultOption,
    ResultOptionJson
} from "../crafting/recipe/Recipe";
import {CraftingSystemApi} from "./CraftingSystemApi";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {SettingManager} from "./SettingManager";
import Properties from "../Properties";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {RecipeValidator} from "../crafting/recipe/RecipeValidator";
import {DocumentManager} from "../foundry/DocumentManager";
import {combinationFromRecord} from "../system/DictionaryUtils";
import {Component} from "../crafting/component/Component";
import {SelectableOptions} from "../crafting/recipe/SelectableOptions";

interface RecipeData {

    recipeIdsByItemUuid: Record<string, string[]>;
    recipeIdsByCraftingSystemId: Record<string, string[]>;
    recipesById: Record<string, RecipeJson>;

}

/**
 * An API for managing recipes.
 *
 * @interface
 */
interface RecipeApi {

    /**
     * Creates a new recipe with the given details.
     *
     * @async
     * @param {object} options - The recipe details.
     * @param {string} [options.itemUuid] - The item that represents this recipe in the game world
     * @returns {Promise<Recipe>} A Promise that resolves with the newly created `Recipe` instance, or rejects with an
     *  Error if the recipe is not valid.
     */
    create({ itemUuid, craftingSystemId }: { itemUuid: string, craftingSystemId: string }): Promise<Recipe>;

    /**
     * Returns all recipes.
     *
     * @async
     * @returns {Promise<Map<string, Recipe>>} A promise that resolves to a Map of Recipe instances, where the keys are
     *  the recipe IDs, or rejects with an Error if the settings cannot be read.
     */
    getAll(): Promise<Map<string, Recipe>>;

    /**
     * Retrieves the recipe with the specified ID.
     *
     * @async
     * @param {string} id - The ID of the recipe to retrieve.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves with the recipe, or undefined if it does not
     *  exist.
     */
    getById(id: string): Promise<Recipe | undefined>;

    /**
     * Saves a recipe.
     *
     * @async
     * @param {Recipe} recipe - The recipe to save.
     * @returns {Promise<Recipe>} A Promise that resolves with the saved recipe, or rejects with an error if the recipe
     *  is not valid, or cannot be saved.
     */
    save(recipe: Recipe): Promise<Recipe>;

    /**
     * Deletes a recipe by ID.
     *
     * @async
     * @param {string} id - The ID of the recipe to delete.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to the deleted recipe or undefined if the recipe
     *  with the given ID does not exist.
     */
    deleteById(id: string): Promise<Recipe | undefined>;

    /**
     * Deletes all recipes associated with a given item UUID.
     *
     * @async
     * @param {string} id - The UUID of the item to delete recipes for.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to the deleted recipe(s) or an empty array if no
     *  recipes were associated with the given item UUID. Rejects with an Error if the recipes could not be deleted.
     */
    deleteByItemUuid(id: string): Promise<Recipe[]>;

    /**
     *
     * Removes all references to the specified crafting component from all recipes within the specified crafting system.
     * @async
     * @param {string} craftingComponentId - The ID of the crafting component to remove references to.
     * @param {string} craftingSystemId - The ID of the crafting system containing the recipes to modify.
     * @returns {Promise<Recipe[]>} A Promise that resolves with an array of all modified recipes that contain
     *  references to the removed crafting component, or an empty array if no modifications were made. If the specified
     *  crafting system or crafting component does not exist, the Promise will reject with an Error.
     */
    removeComponentReferences(craftingComponentId: string, craftingSystemId: string): Promise<Recipe[]>;

    /**
     * Returns all recipes for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of Recipe instances for the given
     * crafting system, where the keys are the recipe IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Recipe>>;

    /**
     * Returns all recipes in a map keyed on crafting system ID, for a given item UUID.
     *
     * @async
     * @param {string} itemUuid - The UUID of the item.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of `Recipe` instances, where the keys
     * are the crafting system IDs, or rejects with an Error if the recipes cannot be read.
     */
    getAllByItemUuid(itemUuid: string): Promise<Map<string, Recipe>>;

    /**
     * Clones a recipe by ID.
     *
     * @async
     * @param {string} id - The ID of the recipe to clone.
     * @returns {Promise<Recipe>} A Promise that resolves with the newly cloned recipe, or rejects with an Error if the
     *  recipe is not valid or cannot be cloned.
     */
    cloneById(id: string): Promise<Recipe>;

    /**
     * The Notification service used by this API. If `notifications.isSuppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    notifications: NotificationService;

}

export { RecipeApi };

class DefaultRecipeApi implements RecipeApi {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly identityFactory: IdentityFactory;
    private readonly settingManager: SettingManager<RecipeData>;
    private readonly recipeValidator: RecipeValidator;
    private readonly craftingSystemApi: CraftingSystemApi;
    private readonly essenceApi: CraftingSystemApi;
    private readonly componentApi: CraftingSystemApi;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;
    private readonly documentManager: DocumentManager;

    constructor({
        craftingSystemApi,
        componentApi,
        essenceApi,
        notificationService,
        localizationService,
        documentManager
    }: {
        craftingSystemApi: CraftingSystemApi;
        essenceApi: CraftingSystemApi;
        componentApi: CraftingSystemApi;
        notificationService: NotificationService;
        localizationService: LocalizationService;
        settingManager: SettingManager<RecipeData>;
        documentManager: DocumentManager;
    }) {
        this.craftingSystemApi = craftingSystemApi;
        this.essenceApi = essenceApi;
        this.componentApi = componentApi;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
        this.documentManager = documentManager;
    }

    async deleteById(id: string): Promise<Recipe | undefined> {
        const settingValue = await this.settingManager.read();
        if (!settingValue.recipesById[id]) {
            const message = this.localizationService.format(
                `${DefaultRecipeApi._LOCALIZATION_PATH}.errors.recipe.doesNotExist`,
                { recipeId: id }
            );
            this.notificationService.error(message);
            return undefined;
        }
        const deletedRecipe = await this.buildRecipe(id, settingValue.recipesById[id]);
        delete settingValue.recipesById[id];
        await this.settingManager.write(settingValue);
        return deletedRecipe;
    }

    private async buildRecipe(id: string, recipeJson: RecipeJson): Promise<Recipe> {
        const itemData = await this.documentManager.getDocumentByUuid(recipeJson.itemUuid);
        const { craftingSystemId, disabled } = recipeJson;
        // todo: add interface methods for these, then continue with this implementation
        const componentsForSystem = this.componentApi.getAllByCraftingSystemId(craftingSystemId);
        const essencesForSystem = this.essenceApi.getAllByCraftingSystemId(craftingSystemId);
        return new Recipe({
            id,
            craftingSystemId,
            itemData,
            disabled,
            ingredientOptions: this.buildIngredientOptions(recipeJson.ingredientOptions, componentsForSystem),
            resultOptions: this.buildResultOptions(recipeJson.resultOptions, componentsForSystem),
            essences: combinationFromRecord(recipeJson.essences, essencesForSystem)
        });
    }

    private buildIngredientOptions(ingredientOptionsJson: Record<string, RequirementOptionJson>, allComponents: Map<string, Component>): SelectableOptions<RequirementOptionJson, RequirementOption> {
        const options = Object.keys(ingredientOptionsJson)
            .map(name => this.buildIngredientOption(name, ingredientOptionsJson[name], allComponents));
        return new SelectableOptions<RequirementOptionJson, RequirementOption>({
            options
        });
    }

    private buildResultOptions(resultOptionsJson: Record<string, ResultOptionJson>, allComponents: Map<string, Component>): SelectableOptions<ResultOptionJson, ResultOption> {
        const options = Object.keys(resultOptionsJson)
            .map(name => this.buildResultOption(name, resultOptionsJson[name], allComponents));
        return new SelectableOptions<ResultOptionJson, ResultOption>({
            options
        });
    }

    private buildIngredientOption(name: string, ingredientOptionJson: RequirementOptionJson, allComponents: Map<string, Component>): RequirementOption {
        return new RequirementOption({
            name,
            catalysts: combinationFromRecord(ingredientOptionJson.catalysts, allComponents),
            ingredients: combinationFromRecord(ingredientOptionJson.ingredients, allComponents)
        });
    }

    private buildResultOption(name: string, resultOptionJson: ResultOptionJson, allComponents: Map<string, Component>): ResultOption {
        return new ResultOption({
            name,
            results: combinationFromRecord(resultOptionJson, allComponents)
        });
    }

}

export { DefaultRecipeApi };

