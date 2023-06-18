import {Recipe, RecipeJson} from "../crafting/recipe/Recipe";
import {LocalizationService} from "../../applications/common/LocalizationService";
import Properties from "../Properties";
import {EntityValidationResult, EntityValidator} from "./EntityValidator";
import {EntityDataStore} from "./EntityDataStore";
import {IdentityFactory} from "../foundry/IdentityFactory";

/**
 * A value object representing a Requirement option
 *
 * @interface
 */
interface RequirementOptionValue {

    /**
     * The name of the requirement option.
     */
    name: string;

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

}

/**
 * A value object representing a Result option
 */
interface ResultOptionValue {

    /**
     * The name of the result option.
     */
    name: string;

    /**
     * The results of this result option. The object is a dictionary keyed on the component ID with the values
     * representing the created quantities.
     */
    results: Record<string, number>;

}

/**
 * Options for creating a new recipe.
 *
 * @interface
 */
interface RecipeOptions {

    /**
     * The UUID of the item associated with the recipe.
     */
    itemUuid: string;

    /**
     * The ID of the crafting system that the recipe belongs to.
     * */
    craftingSystemId: string;

    /**
     * Optional dictionary of the essences required for the recipe. The dictionary is keyed on the essence ID and with
     * the values representing the required quantities.
     */
    essences?: Record<string, number>;

    /**
     * Whether the recipe is disabled. Defaults to false.
     */
    disabled?: boolean;

    /**
     * Optional array of requirement options for the recipe.
     */
    requirementOptions?: RequirementOptionValue[];

    /**
     * Optional array of result options for the recipe.
     * */
    resultOptions?: ResultOptionValue[];

}

export { RecipeOptions }

/**
 * An API for managing recipes.
 *
 * @interface
 */
interface RecipeAPI {

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
     * @param {string[]} recipeIds - An array of recipe IDs to retrieve.
     * @returns {Promise<Recipe | undefined>} A Promise that resolves to a Map of `Recipe` instances, where the keys are
     * the recipe IDs. Values are undefined if the recipe with the corresponding ID does not exist
     */
    getAllById(recipeIds: string[]): Promise<Map<string, Recipe | undefined>>;

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
     * Returns all recipes in a map keyed on recipe ID, for a given item UUID.
     *
     * @async
     * @param {string} itemUuid - The UUID of the item.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of recipe instances, where the keys
     * are the recipe IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByItemUuid(itemUuid: string): Promise<Map<string, Recipe>>;

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

export { RecipeAPI };

class DefaultRecipeAPI implements RecipeAPI {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly recipeValidator: EntityValidator<RecipeJson, Recipe>;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;
    private readonly recipeStore: EntityDataStore<RecipeJson, Recipe>;
    private readonly identityFactory: IdentityFactory;

    constructor({
        notificationService,
        localizationService,
        recipeValidator,
        recipeDataStore,
        identityFactory
    }: {
        notificationService: NotificationService;
        localizationService: LocalizationService;
        recipeValidator: EntityValidator<RecipeJson, Recipe>;
        recipeDataStore: EntityDataStore<RecipeJson, Recipe>;
        identityFactory: IdentityFactory;
    }) {
        this.notificationService = notificationService;
        this.localizationService = localizationService;
        this.recipeValidator = recipeValidator;
        this.recipeStore = recipeDataStore;
        this.identityFactory = identityFactory;
    }

    get notifications() {
        return this.notificationService;
    }

    async deleteById(id: string): Promise<Recipe | undefined> {
        const deletedRecipe= await this.recipeStore.getById(id);
        this.rejectDeletingEmbeddedRecipe(deletedRecipe);
        if (!deletedRecipe) {
            const message = this.localizationService.format(
                `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.doesNotExist`,
                { recipeId: id }
            );
            this.notificationService.error(message);
            return undefined;
        }
        await this.recipeStore.deleteById(id);
        return deletedRecipe;
    }

    async save(recipe: Recipe): Promise<Recipe> {
        const existing = await this.recipeStore.getById(recipe.id);

        this.rejectModifyingEmbeddedRecipe(existing);
        await this.rejectSavingInvalidRecipe(recipe);

        await this.recipeStore.insert(recipe);

        let activityName = existing ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultRecipeAPI._LOCALIZATION_PATH}.settings.recipe.${activityName}`,
            { recipeId: recipe.name }
        );

        this.notificationService.info(message);

        return recipe;
    }

    async create({
        itemUuid,
        craftingSystemId,
        essences = {},
        disabled = false,
        requirementOptions = [],
        resultOptions = [],
    }: RecipeOptions): Promise<Recipe> {
        const assignedIds = await this.recipeStore.listAllEntityIds();
        const id = this.identityFactory.make(assignedIds);
        return this.recipeStore.create(
            {
                id,
                essences,
                itemUuid,
                disabled,
                resultOptions,
                embedded: false,
                craftingSystemId,
                requirementOptions
            }
        );
    }

    async getById(recipeId: string): Promise<Recipe | undefined> {
        const recipe = await this.recipeStore.getById(recipeId);
        if (!recipe) {
            const message = this.localizationService.format(
                `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.doesNotExist`,
                { recipeId }
            );
            this.notificationService.error(message);
            return undefined;
        }
        return recipe;
    }

    async getAllById(recipeIds: string[]): Promise<Map<string, Recipe | undefined>> {
        const recipes = await this.recipeStore.getAllById(recipeIds);
        const result = new Map(recipes.map(recipe => [ recipe.id, recipe ]));
        const missingValues = recipeIds.filter(id => !result.has(id));
        if (missingValues.length > 0) {
            const message = this.localizationService.format(
                `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.missingRecipes`,
                { recipeIds: missingValues.join(", ") }
            );
            this.notificationService.error(message);
            missingValues.forEach(id => result.set(id, undefined));
        }
        return result;
    }

    async cloneById(recipeId: string): Promise<Recipe> {
        const source = await this.getById(recipeId);
        if (!source) {
            const message = this.localizationService.format(
                `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.cloneTargetNotFound`,
                { recipeId }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
        return this.create(source.toJson());
    }

    async deleteByItemUuid(itemUuid: string): Promise<Recipe[]> {
        const recipes = await this.recipeStore.getCollection(itemUuid, Properties.settings.collectionNames.item);
        recipes.forEach(recipe => this.rejectDeletingEmbeddedRecipe(recipe));
        await this.recipeStore.deleteCollection(itemUuid, Properties.settings.collectionNames.item);
        return recipes;
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Recipe[]> {
        const recipes = await this.recipeStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        recipes.forEach(recipe => this.rejectDeletingEmbeddedRecipe(recipe));
        await this.recipeStore.deleteCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        return recipes;
    }

    async getAll(): Promise<Map<string, Recipe>> {
        const recipes = await this.recipeStore.getAllEntities();
        return new Map(recipes.map(recipe => [ recipe.id, recipe ]));
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Recipe>> {
        const recipes = await this.recipeStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        return new Map(recipes.map(recipe => [ recipe.id, recipe ]));
    }

    async getAllByItemUuid(itemUuid: string): Promise<Map<string, Recipe>> {
        const recipes = await this.recipeStore.getCollection(itemUuid, Properties.settings.collectionNames.item);
        return new Map(recipes.map(recipe => [ recipe.id, recipe ]));
    }

    async removeComponentReferences(componentIdToDelete: string, craftingSystemId: string): Promise<Recipe[]> {
        const recipesForCraftingSystem = await this.recipeStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        const recipesWithComponent = recipesForCraftingSystem.filter(recipe => recipe.hasComponent(componentIdToDelete));
        const modifiedRecipes = recipesWithComponent.map(recipe => {
            recipe.removeComponent(componentIdToDelete);
            return recipe;
        });
        await this.recipeStore.updateAll(modifiedRecipes);
        return modifiedRecipes;
    }

    async removeEssenceReferences(essenceIdToDelete: string, craftingSystemId: string): Promise<Recipe[]> {
        const recipesForCraftingSystem = await this.recipeStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        const recipesWithEssence = recipesForCraftingSystem.filter(recipe => recipe.hasEssence(essenceIdToDelete));
        const modifiedRecipes = recipesWithEssence.map(recipe => {
            recipe.removeEssence(essenceIdToDelete);
            return recipe;
        });
        await this.recipeStore.updateAll(modifiedRecipes);
        return modifiedRecipes;
    }

    private async rejectSavingInvalidRecipe(recipe: Recipe): Promise<EntityValidationResult<Recipe>> {
        const validationResult = await this.recipeValidator.validate(recipe);
        if (validationResult.successful) {
            return validationResult;
        }
        const message = this.localizationService.format(
            `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.notValid`,
            { errors: validationResult.errors.join(", ") }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectModifyingEmbeddedRecipe(recipe: Recipe): void {
        if (!recipe?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.cannotModifyEmbedded`,
            { recipeName: recipe.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectDeletingEmbeddedRecipe(recipeToDelete: Recipe): void {
        if (!recipeToDelete?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultRecipeAPI._LOCALIZATION_PATH}.errors.recipe.cannotDeleteEmbedded`,
            { recipeName: recipeToDelete.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

}

export { DefaultRecipeAPI };

