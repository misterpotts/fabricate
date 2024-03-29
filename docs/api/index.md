---
layout: page
title: API
permalink: /api/
has_children: true
---

{: .new }
> The Fabricate API changed significantly in v0.9.0. If you are upgrading from v0.8.9, please read these docs
> to familiarise yourself with the new API.

# API
{: .no_toc }

Fabricate exposes an API in Foundry, enabling users to interact with the module programmatically.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

## Accessing the API

Fabricate makes its APIs available on the global Game object, at the path `game.fabricate`.
Fabricate provides two APIs: the Fabricate API (at `game.fabricate.api`), and the Fabricate User Interface API (at `game.fabricate.ui`).
The Fabricate API is used for managing crafting systems, essences, components, and recipes, as well as performing crafting.
The Fabricate User Interface API is used for interacting with the Fabricate user interface.

## Fabricate API

The Fabricate API implements the `FabricateAPI` interface, described below.

<details open markdown="block">
<summary>
FabricateAPI Interface
</summary>

```typescript
/**
 * Represents an API for managing crafting systems, components, essences, and recipes.
 */
interface FabricateAPI {

    /**
     * Gets the API for managing crafting systems.
     */
    readonly systems: CraftingSystemAPI;

    /**
     * Gets the API for managing essences.
     */
    readonly essences: EssenceAPI;

    /**
     * Gets the API for managing components.
     */
    readonly components: ComponentAPI;

    /**
     * Gets the API for managing recipes.
     */
    readonly recipes: RecipeAPI;

    /**
     * Gets the API for managing Fabricate's data migrations.
     */
    readonly migration: SettingMigrationAPI;

    /**
     * Gets the API for performing crafting.
     */
    readonly crafting: CraftingAPI;

    /**
     * Gets an instance of the Fabricate Document manager, used for loading Foundry Documents and extracting the data
     *   they contain that is relevant to Fabricate.
     */
    readonly documentManager: DocumentManager;

    /**
     * Suppresses notifications from Fabricate for all operations. Use {@link FabricateAPI#activateNotifications} to
     * re-enable notifications.
     */
    suppressNotifications(): void;

    /**
     * Activates notifications from Fabricate for all operations. Use {@link FabricateAPI#suppressNotifications} to
     * suppress notifications.
     */
    activateNotifications(): void;

    /**
     * Gets summary statistics about the Crafting Systems, Essences, Components, and Recipes in the Fabricate database.
     *
     * @async
     * @returns {Promise<FabricateStatistics>} A Promise that resolves with the Fabricate statistics.
     */
    getStatistics(): Promise<FabricateStatistics>;

    /**
     * Deletes all Crafting Systems, Essences, Components, and Recipes in the Fabricate database for the given Crafting
     *  System id.
     *
     * @async
     * @param id - The ID of the Crafting System to delete.
     * @returns {Promise<void>} A Promise that resolves to an object containing the deleted Crafting System, Essences,
     *   Components, and Recipes.
     */
    deleteAllByCraftingSystemId(id: string): Promise<CraftingSystemData>;

    /**
     * Duplicates the Crafting System with the given ID. The copy will have the same name as the original, with the
     *   suffix "Copy" appended to it. All Essences, Components, and Recipes in the Crafting System will also be
     *   duplicated.
     *
     * @async
     * @param sourceCraftingSystemId - The ID of the Crafting System to duplicate.
     * @returns {Promise<CraftingSystemData>} A Promise that resolves to an object containing the duplicated Crafting
     *   System, Essences, Components, and Recipes.
     */
    duplicateCraftingSystem(sourceCraftingSystemId: string): Promise<CraftingSystemData>;

    /**
     * Imports the given Fabricate data into the Fabricate database.
     *
     * @async
     * @param importData - The Fabricate data to import.
     * @returns {Promise<void>} A Promise that resolves to an object containing the imported Crafting System, Essences,
     *  Components, and Recipes.
     */
    import(importData: FabricateExportModel): Promise<CraftingSystemData>;

    /**
     * Exports a complete Crafting System from Fabricate for the given Crafting System ID.
     *
     * @async
     * @param craftingSystemId - The ID of the Crafting System to export.
     * @returns {Promise<FabricateExportModel>} A Promise that resolves to the exported Fabricate Crafting System, with
     * its Essences, Components, and Recipes.
     */
    export(craftingSystemId: string): Promise<FabricateExportModel>;

    /**
     * Downloads a copy of all Fabricate data as a JSON file. This function is used for debugging and troubleshooting.
     * If you want to export data from Fabricate for use in another Foundry VTT world, use {@link FabricateAPI#export}
     */
    downloadData(): void;

}
```

</details>

<details markdown="block">
<summary>
CraftingSystemData Interface
</summary>

```typescript
/**
 * Contains all the entities in a Crafting System.
 */
interface CraftingSystemData {

    /**
     * The Crafting System to which all other entities in this `CraftingSystemData` instance belong.
     */
    craftingSystem: CraftingSystem;

    /**
     * The Essences in the Crafting System.
     */
    essences: Essence[];

    /**
     * The Components in the Crafting System.
     */
    components: Component[];

    /**
     * The Recipes in the Crafting System.
     */
    recipes: Recipe[];

}
```

</details>

<details markdown="block">
<summary>
FabricateStatistics Interface
</summary>

```typescript
/**
 * Contains summary statistics about the Crafting Systems, Essences, Components, and Recipes in the Fabricate database.
 */
interface FabricateStatistics {

    /**
     * The number and IDs of Crafting Systems in the Fabricate database.
     */
    craftingSystems: EntityCountStatistics;

    /**
     * The number and IDs of Essences in the Fabricate database.
     */
    essences: EntityCountStatisticsByCraftingSystem;

    /**
     * The number and IDs of Components in the Fabricate database.
     */
    components: EntityCountStatisticsByCraftingSystem;

    /**
     * The number and IDs of Recipes in the Fabricate database.
     */
    recipes: EntityCountStatisticsByCraftingSystem;

}

/**
 * Contains summary statistics about an Entity type in the Fabricate database, grouped by Crafting System ID.
 */
interface EntityCountStatisticsByCraftingSystem extends EntityCountStatistics {

    /**
     * The number and IDs of the Entity type in the Fabricate database, grouped by Crafting System ID.
     */
    byCraftingSystem: Record<string, EntityCountStatistics>;

}

/**
 * Contains summary statistics about an Entity type in the Fabricate database.
 */
interface EntityCountStatistics {

    /**
     * The number of the Entity type in the Fabricate database.
     */
    count: number;

    /**
     * The IDs of the Entity type in the Fabricate database.
     */
    ids: string[];

}
```

</details>

<details markdown="block">
<summary>
FabricateExportModel Interface
</summary>

```typescript

/**
 * The version of the export model. Currently only V2 is supported in this format. The previous, unversioned export 
 * model can e passed to theimport function, and will be converted to V2 before being imported.
 */
type ExportModelVersion = "V2";

interface CraftingSystemExportModel {
    
    id: string;
    details: {
        name: string;
        summary: string;
        description: string;
        author: string;
    };
    disabled: boolean;
    
}

interface EssenceExportModel {
    
    id: string;
    name: string;
    tooltip: string;
    iconCode: string;
    disabled: boolean;
    description: string;
    craftingSystemId: string;
    activeEffectSourceItemUuid: string;
    
}

interface ComponentExportModel {
    
    id: string;
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: {
        id: string;
        name: string;
        results: Record<string, number>;
        catalysts: Record<string, number>;
    }[];
    craftingSystemId: string;
    
}

interface RecipeExportModel {
    
    id: string;
    itemUuid: string;
    disabled: boolean;
    craftingSystemId: string;
    resultOptions: {
        id: string;
        name: string;
        results: Record<string, number>;
    }[];
    requirementOptions: {
        id: string,
        name: string,
        catalysts: Record<string, number>;
        ingredients: Record<string, number>;
        essences: Record<string, number>;
    }[];
    
}

/**
 * The model used to export and import a crafting system.
 */
interface FabricateExportModel {

    /**
     * The version of the export model.
     */
    version: ExportModelVersion;

    /**
     * The exported crafting system.
     */
    craftingSystem: CraftingSystemExportModel;

    /**
     * The exported essences.
     */
    essences: EssenceExportModel[];

    /**
     * The exported components.
     */
    components: ComponentExportModel[];

    /**
     * The exported recipes.
     */
    recipes: RecipeExportModel[];

}
```

</details>

## Fabricate User Interface API

The Fabricate User Interface API implements the `FabricateUserInterfaceAPI` interface, described below.

<details open markdown="block">
<summary>
FabricateUserInterfaceAPI Interface
</summary>

```typescript
interface FabricateUserInterfaceAPI {

    /**
     * Renders the crafting system manager application.
     *
     * @returns A Promise that resolves when the application is rendered.
     */
    renderCraftingSystemManagerApp(): Promise<void>;

    /**
     * Renders the component salvage application for the specified actor and component.
     *
     * @param actorId - The ID of the actor that owns the component.
     * @param componentId - The ID of the component to salvage.
     * @returns A Promise that resolves when the application is rendered.
     */
    renderComponentSalvageApp(actorId: string, componentId: string): Promise<void>;

    /**
     * Renders the recipe crafting application for the specified actor and recipe.
     *
     * @param actorId - The ID of the actor that owns the recipe.
     * @param recipeId - The ID of the recipe to craft.
     * @returns A Promise that resolves when the application is rendered.
     */
    renderRecipeCraftingApp(actorId: string, recipeId: string): Promise<void>;

}
```

</details>

## Important operations

### Add item quantity support for your world's game system

Fabricate knows how to read and write item quantities for the following game systems:

- D&D 5th Edition
- Pathfinder 2nd Edition
- Any other game system that uses `system.quantity` in item document data

By default, Fabricate looks for item quantity information at the path `system.quantity` in an item's data.
If no value is found at this path, or the path is not valid, Fabricate treats all items in your game world as **having a quantity of 1**.
If your world's game system uses a different path, you can tell Fabricate where to find it by changing the `itemQuantityPropertyPath` setting in the Crafting API.
See the [example in the Crafting API documentation](/fabricate/api/crafting#setting-the-game-system-item-quantity-property-path) for details.
