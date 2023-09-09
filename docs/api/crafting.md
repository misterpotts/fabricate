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
