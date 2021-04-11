/**
 * The type of action to take for a Recipe Result: Add or Remove the component
 * */
declare enum RecipeResultActionType {
    /**
     * This action requires the specified quantity of Component(s) to be added
     * */
    ADD = 'ADD',
    /**
     * This action requires the specified quantity of Component(s) to be removed
     * */
    REMOVE = 'REMOVE'
}

/**
 * The Type of Fabricate Item described by this entry: Recipe or Component
 * */
declare enum FabricateItemType {
    /**
     * This entry describes a Recipe
     * */
    RECIPE = 'RECIPE',
    /**
     * This entry describes a Crafting Component
     * */
    COMPONENT = 'COMPONENT'
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes a type and quantity of Essence,
 * either found in a Crafting Component or required for a Recipe
 * */
declare interface EssenceFlags {
    /**
     * The slug (or ID) of the system-specific essence this essence amount represents
     * */
    slug: string;
    /**
     * The number of essences of the same type this essence amount represents
     * */
    quantity: number;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes the potential salvage from
 * breaking down a Crafting Component
 * */
declare interface SalvageFlags {
    /**
     * The ID of the system part this salvage amount represents
     * */
    partId: string;
    /**
     * The number of parts of the same component type this salvage amount represents
     * */
    quantity: number;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes the unique identity of a
 * Compendium Entry for a Fabricate Item
 * */
declare interface CompendiumEntry {
    /**
     * The ID of the Crafting System this Compendium Entry belongs to
     * */
    systemId: string;
    /**
     * The ID of the part this Compendium Entry represents within the Crafting System
     * */
    partId: string;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes a Crafting Component
 * */
declare interface ComponentFlags {
    /**
     * Essence Slugs (e.g. 'water' or 'negative-energy') and their quantities for the Essences this Component contains
     * */
    essences: EssenceFlags[];
    /**
     * Component Part IDs and their quantities for the potential salvage from breaking down this Component
     * */
    salvage: SalvageFlags[];
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes an ingredient for Recipe and the
 * quantity of the component that is required. Ingredients are specific Crafting Components that are either consumed by
 * a Recipe, or simply required as a catalyst
 * */
declare interface IngredientFlags {
    quantity: number;
    consumed: boolean;
    partId: string;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes one result of crafting a Recipe.
 * Recipes typically have one to many results, describing both the components that are consumed and those that are added
 * */
declare interface RecipeResultFlags {
    action: RecipeResultActionType;
    partId: string;
    quantity: number;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes a Recipe
 * */
declare interface RecipeFlags {
    /**
     * Essence Slugs (e.g. 'water' or 'negative-energy') and their quantities for the Essences this Recipe Requires
     * */
    essences: EssenceFlags[];
    ingredients: IngredientFlags[];
    results: RecipeResultFlags[];
}

/**
 * The structure of the Fabricate module-scoped flags that can exist on an Item, typically found in a Compendium
 * */
declare interface FabricateCompendiumData {
    type: FabricateItemType;
    identity: CompendiumEntry;
    recipe?: RecipeFlags;
    component?: ComponentFlags;
}