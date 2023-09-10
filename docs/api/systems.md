---
layout: page
title: Crafting System API
permalink: /api/systems/
parent: API
nav_order: 1
---

# Crafting system API
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

The crafting system API enables you to create, modify and delete crafting systems.
It is exposed by the Fabricate API at `game.fabricate.api.systems` (the `FabricateAPI#systems` property).
The CraftingSystemAPI implements the `CraftingSystemAPI` interface, described below.

## Interface definition

<details open markdown="block">
<summary>
CraftingSystemAPI Interface
</summary>

```typescript
/**
 * An API for managing crafting systems.
 *
 * @interface
 */
interface CraftingSystemAPI {

    /**
     * Clones a Crafting System by ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the Crafting System to clone.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the newly cloned Crafting System, or rejects with
     *   an Error if the Crafting System is not valid or cannot be cloned.
     */
    cloneById(craftingSystemId: string): Promise<CraftingSystem>;

    /**
     * Creates a new crafting system with the given details. If no details are provided, a default crafting system is
     *  created. The crafting system id is generated automatically.
     *
     * @async
     * @param {object} options - The crafting system details.
     * @param {string} [options.name] - The name of the crafting system.
     * @param {string} [options.summary] - A brief summary of the crafting system.
     * @param {string} [options.description] - A more detailed description of the crafting system.
     * @param {string} [options.author] - The name of the person or organization that authored the crafting system.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the newly created `CraftingSystem` instance, or
     *  rejects with an Error if the crafting system is not valid.
     */
    create({ name, summary, description, author }?: { name?: string, summary?: string, description?: string, author?: string }): Promise<CraftingSystem>;

    /**
     * Retrieves the crafting system with the specified ID.
     *
     * @param {string} id - The ID of the crafting system to retrieve.
     * @returns {Promise<CraftingSystem | undefined>} A Promise that resolves with the crafting system, or undefined if
     *  it does not exist.
     */
    getById(id: string): Promise<CraftingSystem | undefined>;

    /**
     * Saves a crafting system.
     *
     * @async
     * @param {CraftingSystem} craftingSystem - The crafting system to save.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the saved crafting system, or rejects with an
     *  error if the crafting system is not valid, or cannot be saved.
     */
    save(craftingSystem: CraftingSystem): Promise<CraftingSystem>;

    /**
     * Creates or overwrites a crafting system with the given details. This operation is intended to be used when
     *   importing a crafting system from a JSON file. Most users should use `create` or `save` crafting systems
     *   instead.
     *
     * @async
     * @param craftingSystemData - The crafting system data to insert.
     * @returns {Promise<CraftingSystem>} A Promise that resolves with the saved crafting system, or rejects with an
     *   error if the crafting system is not valid, or cannot be saved.
     */
    insert(craftingSystemData: CraftingSystemImportData): Promise<CraftingSystem>;

    /**
     * Deletes a crafting system by ID.
     *
     * @async
     * @param {string} id - The ID of the crafting system to delete.
     * @returns {Promise<CraftingSystem | undefined>} - A Promise that resolves to the deleted crafting system or
     *  undefined if the crafting system with the given ID does not exist.
     */
    deleteById(id: string): Promise<CraftingSystem | undefined>;

    /**
     * The Notification service used by this API. If `notifications.isSuppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    notifications: NotificationService;

    /**
     * Retrieves all crafting systems.
     *
     * @async
     * @returns {Promise<CraftingSystem[]>} A Promise that resolves with all crafting systems.
     */
    getAll(): Promise<Map<string, CraftingSystem>>;

}
```

</details>

## The Crafting system object

Crafting systems implement the `CraftingSystem` interface, which is defined as follows:

<details open markdown="block">
<summary>
CraftingSystem Interface
</summary>

```typescript
/**
 * A crafting system is a set of rules that define how items can be crafted. Crafting systems contain additional
 *   details that can be used to display information about the crafting system to the user.
 */
interface CraftingSystem {

    /**
     * The unique identifier for the crafting system.
     */
    readonly id: string;

    /**
     * Whether or not the crafting system is embedded with Fabricate. Embedded crafting systems are not editable, except
     *   for the `isDisabled` property.
     */
    readonly isEmbedded: boolean;

    /**
     * Whether or not the crafting system is disabled. Disabled crafting systems are not available for use in Fabricate.
     *   Their components cannot be salvaged, and their recipes cannot be crafted.
     */
    isDisabled: boolean;

    /**
     * The details of the crafting system.
     */
    details: CraftingSystemDetails;

    /**
     * Converts the crafting system to a JSON object.
     */
    toJson(): CraftingSystemJson;

    /**
     * Creates a clone of the crafting system.
     *
     * @param id - The unique identifier for the new crafting system.
     * @param name - The name of the new crafting system.
     * @param embedded - Whether the new crafting system should be embedded with Fabricate. Defaults to `false`.
     */
    clone({id, name, embedded}: { name?: string; id: string; embedded?: boolean }): CraftingSystem;

    /**
     * Determines whether the crafting system is equal to another crafting system.
     *
     * @param other - The other crafting system to compare to this one.
     * @param excludeDisabled - Whether to exclude the `isDisabled` property from the comparison. Defaults to `false`.
     */
    equals(other: CraftingSystem, excludeDisabled: boolean): boolean;

}
```

</details>

## Examples

The examples below illustrate how to use the crafting system API to create, modify and delete crafting systems.

### Create a crafting system

You need to create a crafting system before you can create essences, components, or recipes.
To create a crafting system, call `game.fabricate.api.systems.create()`, passing in the crafting system details.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myCraftingSystemData = {
    name: "My new crafting system",
    summary: "A system created using the Fabricate API",
    description: "Made for testing out the API",
    author: "Me!"
};

const craftingSystem = await game.fabricate.api.systems.create(myCraftingSystemData);
console.log(`Created crafting system with ID "${craftingSystem.id}"`); // <-- You'll need this to edit the crafting system later
// If you *do* forget the Crafting system ID you can retrieve it later using game.fabricate.api.systems.getAll()
```

</details>

### Edit a crafting system

You can edit a crafting system by calling `game.fabricate.api.systems.save()`, passing in the crafting system to edit.
You can modify any property of a crafting system this way, except for the crafting system ID.
However, `embedded` crafting systems (those that ship with Fabricate) are read-only except for their `isDisabled` property. 

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myCraftingSystemId = "my-crafting-system-id"; // <-- You'll need to replace this with the ID of your crafting system
const craftingSystem = await game.fabricate.api.systems.getById(myCraftingSystemId);
craftingSystem.details.name = "A cool new name";
craftingSystem.details.description = "An equally interesting description";
const craftingSystemAfterSave = await game.fabricate.api.systems.save(craftingSystem);
``` 

</details>

### Delete a crafting system

You can delete a crafting system by calling `game.fabricate.api.systems.deleteById()`, passing in the ID of the crafting system to delete.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myCraftingSystemId = "my-crafting-system-id"; // <-- You'll need to replace this with the ID of your crafting system
const craftingSystem = await game.fabricate.api.systems.deleteById(myCraftingSystemId);
console.log(`Deleted crafting system with ID "${craftingSystem.id}"`);
```

</details>