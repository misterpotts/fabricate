interface CraftingSystemExportModel {
    id: string;
    details: {
        name: string;
        summary: string;
        description: string;
        author: string;
    };
    disabled: boolean;
}

export { CraftingSystemExportModel }

interface EssenceExportModel {
    id: string;
    name: string;
    tooltip: string;
    iconCode: string;
    disabled: boolean;
    description: string;
    craftingSystemId: string;
    activeEffectSourceItemUuid: string;
}

export { EssenceExportModel }

interface ComponentExportModel {
    id: string;
    itemUuid: string;
    disabled: boolean;
    essences: Record<string, number>;
    salvageOptions: {
        id: string;
        name: string;
        results: Record<string, number>;
        catalysts: Record<string, number>;
    }[];
    craftingSystemId: string;
}

export { ComponentExportModel }

interface RecipeExportModel {
    id: string;
    itemUuid: string;
    disabled: boolean;
    craftingSystemId: string;
    resultOptions: {
        id: string;
        name: string;
        results: Record<string, number>;
    }[];
    requirementOptions: {
        id: string,
        name: string,
        catalysts: Record<string, number>;
        ingredients: Record<string, number>;
        essences: Record<string, number>;
    }[];
}

export { RecipeExportModel }

type ExportModelVersion = "V2";

export { ExportModelVersion }

interface FabricateExportModel {

    version: ExportModelVersion;

    craftingSystem: CraftingSystemExportModel;

    essences: EssenceExportModel[];

    components: ComponentExportModel[];

    recipes: RecipeExportModel[];

}

export { FabricateExportModel }