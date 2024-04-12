import { LocalizationService } from "../../applications/common/LocalizationService";
import fs from "fs";
import { DefaultRecipeAPI, RecipeAPI, RecipeOptions, RequirementOptionValue, ResultOptionValue } from "../api/RecipeAPI";
import { Recipe, RecipeJson } from "../crafting/recipe/Recipe";
import { RecipeValidator } from "../crafting/recipe/RecipeValidator";
import { DocumentManager } from "../foundry/DocumentManager";
import { GameProvider } from "../foundry/GameProvider";
import { IdentityFactory } from "../foundry/IdentityFactory";
import { NotificationService } from "../foundry/NotificationService";
import { EntityDataStore } from "../repository/EntityDataStore";

// =======================
// Mastercrafted models (version 2.0)
// =======================

/**
 * @typedef {Object} RecipeBookMasterCrafted
 * @property {string} [id=null]
 * @property {string} [name=""]
 * @property {string} [description=""]
 * @property {RecipeMasterCrafted[]} [recipes=RecipeMasterCrafted[]]
 * @property {string[]} [tools=[]]
 * @property {string} [sound=""]
 * @property {Object} [ownership={}]
 * @param {(0|1)} [ingredientsInspection=0] (default 0)
 * @param {(0|1)} [productInspection=0] (default 0)
 * @property {string} [img=MASTERCRAFTED_CONST.RECIPE_BOOK.IMG]
 */
interface RecipeBookMasterCrafted {
    id: string;
    name: string;
    description: string;
    recipes?: RecipeMasterCrafted[];
    tools?: string[];
    sound?: string;
    ownership?: Record<string, unknown>;
    ingredientsInspection?: 0 | 1;
    productInspection?: 0 | 1;
    img: string;
}

/**
 * @typedef {Object} RecipeMasterCrafted
 * @property {string} [id=null]
 * @property {string} [name=""]
 * @property {string} [description=""]
 * @property {number} [time=null]
 * @property {string} [macroName=""]
 * @property {RecipeBookMasterCrafted} [recipeBook=null]
 * @property {IngredientMasterCrafted[]} [ingredients=[]]
 * @property {ProductMasterCrafted[]} [products=[]]
 * @property {string[]} [tools=[]]
 * @property {string} [sound=""]
 * @property {Object} [ownership={}]
 * @param {(0|1)} [ingredientsInspection=0] (default 0)
 * @param {(0|1)} [productInspection=0] (default 0)
 * @property {string} [img=MASTERCRAFTED_CONST.RECIPE_BOOK.IMG]
 */
interface RecipeMasterCrafted {
    id?: string;
    name?: string;
    description?: string;
    time?: number;
    macroName?: string;
    recipeBook?: RecipeBookMasterCrafted;
    ingredients?: IngredientMasterCrafted[];
    products?: ProductMasterCrafted[];
    tools?: string[];
    sound?: string;
    ownership?: Record<string, unknown>;
    ingredientsInspection?: 0 | 1;
    productInspection?: 0 | 1;
    img?: string;
}

/**
 * @typedef {Object} ComponentMasterCrafted
 * @property {string} [id=undefined]
 * @property {string} [uuid=undefined]
 * @property {number} [quantity=undefined]
 * @property {string} [name=undefined]
 */
interface ComponentMasterCrafted {
    id?: string;
    uuid?: string;
    quantity?: number;
    name?: string;
}

/**
 * @typedef {Object} IngredientMasterCrafted
 * @property {string} id
 * @property {string} [name=null]
 * @property {ComponentMasterCrafted[]} [components=[]]
 * @property {RecipeMasterCrafted} [recipe=null]
 */
interface IngredientMasterCrafted {
    id: string;
    name?: string;
    components?: ComponentMasterCrafted[];
    recipe?: RecipeMasterCrafted;
}

/**
 * @typedef {Object} ProductMasterCrafted
 * @property {string} id
 * @property {string} name
 * @property {ComponentMasterCrafted[]} components
 */
interface ProductMasterCrafted {
    id: string;
    name: string;
    components: ComponentMasterCrafted[];
}



class MasterCraftedAPI extends DefaultRecipeAPI implements RecipeAPI {

    constructor({
        notificationService,
        localizationService,
        recipeValidator,
        recipeStore,
        identityFactory,
        gameProvider,
        documentManager,
    }: {
        notificationService: NotificationService;
        localizationService: LocalizationService;
        recipeValidator: RecipeValidator;
        recipeStore: EntityDataStore<RecipeJson, Recipe>;
        identityFactory: IdentityFactory;
        gameProvider: GameProvider;
        documentManager: DocumentManager;
    }) {
        super({
            notificationService,
            localizationService,
            recipeValidator,
            recipeStore,
            identityFactory,
            gameProvider,
            documentManager
        })
    }

    async importRecipeBookFile(recipeBookMasterCraftedPathToJson:string): Promise<Recipe[]> {
        let recipeBookMasterCrafted: RecipeBookMasterCrafted = JSON.parse(fs.readFileSync(recipeBookMasterCraftedPathToJson, 'utf-8'));
        return await this.importRecipeBook(recipeBookMasterCrafted);
    }

    async importRecipeBookJson(recipeBookMasterCraftedJson:string): Promise<Recipe[]> {
        let recipeBookMasterCrafted: RecipeBookMasterCrafted = JSON.parse(recipeBookMasterCraftedJson);
        return await this.importRecipeBook(recipeBookMasterCrafted);
    }

    async importRecipeBook(recipeBookMasterCrafted: RecipeBookMasterCrafted): Promise<Recipe[]> {

        const itemUuids: string[] = recipeBookMasterCrafted.recipes.map((recipe) => {
            return recipe.id;
        })
        const craftingSystemId: string = recipeBookMasterCrafted.id;
        const recipeOptionsByItemUuid: Map<string, RecipeOptions> = new Map();

        for(const recipeMasterCrafted of recipeBookMasterCrafted.recipes) {

            let recipeData:RecipeOptions;
        
            // const recipeName: string = recipeMasterCrafted.name;
            // const recipeId: string = recipeMasterCrafted.id;

            recipeData.craftingSystemId = recipeMasterCrafted.recipeBook.id;
            recipeData.itemUuid = recipeMasterCrafted.id;

            const requirementOptions:RequirementOptionValue[] = [];
            for(const ingredientMasterCrafted of recipeMasterCrafted.ingredients) {
                
                // Import catalyst

                const catalysts: Record<string, number> = {};

                // Import essences

                const essences: Record<string, number> = {};

                // Import ingredients/components

                const ingredients: Record<string, number> = {};
                for(const componentMasterCrafted of ingredientMasterCrafted.components) {
                    ingredients[componentMasterCrafted.uuid] = componentMasterCrafted.quantity || 1;
                }

                requirementOptions.push({
                    name: recipeMasterCrafted.name,
                    catalysts: catalysts,
                    ingredients: ingredients,
                    essences: essences
                });
            }
            recipeData.requirementOptions = requirementOptions;

            const resultOptions: ResultOptionValue[] = [];
            for(const product of recipeMasterCrafted.products) {

                // Import results

                const results: Record<string, number> = {};
                for(const componentResultMasterCrafted of product.components) {
                    results[componentResultMasterCrafted.uuid] = componentResultMasterCrafted.quantity || 1;
                }

                resultOptions.push(
                {
                    name: product.name,
                    results: results
                });
            }
            recipeData.resultOptions = resultOptions;

            recipeOptionsByItemUuid.set(recipeMasterCrafted.id,recipeData);

        }

        return await super.createMany({
            itemUuids: itemUuids,
            craftingSystemId: craftingSystemId,
            recipeOptionsByItemUuid: recipeOptionsByItemUuid
        });

    }

}

export { MasterCraftedAPI };