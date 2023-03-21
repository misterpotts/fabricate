import {RecipeCraftingAppFactory} from "./RecipeCraftingAppFactory";
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {SvelteApplication} from "../SvelteApplication";
import {Recipe} from "../../scripts/common/Recipe";

interface RecipeCraftingAppCatalog {
    load(recipe: Recipe, craftingSystem: CraftingSystem, actor: Actor): Promise<SvelteApplication>;
}

class DefaultRecipeCraftingAppCatalog implements RecipeCraftingAppCatalog {

    private readonly _recipeCraftingAppFactory: RecipeCraftingAppFactory;
    private readonly _systemRegistry: SystemRegistry;

    private readonly _appIndex: Map<string, SvelteApplication> = new Map();

    constructor({
        recipeCraftingAppFactory,
        systemRegistry,
        appIndex = new Map()
    }: {
        recipeCraftingAppFactory: RecipeCraftingAppFactory;
        systemRegistry: SystemRegistry;
        appIndex?: Map<string, SvelteApplication>;
    }) {
        this._recipeCraftingAppFactory = recipeCraftingAppFactory;
        this._systemRegistry = systemRegistry;
        this._appIndex = appIndex;
    }

    async load(recipe: Recipe, craftingSystem: CraftingSystem, actor: Actor): Promise<SvelteApplication> {
        const appId = `fabricate-recipe-crafting-app-${recipe.id}`;
        if (this._appIndex.has(appId)) {
            const svelteApplication = this._appIndex.get(appId);
            if (svelteApplication.rendered) {
                await svelteApplication.close();
            }
            this._appIndex.delete(appId);
            craftingSystem = await this._systemRegistry.getCraftingSystemById(craftingSystem.id);
            await craftingSystem.loadPartDictionary();
            recipe = craftingSystem.getRecipeById(recipe.id);
        }
        const app = this._recipeCraftingAppFactory.make(recipe, craftingSystem, actor, appId);
        this._appIndex.set(appId, app);
        return app;
    }

}

export { RecipeCraftingAppCatalog, DefaultRecipeCraftingAppCatalog }