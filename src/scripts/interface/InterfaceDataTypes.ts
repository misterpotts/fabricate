interface InventoryRecordData {
    name: string;
    entryId: string;
    quantity: number;
    imageUrl: string;
}

interface CraftingSystemData {
    selectedSystemId: string;
    hasEnabledSystems: boolean;
    systems: CraftingSystemInfo[];
}

interface CraftingSystemInfo {
    disabled: boolean;
    compendiumPackKey: string;
    name: string;
    selected: boolean;
}

interface RecipeData {
    name: string;
    entryId: string;
    known: boolean;
    craftable: boolean;
}

export {InventoryRecordData, CraftingSystemData, CraftingSystemInfo, RecipeData}