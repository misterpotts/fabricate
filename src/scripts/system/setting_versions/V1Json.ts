interface V1ComponentJson {
    itemUuid: string;
    essences: Record<string, number>;
    salvage: Record<string, number>;
}

interface V1RecipeJson {
    itemUuid: string;
    essences: Record<string, number>;
    catalysts: Record<string, number>;
    resultGroups: Record<string, number>[];
    ingredientGroups: Record<string, number>[];
}

interface V1EssenceJson {
    id: string;
    name: string;
    tooltip: string;
    iconCode: string;
    description: string;
}

interface V1SystemJson {
    id: string;
    details: {
        name: string;
        summary: string;
        description: string;
        author: string
    };
    enabled: boolean;
    locked: boolean;
    parts: {
        components: Record<string, V1ComponentJson>;
        recipes: Record<string, V1RecipeJson>;
        essences: Record<string, V1EssenceJson>;
    }
}

export { V1SystemJson, V1EssenceJson, V1ComponentJson, V1RecipeJson };