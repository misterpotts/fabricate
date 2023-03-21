---
layout: page
title: API
permalink: /api/
---

{: .warning }
> ❗ This API is not stable.
> Expect breaking changes in future releases of Fabricate.

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

## Crafting system registry

The crafting system registry enables you to create, modify and delete crafting systems, components and recipes.
It is exposed through the global `Game` object, at the path `game.fabricate.SystemRegistry`.
The crafting system registry implements the `SystemRegistry` interface.

<details open markdown="block">
<summary>
SystemRegistry Interface
</summary>

```typescript
interface SystemRegistry {

    /**
     * Gets a crafting system by ID.
     *
     * @param id The ID of the Crafting system to get
     * @return A Promise that resolves to the crafting system with the provided ID, or undefined
     * */
    getCraftingSystemById(id: string): Promise<CraftingSystem>;

    /**
     * Gets all crafting systems, including both embedded and user-defined systems.
     *
     * @return A Promise that resolves to a Map of crafting systems, keyed on the crafting system ID
     * */
    getAllCraftingSystems(): Promise<Map<string, CraftingSystem>>;

    /**
     * Gets all crafting systems that were defined by users. Does not include embedded systems.
     *
     * @return A Promise that resolves to a Map of crafting systems, keyed on the crafting system ID
     * */
    getUserDefinedSystems(): Promise<Map<string, CraftingSystem>>;

    /**
     * Gets all crafting systems that were embedded with Fabricate for the current game system only. Does not include
     * user-defined systems.
     *
     * @return A Promise that resolves to a Map of crafting systems, keyed on the crafting system ID
     * */
    getEmbeddedSystems(): Promise<Map<string, CraftingSystem>>;

    /**
     * Delete a crafting system by ID. This will remove the crafting system, its recipes, components and essences. This
     * operation is permanent and cannot be undone
     *
     * @param id The ID of the Crafting system to delete
     * @return A Promise that resolves when the crafting system has been deleted, or if the crafting system ID is not
     *  found
     * */
    deleteCraftingSystemById(id: string): Promise<void>;

    /**
     * Saves a crafting system, updating the existing data for that system and modifying all essences, recipes and
     * components within the crafting system. Any deleted essences, components and recipes are removed from the saved
     * data.
     *
     * @param craftingSystem The crafting system to save
     * @return A Promise that resolves when the crafting system has been saved
     * */
    saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem>;

    /**
     * Saves multiple crafting systems, updating the existing data for each system and modifying all essences, recipes
     * and components within each crafting system. Any deleted essences, components and recipes are removed from the
     * saved crafting system data.
     *
     * @param craftingSystems A map of crafting systems to save, keyed on the crafting system ID
     * @return A Promise that resolves when the crafting systems have been saved
     * */
    saveCraftingSystems(craftingSystems: Map<string, CraftingSystem>): Promise<Map<string, CraftingSystem>>;

    /**
     * Creates a copy of a crafting system, including all essences, recipes and components within the source crafting
     * system. The cloned system is created with a modified name and a new, unique ID.
     *
     * @param id The ID of the crafting system to duplicate
     * @return A Promise that resolves when the crafting system has been duplicated and saved
     * */
    cloneCraftingSystemById(id: string): Promise<CraftingSystem>;

    /**
     * Gets the serialised representation of all crafting systems embedded with Fabricate for the current game system
     * only.
     *
     * @return an array of serialised crafting system data for the embedded crafting systems that support the current
     *  game system
     * */
    getEmbeddedCraftingSystemsJson(): CraftingSystemJson[];

    /**
     * Performs a complete reset of all Fabricate data, restoring the state of the module data at the time of
     * installation. All user-defined crafting systems will be deleted during this reset.
     *
     * @return A Promise that resolves when all Fabricate data has been reset
     * */
    reset(): Promise<void>;

    /**
     * Gets the default value for Fabricate's crafting system settings. This will include embedded crafting systems for
     * the current game system, but no user-defined crafting systems present.
     *
     * @return the default setting value for Fabricate
     * */
    getDefaultSettingValue(): FabricateSetting<Record<string, CraftingSystemJson>>;

    /**
     * Creates a crafting system from a serialised `CraftingSystemJson` definition.
     *
     * @param systemDefinition the serialised crafting system definition
     * @return a promise that resolves to the newly created crafting system
     * */
    createCraftingSystem(systemDefinition: CraftingSystemJson): Promise<CraftingSystem>;

    /**
     * Checks if a crafting system with a given ID exists.
     *
     * @param id The ID of the Crafting system to check
     * @return A Promise that resolves to a boolean value that is true if a crafting system with the given ID exists,
     *  false if not
     * */
    hasCraftingSystem(id: string): Promise<boolean>;

}
```
</details>

## Create a crafting system

A crafting system is specified by the `CraftingSystemJson` interface.

<details open markdown="block">
<summary>
CraftingSystemJson Interface
</summary>

```typescript
interface CraftingSystemJson {
    id: string, // optional when creating a crafting system
    details: CraftingSystemDetailsJson,
    enabled: boolean,
    parts: PartDictionaryJson // optional when creating a crafting system
}

interface CraftingSystemDetailsJson {
    name: string;
    summary: string;
    description: string;
    author: string;
}

interface PartDictionaryJson {
    components: Record<string, CraftingComponentJson>;
    recipes: Record<string, RecipeJson>;
    essences: Record<string, EssenceJson>;
}
```

</details>

To create one, build an object that conforms to the interface, and call `SystemRegistry#createCraftingSystem`.

<details open markdown="block">
<summary>
Create a crafting system
</summary>

```js
const mySystem = {
    enabled: true,
    details: {
        name: "My new crafting system",
        summary: "A system created using the Fabricate API",
        description: "Made for testing the API out",
        author: "Me!"
    }
};

const craftingSystem = await game.fabricate.SystemRegistry.createCraftingSystem(mySystem);
console.log(`Created crafting system with ID "${craftingSystem.id}"`); // <-- You'll need this to edit the crafting system
```

</details>

## Add a component to a crafting system

A crafting component is specified by the `CraftingComponentJson` interface.

<details open markdown="block">
<summary>
CraftingComponentJson Interface
</summary>

```typescript
interface CraftingComponentJson {
    
    /**
     * The UUID of the Item document for this component 
     * */
    itemUuid: string; 
    
    /**
     * true if the component is disabled, false if enabled
     * */
    disabled: boolean;
    
    /** 
    * Keyed on the ID of the essence, the value represents the quantity available. This must be a valid essence ID for 
     * the crafting system
    */
    essences: Record<string, number>;

    /**
     * Keyed on the option name, the value represents the component combination for the salvage option
     */
    salvageOptions: Record<string, SalvageOptionJson>;
}

/**
 * Keyed on the ID of the component, the value represents the quantity produced by salvaging the component with this 
 * option selected. This must be a valid component ID for the crafting system 
 * */
type SalvageOptionJson = Record<string, number>;
```

</details>

To create one, get the crafting system you want to add it to, and call `CraftingSystem#createComponent`.
Then, save the crafting system.

<details open markdown="block">
<summary>
Add a component to a crafting system
</summary>

```js
const myComponent = {
    // you can obtain the Item UUID by right-clicking the passport icon in the top left of an item sheet.
    // be sure to use an item from the item directory, or from a compendium. These begin with "Item." or "Compendium."
    itemUuid: "Item.qefRHSJYoNK7m7wE",
    disabled: false,
    essences: {},
    salvageOptions: {}
};

const myCraftingSystemId = "8Bn1VBc6noSUeKlG"; // replace this with your own crafting system ID
const craftingSystem = await game.fabricate.SystemRegistry.getCraftingSystemById(myCraftingSystemId);
const createdComponent = await craftingSystem.createComponent(myComponent);
await game.fabricate.SystemRegistry.saveCraftingSystem(craftingSystem); 
console.log(`Created component with ID "${createdComponent.id}"`); // <-- You'll need this to edit the component
```

</details>

## Editing a component 

{: .highlight }
> The docs haven't caught up with the code here just yet. 
> The API exists, if you want to [dig around in the sources](http://github.com/misterpotts/fabricate) and experiment.
> Alternatively, you can wait for these docs to be updated.

## Deleting a component

{: .highlight }
> The docs haven't caught up with the code here just yet.
> The API exists, if you want to [dig around in the sources](http://github.com/misterpotts/fabricate) and experiment.
> Alternatively, you can wait for these docs to be updated.