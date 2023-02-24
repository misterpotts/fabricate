import {FabricateSettingMigrator} from "../FabricateSetting";
import {CraftingSystemJson} from "../../system/CraftingSystem";
import {V1ComponentJson, V1EssenceJson, V1RecipeJson, V1SystemJson} from "../../system/setting_versions/V1Json";
import {EssenceJson} from "../../common/Essence";
import {CraftingComponentJson, SalvageOptionJson} from "../../common/CraftingComponent";
import {IngredientOptionJson, RecipeJson, ResultOptionJson} from "../../common/Recipe";

class V2CraftingSystemSettingMigrator implements FabricateSettingMigrator<Record<string, V1SystemJson>, Record<string, CraftingSystemJson>> {

    private static readonly _FROM_VERSION: string = "1";
    private static readonly _TO_VERSION: string = "2";

    get fromVersion(): string {
        return V2CraftingSystemSettingMigrator._FROM_VERSION;
    }

    get toVersion(): string {
        return V2CraftingSystemSettingMigrator._TO_VERSION;
    }

    perform(from: Record<string, V1SystemJson>): Record<string, CraftingSystemJson> {
        const result: Record<string, CraftingSystemJson> = {};
        Object.keys(from).forEach(systemId => {
            result[systemId] = this.migrateCraftingSystem(from[systemId]);
        })
        return result;
    }

    private migrateCraftingSystem(inputSystem: V1SystemJson): CraftingSystemJson {
        return {
            id: inputSystem.id,
            details: inputSystem.details,
            locked: inputSystem.locked,
            enabled: inputSystem.enabled,
            parts: {
                essences: this.migrateEssences(inputSystem.parts.essences),
                components: this.migrateComponents(inputSystem.parts.components),
                recipes: this.migrateRecipes(inputSystem.parts.recipes)
            }
        };
    }

    private migrateEssences(inputEssences: Record<string, V1EssenceJson>): Record<string, EssenceJson> {
        const result: Record<string, EssenceJson> = {};
        Object.keys(inputEssences).forEach(essenceId => {
            const inputEssence: V1EssenceJson = inputEssences[essenceId];
            result[essenceId] = {
                name: inputEssence.name,
                description: inputEssence.description,
                iconCode: inputEssence.iconCode,
                tooltip: inputEssence.tooltip,
                activeEffectSourceItemUuid: null
            };
        });
        return result;
    }

    private migrateComponents(inputComponents: Record<string, V1ComponentJson>): Record<string, CraftingComponentJson> {
        const result: Record<string, CraftingComponentJson> = {};
        Object.keys(inputComponents).forEach(componentId => {
            const inputComponent: V1ComponentJson = inputComponents[componentId];
            result[componentId] = {
                essences: inputComponent.essences,
                disabled: false,
                itemUuid: inputComponent.itemUuid,
                salvageOptions: this.migrateSalvage(inputComponent.salvage)
            }
        });
        return result;

    }

    private migrateSalvage(salvage: Record<string, number>): Record<string, SalvageOptionJson>  {
        if (!salvage || Object.keys(salvage).length === 0) {
            return {};
        }
        const optionName = "Option 1";
        return {[optionName]: salvage};
    }

    private migrateRecipes(inputRecipes: Record<string, V1RecipeJson>): Record<string, RecipeJson> {
        const result: Record<string, RecipeJson> = {};
        Object.keys(inputRecipes).forEach(recipeId => {
            const inputRecipe: V1RecipeJson = inputRecipes[recipeId];
            result[recipeId] = {
                essences: inputRecipe.essences,
                disabled: false,
                itemUuid: inputRecipe.itemUuid,
                ingredientOptions: this.migrateIngredients(inputRecipe.ingredientGroups, inputRecipe.catalysts),
                resultOptions: this.migrateResults(inputRecipe.resultGroups)
            }
        });
        return result;
    }

    private migrateIngredients(ingredientGroups: Record<string, number>[], catalysts: Record<string, number>): Record<string, IngredientOptionJson> {
        const result: Record<string, IngredientOptionJson> = {};
        ingredientGroups.forEach((value, index) => {
            const optionName = `Option ${index + 1}`;
            const option: IngredientOptionJson = {
                ingredients: value,
                catalysts: catalysts
            };
            result[optionName] = option;
        });
        return result;
    }

    private migrateResults(resultGroups: Record<string, number>[]): Record<string, ResultOptionJson> {
        const result: Record<string, ResultOptionJson> = {};
        resultGroups.forEach((value, index) => {
            const optionName = `Option ${index + 1}`;
            result[optionName] = value;
        });
        return result;
    }
}

export { V2CraftingSystemSettingMigrator }