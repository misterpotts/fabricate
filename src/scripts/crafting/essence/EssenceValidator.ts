import {DefaultEntityValidationResult, EntityValidationResult} from "../../api/EntityValidator";
import {Essence} from "./Essence";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {NoFabricateItemData} from "../../foundry/DocumentManager";

interface EssenceValidator {

    validate(candidate: Essence): Promise<EntityValidationResult<Essence>>;

}

export { EssenceValidator }

class DefaultEssenceValidator implements EssenceValidator {

    private readonly craftingSystemAPI: CraftingSystemAPI;

    constructor({
        craftingSystemAPI
    }: {
        craftingSystemAPI: CraftingSystemAPI;
    }) {
        this.craftingSystemAPI = craftingSystemAPI;
    }

    async validate(candidate: Essence): Promise<EntityValidationResult<Essence>> {

        // Prepare an array to capture any errors that are found
        const errors: string[] = [];

        // Check that the crafting system exists
        const craftingSystem = await this.craftingSystemAPI.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist. `);
        }

        if (!candidate.name) {
            errors.push("The essence name is required. ");
        }

        // if the essence has an active effect source, check it is valid
        if (candidate.hasActiveEffectSource && !(candidate.activeEffectSource instanceof NoFabricateItemData)) {
            // Check that the item exists and can be loaded
            if (!candidate.loaded) {
                await candidate.load();
            }
            if (candidate.activeEffectSource.hasErrors) {
                const itemDataErrorMessages = candidate.activeEffectSource.errors.map(error => error.message);
                const cause = itemDataErrorMessages.length > 0 ? `Caused by: ${itemDataErrorMessages.join(", ")}. ` : "";
                errors.push(`The item with UUID ${candidate.activeEffectSource?.uuid} could not be loaded. ${cause} `);
            }
        }

        return new DefaultEntityValidationResult({ entity: candidate, errors: errors });

    }

}

export { DefaultEssenceValidator };