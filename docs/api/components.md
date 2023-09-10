---
layout: page
title: Component API
permalink: /api/components/
parent: API
nav_order: 3
---

# Component API
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
- TOC
{:toc}
</details>

The component API enables you to create, modify and delete components.
It is exposed by the Fabricate API at `game.fabricate.api.components` (the `FabricateAPI#components` property).
The component API implements the `ComponentAPI` interface, described below.

## Interface definition

<details open markdown="block">
<summary>
ComponentAPI Interface
</summary>

```typescript
/**
 * A service for managing components.
 */
interface ComponentAPI {

    /**
     * Creates a new component with the given options.
     *
     * @async
     * @param {ComponentCreationOptions} componentOptions - The options for the component.
     * @returns {Promise<Component>} - A promise that resolves with the newly created component. As document data is loaded
     *  during validation, the created component is returned with item data loaded.
     * @throws {Error} - If there is an error creating the component.
     */
    create(componentOptions: ComponentCreationOptions): Promise<Component>;

    /**
     * Returns all components.
     *
     * @async
     * @returns {Promise<Map<string, Component>>} A promise that resolves to a Map of component instances, where the keys are
     *  the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAll(): Promise<Map<string, Component>>;

    /**
     * Retrieves the component with the specified ID.
     *
     * @async
     * @param {string} id - The ID of the component to retrieve.
     * @returns {Promise<Essence | undefined>} A Promise that resolves with the component, or undefined if it does not
     *  exist.
     */
    getById(id: string): Promise<Component | undefined>;

    /**
     * Retrieves all components with the specified IDs.
     *
     * @async
     * @param {string} componentIds - An array of component IDs to retrieve.
     * @returns {Promise<Component | undefined>} A Promise that resolves to a Map of component instances, where the keys are
     * the component IDs. Values are undefined if the component with the corresponding ID does not exist
     */
    getAllById(componentIds: string[]): Promise<Map<string, Component | undefined>>;

    /**
     * Returns all components for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Component>>} A Promise that resolves to a Map of component instances for the given
     * crafting system, where the keys are the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>>;

    /**
     * Returns all components in a map keyed on component ID, for a given item UUID.
     *
     * @async
     * @param {string} itemUuid - The UUID of the item.
     * @returns {Promise<Map<string, Component>>} A Promise that resolves to a Map of component instances, where the keys
     * are the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByItemUuid(itemUuid: string): Promise<Map<string, Component>>;

    /**
     * Saves a component.
     *
     * @async
     * @param {Component} component - The component to save.
     * @returns {Promise<Component>} A Promise that resolves with the saved component, or rejects with an error if the component
     *  is not valid, or cannot be saved. As document data is loaded during validation, the created component is returned
     *  with item data loaded.
     */
    save(component: Component): Promise<Component>;

    /**
     * Deletes a component by ID.
     *
     * @async
     * @param {string} componentId - The ID of the component to delete.
     * @returns {Promise<Component | undefined>} A Promise that resolves to the deleted component or undefined if the component
     *  with the given ID does not exist.
     */
    deleteById(componentId: string): Promise<Component | undefined>;

    /**
     * Deletes all components associated with a given item UUID.
     *
     * @async
     * @param {string} componentId - The UUID of the item to delete components for.
     * @returns {Promise<Component | undefined>} A Promise that resolves to the deleted component(s) or an empty array if no
     *  components were associated with the given item UUID. Rejects with an Error if the components could not be deleted.
     */
    deleteByItemUuid(componentId: string): Promise<Component[]>;

    /**
     * Deletes all components associated with a given crafting system.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system to delete components for.
     * @returns {Promise<Component | undefined>} A Promise that resolves to the deleted component(s) or an empty array if no
     *  components were associated with the given crafting system. Rejects with an Error if the components could not be
     *  deleted.
     */
    deleteByCraftingSystemId(craftingSystemId: string): Promise<Component[]>;

    /**
     * Removes all references to the specified essence from all components within the specified crafting system.
     *
     * @async
     * @param {string} essenceId - The ID of the essence to remove references to.
     * @param {string} craftingSystemId - The ID of the crafting system containing the components to modify.
     * @returns {Promise<Component[]>} A Promise that resolves with an array of all modified components that contain
     *  references to the removed essence, or an empty array if no modifications were made. If the specified
     *  crafting system has no components, the Promise will reject with an Error.
     */
    removeEssenceReferences(essenceId: string, craftingSystemId: string): Promise<Component[]>;

    /**
     * Removes all references to the specified salvage from all components within the specified crafting system.
     *
     * @param {string} componentId
     * @param {string} craftingSystemId
     * @returns {Promise<Component[]>} A Promise that resolves with an array of all modified components that contain
     *   references to the removed salvage, or an empty array if no modifications were made. If the specified
     *   crafting system has no components, the Promise will reject with an Error.
     */
    removeSalvageReferences(componentId: string, craftingSystemId: string): Promise<Component[]>;

    /**
     * Clones a component by ID.
     *
     * @async
     * @param {string} componentId - The ID of the component to clone.
     * @returns {Promise<Component>} A Promise that resolves with the newly cloned component, or rejects with an Error if the
     *  component is not valid or cannot be cloned.
     */
    cloneById(componentId: string): Promise<Component>;

    /**
     * The Notification service used by this API. If `notifications.isSuppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    notifications: NotificationService;

    /**
     * Creates or overwrites a component with the given details. This operation is intended to be used when importing a
     * crafting system and its components from a JSON file. Most users should use `create` or `save` components instead.
     *
     * @async
     * @param componentData - The component data to insert
     * @returns {Promise<Component>} A Promise that resolves with the saved component, or rejects with an error if
     *   the component is not valid, or cannot be saved.
     */
    insert(componentData: ComponentExportModel): Promise<Component>;

    /**
     * Creates or overwrites multiple components with the given details. This operation is intended to be used when
     *   importing a crafting system and its components from a JSON file. Most users should use `create` or `save`
     *   components instead.
     *
     * @async
     * @param componentData - The component data to insert
     * @returns {Promise<Component[]>} A Promise that resolves with the saved components, or rejects with an error
     *   if any of the components are not valid, or cannot be saved.
     */
    insertMany(componentData: ComponentExportModel[]): Promise<Component[]>;


    /**
     * Clones all provided Components to a target Crafting System, optionally substituting each Component's essences with
     *   new IDs. Components are cloned by value and the copies will be assigned new IDs. The cloned Components will be
     *   assigned to the Crafting System with the given target Crafting System ID. This operation is not idempotent and
     *   will produce duplicate Components with distinct IDs if called multiple times with the same source Components
     *   and target Crafting System ID. As only one Component can be associated with a given game item within a single
     *   Crafting system, Components cloned into the same Crafting system will have their associated items removed.
     *
     * @async
     * @param sourceComponents - The Components to clone
     * @param targetCraftingSystemId - The ID of the Crafting System to clone the Components to. Defaults to the source
     *   component's Crafting System ID.
     * @param substituteEssenceIds - An optional Map of Essence IDs to substitute with new IDs. If a Component
     *   references an Essence ID in this Map, the Component will be cloned with the new Essence ID in place of the
     *   original ID.
     */
    cloneAll(sourceComponents: Component[], targetCraftingSystemId?: string, substituteEssenceIds?: Map<string, string>): Promise<{ components: Component[], idLinks: Map<string, string> }>;

    /**
     * Saves all provided components.
     *
     * @async
     * @param components - The components to save.
     * @returns {Promise<Component[]>} A Promise that resolves with the saved components, or rejects with an error if
     *   any of the components are not valid, or cannot be saved.
     */
    saveAll(components: Component[]): Promise<Component[]>;

}
```

</details>

<details markdown="block">
<summary>
ComponentCreationOptions Interface
</summary>

```typescript
/**
 * Options for creating a new component.
 */
interface ComponentCreationOptions {

    /**
     * The UUID of the item associated with the component.
     * */
    itemUuid: string;

    /**
     * The ID of the crafting system that the component belongs to.
     * */
    craftingSystemId: string;

    /**
     * Optional dictionary of the essences contained by the component. The dictionary is keyed on the essence ID and
     * with the values representing the required quantities.
     * */
    essences?: Record<string, number>;

    /**
     * Whether the component is disabled. Defaults to false.
     * */
    disabled?: boolean;

    /**
     * Optional array of salvage options for the component.
     * */
    salvageOptions?: SalvageOptionValue[];

}
```

</details>

<details markdown="block">
<summary>
SalvageOptionValue Interface
</summary>

```typescript
/**
 * A value object representing an option for salvaging a component
 *
 * @interface
 * */
interface SalvageOptionValue {

    /**
     * The name of the salvage option.
     */
    name: string;

    /**
     * The salvage that will be produced when the option is used to salvage the component.
     */
    results: Record<string, number>;

    /**
     * The additional components that must be present to salvage this component
     */
    catalysts: Record<string, number>;

}
```

</details>

## Examples

The examples below illustrate how to use the component API to create, modify and delete components.

### Creating a component

Once you've [created a crafting system](../systems#create-a-crafting-system) and an item, you can create a component for that item by calling `game.fabricate.api.components.create()`, passing in the component details.
To create a component, you must provide the ID of the crafting system that the component belongs to and the UUID of the item that the component is associated with.
If you've [created essences for the crafting system](../essences#create-an-essence), you can also provide a dictionary of essences and their quantities.
If you've created other components for the crafting system already, you can also provide an array of salvage options for the component.
Don't worry though; you can always [add essences to the component later](#adding-essences-to-a-component) and [add salvage options to the component later](#adding-salvage-options-to-a-component).

<details markdown="block">
<summary>
Example #1 - A component with no essences and no salvage options
</summary>

```typescript
const myComponentData = {
    itemUuid: "my-item-uuid", // <-- Replace this with the UUID of your item
    craftingSystemId: "my-crafting-system-id", // <-- Replace this with the ID of your crafting system
};
const component = await game.fabricate.api.components.create(myComponentData);
```

</details>

<details markdown="block">
<summary>
Example #2 - A component with essences and no salvage options
</summary>

```typescript
const myComponentData = {
    itemUuid: "my-item-uuid", // <-- Replace this with the UUID of your item
    craftingSystemId: "my-crafting-system-id", // <-- Replace this with the ID of your crafting system
    essences: { // <-- Replace the keys with the ID of your desired essences and the values with the quantity of each essence
        "my-essence-id": 1, 
        "my-other-essence-id": 2
    }
};
const component = await game.fabricate.api.components.create(myComponentData);
```

</details>

<details markdown="block">
<summary>
Example #3 - A component with essences and salvage options
</summary>

```typescript
const myComponentData = {
    itemUuid: "my-item-uuid", // <-- Replace this with the UUID of your item
    craftingSystemId: "my-crafting-system-id", // <-- Replace this with the ID of your crafting system
    essences: { // <-- Replace the keys with the ID of your desired essences and the values with the quantity of each essence
        "my-essence-id": 1,
        "my-other-essence-id": 2
    },
    // If a component has mutliple salvage options the names are displayed to the user in the UI
    // The user can choose which option to use when salvaging the component.
    // Catalysts are optional. If a component has catalysts, the user must have them in their inventory, but they are not consumed when the component is salvaged.
    salvageOptions: [
        {
            name: "Salvage option 1", // <-- Replace this with the name you want to use for the salvage option
            results: { // <-- Replace the keys with the IDs of the components you want to produce when the component is salvaged and the values with the quantity to produce
                "my-salvage-id": 1
            },
            catalysts: {} // <-- This salvage option has no catalysts. You can also just leave this property out entirely
        },
        {
            name: "Salvage option 2", // <-- Same here with naming your salvage options
            results: { // <-- Same here with the salvage results
                "my-salvage-id": 2
            },
            catalysts: { // <-- Replace the keys with the IDs of the components you want to use as catalysts and the values with the quantity of each catalyst
                "my-catalyst-id": 2
            }
        }
    ]
};
const component = await game.fabricate.api.components.create(myComponentData);
```

</details>

### Getting a component by ID

You can retrieve a component by calling `game.fabricate.api.components.getById()`, passing in the ID of the component to retrieve.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myComponentId = "my-component-id"; // <-- Replace this with the ID of your component
const component = await game.fabricate.api.components.getById(myComponentId);
```

</details>

### Getting all components

You can retrieve all components in all crafting systems by calling `game.fabricate.api.components.getAll()`.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const components = await game.fabricate.api.components.getAll();
```

</details>

### Getting all components in a crafting system

You can retrieve all components in a crafting system by calling `game.fabricate.api.components.getAllByCraftingSystemId()`, passing in the ID of the crafting system to retrieve components for.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myCraftingSystemId = "my-crafting-system-id"; // <-- Replace this with the ID of your crafting system
const components = await game.fabricate.api.components.getAllByCraftingSystemId(myCraftingSystemId);
```

</details>

### Getting all components for an item

You can retrieve all components for an item by calling `game.fabricate.api.components.getAllByItemUuid()`, passing in the UUID of the item to retrieve components for.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myItemUuid = "my-item-uuid"; // <-- Replace this with the UUID of your item
const components = await game.fabricate.api.components.getAllByItemUuid(myItemUuid);
```

</details>

### Adding essences to a component

You can add essences to a component by fetching it, setting the essences then calling `game.fabricate.api.components.save()`, passing in the modified component.
You'll need to [create the essences](../essences#create-an-essence) before you can add them to a component.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myComponentId = "my-component-id"; // <-- Replace this with the ID of your component
const component = await game.fabricate.api.components.getById(myComponentId);
componentOne.addEssence("my-fisrt-essence-id"); // <-- Replace this with the ID of your essence. The quantity isoptional (it defaults to 1)
componentOne.addEssence("my-second-essence-id", 2); // <-- Replace the first argument with the ID of your essence and the second with the quantity to add
const componentAfterSave = await game.fabricate.api.components.save(component);
```

</details>

### Removing essences from a component

You can remove essences from a component by fetching it, removing the essences then calling `game.fabricate.api.components.save()`, passing in the modified component.

<details markdown="block">
<summary>
Example
</summary>

```typescript
const myComponentId = "my-component-id"; // <-- Replace this with the ID of your component
const component = await game.fabricate.api.components.getById(myComponentId);
// Removes an essence from the component if it exists, regardless of quantity
component.removeEssence("my-fisrt-essence-id"); // <-- Replace this with the ID of your essence
// Removes a specific quantity of an essence from the component if it exists
component.subtractEssence("my-second-essence-id"); // <-- Replace the first argument with the ID of your essence. The quantity isoptional (it defaults to 1)
component.subtractEssence("my-third-essence-id", 2); // <-- Replace the first argument with the ID of your essence and the second with the quantity to remove
const componentAfterSave = await game.fabricate.api.components.save(component);
```

</details>

### Setting the salvage options for a component

You can add salvage options to a component by fetching it, setting the salvage option (or options) then calling `game.fabricate.api.components.save()`, passing in the modified component.

<details markdown="block">
<summary>
Example
</summary>

```typescript
// Get the component
const myComponentId = "my-component-id"; // <-- Replace this with the ID of your component
const component = await game.fabricate.api.components.getById(myComponentId);

// Create a new salvage option that requires catalysts
const mySalvageOptionWithCatalysts = {
    name: "My new salvage option", // <-- Replace this with the name of your salvage option
    results: { // <-- Replace the keys with the IDs of the components you want to produce when the component is salvaged and the values with the quantity to produce
        "my-salvage-id": 1
    },
    catalysts: { // <-- Replace the keys with the IDs of the components you want to use as catalysts and the values with the quantity of each catalyst
        "my-catalyst-id": 2
    }
};
component.setSalvageOption(mySalvageOptionWithCatalysts);

// Create a new salvage option that doesn't require catalysts
const mySalvageOptionWithoutCatalysts = {
    name: "My other salvage option", // <-- Same here with naming your salvage options
    results: { // <-- Same here with configuring the salvage results
        "my-salvage-id": 1
    }
};
component.setSalvageOption(mySalvageOptionWithoutCatalysts);

// You can overwrite an existing salvage option by adding the ID of the salvage option to overwrite
// If the ID you provide doesn't match an existing salvage option, this will cause the `setSalvageOption` method to throw an error
const mySalvageOptionToOverwrite = {
    id: "my-salvage-option-id-1", // <-- Replace this with the ID of the salvage option to overwite
    name: "My existing salvage option to replace", // <-- Same here with naming your salvage options
    results: { // <-- Same here with configuring the salvage results
        "my-salvage-id": 1
    }
};
component.setSalvageOption(mySalvageOptionToOverwrite);

// You can also delete a salvage option by passing in the ID of the salvage option to delete
component.deleteSalvageOptionById("my-salvage-option-id-2"); // <-- Replace this with the ID of the salvage option to delete

// Save the component
const componentAfterSave = await game.fabricate.api.components.save(component);
```

</details>

