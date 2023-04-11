import {
    Recipe,
    RecipeJson,
    RequirementOption,
    RequirementOptionJson,
    ResultOption,
    ResultOptionJson
} from "../crafting/recipe/Recipe";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {SettingManager} from "./SettingManager";
import Properties from "../Properties";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {DocumentManager} from "../foundry/DocumentManager";
import {Component} from "../crafting/component/Component";
import {SelectableOptions} from "../crafting/recipe/SelectableOptions";
import {ComponentApi} from "./ComponentApi";
import {EssenceApi} from "./EssenceApi";
import {Essence} from "../crafting/essence/Essence";
import {EntityValidationResult, EntityValidator} from "./EntityValidator";
import {Combination} from "../common/Combination";

interface RecipeData {

    recipeIdsByItemUuid: Record<string, string[]>;
    recipeIdsByCraftingSystemId: Record<string, string[]>;
    recipesById: Record<string, RecipeJson>;

}

export { RecipeData }

/**
 * Options for creating a new recipe.
 *
 * @interface
 */
interface RecipeOptions {

    /**
     * The UUID of the item associated with the recipe.
     * */
    itemUuid: string;

    /**
     * The ID of the crafting system that the recipe belongs to.
     * */
    craftingSystemId: string;

    /**
     * Optional dictionary of the essences required for the recipe. The dictionary is keyed on the essence ID and with
     * the values representing the required quantities.
     * */
    essences?: Record<string, number>;

    /**
     * Whether the recipe is disabled.
     * */
    disabled?: boolean;

    /**
     * Optional dictionary of requirement options for the recipe, keyed on the option name.
     * */
    requirementOptions?: Record<string, {

        /**
         * The catalysts necessary for this requirement option. The object is a dictionary keyed on the component ID with
         * the values representing the required quantities.
         */
        catalysts: Record<string, number>;

        /**
         * The ingredients necessary for this requirement option. The object is a dictionary keyed on the component ID with
         * the values representing the required quantities.
         */
        ingredients: Record<string, number>;

    }>;

    /**
     * Optional dictionary of result options for the recipe, keyed on the option name. Each option is a dictionary keyed
     * on the component ID with the values representing the created quantities.
     * */
    resultOptions?: Record<string, Record<string, number>>;

}

export { RecipeOptions }

/**
 * An API for managing recipes.
 *
 * @interface
 */
interface RecipeApi {

    /**
     * Creates a new recipe with the given options.
     *
     * @async
     * @param {RecipeOptions} recipeOptions - The options for the recipe.
     * @returns {Promise<Recipe>} - A promise that resolves with the newly created recipe. As document data is loaded
     *  during validation, the created recipe is returned with item data loaded.
     * @throws {Error} - If there is an error creating the recipe.
     */
    create(recipeOptions: RecipeOptions): Promise<Recipe>;

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
     * @param {string} recipeId - The ID of the recipe to retrieve.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves with the recipe, or undefined if it does not
     *  exist.
     */
    getById(recipeId: string): Promise<Recipe | undefined>;

    /**
     * Retrieves all recipes with the specified IDs.
     *
     * @async
     * @param {string} recipeIds - An array of recipe IDs to retrieve.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to a Map of `Recipe` instances, where the keys are
     * the recipe IDs. Values are undefined if the recipe with the corresponding ID does not exist
     */
    getAllById(recipeIds: string[]): Promise<Map<string, Recipe | undefined>>;

    /**
     * Saves a recipe.
     *
     * @async
     * @param {Recipe} recipe - The recipe to save.
     * @returns {Promise<Recipe>} A Promise that resolves with the saved recipe, or rejects with an error if the recipe
     *  is not valid, or cannot be saved. As document data is loaded during validation, the created recipe is returned
     *  with item data loaded.
     */
    save(recipe: Recipe): Promise<Recipe>;

    /**
     * Deletes a recipe by ID.
     *
     * @async
     * @param {string} recipeId - The ID of the recipe to delete.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to the deleted recipe or undefined if the recipe
     *  with the given ID does not exist.
     */
    deleteById(recipeId: string): Promise<Recipe | undefined>;

    /**
     * Deletes all recipes associated with a given item UUID.
     *
     * @async
     * @param {string} recipeId - The UUID of the item to delete recipes for.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to the deleted recipe(s) or an empty array if no
     *  recipes were associated with the given item UUID. Rejects with an Error if the recipes could not be deleted.
     */
    deleteByItemUuid(recipeId: string): Promise<Recipe[]>;

    /**
     * Deletes all recipes associated with a given crafting system.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system to delete recipes for.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to the deleted recipe(s) or an empty array if no
     *  recipes were associated with the given crafting system. Rejects with an Error if the recipes could not be
     *  deleted.
     */
    deleteByCraftingSystemId(craftingSystemId: string): Promise<Recipe[]>;

    /**
     *
     * Removes all references to the specified crafting component from all recipes within the specified crafting system.
     * @async
     * @param {string} craftingComponentId - The ID of the crafting component to remove references to.
     * @param {string} craftingSystemId - The ID of the crafting system containing the recipes to modify.
     * @returns {Promise<Recipe[]>} A Promise that resolves with an array of all modified recipes that contain
     *  references to the removed crafting component, or an empty array if no modifications were made. If the specified
     *  crafting system has no recipes, the Promise will reject with an Error.
     */
    removeComponentReferences(craftingComponentId: string, craftingSystemId: string): Promise<Recipe[]>;

    /**
     *
     * Removes all references to the specified essence from all recipes within the specified crafting system.
     * @async
     * @param {string} essenceId - The ID of the essence to remove references to.
     * @param {string} craftingSystemId - The ID of the crafting system containing the recipes to modify.
     * @returns {Promise<Recipe[]>} A Promise that resolves with an array of all modified recipes that contain
     *  references to the removed essence, or an empty array if no modifications were made. If the specified
     *  crafting system has no recipes, the Promise will reject with an Error.
     */
    removeEssenceReferences(essenceId: string, craftingSystemId: string): Promise<Recipe[]>;

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
     * @param {string} recipeId - The ID of the recipe to clone.
     * @returns {Promise<Recipe>} A Promise that resolves with the newly cloned recipe, or rejects with an Error if the
     *  recipe is not valid or cannot be cloned.
     */
    cloneById(recipeId: string): Promise<Recipe>;

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
    private readonly recipeValidator: EntityValidator<Recipe>;
    private readonly essenceApi: EssenceApi;
    private readonly componentApi: ComponentApi;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;
    private readonly documentManager: DocumentManager;

    constructor({
        componentApi,
        essenceApi,
        identityFactory,
        notificationService,
        localizationService,
        settingManager,
        documentManager,
        recipeValidator
    }: {
        essenceApi: EssenceApi;
        componentApi: ComponentApi;
        identityFactory: IdentityFactory;
        notificationService: NotificationService;
        localizationService: LocalizationService;
        settingManager: SettingManager<RecipeData>;
        documentManager: DocumentManager;
        recipeValidator: EntityValidator<Recipe>;
    }) {
        this.essenceApi = essenceApi;
        this.componentApi = componentApi;
        this.identityFactory = identityFactory;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
        this.settingManager = settingManager;
        this.documentManager = documentManager;
        this.recipeValidator = recipeValidator;
    }

    get notifications() {
        return this.notificationService;
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
        const essencesForSystem = await this.essenceApi.getAllByCraftingSystemId(settingValue.recipesById[id].craftingSystemId);
        const componentsForSystem = await this.componentApi.getAllByCraftingSystemId(settingValue.recipesById[id].craftingSystemId);
        const deletedRecipe = await this.buildRecipe(settingValue.recipesById[id], componentsForSystem, essencesForSystem);
        delete settingValue.recipesById[id];
        settingValue.recipeIdsByCraftingSystemId[deletedRecipe.craftingSystemId] = settingValue.recipeIdsByCraftingSystemId[deletedRecipe.craftingSystemId]
            .filter(id => id !== deletedRecipe.id);
        settingValue.recipeIdsByItemUuid[deletedRecipe.itemUuid] = settingValue.recipeIdsByItemUuid[deletedRecipe.itemUuid]
            .filter(id => id !== deletedRecipe.id);
        await this.settingManager.write(settingValue);
        return deletedRecipe;
    }

    async save(recipe: Recipe): Promise<Recipe> {
        await this.rejectSavingInvalidRecipe(recipe);
        const recipeData = await this.settingManager.read();

        let localizationActivity = !!recipeData.recipesById[recipe.id] ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultRecipeApi._LOCALIZATION_PATH}.settings.recipe.${localizationActivity}`,
            { recipeId: recipe.name }
        );

        if (!recipeData.recipesById[recipe.id]) {
            recipeData.recipeIdsByCraftingSystemId = this.addRecipeIdToCollectionDictionary(recipe.id, recipe.itemUuid, recipeData.recipeIdsByCraftingSystemId);
            recipeData.recipeIdsByItemUuid = this.addRecipeIdToCollectionDictionary(recipe.id, recipe.itemUuid, recipeData.recipeIdsByItemUuid);
        }

        recipeData.recipesById[recipe.id] = recipe.toJson();

        await this.settingManager.write(recipeData);
        this.notificationService.info(message);
        return recipe;
    }

    async create({
        itemUuid,
        craftingSystemId,
        essences = {},
        disabled = false,
        requirementOptions = {},
        resultOptions = {},
    }: RecipeOptions): Promise<Recipe> {
        const settingValue = this.settingManager.read();
        const assignedIds = Object.keys(settingValue);
        const id = this.identityFactory.make(assignedIds);
        const componentsForSystem = await this.componentApi.getAllByCraftingSystemId(craftingSystemId);
        const essencesForSystem = await this.essenceApi.getAllByCraftingSystemId(craftingSystemId);
        const created = await this.buildRecipe(
            {
                id,
                itemUuid,
                craftingSystemId,
                disabled,
                essences,
                ingredientOptions: requirementOptions,
                resultOptions
            },
            componentsForSystem,
            essencesForSystem
        );
        return this.save(created);
    }

    async getById(recipeId: string): Promise<Recipe | undefined> {
        const settingValue = await this.settingManager.read();
        const recipeJson = settingValue.recipesById[recipeId];
        if (!recipeJson) {
            const message = this.localizationService.format(
                `${DefaultRecipeApi._LOCALIZATION_PATH}.errors.recipe.doesNotExist`,
                { recipeId }
            );
            this.notificationService.error(message);
            return undefined;
        }
        const componentsForSystem = await this.componentApi.getAllByCraftingSystemId(recipeJson.craftingSystemId);
        const essencesForSystem = await this.essenceApi.getAllByCraftingSystemId(recipeJson.craftingSystemId);
        return this.buildRecipe(recipeJson, componentsForSystem, essencesForSystem);
    }

    async getAllById(recipeIds: string[]): Promise<Map<string, Recipe | undefined>> {
        const recipes = await Promise.all(recipeIds.map(async id => {
            return {
                id,
                recipe: await this.getById(id)
            }
        }));
        return new Map(recipes.map(recipeData => [ recipeData.id, recipeData.recipe ]));
    }

    async cloneById(recipeId: string): Promise<Recipe> {
        const source = await this.getById(recipeId);
        const settingValue = await this.settingManager.read();
        const assignedIds = Object.keys(settingValue.recipesById);
        const cloneId = this.identityFactory.make(assignedIds);
        const clone = source.clone(cloneId);
        return this.save(clone);
    }

    async deleteByItemUuid(itemUuid: string): Promise<Recipe[]> {
        const recipesToDeleteByRecipeId = await this.getAllByItemUuid(itemUuid);
        const settingValue = await this.settingManager.read();
        delete settingValue.recipeIdsByItemUuid[itemUuid];
        const recipesToDelete = Array.from(recipesToDeleteByRecipeId.values());
        recipesToDelete
            .forEach(recipe => {
                delete settingValue.recipesById[recipe.id];
                settingValue.recipeIdsByCraftingSystemId[recipe.craftingSystemId] = settingValue.recipeIdsByCraftingSystemId[recipe.craftingSystemId]
                    .filter(id => id !== recipe.id);
            });
        await this.settingManager.write(settingValue);
        return recipesToDelete;
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Recipe[]> {
        const recipesToDeleteByRecipeId = await this.getAllByCraftingSystemId(craftingSystemId);
        const settingValue = await this.settingManager.read();
        delete settingValue.recipeIdsByCraftingSystemId[craftingSystemId];
        const recipesToDelete = Array.from(recipesToDeleteByRecipeId.values());
        recipesToDelete
            .forEach(recipe => {
                delete settingValue.recipesById[recipe.id];
                settingValue.recipeIdsByItemUuid[recipe.itemUuid] = settingValue.recipeIdsByItemUuid[recipe.itemUuid]
                    .filter(id => id !== recipe.id);
            });
        await this.settingManager.write(settingValue);
        return recipesToDelete;
    }

    private async _getAll(craftingSystemId?: string): Promise<Map<string, Recipe>> {
        const settingValue = await this.settingManager.read();

        const craftingSystemsData = await Promise.all(Object.keys(settingValue.recipeIdsByCraftingSystemId)
            .filter(id => !craftingSystemId || id === craftingSystemId)
            .map(async systemId => {
                const componentsForSystem = await this.componentApi.getAllByCraftingSystemId(systemId);
                const essencesForSystem = await this.essenceApi.getAllByCraftingSystemId(systemId);
                return {
                    craftingSystemId: systemId,
                    componentsForSystem,
                    essencesForSystem,
                    recipeIds: settingValue.recipeIdsByCraftingSystemId[systemId]
                }
            }));

        const recipeData = await Promise.all(craftingSystemsData.flatMap(systemData =>
            systemData.recipeIds
                .map(recipeId => this.buildRecipe(
                    settingValue.recipesById[recipeId],
                    systemData.componentsForSystem,
                    systemData.essencesForSystem)
                )
        ));

        return new Map(recipeData.map(recipe => [recipe.id, recipe]));
    }

    getAll(): Promise<Map<string, Recipe>> {
        return this._getAll();
    }

    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Recipe>> {
        return this._getAll(craftingSystemId);
    }

    async getAllByItemUuid(itemUuid: string): Promise<Map<string, Recipe>> {
        const settingValue = await this.settingManager.read();

        const recipeIdsByItemUuid = settingValue.recipeIdsByItemUuid[itemUuid];
        const recipeData = await Promise.all(recipeIdsByItemUuid
            .map(async recipeId => {
                const recipeJson = settingValue.recipesById[recipeId];
                const componentsForSystem = await this.componentApi.getAllByCraftingSystemId(recipeJson.craftingSystemId);
                const essencesForSystem = await this.essenceApi.getAllByCraftingSystemId(recipeJson.craftingSystemId);
                return this.buildRecipe(recipeJson, componentsForSystem, essencesForSystem);
            }));

        return new Map(recipeData.map(recipe => [recipe.id, recipe]));
    }

    async removeComponentReferences(componentIdToDelete: string, craftingSystemId: string): Promise<Recipe[]> {
        const settingValue = await this.settingManager.read();
        const recipeIdsForCraftingSystem = settingValue.recipeIdsByCraftingSystemId[craftingSystemId];
        if (!recipeIdsForCraftingSystem) {
            throw new Error(`No Recipes exist for the crafting system ID "${craftingSystemId}". `);
        }
        const modifiedRecipeIds: string[] = [];
        recipeIdsForCraftingSystem
            .map(recipeId => settingValue.recipesById[recipeId])
            .forEach(recipeJson => {
                let modified = false;
                Object.values(recipeJson.ingredientOptions)
                    .forEach(ingredientOption => {
                        if (ingredientOption.ingredients[componentIdToDelete] || ingredientOption.catalysts[componentIdToDelete]) {
                            modified = true;
                            delete ingredientOption.ingredients[componentIdToDelete];
                            delete ingredientOption.catalysts[componentIdToDelete];
                        }
                    });
                Object.values(recipeJson.resultOptions)
                    .forEach(resultOption => {
                        if (resultOption[componentIdToDelete]) {
                            modified = true;
                            delete resultOption[componentIdToDelete];
                        }
                    });
                if (modified) {
                    modifiedRecipeIds.push(recipeJson.id);
                }
            });
        await this.settingManager.write(settingValue);
        const allRecipesForCraftingSystem = await this.getAllByCraftingSystemId(craftingSystemId);
        return Array.from(allRecipesForCraftingSystem.values()).filter(recipe => modifiedRecipeIds.includes(recipe.id));
    }

    async removeEssenceReferences(essenceIdToDelete: string, craftingSystemId: string): Promise<Recipe[]> {
        const settingValue = await this.settingManager.read();
        const recipeIdsForCraftingSystem = settingValue.recipeIdsByCraftingSystemId[craftingSystemId];
        if (!recipeIdsForCraftingSystem) {
            throw new Error(`No Recipes exist for the crafting system ID "${craftingSystemId}". `);
        }
        const modifiedRecipeIds: string[] = [];
        recipeIdsForCraftingSystem
            .map(recipeId => settingValue.recipesById[recipeId])
            .forEach(recipeJson => {
                if (recipeJson.essences[essenceIdToDelete]) {
                    delete recipeJson.essences[essenceIdToDelete];
                    modifiedRecipeIds.push(recipeJson.id);
                }
            });
        await this.settingManager.write(settingValue);
        const allRecipesForCraftingSystem = await this.getAllByCraftingSystemId(craftingSystemId);
        return Array.from(allRecipesForCraftingSystem.values()).filter(recipe => modifiedRecipeIds.includes(recipe.id));
    }

    private async buildRecipe(recipeJson: RecipeJson, componentsForSystem: Map<string, Component>, essencesForSystem: Map<string, Essence>): Promise<Recipe> {
        const itemData = await this.documentManager.prepareItemDataByDocumentUuid(recipeJson.itemUuid);
        const { id, craftingSystemId, disabled } = recipeJson;
        return new Recipe({
            id,
            craftingSystemId,
            itemData,
            disabled,
            ingredientOptions: this.buildIngredientOptions(recipeJson.ingredientOptions, componentsForSystem),
            resultOptions: this.buildResultOptions(recipeJson.resultOptions, componentsForSystem),
            essences: Combination.fromRecord(recipeJson.essences, essencesForSystem)
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
            catalysts: Combination.fromRecord(ingredientOptionJson.catalysts, allComponents),
            ingredients: Combination.fromRecord(ingredientOptionJson.ingredients, allComponents)
        });
    }

    private buildResultOption(name: string, resultOptionJson: ResultOptionJson, allComponents: Map<string, Component>): ResultOption {
        return new ResultOption({
            name,
            results: Combination.fromRecord(resultOptionJson, allComponents)
        });
    }

    private addRecipeIdToCollectionDictionary(recipeId: string, collectionKey: string, collectionDictionary: Record<string, string[]>) {
        if (collectionDictionary[collectionKey]) {
            collectionDictionary[collectionKey].push(recipeId);
            return collectionDictionary;
        }
        collectionDictionary[collectionKey] = [recipeId];
        return collectionDictionary;
    }

    private async rejectSavingInvalidRecipe(recipe: Recipe): Promise<EntityValidationResult<Recipe>> {
        const validationResult = await this.recipeValidator.validate(recipe);
        if (validationResult.isSuccessful) {
            return validationResult;
        }
        const message = this.localizationService.format(
            `${DefaultRecipeApi._LOCALIZATION_PATH}.errors.recipe.notValid`,
            { errors: validationResult.errors.join(", ") }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }
}

export { DefaultRecipeApi };

