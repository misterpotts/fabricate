import {Recipe, RecipeJson} from "../../src/scripts/crafting/recipe/Recipe";
import {
    DefaultEntityValidationResult,
    EntityValidationResult,
    EntityValidator
} from "../../src/scripts/api/EntityValidator";

class StubRecipeValidator implements EntityValidator<RecipeJson, Recipe> {

    private readonly result: boolean;

    constructor(result: boolean) {
        this.result = result;
    }

    async validate(candidate: Recipe): Promise<EntityValidationResult<Recipe>> {
        return new DefaultEntityValidationResult({ entity: candidate, errors: ["test-error"], isSuccessful: this.result } );
    }

    async validateJson(candidate: RecipeJson): Promise<EntityValidationResult<RecipeJson>> {
        return new DefaultEntityValidationResult({ entity: candidate, errors: ["test-error"], isSuccessful: this.result } );
    }

}

export { StubRecipeValidator }