import {CraftingSystem, CraftingSystemJson} from "../system/CraftingSystem";
import {Component, ComponentJson} from "../common/Component";
import {CraftingSystemApi} from "./CraftingSystemApi";
import {EssenceApi} from "./EssenceApi";
import {ComponentApi} from "./ComponentApi";
import {RecipeApi} from "./RecipeApi";
import {Essence, EssenceJson} from "../common/Essence";
import {Recipe, RecipeJson} from "../common/Recipe";

interface FabricateApiFactory {

    make(): FabricateAPI;

}

export { FabricateApiFactory }

class DefaultFabricateApiFactory implements FabricateApiFactory {

    make(): FabricateAPI {
        return undefined;
    }

}

export { DefaultFabricateApiFactory }

interface FabricateAPI {

    createCraftingSystem(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem>;

    createComponent(craftingSystemId: string, componentJson: ComponentJson): Promise<Component>;

}

export { FabricateAPI }

class DefaultFabricateApi implements FabricateAPI {

    private readonly _craftingSystemApi: CraftingSystemApi;
    private readonly _essenceApi: EssenceApi;
    private readonly _componentApi: ComponentApi;
    private readonly _recipeApi: RecipeApi;

    constructor({
        craftingSystemApi,
        essenceApi,
        componentApi,
        recipeApi
    }: {
        craftingSystemApi: CraftingSystemApi;
        essenceApi: EssenceApi;
        componentApi: ComponentApi;
        recipeApi: RecipeApi
    }) {
        this._craftingSystemApi = craftingSystemApi;
        this._essenceApi = essenceApi;
        this._componentApi = componentApi;
        this._recipeApi = recipeApi;
    }

    createCraftingSystem(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {
        return this._craftingSystemApi.create(craftingSystemJson);
    }

    createEssence(craftingSystemId: string, essenceJson: EssenceJson): Promise<Essence> {
        return this._essenceApi.create(craftingSystemId, essenceJson);
    }

    createComponent(craftingSystemId: string, componentJson: ComponentJson): Promise<Component> {
        return this._componentApi.create(craftingSystemId, componentJson);
    }

    createRecipe(craftingSystemId: string, recipeJson: RecipeJson): Promise<Recipe> {
        return this._recipeApi.create(craftingSystemId, recipeJson);
    }

}

export { DefaultFabricateApi }