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

/**
 * The model used to export and import a crafting system.
 */
interface FabricateExportModel {

    /**
     * The version of the export model.
     */
    version: ExportModelVersion;

    /**
     * The exported crafting system.
     */
    craftingSystem: CraftingSystemExportModel;

    /**
     * The exported essences.
     */
    essences: EssenceExportModel[];

    /**
     * The exported components.
     */
    components: ComponentExportModel[];

    /**
     * The exported recipes.
     */
    recipes: RecipeExportModel[];

}

export { FabricateExportModel }