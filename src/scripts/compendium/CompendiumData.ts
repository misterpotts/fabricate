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

export interface ComponentData {
    /**
     * Essence Slugs (e.g. 'water' or 'negative-energy') and their quantities for the Essences this Component contains
     * */
    essences: Record<string, number>;
    /**
     * Component Part IDs and their quantities for the potential salvage from breaking down this Component
     * */
    salvage: Record<string, number>;
}

export interface RecipeData {
    essences: Record<string, number>;
    catalysts: Record<string, number>;
    ingredients: Record<string, number>[];
    results: Record<string, number>[];
}

export declare type CraftingSystemData = RecipeData | ComponentData;

/**
 * The structure of the Fabricate module-scoped flags that can exist on an Item, typically found in a Compendium
 * */
export interface FabricateCompendiumData {
    id: string;
    type: FabricateItemType;
    systemData: Record<string, CraftingSystemData>;
}