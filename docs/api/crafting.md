---
layout: page
title: Crafting API
permalink: /api/crafting/
parent: API
nav_order: 5
---

# Crafting API
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

The crafting API enables you to craft recipes and salvage components.
It is exposed by the Fabricate API at `game.fabricate.api.crafting` (the `FabricateAPI#crafting` property).
The crafting API implements the `CraftingAPI` interface, described below.

## Interface definition

<details open markdown="block">
<summary>
ComponentAPI Interface
</summary>

```typescript
/**
 * The Crafting API provides methods for crafting recipes and salvaging components.
 */
interface CraftingAPI {

    /**
     * Counts the number of components of a given type owned by the specified actor.
     *
     * @async
     * @param actorId - The ID of the actor to check.
     * @param componentId - The ID of the component to count.
     * @returns A Promise that resolves with the number of components of this type owned by the actor.
     */
    countOwnedComponentsOfType(actorId: string, componentId: string): Promise<number>;

    /**
     * Gets the components owned by the specified actor for the specified crafting system.
     *
     * @async
     * @param actorId - The ID of the actor whose inventory you want to search.
     * @param craftingSystemId - The ID of the crafting system to limit component matches to.
     * @returns A Promise that resolves with the components owned by the actor for the specified crafting system.
     */
    getOwnedComponentsForCraftingSystem(actorId: string, craftingSystemId: string): Promise<Combination<Component>>;

    /**
     * Attempts to salvage the specified component.
     *
     * @async
     * @param componentSalvageOptions - The options to use when salvaging the component.
     * @returns Promise<SalvageResult> A Promise that resolves with the Salvage Result
     */
    salvageComponent(componentSalvageOptions: ComponentSalvageOptions): Promise<SalvageResult>;

    /**
     * Attempts to craft the specified recipe.
     *
     * @async
     * @param recipeCraftingOptions - The options to use when crafting the recipe.
     * @returns Promise<CraftingResult> A Promise that resolves with the prepared Crafting Result.
     */
    craftRecipe(recipeCraftingOptions: RecipeCraftingOptions): Promise<CraftingResult>;

    /**
     * Selects components from the specified source Actor for the specified recipe requirement option. The Component
     *  Selection will be insufficient if the source Actor's inventory does not contain enough components to satisfy the
     *  requirement option.
     *
     * @async
     * @param componentSelectionOptions - The options to use when selecting components.
     * @returns Promise<ComponentSelection> A Promise that resolves with the selected components.
     */
    selectComponents(componentSelectionOptions: ComponentSelectionOptions): Promise<ComponentSelection>;

    /**
     * Configure Fabricate to read from and write to the JSON property path when considering item quantity in your game
     *   world. You can find the game system ID by printing `game.system.id` to the console. For example, `dnd5e` is the
     *   Dungeons and Dragons 5th Edition game system ID. 5th Edition manages item quantity in the `system.quantity`
     *   property. Fabricate supports the following game systems out of the box:
     *   - Dungeons and Dragons 5th Edition (`dnd5e`)
     *   - Pathfinder 2nd Edition (`pf2e`)
     *   If you are using a different game system, you will need to find the correct property path for your
     *   game system. This value is currently not stored in settings, so you will need to call this method every time
     *   you start Foundry VTT.
     *
     * @param gameSystem - The ID of the game system to configure.
     * @param propertyPath - The JSON property path to use when reading and writing item quantity.
     * @returns {[string, string][]} - An array containing all configured game systems and their item quantity property
     *   paths.
     */
    setGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): void;

}
```

</details>

<details markdown="block">
<summary>
ComponentSelectionOptions Interface
</summary>

```typescript
/**
 * Options used when selecting components from an actor's inventory for use when crafting recipes
 */
interface ComponentSelectionOptions {

    /**
     * The ID of the Actor whose inventory you want to select components from.
     */
    sourceActorId: string;

    /**
     * The optional ID of the Recipe Requirement Option to select components for. Not required if the recipe has only
     * one Result Option. If the recipe has multiple requirement options this must be specified.
     */
    requirementOptionId?: string;

    /**
     * The ID of the Recipe to select components for.
     */
    recipeId: string;
}
```

</details>

<details markdown="block">
<summary>
RecipeCraftingOptions Interface
</summary>

```typescript
/**
 * Options used when crafting a recipe.
 */
interface RecipeCraftingOptions {

    /**
     * The ID of the recipe to attempt.
     */
    recipeId: string;

    /**
     * The ID of the Actor from which the components should be removed.
     */
    sourceActorId: string;

    /**
     * The optional ID of the Actor to which any produced components should be added. If not specified, the
     * sourceActorId is used. Specify a different targetActorId when crafting from a container or shared inventory to
     * another character.
     */
    targetActorId?: string;

    /**
     * The optional ID of the Requirement Option to use. Not required if the recipe has only one Requirement Option. If
     * the recipe has multiple Requirement Options this must be specified.
     */
    requirementOptionId?: string;

    /**
     * The optional ID of the Result Option to use. Not required if the recipe has only one Result Option. If the recipe
     * has multiple Result Options this must be specified.
     */
    resultOptionId?: string;

    /**
     * The optional IDs and quantities of the components to use when crafting the recipe. If not specified, the
     * components and amounts will be selected automatically for the least wasteful essence sources (if any are
     * required). This is useful when customising component selection for essences. However, if the Recipe also requires
     * catalysts and named ingredients be sure to include them in the component selection. If an insufficient
     * combination is specified crafting will not be attempted.
     */
    userSelectedComponents?: UserSelectedComponents;

}
```

</details>

<details markdown="block">
<summary>
ComponentSalvageOptions Interface
</summary>

```typescript
/**
 * Options used when salvaging a component using the Crafting API.
 */
interface ComponentSalvageOptions {

    /**
     * The ID of the component to salvage.
     */
    componentId: string;

    /**
     * The ID of the Actor from which the component should be removed.
     */
    sourceActorId: string;

    /**
     * The optional ID of the Actor to which any produced components should be added. If not specified, the
     * sourceActorId is used. Specify a different targetActorId when salvaging from a container or shared inventory to
     * another character.
     */
    targetActorId?: string;

    /**
     * The optional ID of the Salvage Option to use. Not required if the component has only one Salvage Option. If the
     * component has multiple Salvage Options this must be specified.
     */
    salvageOptionId?: string;

}
```

</details>

<details markdown="block">
<summary>
UserSelectedComponents Interface
</summary>

```typescript
/**
 * Options used when explicitly selecting components for crafting recipes
 */
interface UserSelectedComponents {

    /**
     * The IDs and quantities of the catalysts to use when crafting the recipe.
     */
    catalysts: Record<string, number>;

    /**
     * The IDs and quantities of the ingredients to use when crafting the recipe.
     */
    ingredients: Record<string, number>;

    /**
     * The IDs and quantities of the components to use as essence sources when crafting the recipe.
     */
    essenceSources: Record<string, number>;

}
```

</details>

## Examples

The examples below illustrate how to use the crafting API to craft recipes and salvage components.

### Setting the game system item quantity property path

Fabricate treats items in unknown game systems as having a quantity of 1.
You'll need to configure this property if your game system of choice supports item quantities and is not known to Fabricate.
You can do this by making Fabricate aware of the item quantity property path for your game system.
It's really easy to do this, just call `CraftingAPI#setGameSystemItemQuantityPropertyPath`, passing in the game system ID and the property path to use.

<details markdown="block">
<summary>
Example
</summary>

```typescript
// Replace gameSystemId with the ID of the game system to configure, e.g. "dnd5e"
const gameSystemId = "gameSystemId"; 
// Replace itemQuantityPropertyPath with the JSON property path to use when reading and writing item quantity in this game system, e.g. "system.quantity"
const itemQuantityPropertyPath = "property.path"; 
game.fabricate.api.crafting.setGameSystemItemQuantityPropertyPath(gameSystemId, itemQuantityPropertyPath);
```

</details>

### Counting how much of a component an actor owns

You can use the `CraftingAPI#countOwnedComponentsOfType` method to count how many components of a given type an actor owns.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const actorId = "actorId"; // <-- Replace actorId with the ID of the actor to check.
const componentId = "componentId"; // <-- Replace componentId with the ID of the component to count.
const count = await game.fabricate.api.crafting.countOwnedComponentsOfType(actorId, componentId);
```

</details>

### Getting the components owned by an actor for a crafting system

You can use the `CraftingAPI#getOwnedComponentsForCraftingSystem` method to get the components owned by an actor for a given crafting system.
Functionally, this gives you the contents of the actor's inventory for the specified crafting system.
The method produces a [Combination](../types#combination) of Component objects, which acts as a powerful set-like data structure for use in supporting crafting operations.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const actorId = "actorId"; // <-- Replace actorId with the ID of the actor whose inventory you want to search.
const craftingSystemId = "craftingSystemId"; // <-- Replace craftingSystemId with the ID of the crafting system to limit component matches to.
const componentCombination = await game.fabricate.api.crafting.getOwnedComponentsForCraftingSystem(actorId, craftingSystemId);
componentCombination.units.forEach(unit => {
    const component = unit.element;
    const quantity = unit.quantity;
    console.log(`Actor ${actorId} owns ${quantity} of component ${component.id}`);
});
```

</details>

### Selecting components for a recipe

You can use the `CraftingAPI#selectComponents` method to select components from an actor's inventory for use when crafting recipes.
Fabricate will automatically select the least wasteful essence sources (if any are required) for the recipe, as well as any catalysts and named ingredients.
The returned [Component Selection](../types#componentselection) will be insufficient if the actor's inventory does not contain enough components to satisfy the recipe requirement option.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const componentSelectionOptions = {
    sourceActorId: "actorId", // <-- Replace actorId with the ID of the actor whose inventory you want to select components from.
    requirementOptionId: "requirementOptionId", // <-- Replace requirementOptionId with the ID of the Recipe Requirement Option to select components for. Not required if the recipe has only one Requirement Option.
    recipeId: "recipeId" // <-- Replace recipeId with the ID of the Recipe to select components for.
};
const componentSelection = await game.fabricate.api.crafting.selectComponents(componentSelectionOptions);
```

</details>

### Salvaging a component

You can use the `CraftingAPI#salvageComponent` method to salvage a component.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const componentSalvageOptions = {
    componentId: "componentId", // <-- Replace componentId with the ID of the component to salvage.
    sourceActorId: "actorId", // <-- Replace actorId with the ID of the actor from which the component should be removed.
    targetActorId: "actorId", // <-- Replace actorId with the ID of the actor to which any produced components should be added. If not specified, the sourceActorId is used.
    salvageOptionId: "salvageOptionId" // <-- Replace salvageOptionId with the ID of the Salvage Option to use. Not required if the component has only one Salvage Option.
};
const salvageResult = await game.fabricate.api.crafting.salvageComponent(componentSalvageOptions);
```

</details>

### Crafting a recipe

You can use the `CraftingAPI#craftRecipe` method to craft a recipe.
The method will automatically select the least wasteful essence sources (if any are required) for the recipe, as well as any catalysts and named ingredients.

<details markdown="block">
<summary>
Example #1 - Crafting a recipe by letting Fabricate select components automatically
</summary>

```typescript
const recipeCraftingOptions = {
    recipeId: "recipeId", // <-- Replace recipeId with the ID of the recipe to attempt.
    sourceActorId: "actorId", // <-- Replace actorId with the ID of the actor from which the components should be removed.
    targetActorId: "actorId", // <-- Replace actorId with the ID of the actor to which any produced components should be added. If not specified, the sourceActorId is used.
    requirementOptionId: "requirementOptionId", // <-- Replace requirementOptionId with the ID of the Requirement Option to use. Not required if the recipe has only one Requirement Option.
    resultOptionId: "resultOptionId", // <-- Replace resultOptionId with the ID of the Result Option to use. Not required if the recipe has only one Result Option.
};
const craftingResult = await game.fabricate.api.crafting.craftRecipe(recipeCraftingOptions);
```

</details>

<details markdown="block">
<summary>
Example #2 - Crafting a recipe by specifying the components to use
</summary>

```typescript
const recipeCraftingOptions = {
    recipeId: "recipeId", // <-- Replace recipeId with the ID of the recipe to attempt.
    sourceActorId: "actorId", // <-- Replace actorId with the ID of the actor from which the components should be removed.
    targetActorId: "actorId", // <-- Replace actorId with the ID of the actor to which any produced components should be added. If not specified, the sourceActorId is used.
    requirementOptionId: "requirementOptionId", // <-- Replace requirementOptionId with the ID of the Requirement Option to use. Not required if the recipe has only one Requirement Option.
    resultOptionId: "resultOptionId", // <-- Replace resultOptionId with the ID of the Result Option to use. Not required if the recipe has only one Result Option.
    userSelectedComponents: {
        catalysts: { // <-- Replace the keys and values in this object with the IDs and quantities of the catalysts to use when crafting the recipe.
            "componentId": 1 
        },
        ingredients: { // <-- Replace the keys and values in this object with the IDs and quantities of the ingredients to use when crafting the recipe.
            "componentId": 1 
        },
        essenceSources: { // <-- Replace the keys and values in this object with the IDs and quantities of the components to use as essence sources when crafting the recipe.
            "componentId": 1 
        }
    }
};
const craftingResult = await game.fabricate.api.crafting.craftRecipe(recipeCraftingOptions);
```

</details>