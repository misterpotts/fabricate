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
    partId: string;
    known: boolean;
    owned: boolean;
    craftable: boolean;
    selected: boolean;
}

export {InventoryRecordData, CraftingSystemData, CraftingSystemInfo, RecipeData}