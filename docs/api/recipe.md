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

## The recipe object

Recipes implement the `Recipe` interface, described below:

<details markdown="block">
<summary>
Recipe Interface
</summary>

```typescript
interface Recipe extends Identifiable, Serializable<RecipeJson> {

    /**
     * The unique ID of the recipe
     */
    readonly id: string;

    /**
     * The unique ID of the item this recipe is associated with
     */
    readonly itemUuid: string;

    /**
     * The unique ID of the crafting system this recipe belongs to
     */
    readonly craftingSystemId: string;

    /**
     * Whether this recipe is embedded with Fabricate
     */
    readonly embedded: boolean;

    /**
     * Whether this recipe is disabled
     */
    isDisabled: boolean;

    /**
     * The name of the item this recipe is associated with
     */
    readonly name: string;

    /**
     * The URL of the image of the item this recipe is associated with
     */
    readonly imageUrl: string;

    /**
     * The data of the item this recipe is associated with
     */
    itemData: FabricateItemData;

    /**
     * The options for the requirements of this recipe. May be empty.
     */
    readonly requirementOptions: SelectableOptions<RequirementOptionJson, RequirementOption>;

    /**
     * The options for the results of this recipe. May be empty.
     */
    readonly resultOptions: SelectableOptions<ResultOptionJson, ResultOption>;

    /**
     * Whether this recipe has any requirement options. This is a convenience function for checking if the requirement
     *  options are empty.
     */
    readonly hasRequirements: boolean;

    /**
     * Whether this recipe has any result options. This is a convenience function for checking if the result options
     *  are empty.
     */
    readonly hasResults: boolean;

    /**
     * Whether this recipe requires any choices to be made by the user. This is a convenience function for checking if
     *  either the requirement options or the result options require choices.
     */
    readonly hasChoices: boolean;

    /**
     * Whether this recipe requires any choices to be made by the user for the requirements. This is a convenience
     *   function for checking if there are multiple requirement options.
     */
    readonly hasRequirementChoices: boolean;

    /**
     * Whether this recipe requires any choices to be made by the user for the results. This is a convenience function
     *  for checking if there are multiple result options.
     */
    readonly hasResultChoices: boolean;

    /**
     * Whether this recipe has any errors in its item data. This is a convenience function for checking if the item data
     *  has any errors.
     */
    readonly hasErrors: boolean;

    /**
     * The codes for the errors that occurred while loading the item data, if any. May be an empty array.
     */
    readonly errorCodes: string[];

    /**
     * The errors that occurred while loading the item data, if any. May be an empty array.
     */
    readonly errors: ItemLoadingError[];

    /**
     * Indicates whether this recipe's item data has been loaded
     */
    readonly loaded: boolean;

    /**
     * Sets the result option for this recipe. If the result option has an ID, it will be used to attempt to overwrite
     * an existing result option. Otherwise, a new result option will be created with a new ID.
     *
     * @param {ResultOptionConfig | ResultOption} resultOption - The result option to set. Accepts a ResultOption
     *  instance or a ResultOptionConfig object.
     */
    setResultOption(resultOption: ResultOptionConfig | ResultOption): void;

    /**
     * Sets the requirement option for this recipe. If the requirement option has an ID, it will be used to attempt to
     * overwrite an existing requirement option. Otherwise, a new requirement option will be created with a new ID.
     *
     * @param {RequirementOptionConfig | RequirementOption} requirementOption - The requirement option to set. Accepts
     * a RequirementOption instance or a RequirementOptionConfig object.
     */
    setRequirementOption(requirementOption: RequirementOptionConfig | RequirementOption): void;

    /**
     * Deletes the result option with the given ID from this recipe
     *
     * @param id - The ID of the result option to delete
     */
    deleteResultOptionById(id: string): void;

    /**
     * Deletes the requirement option with the given ID from this recipe
     *
     * @param id - The ID of the requirement option to delete
     */
    deleteRequirementOptionById(id: string): void;

    /**
     * Clones this recipe, optionally with a new ID, crafting system ID, and/or substitute essence and component IDs
     *
     * @param id - The ID for the cloned recipe. Must not be the ID of this recipe.
     * @param embedded - Whether the cloned recipe should be embedded with Fabricate. Defaults to false.
     * @param craftingSystemId - The ID of the crafting system for the cloned recipe. Defaults to the ID of this
     *  recipe's crafting system.
     * @param substituteEssenceIds - A map of essence IDs to substitute with new IDs. Defaults to an empty map. This is
     *  used when cloning a recipe into a new crafting system, to ensure that the cloned recipe's essences are
     *  unique to the new crafting system.
     * @param substituteComponentIds - A map of component IDs to substitute with new IDs. Defaults to an empty map.
     *  This is used when cloning a recipe into a new crafting system, to ensure that the cloned recipe's components
     *  are unique to the new crafting system.
     */
    clone({
        id,
        craftingSystemId,
        substituteEssenceIds,
        substituteComponentIds,
      }: {
        id: string;
        craftingSystemId?: string;
        substituteEssenceIds?: Map<string, string>;
        substituteComponentIds?: Map<string, string>;
    }): Recipe;

    /**
     * Lists all the components referenced by this recipe. May be an empty array.
     *
     * @returns {ComponentReference[]} - An array of all the components referenced by this recipe
     */
    getUniqueReferencedComponents(): ComponentReference[];

    /**
     * Lists all the essences referenced by this recipe. May be an empty array.
     *
     * @returns {EssenceReference[]} - An array of all the essences referenced by this recipe
     */
    getUniqueReferencedEssences(): EssenceReference[];

    /**
     * Loads the item data for this recipe
     *
     * @param forceReload - Whether to reload the item data. Defaults to false.
     * @returns {Promise<Component>} - A promise that resolves to this recipe, once the item data has been loaded
     */
    load(forceReload?: boolean): Promise<Recipe>;

    /**
     * Performs an equality check between this recipe and another recipe. If excludeDisabled is true, the disabled
     *  status of the recipes will be ignored. Works regardless of whether the recipes are loaded.
     *
     * @param other - The other recipe to compare to
     * @param excludeDisabled - Whether to ignore the disabled status of the recipes. Defaults to false.
     */
    equals(other: Recipe, excludeDisabled?: boolean): boolean;

    /**
     * Indicates whether this recipe has a requirement option that requires essences
     */
    hasEssenceRequirementOption(): boolean;

    /**
     * Indicates whether this recipe has a component with the given ID in any of its requirement or result options
     *
     * @param componentId - The ID of the component to check for
     */
    hasComponent(componentId: string): boolean;

    /**
     * Removes the component with the given ID from any of the requirement or result options
     *
     * @param componentId - The ID of the component to remove
     */
    removeComponent(componentId: string): void;

    /**
     * Indicates whether this recipe has an essence with the given ID in any of its requirement options
     *
     * @param essenceIdToRemove - The ID of the essence to check for
     */
    removeEssence(essenceIdToRemove: string): void;

    /**
     * Indicates whether this recipe has an essence with the given ID in any of its requirement options
     *
     * @param essenceId - The ID of the essence to check for
     */
    hasEssence(essenceId: string): any;

}
```

</details>

## Examples 

The examples below illustrate how to use the recipe API to create, modify and delete recipes.

### Creating a recipe

Once you've [created a crafting system](../systems#create-a-crafting-system), you can create a recipe for that crafting system by calling `game.fabricate.api.recipes.create()`, passing in the recipe details.
To create a recipe, you must provide the ID of the crafting system the recipe belongs to, and the UUID of the item the recipe is associated with.
If you've [created components](../components#creating-a-component) and optionally [created essences](../essences#creating-an-essence) for the crafting system, you can also provide options for requirements and results for the recipe.
If not, don't worry - you can always [add requirements](#modifying-the-requirementoptions-for-a-recipe) and [add results](#modifying-the-resultoptions-for-a-recipe) later.

<details markdown="block">
<summary>
Example #1: A bare-bones recipe, with no requirements or results
</summary>

```typescript
const myRecipeData = {
    itemUuid: 'my-item-uuid', // <-- Replace with the UUID of the item you want to associate the recipe with
    craftingSystemId: 'my-crafting-system-id', // <-- Replace with the ID of the crafting system you want to add the recipe to
};
const recipe = await game.fabricate.api.recipes.create(myRecipeData);
```

</details>

<details markdown="block">
<summary>
Example #2: A simple recipe with one requirement option and one result option
</summary>

```typescript
const myRecipeData = {
    itemUuid: 'my-item-uuid', // <-- Replace with the UUID of the item you want to associate the recipe with
    craftingSystemId: 'my-crafting-system-id', // <-- Replace with the ID of the crafting system you want to add the recipe to
    // A requirement option can have catalysts, ingredients and essences, or just a subset of these. This example has catalysts and ingredients.
    requirementOptions: [ // <-- Replace with the requirement options you want to create for the recipe
        {
            name: 'My Requirement Option', // <-- Replace with the name of the requirement option
            catalysts: { // <-- Replace the keys with the IDs of the components you want to add as catalysts, and the values with the quantities required
                'my-catalyst-component-id': 1,
            },
            ingredients: { // <-- Replace the keys with the IDs of the components you want to add as ingredients, and the values with the quantities required
                'my-ingredient-component-id': 1,
            }
        },
    ],
    // Results produce components when the recipe is crafted
    resultOptions: [
        {
            name: 'My Result Option', // <-- Replace with the name of the result option
            results: { // <-- Replace the keys with the IDs of the components you want to add as results, and the values with the quantities created
                'my-result-component-id': 1,
            },
        },
    ],
};
const recipe = await game.fabricate.api.recipes.create(myRecipeData);
```

</details>

<details markdown="block">
<summary>
Example #3: A recipe with multiple requirement options and multiple result options
</summary>

```typescript
const myRecipeData = {
    itemUuid: 'my-item-uuid', // <-- Replace with the UUID of the item you want to associate the recipe with
    craftingSystemId: 'my-crafting-system-id', // <-- Replace with the ID of the crafting system you want to add the recipe to
    // A requirement option can have catalysts, ingredients and essences, or just a subset of these. This example has only essences.
    requirementOptions: [ // <-- Replace with the requirement options you want to create for the recipe
        {
            name: 'My Requirement Option 1', // <-- Replace with the name of the requirement option
            essences: { // <-- Replace the keys with the IDs of the essences you want to add, and the values with the quantities required
                'my-essence-id-1': 2,
            }
        },
        // Add as many requirement options as you like, but remember to change the names and IDs!
        {
            name: 'My Requirement Option 2', 
            essences: {
                'my-essence-id-1': 1,
                'my-essence-id-2': 1,
            }
        },
    ],
    // Results produce components when the recipe is crafted
    resultOptions: [
        {
            name: 'My Result Option 1', // <-- Replace with the name of the result option
            results: { // <-- Replace the keys with the IDs of the components you want to add as results, and the values with the quantities created
                'my-result-component-id-1': 1,
            },
        },
        // Add as many result options as you like, but remember to change the names and IDs!
        {
            name: 'My Result Option 2', 
            results: { 
                'my-result-component-id-2': 3,
            },
        },
    ],
};
const recipe = await game.fabricate.api.recipes.create(myRecipeData);
```

</details>

### Getting a recipe by ID

You can get a recipe by its ID by calling `game.fabricate.api.recipes.getById()`, passing in the ID of the recipe you want to retrieve.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to retrieve
const recipe = await game.fabricate.api.recipes.getById(recipeId);
```

</details>

### Getting all recipes

You can retrieve all recipes in all crafting systems by calling `game.fabricate.api.recipes.getAll()`.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const recipes = await game.fabricate.api.recipes.getAll();
```

</details>

Getting all recipes in a crafting system

You can retrieve all recipes in a crafting system by calling `game.fabricate.api.recipes.getAllByCraftingSystemId()`, passing in the ID of the crafting system you want to retrieve recipes for.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const craftingSystemId = 'my-crafting-system-id'; // <-- Replace with the ID of the crafting system you want to retrieve recipes for
const recipes = await game.fabricate.api.recipes.getAllByCraftingSystemId(craftingSystemId);
```

</details>

### Getting all recipes for an item

You can retrieve all recipes for an item by calling `game.fabricate.api.recipes.getAllByItemUuid()`, passing in the UUID of the item you want to retrieve recipes for.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const itemUuid = 'my-item-uuid'; // <-- Replace with the UUID of the item you want to retrieve recipes for
const recipes = await game.fabricate.api.recipes.getAllByItemUuid(itemUuid);
```

</details>

### Deleting a recipe

You can delete a recipe by calling `game.fabricate.api.recipes.deleteById()`, passing in the ID of the recipe you want to delete.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to delete
const deletedRecipe = await game.fabricate.api.recipes.deleteById(recipeId);
```

</details>

### Modifying the requirement options for a recipe

You can modify the requirement options for a recipe by fetching it, modifying the requirement option (or options), then calling `game.fabricate.api.recipes.save()`, passing in the modified recipe.

<details markdown="block">
<summary>
Example #1: Adding a requirement option with ingredients and catalysts
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to modify
const recipe = await game.fabricate.api.recipes.getById(recipeId);
const myRequirementOptionData = {
    name: 'My Requirement Option', // <-- Replace with the name of the requirement option
    catalysts: { // <-- Replace the keys with the IDs of the components you want to add as catalysts, and the values with the quantities required
        'my-catalyst-component-id': 1,
    },
    ingredients: { // <-- Replace the keys with the IDs of the components you want to add as ingredients, and the values with the quantities required
        'my-ingredient-component-1-id': 3,
        'my-ingredient-component-2-id': 1,
    }
};
recipe.setRequirementOption(myRequirementOptionData);
// Save the recipe
await game.fabricate.api.recipes.save(recipe);
```

</details>

<details markdown="block">
<summary>
Example #2: Adding a requirement option with essences and ingredients
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to modify
const recipe = await game.fabricate.api.recipes.getById(recipeId);
const myRequirementOptionData = {
    name: 'My Requirement Option', // <-- Replace with the name of the requirement option
    ingredients: {
        'my-ingredient-component-id': 1,
    },
    essences: { // <-- Replace the keys with the IDs of the essences you want to add, and the values with the quantities required
        'my-essence-id': 2,
    }
};
recipe.setRequirementOption(myRequirementOptionData);
// Save the recipe
await game.fabricate.api.recipes.save(recipe);
```

</details>

<details markdown="block">
<summary>
Example #3: Overwriting an existing requirement option
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to modify
const recipe = await game.fabricate.api.recipes.getById(recipeId);
const myRequirementOptionData = {
    id: 'my-requirement-option-id', // <-- Replace with the ID of the requirement option you want to overwrite
    name: 'My Requirement Option', // <-- Replace with the name of the requirement option
    ingredients: {
        'my-ingredient-component-id': 1,
    },
    essences: { // <-- Replace the keys with the IDs of the essences you want to add, and the values with the quantities required
        'my-essence-id': 2,
    }
};
recipe.setRequirementOption(myRequirementOptionData);
// Save the recipe
await game.fabricate.api.recipes.save(recipe);
```

</details>

<details markdown="block">
<summary>
Example #4: Deleting a requirement option
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to modify
const recipe = await game.fabricate.api.recipes.getById(recipeId);
recipe.deleteRequirementOptionById('my-requirement-option-id'); // <-- Replace with the ID of the requirement option you want to delete
// Save the recipe
await game.fabricate.api.recipes.save(recipe);
```

</details>

### Changing the item associated with a recipe

You can change the item associated with a recipe (with a bit of a workaround) by first loading the item data using the document manager. 
Just like with other modifications, you will need to save the modified recipe after changing the source item data by calling `game.fabricate.api.recipes.save()`. 
In a later release of Fabricate, this will be simplified to allow you to simply assign the item UUID to a the `itemUuid` property on the recipe.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const recipeId = 'my-recipe-id'; // <-- Replace with the ID of the recipe you want to modify
const recipe = await game.fabricate.api.recipes.getById(recipeId);
// Change the item data:
//   Currently, Fabricate requires that you load the item using its document manager before assigning it to the recipe.
//   This is likely to change in a future release to simplify things for API users.
const itemUuid = "myNewItemUuid"; // <-- Replace with the UUID of the new source item
recope.itemData = await game.fabricate.api.documentManager.loadItemDataByDocumentUuid(itemUuid);
// Save the recipe
await game.fabricate.api.recipes.save(recipe);
```

</details>