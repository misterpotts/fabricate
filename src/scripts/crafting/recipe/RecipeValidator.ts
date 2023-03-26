import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "../../api/EntityValidator";
import {DocumentManager} from "../../foundry/DocumentManager";
import {Recipe} from "./Recipe";
import {CraftingSystemApi} from "../../api/CraftingSystemApi";
import {EssenceApi} from "../../api/EssenceApi";
import {ComponentApi} from "../../api/ComponentApi";

class RecipeValidator implements EntityValidator<Recipe> {

    private readonly documentManager: DocumentManager;
    private readonly craftingSystemApi: CraftingSystemApi;
    private readonly componentApi: ComponentApi;
    private readonly essenceApi: EssenceApi;

    constructor({
        documentManager,
        craftingSystemApi,
        componentApi,
        essenceApi
    }: {
        documentManager: DocumentManager;
        craftingSystemApi: CraftingSystemApi;
        componentApi: ComponentApi;
        essenceApi: EssenceApi;
    }) {
        this.documentManager = documentManager;
        this.craftingSystemApi = craftingSystemApi;
        this.componentApi = componentApi;
        this.essenceApi = essenceApi;
    }

    async validate(candidate: Recipe): Promise<EntityValidationResult<Recipe>> {
        const errors: string[] = [];

        const document = await this.documentManager.getDocumentByUuid(candidate.itemUuid);
        if (!document) {
            errors.push(`The item with UUID ${candidate.itemUuid} does not exist`);
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

        candidate.ingredientOptions
            .map(ingredientOption => ingredientOption.name)
            .map((ingredientOptionName, index, allIngredientOptionNames) => {
                if (allIngredientOptionNames.indexOf(ingredientOptionName) !== index) {
                    errors.push(`The ingredient option name ${ingredientOptionName} is not unique`);
                }
            });

        candidate.resultOptions
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