import {ActionType} from "./ActionType";

enum FabricateItemType {
    RECIPE = 'RECIPE',
    COMPONENT = 'COMPONENT'
}

interface ComponentFlags {
    name: string,
    essences: string[];
    compendiumEntry: {
        compendiumKey: string,
        entryId: string
    }
}

interface IngredientFlags {
    quantity: number,
    consumed: boolean,
    componentType: ComponentFlags
}

interface ResultFlags {
    action: ActionType,
    item: ComponentFlags,
    quantity: number
}

interface FabricateFlags {
    type: FabricateItemType;
    recipe?: {
        entryId: string,
        name: string,
        ingredients: IngredientFlags[],
        results: ResultFlags[]
    };
    component?: ComponentFlags;
}

export {FabricateFlags, FabricateItemType, IngredientFlags, ResultFlags, ComponentFlags}