---
layout: page
title: Recipe API
permalink: /api/recipes/
parent: API
nav_order: 4
---

# Recipe API
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

The recipe API enables you to create, modify and delete recipes.
It is exposed by the Fabricate API at `game.fabricate.api.recipes` (the `FabricateAPI#recipes` property).
The recipe API implements the `RecipeAPI` interface, described below.

## Interface definition

<details open markdown="block">
<summary>
RecipeAPI Interface
</summary>

```typescript
/**
 * An API for managing recipes.
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

    /**
     * Creates or overwrites a recipe with the given details. This operation is intended to be used when importing a
     * crafting system and its recipes from a JSON file. Most users should use `create` or `save` recipes instead.
     *
     * @async
     * @param recipeData - The recipe data to insert
     * @returns {Promise<Recipe>} A Promise that resolves with the saved recipe, or rejects with an error if
     *   the recipe is not valid, or cannot be saved.
     */
    insert(recipeData: RecipeExportModel): Promise<Recipe>;

    /**
     * Creates or overwrites multiple recipes with the given details. This operation is intended to be used when
     *   importing a crafting system and its recipes from a JSON file. Most users should use `create` or `save`
     *   recipes instead.
     *
     * @async
     * @param recipeData - The recipe data to insert
     * @returns {Promise<Recipe[]>} A Promise that resolves with the saved recipes, or rejects with an error
     *   if any of the recipes are not valid, or cannot be saved.
     */
    insertMany(recipeData: RecipeExportModel[]): Promise<Recipe[]>;

    /**
     * Clones all recipes in the given array, optionally substituting the IDs of essences and crafting components with
     *   new IDs. Recipes are cloned by value and the copies will be assigned new IDs. The cloned Recipes will be
     *   assigned to the Crafting System with the given target Crafting System ID. This operation is not idempotent and
     *   will produce duplicate Recipes with distinct IDs if called multiple times with the same source Recipes and
     *   target Crafting System ID. As only one Recipe can be associated with a given game item within a single Crafting
     *   system, Recipes cloned into the same Crafting system will have their associated items removed.
     *
     * @param recipes - The Recipes to clone
     * @param targetCraftingSystemId - The ID of the Crafting System to clone the Recipes to. Defaults to the source
     *   Recipe's Crafting System ID.
     * @param substituteEssenceIds - An optional Map of Essence IDs to substitute with new IDs. If a Recipe references
     *   an Essence in this Map , the Recipe will be cloned with the new Essence ID in place of the original ID.
     * @param substituteComponentIds - An optional Map of Crafting Component IDs to substitute with new IDs. If a Recipe
     *   references a Crafting Component in this Map , the Recipe will be cloned with the new Crafting Component ID in
     *   place of the original ID.
     */
    cloneAll(recipes: Recipe[], targetCraftingSystemId?: string, substituteEssenceIds?: Map<string, string>, substituteComponentIds?: Map<string, string>): Promise<{ recipes: Recipe[], idLinks: Map<string, string> }>;

}
```

</details>

<details markdown="block">
<summary>
RecipeOptions Interface
</summary>

```typescript
/**
 * Options for creating a new recipe.
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
```

</details>

<details markdown="block">
<summary>
ResultOptionValue Interface
</summary>

```typescript
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
```

</details>

<details markdown="block">
<summary>
RequirementOptionValue Interface
</summary>

```typescript
/**
 * A value object representing a Requirement option
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

    /**
     * The essences necessary for this requirement option. The object is a dictionary keyed on the essence ID with the
     *   values representing the required quantities.
     */
    essences: Record<string, number>;

}
```

</details>