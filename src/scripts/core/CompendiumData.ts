import {ActionType} from "./ActionType";

enum FabricateItemType {
    RECIPE = 'RECIPE',
    COMPONENT = 'COMPONENT'
}

interface FabricateComponentFlags {
    name: string,
    essences: string[];
    compendiumEntry: {
        compendiumKey: string,
        entryId: string
    }
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
        ingredients: FabricateIngredientFlags[],
        results: FabricateResultFlags[]
    };
    component?: FabricateComponentFlags;
}

export {FabricateCompendiumData, FabricateItemType, FabricateIngredientFlags, FabricateResultFlags, FabricateComponentFlags}