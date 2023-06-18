import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "../../api/EntityValidator";
import {Recipe, RecipeJson} from "./Recipe";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {EssenceAPI} from "../../api/EssenceAPI";
import {ComponentAPI} from "../../api/ComponentAPI";
import {DocumentManager} from "../../foundry/DocumentManager";

class RecipeValidator implements EntityValidator<RecipeJson, Recipe> {

    private readonly craftingSystemApi: CraftingSystemAPI;
    private readonly componentApi: ComponentAPI;
    private readonly essenceApi: EssenceAPI;
    private readonly documentManager: DocumentManager;

    constructor({
        craftingSystemApi,
        componentApi,
        essenceApi,
        documentManager
    }: {
        craftingSystemApi: CraftingSystemAPI;
        componentApi: ComponentAPI;
        essenceApi: EssenceAPI;
        documentManager: DocumentManager;
    }) {
        this.craftingSystemApi = craftingSystemApi;
        this.componentApi = componentApi;
        this.essenceApi = essenceApi;
        this.documentManager = documentManager;
    }

    async validate(candidate: Recipe): Promise<EntityValidationResult<Recipe>> {
        const validationResult = await this.validateJson(candidate.toJson());
        return new DefaultEntityValidationResult({ entity: candidate, errors: validationResult.errors });
    }

    async validateJson(candidate: RecipeJson): Promise<EntityValidationResult<RecipeJson>> {

        const errors: string[] = [];

        const itemData = await this.documentManager.loadItemDataByDocumentUuid(candidate.itemUuid);
        if (itemData.hasErrors) {
            const itemDataErrorMessages = itemData.errors.map(error => error.message);
            errors.push(`The item with UUID ${candidate.itemUuid} could not be loaded. Caused by: ${itemDataErrorMessages.join(", ")} `);
        }

        const craftingSystem = await this.craftingSystemApi.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist. `);
        }

        const essenceIds = Object.keys(candidate.essences);
        const essenceLoadingResults = await this.essenceApi.getAllById(essenceIds);
        const undefinedEssenceIds = essenceIds.filter(essenceId => !essenceLoadingResults.get(essenceId));
        if (undefinedEssenceIds.length > 0) {
            errors.push(`The essences with the following IDs do not exist: ${undefinedEssenceIds.join(", ")}`)
        }

        const resultComponentIds = Object.values(candidate.resultOptions)
            .flatMap(resultOption => Object.keys(resultOption.results));
        const requirementComponentIds = Object.values(candidate.requirementOptions)
            .flatMap(requirementOption => Object.keys(requirementOption.catalysts).concat(Object.keys(requirementOption.ingredients)));
        const componentIds = resultComponentIds.concat(requirementComponentIds);
        const componentLoadingResults = await this.componentApi.getAllById(componentIds);
        const undefinedComponentIds = Array.from(componentLoadingResults.keys()).filter(componentId => !componentLoadingResults.get(componentId));
        if (undefinedComponentIds.length > 0) {
            errors.push(`The components with the following IDs do not exist: ${undefinedComponentIds.join(", ")}`)
        }

        return new DefaultEntityValidationResult({entity: candidate, errors});

    }

}

export {RecipeValidator};