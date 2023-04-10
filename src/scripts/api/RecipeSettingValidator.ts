import {DefaultEntityValidationResult, EntityValidationResult, EntityValidator} from "./EntityValidator";
import {RecipeData} from "./RecipeApi";

class RecipeSettingValidator implements EntityValidator<RecipeData>{

    async validate(value: RecipeData): Promise<EntityValidationResult<RecipeData>> {

        const errors: string[] = [];

        if (!value) {
            errors.push("The Recipe setting value must be an object. ");
        }

        if (!value.recipesById) {
            errors.push("The Recipe setting must have the \"recipesById\" property. ");
        }

        if (!value.recipeIdsByCraftingSystemId) {
            errors.push("The Recipe setting must have the \"recipeIdsByCraftingSystemId\" property. ");
        }

        if (!value.recipeIdsByItemUuid) {
            errors.push("The Recipe setting must have the \"recipeIdsByItemUuid\" property. ");
        }

        return new DefaultEntityValidationResult({ entity: value, errors });

    }

}

export { RecipeSettingValidator }