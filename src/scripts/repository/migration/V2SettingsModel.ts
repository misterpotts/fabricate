interface VersionedSettings<T = Record<string, any>> {

    readonly version: string;

    readonly value: T;

}

export { VersionedSettings }

interface V2Component {
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: Record<string, Record<string, number>>;
}

export { V2Component }

interface V2Recipe {
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    resultOptions: Record<string, Record<string,number>>;
    ingredientOptions: Record<string, {
        catalysts: Record<string, number>;
        ingredients: Record<string, number>;
    }>;
}

export { V2Recipe }

interface V2Essence {
    name: string;
    tooltip: string;
    iconCode: string;
    description: string;
    activeEffectSourceItemUuid: string;
}

export { V2Essence }

interface V2CraftingSystem {
    id: string;
    details: {
        name: string;
        summary: string;
        description: string;
        author: string;
    };
    enabled: boolean;
    locked: boolean;
    parts: {
        components: Record<string, V2Component>;
        recipes: Record<string, V2Recipe>;
        essences: Record<string, V2Essence>;
    };
}

export { V2CraftingSystem }

interface V2SettingsModel {

    craftingSystems: VersionedSettings<Record<string, V2CraftingSystem>>;

}

export { V2SettingsModel }