import { DefaultEntityValidationResult, EntityValidationResult } from "../../api/EntityValidator";
import {Component, ComponentJson} from "./Component";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {EssenceAPI} from "../../api/EssenceAPI";
import {DocumentManager} from "../../foundry/DocumentManager";

class ComponentValidator  {

    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly documentManager: DocumentManager;

    constructor({
        craftingSystemAPI,
        essenceAPI,
        documentManager
    }: {
        craftingSystemAPI: CraftingSystemAPI;
        essenceAPI: EssenceAPI;
        documentManager: DocumentManager;
    }) {
        this.craftingSystemAPI = craftingSystemAPI;
        this.essenceAPI = essenceAPI;
        this.documentManager = documentManager;
    }

    async validate(candidate: Component, existingComponentIds: string[]): Promise<EntityValidationResult<Component>> {
        const validationResult = await this.validateJson(candidate.toJson(), existingComponentIds);
        return new DefaultEntityValidationResult({ entity: candidate, errors: validationResult.errors });
    }

    async validateJson(candidate: ComponentJson, existingComponentIds: string[]): Promise<EntityValidationResult<ComponentJson>> {
        const errors: string[] = [];

        const itemData = await this.documentManager.loadItemDataByDocumentUuid(candidate.itemUuid);
        if (itemData.hasErrors) {
            const itemDataErrorMessages = itemData.errors.map(error => error.message);
            errors.push(`The item with UUID ${candidate.itemUuid} could not be loaded. Caused by: ${itemDataErrorMessages.join(", ")} `);
        }

        const craftingSystem = await this.craftingSystemAPI.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist. `);
        }

        const uniqueSalvageComponentIds = Object.values(candidate.salvageOptions)
            .flatMap(salvageOption => Object.keys(salvageOption))
            .filter((value, index, array) => array.indexOf(value) === index);
        const undefinedSalvageComponents = uniqueSalvageComponentIds.filter(componentId => !existingComponentIds.includes(componentId));
        if (undefinedSalvageComponents.length > 0) {
            errors.push(`The components with the following IDs do not exist: ${undefinedSalvageComponents.join(", ")}`);
        }

        const essenceIds = Object.keys(candidate.essences);
        const essenceLoadingResults = await this.essenceAPI.getAllById(essenceIds);
        const undefinedEssenceIds = essenceIds.filter(essenceId => !essenceLoadingResults.get(essenceId));
        if (undefinedEssenceIds.length > 0) {
            errors.push(`The essences with the following IDs do not exist: ${undefinedEssenceIds.join(", ")}`)
        }

        return new DefaultEntityValidationResult({ entity: candidate, errors: errors });
    }

}

export { ComponentValidator };