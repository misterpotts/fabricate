/**
 * The type of action to take for a Recipe Result: Add or Remove the component
 * */
export enum RecipeResultActionType {
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
export enum FabricateItemType {
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
 * The structure of a configuration data object found in Fabricate flags that describes the unique identity of a
 * Compendium Entry for a Fabricate Item
 * */
export interface CompendiumEntry {
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
export interface ComponentFlags {
    /**
     * Essence Slugs (e.g. 'water' or 'negative-energy') and their quantities for the Essences this Component contains
     * */
    essences: Record<string, number>;
    /**
     * Component Part IDs and their quantities for the potential salvage from breaking down this Component
     * */
    salvage: Record<string, number>;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes an ingredient for Recipe and the
 * quantity of the component that is required. Ingredients are specific Crafting Components that are either consumed by
 * a Recipe, or simply required as a catalyst
 * */
export interface IngredientFlags {
    quantity: number;
    consumed: boolean;
    partId: string;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes one result of crafting a Recipe.
 * Recipes typically have one to many results, describing both the components that are consumed and those that are added
 * */
export interface RecipeResultFlags {
    action: RecipeResultActionType;
    partId: string;
    quantity: number;
}

/**
 * The structure of a configuration data object found in Fabricate flags that describes a Recipe
 * */
export interface RecipeFlags {
    /**
     * Essence Slugs (e.g. 'water' or 'negative-energy') and their quantities for the Essences this Recipe Requires
     * */
    requiredEssences?: Record<string, number>;
    ingredients?: IngredientFlags[];
    results: RecipeResultFlags[];
}

/**
 * The structure of the Fabricate module-scoped flags that can exist on an Item, typically found in a Compendium
 * */
export interface FabricateCompendiumData {
    type: FabricateItemType;
    identity: CompendiumEntry;
    recipe?: RecipeFlags;
    component?: ComponentFlags;
}