import {DefaultEntityValidationResult, EntityValidationResult} from "../../api/EntityValidator";
import {Recipe} from "./Recipe";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {EssenceAPI} from "../../api/EssenceAPI";
import {ComponentAPI} from "../../api/ComponentAPI";

interface RecipeValidator {

    validate(candidate: Recipe, existingRecipeIdsForItem: string[]): Promise<EntityValidationResult<Recipe>>;

}

export { RecipeValidator }

class DefaultRecipeValidator implements RecipeValidator  {

    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly componentAPI: ComponentAPI;
    private readonly essenceAPI: EssenceAPI;

    constructor({
        craftingSystemAPI,
        componentAPI,
        essenceAPI
    }: {
        craftingSystemAPI: CraftingSystemAPI;
        componentAPI: ComponentAPI;
        essenceAPI: EssenceAPI;
    }) {
        this.craftingSystemAPI = craftingSystemAPI;
        this.componentAPI = componentAPI;
        this.essenceAPI = essenceAPI;
    }

    async validate(candidate: Recipe, existingRecipeIdsForItem: string[]): Promise<EntityValidationResult<Recipe>> {

        // Prepare an array to capture any errors that are found
        const errors: string[] = [];

        // Check that the crafting system exists
        const craftingSystem = await this.craftingSystemAPI.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist. `);
        }

        // Check that this item is not already a component for this crafting system
        for (const existingRecipeId of existingRecipeIdsForItem) {
            if (existingRecipeId !== candidate.id && existingRecipeIdsForItem.includes(existingRecipeId)) {
                errors.push(`The item with UUID ${candidate.itemUuid} is already a recipe in the system "${candidate.craftingSystemId}" with the ID "${existingRecipeId}". `);
            }
        }

        // Check that the item exists and can be loaded
        if (!candidate.itemData.loaded) {
            await candidate.itemData.load();
        }
        if (candidate.itemData.hasErrors) {
            const itemDataErrorMessages = candidate.itemData.errors.map(error => error.message);
            errors.push(`The item with UUID ${candidate.itemUuid} could not be loaded. Caused by: ${itemDataErrorMessages.join(", ")} `);
        }

        // Check that the essences referenced by this recipe all exist
        const existingEssences = await this.essenceAPI.getAll();
        const undefinedEssences = candidate.getUniqueReferencedEssences()
            .filter(essenceReference => !existingEssences.has(essenceReference.id))
            .map(essenceReference => essenceReference.id);
        if (undefinedEssences.length > 0) {
            errors.push(`The essences with the following IDs do not exist: ${undefinedEssences.join(", ")}`);
        }

        // Check that the required and resultant components in all options referenced by this recipe exist
        const componentsForSystem = await this.componentAPI.getAllByCraftingSystemId(candidate.craftingSystemId);
        const undefinedComponents = candidate.getUniqueReferencedComponents()
            .filter(componentReference => !componentsForSystem.has(componentReference.id))
            .map(componentReference => componentReference.id);
        if (undefinedComponents.length > 0) {
            errors.push(`The components with the following IDs do not exist: ${undefinedComponents.join(", ")}`);
        }

        return new DefaultEntityValidationResult({ entity: candidate, errors: errors });

    }

}

export { DefaultRecipeValidator };