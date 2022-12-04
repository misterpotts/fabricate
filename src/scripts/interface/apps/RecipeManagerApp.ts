import {ApplicationWindow, StateManager} from "./core/Applications";
import {Recipe} from "../../crafting/Recipe";
import {GameProvider} from "../../foundry/GameProvider";
import Properties from "../../Properties";
import FabricateApplication from "../FabricateApplication";
import {CraftingSystem} from "../../system/CraftingSystem";

interface RecipeManagerView {

    recipe: {
        id: string;
        name: string;
        imageUrl: string;
    }

}

class RecipeManagerModel {

    private readonly _recipe: Recipe;
    private readonly _system: CraftingSystem;

    constructor({
        recipe,
        system
    } : {
        recipe: Recipe,
        system: CraftingSystem
    }) {
        this._recipe = recipe;
        this._system = system;
    }

    get recipe(): Recipe {
        return this._recipe;
    }

    get system(): CraftingSystem {
        return this._system;
    }

}

class RecipeStateManager implements StateManager<RecipeManagerView, RecipeManagerModel> {

    private readonly _model: RecipeManagerModel;

    constructor(model: RecipeManagerModel) {
        this._model = model;
    }

    getModelState(): RecipeManagerModel {
        return this._model;
    }

    getViewData(): RecipeManagerView {
        return {
            recipe: {
                id: this._model.recipe.id,
                name: this._model.recipe.name,
                imageUrl: this._model.recipe.imageUrl
            }
        };
    }

    load(): Promise<RecipeManagerModel> {
        return Promise.resolve(undefined);
    }

    async save(model: RecipeManagerModel): Promise<RecipeManagerModel> {
        await FabricateApplication.systemRegistry.saveCraftingSystem(model.system);
        return this.getModelState();
    }

}

class RecipeManagerAppFactory {

    make(recipe: Recipe, system: CraftingSystem): ApplicationWindow<RecipeManagerView, RecipeManagerModel> {
        return new ApplicationWindow<RecipeManagerView, RecipeManagerModel>({
            stateManager: new RecipeStateManager(new RecipeManagerModel({recipe, system})),
            options: {
                title: new GameProvider().globalGameObject().i18n.localize(`${Properties.module.id}.RecipeManagerApp.title`),
                id: `${Properties.module.id}-recipe-manager`,
                template: Properties.module.templates.recipeManagerApp,
                width: 500,
            }
        });
    }

}

export default new RecipeManagerAppFactory();