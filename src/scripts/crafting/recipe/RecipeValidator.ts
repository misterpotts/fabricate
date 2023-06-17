import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "../../api/EntityValidator";
import {Recipe} from "./Recipe";
import {CraftingSystemAPI} from "../../api/CraftingSystemAPI";
import {EssenceAPI} from "../../api/EssenceAPI";
import {ComponentAPI} from "../../api/ComponentAPI";
import {NoFabricateItemData} from "../../foundry/DocumentManager";

class RecipeValidator implements EntityValidator<Recipe> {

    private readonly craftingSystemApi: CraftingSystemAPI;
    private readonly componentApi: ComponentAPI;
    private readonly essenceApi: EssenceAPI;

    constructor({
        craftingSystemApi,
        componentApi,
        essenceApi
    }: {
        craftingSystemApi: CraftingSystemAPI;
        componentApi: ComponentAPI;
        essenceApi: EssenceAPI;
    }) {
        this.craftingSystemApi = craftingSystemApi;
        this.componentApi = componentApi;
        this.essenceApi = essenceApi;
    }

    async validate(candidate: Recipe): Promise<EntityValidationResult<Recipe>> {
        const errors: string[] = [];

        if (!candidate.itemData.isLoaded && !(candidate.itemData instanceof NoFabricateItemData)) {
            await candidate.load();
            if (candidate.itemData.hasErrors) {
                errors.push(`The item with UUID ${candidate.itemUuid} could not be loaded. 
                    Caused by: ${candidate.errors.map(error => error.message).join(", ")} `)
            }
        }

        const craftingSystem = await this.craftingSystemApi.getById(candidate.craftingSystemId);
        if (!craftingSystem) {
            errors.push(`The crafting system with ID ${candidate.craftingSystemId} does not exist`);
        }

        const essenceLoadingResults = await Promise.all(
            candidate.essences.members.map(async essence => {
                return {
                    id: essence.id,
                    essence: await this.essenceApi.getById(essence.id)
                };
            }));
        const undefinedEssences = essenceLoadingResults.filter(essenceLoadingResult => !essenceLoadingResult.essence);
        if (undefinedEssences.length > 0) {
            errors.push(`The essences with the following IDs do not exist: ${undefinedEssences.map(undefinedEssence => undefinedEssence.id).join(", ")}`)
        }

        const componentLoadingResults = await Promise.all(
            candidate.getIncludedComponents().map(async component => {
                return {
                    id: component.id,
                    component: await this.componentApi.getById(component.id)
                };
            }));
        const undefinedComponents = componentLoadingResults.filter(componentLoadingResult => !componentLoadingResult.component);
        if (undefinedComponents.length > 0) {
            errors.push(`The components with the following IDs do not exist: ${undefinedComponents.map(undefinedComponent => undefinedComponent.id).join(", ")}`)
        }

        candidate.requirementOptions
            .options
            .map(ingredientOption => ingredientOption.name)
            .map((ingredientOptionName, index, allIngredientOptionNames) => {
                if (allIngredientOptionNames.indexOf(ingredientOptionName) !== index) {
                    errors.push(`The ingredient option name ${ingredientOptionName} is not unique`);
                }
            });

        candidate.resultOptions
            .options
            .map(resultOption => resultOption.name)
            .map((resultOptionName, index, allResultOptionNames) => {
                if (allResultOptionNames.indexOf(resultOptionName) !== index) {
                    errors.push(`The result option name ${resultOptionName} is not unique`);
                }
            });

        return new DefaultEntityValidationResult({entity: candidate, errors});
    }

}

export {RecipeValidator};