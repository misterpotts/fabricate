---
layout: page
title: Essence API
permalink: /api/essences/
parent: API
nav_order: 2
---

# Essence API
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

The essence API enables you to create, modify and delete essences.
It is exposed by the Fabricate API at `game.fabricate.api.essences` (the `FabricateAPI#essences` property).
The essence API implements the `EssenceAPI` interface, described below.

## Interface definition

<details open markdown="block">
<summary>
EssenceAPI Interface
</summary>

```typescript
/**
 * An API for managing essences.
 */
interface EssenceAPI {

    /**
     * Retrieves the essence with the specified ID.
     *
     * @async
     * @param {string} id - The ID of the essence to retrieve.
     * @returns {Promise<Essence | undefined>} A Promise that resolves with the essence, or undefined if it does not
     *  exist.
     */
    getById(id: string): Promise<Essence | undefined>;

    /**
     * Returns all essences.
     *
     * @async
     * @returns {Promise<Map<string, Essence>>} A Promise that resolves to a Map of all essences, where the keys are
     *   the essence IDs, or rejects with an Error if the settings cannot be read.
     */
    getAll(): Promise<Map<string, Essence>>;

    /**
     * Returns all essences with the specified IDs.
     *
     * @param {string[]} essenceIds - An array of essence IDs to retrieve.
     * @returns {Promise<Map<string, Essence | undefined>>} A Promise that resolves to a Map of essences, where the keys
     *   are the essence IDs. Values are undefined if the essence with the corresponding ID does not exist.
     */
    getAllById(essenceIds: string[]): Promise<Map<string, Essence | undefined>>;

    /**
     * Returns all essences for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of essence instances for the given
     * crafting system, where the keys are the essence IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>>;

    /**
     * Deletes an essence by ID.
     *
     * @async
     * @param {string} id - The ID of the essence to delete.
     * @returns {Promise<Essence | undefined>} - A Promise that resolves to the deleted essence or undefined if the
     *   essence with the given ID does not exist.
     */
    deleteById(id: string): Promise<Essence | undefined>;

    /**
     * Deletes all essences by item UUID.
     *
     * @async
     * @param itemUuid
     * @returns {Promise<Essence | undefined>} - A Promise that resolves to the deleted essence(s) or an empty array if
     *   no essences were deleted.
     */
    deleteByItemUuid(itemUuid: string): Promise<Essence[]>;

    /**
     * Deletes all essences by crafting system ID.
     *
     * @async
     * @param craftingSystemId - The ID of the crafting system to which the essences belong.
     * @returns {Promise<Essence[]>} - A Promise that resolves to the deleted essence(s) or an empty array if no
     *   essences were deleted.
     */
    deleteByCraftingSystemId(craftingSystemId: string): Promise<Essence[]>;

    /**
     * Creates a new essence with the given details.
     *
     * @async
     * @param {EssenceCreationOptions} essenceCreationOptions - The details of the essence to create.
     * @returns {Promise<Essence>} A Promise that resolves to the created essence.
     */
    create(essenceCreationOptions: EssenceCreationOptions): Promise<Essence>;

    /**
     * Saves the given essence.
     *
     * @async
     * @param {Essence} essence - The essence to save.
     * @returns {Promise<Essence>} A Promise that resolves to the saved essence, or rejects with an Error if the
     *  essence is invalid or cannot be saved.
     */
    save(essence: Essence): Promise<Essence>;

    /**
     * Saves all the given essences.
     *
     * @async
     * @param essences - The essences to save.
     * @returns {Promise<Essence[]>} A Promise that resolves to the saved essences, or rejects with an Error if any
     *  of the essences are invalid or cannot be saved.
     */
    saveAll(essences: Essence[]): Promise<Essence[]>;

    /**
     * The Notification service used by this API. If `notifications.suppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    readonly notifications: NotificationService;

    /**
     * Creates or overwrites an essence with the given details. This operation is intended to be used when importing a
     * crafting system and its essences from a JSON file. Most users should use `create` or `save` essences instead.
     *
     * @async
     * @param essenceData - The essence data to insert
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the saved essence, or rejects with an error if
     *   the essence is not valid, or cannot be saved.
     */
    insert(essenceData: EssenceExportModel): Promise<Essence>;

    /**
     * Creates or overwrites multiple essences with the given details. This operation is intended to be used when
     *   importing a crafting system and its essences from a JSON file. Most users should use `create` or `save`
     *   essences instead.
     *
     * @async
     * @param essenceData - The essence data to insert
     * @returns {Promise<CraftingSystem[]>} A Promise that resolves with the saved essences, or rejects with an error if
     *  any of the essences are not valid, or cannot be saved.
     */
    insertMany(essenceData: EssenceExportModel[]): Promise<Essence[]>;

    /**
     * Clones all provided Essences to a target Crafting System. Essences are cloned by value and the copies will be
     *   assigned new IDs. The cloned Essences will be assigned to the Crafting System with the given target Crafting
     *   System ID. This operation is not idempotent and will produce duplicate Essences with distinct IDs if called
     *   multiple times with the same source Essences and target Crafting System ID.
     *
     * @async
     * @param sourceEssences - The Essences to clone.
     * @param targetCraftingSystemId - The ID of the Crafting System to clone the essences to. Defaults to the source
     *   Essence's Crafting System ID.
     * @returns {Promise<Essence[]>} A Promise that resolves to an object containing the cloned Essences and a Map keyed
     *   on the source Essence IDs pointing to the newly cloned Essence IDs, or rejects with an Error if the target
     *   Crafting System does not exist or any of the Essences are invalid.
     */
    cloneAll(sourceEssences: Essence[], targetCraftingSystemId?: string): Promise<{ essences: Essence[], idLinks: Map<string, string> }>;

}
```

</details>

<details markdown="block">
<summary>
EssenceCreationOptions Interface
</summary>

```typescript
/**
 * Represents a set of options for creating an essence.
 */
interface EssenceCreationOptions {

    /**
     * The name of the essence.
     */
    name?: string;

    /**
     * The tooltip text to display when the essence is hovered over.
     */
    tooltip?: string;

    /**
     * The FontAwesome icon code for the essence icon
     */
    iconCode?: string;

    /**
     * A more detailed description of the essence
     */
    description?: string;

    /**
     * The UUID of the item that is the source of the active effect for this essence, if present
     */
    activeEffectSourceItemUuid?: string;

    /**
     * The ID of the crafting system to which this essence belongs.
     */
    craftingSystemId: string;

    /**
     * Whether the essence is disabled. Defaults to false.
     */
    disabled?: boolean;

}
```

</details>

## The essence object

Essences implement the Essence interface, described below.

<details markdown="block">
<summary>
Essence Interface
</summary>

```typescript
interface Essence extends Identifiable, Serializable<EssenceJson> {

    /**
     * The unique id of this essence
     */
    readonly id: string;

    /**
     * The unique id of the crafting system this essence belongs to
     */
    readonly craftingSystemId: string;

    /**
     * The display name of this essence
     */
    name: string;

    /**
     * The long-form, detailed description of this essence
     */
    description: string;

    /**
     * The tooltip to display when the user hovers their cursor over the icon for this essence
     */
    tooltip: string;

    /**
     * The Fontawesome icon code for the icon to display for this essence. Free icons, included with Foundry VTT can be
     *  found at https://fontawesome.com/search?m=free&o=r
     */
    iconCode: string;

    /**
     * Indicates whether this essence is embedded in a crafting system
     */
    readonly isEmbedded: boolean;

    /**
     * Indicates whether this essence is disabled. Disabled essences cannot be used in crafting
     */
    disabled: boolean;

    /**
     * Indicates whether this essence's active effect source item data has been loaded, if it has any
     */
    readonly loaded: boolean;

    /**
     * Indicates whether this essence has an active effect source item
     */
    readonly hasActiveEffectSource: boolean;

    /**
     * The active effect source item data for this essence, if it has any. May be an instance of the null object,
     *  `NoFabricateItemData`
     */
    activeEffectSource: FabricateItemData;

    /**
     * Indicates whether this essence has any loading errors in its active effect source item data
     */
    readonly hasErrors: boolean;

    /**
     * The loading errors in this essence's active effect source item data, if it has any
     */
    readonly errors: ItemLoadingError[];

    /**
     * Converts this essence to an essence reference
     *
     * @returns EssenceReference A reference to this essence
     */
    toReference(): EssenceReference;

    /**
     * Clones this essence, returning a new instance with the provided id and crafting system id
     *
     * @param id - The id for the new essence. Must be different to this essence's id
     * @param craftingSystemId - The crafting system id for the new essence
     * @returns Essence A new instance of this essence, with the provided id and crafting system id
     */
    clone({
              id,
              craftingSystemId,
          }: {
        id: string,
        craftingSystemId?: string
    }): Essence;

    /**
     * Loads this essence's active effect source item data, if it has any
     *
     * @returns Promise<Essence> A promise that resolves to this essence, after its active effect source item data has
     */
    load(): Promise<Essence>;

}
```

</details>

## Examples

The examples below illustrate how to use the essence API to create, modify and delete essences.

### Creating an essence

Once you've [created a crafting system](../systems#create-a-crafting-system), you can create essences for it by calling `game.fabricate.api.essences.create()` and passing in the essence details.
To create an essence, you must provide the ID of the crafting system to which it belongs.
In addition to the basic details for the Essence, you can optionally provide the UUID of an item to use as a source of active effects for the essence.
Don't worry though, you can always add or remove the source item later.

<details markdown="block">
<summary>
Example #1: Bare-bones Essence creation
</summary>

```typescript
// Create a new essence with the default values for all properties, except the crafting system ID (we can edit them after creation)
const myEssenceData = {
    craftingSystemId: "myCraftingSystem" // <-- Replace with your crafting system ID
};
const essence = await game.fabricate.api.essences.create(myEssenceData);
```

</details>

<details markdown="block">
<summary>
Example #2: Creating an essence without an active effect source item
</summary>

```typescript
const craftingSystemId = "myCraftingSystem"; // <-- Replace with your crafting system ID
const myEssenceData = {
    name: "The Essence Display Name",
    tooltip: "The Tooltip to display when the essence ison is hovered over",
    // You can see the available, free icons included with Foundry VTT at https://fontawesome.com/search?m=free&o=r
    iconCode: "fa-solid fa-mortar-pestle", // <-- This is the *full* font awesome icon code to use for the icon
    description: "The long form detailed essence description",
    craftingSystemId
};
const essence = await game.fabricate.api.essences.create(myEssenceData);
```

</details>

<details markdown="block">
<summary>
Example #3: Creating an essence with an active effect source item
</summary>

```typescript
const craftingSystemId = "myCraftingSystem"; // <-- Replace with your crafting system ID
const myEssenceData = {
    name: "The Essence Display Name",
    tooltip: "The Tooltip to display when the essence ison is hovered over",
    // You can see the available, free icons included with Foundry VTT at https://fontawesome.com/search?m=free&o=r
    iconCode: "fa-solid fa-mortar-pestle", // <-- This is the *full* font awesome icon code to use for the icon
    description: "The long form detailed essence description",
    craftingSystemId,
    activeEffectSourceItemUuid: "myItemUuid" // <-- Replace with the UUID of the item to use as the source of active effects for this essence
};
const essence = await game.fabricate.api.essences.create(myEssenceData);
```

</details>

### Getting an essence by ID

You can retrieve an essence by its ID by calling `game.fabricate.api.essences.getById()` and passing in the ID of the essence you want to retrieve.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const essenceId = "myEssenceId"; // <-- Replace with the ID of the essence you want to retrieve
const essence = await game.fabricate.api.essences.getById(essenceId);
```

</details>

### Getting all essences

You can retrieve all essences in all crafting systems by calling `game.fabricate.api.essences.getAll()`.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const essences = await game.fabricate.api.essences.getAll();
```

</details>

### Getting all essences by in a crafting system

You can retrieve all essences in a crafting system by calling `game.fabricate.api.essences.getAllByCraftingSystemId()` and passing in the ID of the crafting system.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const craftingSystemId = "myCraftingSystemId"; // <-- Replace with the ID of the crafting system
const essences = await game.fabricate.api.essences.getAllByCraftingSystemId(craftingSystemId);
```

</details>

### Deleting an essence

You can delete an essence by its ID by calling `game.fabricate.api.essences.deleteById()` and passing in the ID of the essence you want to delete.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const essenceId = "myEssenceId"; // <-- Replace with the ID of the essence you want to delete
const deletedEssence = await game.fabricate.api.essences.deleteById(essenceId);
```

</details>

### Modifying an essence

You can modify an essence by fetching and editing it, then calling `game.fabricate.api.essences.save()` and passing in the modified essence.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const essenceId = "myEssenceId"; // <-- Replace with the ID of the essence you want to modify
const essence = await game.fabricate.api.essences.getById(essenceId);
// Modify the essence
essence.name = "My new essence name";
essence.tooltip = "My new essence tooltip";
// Save the modified essence
await game.fabricate.api.essences.save(essence);
```

</details>

### Changing the active effect source item of an essence

You can change the active effect source item (with a bit of a workaround) by first loading the item data using the document manager.
Just like with other modifications, you will need to save the modified essence after changing the active effect source by calling `game.fabricate.api.essences.save()`.
In a later release of Fabricate, this will be simplified to allow you to simply assign the item UUID to the essence's `activeEffectSourceItemUuid` property.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const essenceId = "myEssenceId"; // <-- Replace with the ID of the essence you want to modify
const essence = await game.fabricate.api.essences.getById(essenceId);
// Change the source item:
//   Currently, Fabricate requires that you load the item using its document manager before assigning it to the essence.
//   This is likely to change in a future release to simplify things for API users.
const itemUuid = "myNewItemUuid"; // <-- Replace with the UUID of the new active effect source item
essence.activeEffectSource = await game.fabricate.api.documentManager.loadItemDataByDocumentUuid(itemUuid);
// Save the modified essence
await game.fabricate.api.essences.save(essence);
```

</details>