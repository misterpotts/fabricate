import {DefaultEntityValidationResult, EntityValidationResult} from "../../api/EntityValidator";
import {Component} from "./Component";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {EssenceAPI} from "../../api/EssenceAPI";
import {NoFabricateItemData} from "../../foundry/DocumentManager";

interface ComponentValidator {

    validate(candidate: Component, existingComponentIdsForSystem: string[], existingComponentsIdsForItem: string[]): Promise<EntityValidationResult<Component>>;

}

export { ComponentValidator }

class DefaultComponentValidator implements ComponentValidator {

    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly essenceAPI: EssenceAPI;

    constructor({
        craftingSystemAPI,
        essenceAPI
    }: {
        craftingSystemAPI: CraftingSystemAPI;
        essenceAPI: EssenceAPI;
    }) {
        this.craftingSystemAPI = craftingSystemAPI;
        this.essenceAPI = essenceAPI;
    }

    async validate(candidate: Component, existingComponentIdsForSystem: string[], existingComponentsIdsForItem: string[]): Promise<EntityValidationResult<Component>> {

        // Prepare an array to capture any errors that are found
        const errors: string[] = [];

        // Check that the crafting system exists
        const craftingSystem = await this.craftingSystemAPI.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist. `);
        }

        // Check that this item is not already a component for this crafting system
        for (const existingComponentId of existingComponentsIdsForItem) {
            if (existingComponentId !== candidate.id && existingComponentIdsForSystem.includes(existingComponentId)) {
                errors.push(`The item with UUID ${candidate.itemUuid} is already a component in the system "${candidate.craftingSystemId}" with the ID "${existingComponentId}". `);
            }
        }

        // If the component has an item specified, check it is valid
        if (!(candidate.itemData instanceof NoFabricateItemData)){
            // Check that the item exists and can be loaded
            if (!candidate.itemData.loaded) {
                await candidate.load();
            }
            if (candidate.itemData.hasErrors) {
                const itemDataErrorMessages = candidate.itemData.errors.map(error => error.message);
                const cause = itemDataErrorMessages.length > 0 ? `Caused by: ${itemDataErrorMessages.join(", ")}. ` : "";
                errors.push(`The item with UUID ${candidate.itemUuid} could not be loaded. ${cause} `);
            }
        }

        // Check that the salvage and catalysts referenced by this component all exist
        const undefinedSalvageComponents = candidate.getUniqueReferencedComponents()
            .filter(componentReference => !existingComponentIdsForSystem.includes(componentReference.id))
            .map(componentReference => componentReference.id);
        if (undefinedSalvageComponents.length > 0) {
            errors.push(`The components with the following IDs do not exist: ${undefinedSalvageComponents.join(", ")}`);
        }

        // Check that the essences referenced by this component all exist
        const existingEssences = await this.essenceAPI.getAll();
        const undefinedEssences = candidate.getUniqueReferencedEssences()
            .filter(essenceReference => !existingEssences.has(essenceReference.id))
            .map(essenceReference => essenceReference.id);
        if (undefinedEssences.length > 0) {
            errors.push(`The essences with the following IDs do not exist: ${undefinedEssences.join(", ")}`);
        }

        return new DefaultEntityValidationResult({ entity: candidate, errors: errors });

    }

}

export { DefaultComponentValidator };