import {ActionType} from "./ActionType";

enum FabricateItemType {
    RECIPE = 'RECIPE',
    COMPONENT = 'COMPONENT'
}

interface CompendiumEntry {
    compendiumKey: string,
    entryId: string
}

interface FabricateComponentFlags {
    name: string,
    essences: string[];
    compendiumEntry: CompendiumEntry
}

interface FabricateIngredientFlags {
    quantity: number,
    consumed: boolean,
    componentType: FabricateComponentFlags
}

interface FabricateResultFlags {
    action: ActionType,
    item: FabricateComponentFlags,
    quantity: number
}

interface FabricateCompendiumData {
    type: FabricateItemType;
    recipe?: {
        entryId: string,
        name: string,
        essences: string[],
        ingredients: FabricateIngredientFlags[],
        results: FabricateResultFlags[]
    };
    component?: FabricateComponentFlags;
}

export {FabricateCompendiumData, FabricateItemType, FabricateIngredientFlags, FabricateResultFlags, FabricateComponentFlags, CompendiumEntry}