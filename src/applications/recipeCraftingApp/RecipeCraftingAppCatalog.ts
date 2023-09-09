import {RecipeCraftingAppFactory} from "./RecipeCraftingAppFactory";
import {SvelteApplication} from "../SvelteApplication";
import {Recipe} from "../../scripts/crafting/recipe/Recipe";

interface RecipeCraftingAppCatalog {

    load(recipe: Recipe, actor: Actor): Promise<SvelteApplication>;

}

class DefaultRecipeCraftingAppCatalog implements RecipeCraftingAppCatalog {

    private readonly _recipeCraftingAppFactory: RecipeCraftingAppFactory;

    private readonly _appIndex: Map<string, SvelteApplication> = new Map();

    constructor({
        recipeCraftingAppFactory,
        appIndex = new Map()
    }: {
        recipeCraftingAppFactory: RecipeCraftingAppFactory;
        appIndex?: Map<string, SvelteApplication>;
    }) {
        this._recipeCraftingAppFactory = recipeCraftingAppFactory;
        this._appIndex = appIndex;
    }

    async load(recipe: Recipe, actor: Actor): Promise<SvelteApplication> {
        const appId = this.getAppId(actor, recipe);
        if (this._appIndex.has(appId)) {
            const svelteApplication = this._appIndex.get(appId);
            if (svelteApplication.rendered) {
                await svelteApplication.close();
            }
            this._appIndex.delete(appId);
            await recipe.load();
        }
        const app = await this._recipeCraftingAppFactory.make(recipe, actor, appId);
        this._appIndex.set(appId, app);
        return app;
    }

    private getAppId(actor: Actor, recipe: Recipe) {
        // @ts-ignore
        const actorId = actor.id;
        return `fabricate-recipe-crafting-app-${recipe.id}-${actorId}`;
    }
}

export { RecipeCraftingAppCatalog, DefaultRecipeCraftingAppCatalog }