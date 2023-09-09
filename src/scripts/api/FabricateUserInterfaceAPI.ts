import {CraftingSystemManagerAppFactory} from "../../applications/CraftingSystemManagerAppFactory";
import {ComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {RecipeCraftingAppCatalog} from "../../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {FabricateAPI} from "./FabricateAPI";
import {GameProvider} from "../foundry/GameProvider";

/**
 * Represents an API for managing the Fabricate user interface.
 */
interface FabricateUserInterfaceAPI {

    /**
     * Renders the crafting system manager application.
     *
     * @returns A Promise that resolves when the application is rendered.
     */
    renderCraftingSystemManagerApp(): Promise<void>;

    /**
     * Renders the component salvage application for the specified actor and component.
     *
     * @param actorId - The ID of the actor that owns the component.
     * @param componentId - The ID of the component to salvage.
     * @returns A Promise that resolves when the application is rendered.
     */
    renderComponentSalvageApp(actorId: string, componentId: string): Promise<void>;

    /**
     * Renders the recipe crafting application for the specified actor and recipe.
     *
     * @param actorId - The ID of the actor that owns the recipe.
     * @param recipeId - The ID of the recipe to craft.
     * @returns A Promise that resolves when the application is rendered.
     */
    renderRecipeCraftingApp(actorId: string, recipeId: string): Promise<void>;

}

export { FabricateUserInterfaceAPI };

class DefaultFabricateUserInterfaceAPI implements FabricateUserInterfaceAPI {

    private readonly fabricateAPI: FabricateAPI;
    private readonly gameProvider: GameProvider;
    private readonly recipeCraftingAppCatalog: RecipeCraftingAppCatalog;
    private readonly componentSalvageAppCatalog: ComponentSalvageAppCatalog;
    private readonly craftingSystemManagerAppFactory: CraftingSystemManagerAppFactory

    constructor({
        fabricateAPI,
        gameProvider,
        recipeCraftingAppCatalog,
        componentSalvageAppCatalog,
        craftingSystemManagerAppFactory,
    }: {
        fabricateAPI: FabricateAPI;
        gameProvider: GameProvider;
        recipeCraftingAppCatalog: RecipeCraftingAppCatalog;
        componentSalvageAppCatalog: ComponentSalvageAppCatalog;
        craftingSystemManagerAppFactory: CraftingSystemManagerAppFactory;
    }) {
        this.fabricateAPI = fabricateAPI;
        this.gameProvider = gameProvider;
        this.recipeCraftingAppCatalog = recipeCraftingAppCatalog;
        this.componentSalvageAppCatalog = componentSalvageAppCatalog;
        this.craftingSystemManagerAppFactory = craftingSystemManagerAppFactory;
    }

    async renderComponentSalvageApp(actorId: string, componentId: string): Promise<void> {
        const actor = this.gameProvider.get().actors.get(actorId);
        const component = await this.fabricateAPI.components.getById(componentId);
        await component.load();
        const application = await this.componentSalvageAppCatalog.load(actor, component);
        application.render(true);
    }

    async renderCraftingSystemManagerApp(): Promise<void> {
        const application = this.craftingSystemManagerAppFactory.make();
        application.render(true);
    }

    async renderRecipeCraftingApp(actorId: string, recipeId: string): Promise<void> {
        const actor = this.gameProvider.get().actors.get(actorId);
        const recipe = await this.fabricateAPI.recipes.getById(recipeId);
        await recipe.load();
        const application = await this.recipeCraftingAppCatalog.load(recipe, actor);
        application.render(true);
    }

}

export { DefaultFabricateUserInterfaceAPI };