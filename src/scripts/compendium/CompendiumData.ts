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
 * The structure of a configuration data object found in Fabricate flags that describes a Recipe
 * */
export interface RecipeFlags {
    /**
     * Essence Slugs (e.g. 'water' or 'negative-energy') and their quantities for the Essences this Recipe Requires
     * */
    essences?: Record<string, number>;
    ingredients?: Record<string, number>;
    catalysts?: Record<string, number>;
    results: Record<string, number>;
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