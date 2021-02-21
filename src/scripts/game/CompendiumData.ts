import {ActionType} from "../core/ActionType";

enum FabricateItemType {
    RECIPE = 'RECIPE',
    COMPONENT = 'COMPONENT'
}

interface CompendiumEntry {
    systemId: string;
    partId: string;
}

interface FabricateComponentFlags {
    essences: string[];
}

interface FabricateIngredientFlags {
    quantity: number,
    consumed: boolean,
    partId: string;
}

interface FabricateResultFlags {
    action: ActionType,
    partId: string,
    quantity: number
}

interface FabricateCompendiumData {
    type: FabricateItemType;
    identity: CompendiumEntry;
    recipe?: {
        essences: string[],
        ingredients: FabricateIngredientFlags[],
        results: FabricateResultFlags[]
    };
    component?: FabricateComponentFlags;
}

export {FabricateCompendiumData, FabricateItemType, FabricateIngredientFlags, FabricateResultFlags, FabricateComponentFlags, CompendiumEntry}