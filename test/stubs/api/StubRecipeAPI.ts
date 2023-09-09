import {RecipeAPI, RecipeOptions} from "../../../src/scripts/api/RecipeAPI";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";
import {Recipe} from "../../../src/scripts/crafting/recipe/Recipe";
import {RecipeExportModel} from "../../../src/scripts/repository/import/FabricateExportModel";

class StubRecipeAPI implements RecipeAPI {

    private static readonly _USE_REAL_INSTEAD_MESSAGE = "Complex operations with real behaviour are not implemented by stubs. Should you be using the real thing instead?";

    private readonly _valuesById: Map<string, Recipe>;

    constructor({
        valuesById = new Map(),
    }: {
        valuesById?: Map<string, Recipe>;
    } = {}) {
        this._valuesById = valuesById;
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    cloneAll(_recipes: Recipe[],
             _targetCraftingSystemId?: string,
             _substituteEssenceIds?: Map<string, string>,
             _substituteComponentIds?: Map<string, string>
    ): Promise<{ recipes: Recipe[]; idLinks: Map<string, string> }> {
        throw new Error(StubRecipeAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async cloneById(recipeId: string): Promise<Recipe> {
        if (this._valuesById.has(recipeId)) {
            return this._valuesById.get(recipeId);
        }
        throw new Error(`No recipe with id ${recipeId}`);
    }

    async create(recipeOptions: RecipeOptions): Promise<Recipe> {
        const result = Array.from(this._valuesById.values())
            .find(recipe =>
                recipe.craftingSystemId === recipeOptions.craftingSystemId
                && recipe.itemUuid === recipeOptions.itemUuid
            );
        if (result) {
            return result;
        }
        throw new Error(`No recipe with crafting system id ${recipeOptions.craftingSystemId} and item uuid ${recipeOptions.itemUuid} was configured for this stub. Make sure to provide all expected recipes in the constructor.`);
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Recipe[]> {
        const recipesToDelete = Array.from(this._valuesById.values())
            .filter(recipe => recipe.craftingSystemId === craftingSystemId)
        recipesToDelete.forEach(recipe => this._valuesById.delete(recipe.id));
        return recipesToDelete;
    }

    async deleteById(recipeId: string): Promise<Recipe | undefined> {
        const result = this._valuesById.get(recipeId);
        this._valuesById.delete(recipeId);
        return result;
    }

    async deleteByItemUuid(recipeId: string): Promise<Recipe[]> {
        const recipesToDelete = Array.from(this._valuesById.values())
            .filter(recipe => recipe.itemUuid === recipeId)
        recipesToDelete.forEach(recipe => this._valuesById.delete(recipe.id));
        return recipesToDelete;
    }

    async getAll(): Promise<Map<string, Recipe>> {
        return new Map(this._valuesById);
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Recipe>> {
        return Array.from(this._valuesById.values())
            .filter(recipe => recipe.craftingSystemId === craftingSystemId)
            .reduce((result, recipe) => {
                result.set(recipe.id, recipe);
                return result;
            }, new Map<string, Recipe>());
    }

    async getAllById(recipeIds: string[]): Promise<Map<string, Recipe | undefined>> {
        return recipeIds.reduce((result, recipeId) => {
            result.set(recipeId, this._valuesById.get(recipeId));
            return result;
        }, new Map<string, Recipe | undefined>());
    }

    async getAllByItemUuid(itemUuid: string): Promise<Map<string, Recipe>> {
        return Array.from(this._valuesById.values())
            .filter(recipe => recipe.itemUuid === itemUuid)
            .reduce((result, recipe) => {
                result.set(recipe.id, recipe);
                return result;
            }, new Map<string, Recipe>());
    }

    async getById(recipeId: string): Promise<Recipe | undefined> {
        return this._valuesById.get(recipeId);
    }

    async insert(_recipeData: RecipeExportModel): Promise<Recipe> {
        throw new Error(StubRecipeAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async insertMany(_recipeData: RecipeExportModel[]): Promise<Recipe[]> {
        throw new Error(StubRecipeAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async removeComponentReferences(_craftingComponentId: string, _craftingSystemId: string): Promise<Recipe[]> {
        throw new Error(StubRecipeAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async removeEssenceReferences(_essenceId: string, _craftingSystemId: string): Promise<Recipe[]> {
        throw new Error(StubRecipeAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async save(recipe: Recipe): Promise<Recipe> {
        this._valuesById.set(recipe.id, recipe);
        return recipe;
    }

}

export { StubRecipeAPI };