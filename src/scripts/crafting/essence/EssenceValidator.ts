import {DefaultEntityValidationResult, EntityValidationResult} from "../../api/EntityValidator";
import {Essence, EssenceJson} from "./Essence";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {DocumentManager} from "../../foundry/DocumentManager";

interface EssenceValidator {

    validate(candidate: Essence): Promise<EntityValidationResult<Essence>>;

    validateJson(candidate: EssenceJson): Promise<EntityValidationResult<EssenceJson>>;

}

export { EssenceValidator }

class DefaultEssenceValidator implements EssenceValidator {

    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly documentManager: DocumentManager;

    constructor({
        craftingSystemAPI,
        documentManager
    }: {
        craftingSystemAPI: CraftingSystemAPI;
        documentManager: DocumentManager;
    }) {
        this.craftingSystemAPI = craftingSystemAPI;
        this.documentManager = documentManager;
    }

    async validate(candidate: Essence): Promise<EntityValidationResult<Essence>> {
        const validationResult = await this.validateJson(candidate.toJson());
        return new DefaultEntityValidationResult({ entity: candidate, errors: validationResult.errors });
    }

    async validateJson(candidate: EssenceJson): Promise<EntityValidationResult<EssenceJson>> {
        const errors: string[] = [];

        if (!candidate.name) {
            errors.push("The essence name is required. ");
        }

        if (candidate.activeEffectSourceItemUuid) {
            const itemData = await this.documentManager.loadItemDataByDocumentUuid(candidate.activeEffectSourceItemUuid);
            if (itemData.hasErrors) {
                const itemDataErrorMessages = itemData.errors.map(error => error.message);
                errors.push(`The item with UUID ${candidate.activeEffectSourceItemUuid} could not be loaded. Caused by: ${itemDataErrorMessages.join(", ")} `);
            }
        }

        const craftingSystem = await this.craftingSystemAPI.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist. `);
        }

        return new DefaultEntityValidationResult({ entity: candidate, errors: errors });
    }


}

export { DefaultEssenceValidator };