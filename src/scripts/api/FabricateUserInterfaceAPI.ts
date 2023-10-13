import {CraftingSystemManagerAppFactory} from "../../applications/CraftingSystemManagerAppFactory";
import {ComponentSalvageAppCatalog} from "../../applications/componentSalvageApp/ComponentSalvageAppCatalog";
import {RecipeCraftingAppCatalog} from "../../applications/recipeCraftingApp/RecipeCraftingAppCatalog";
import {FabricateAPI} from "./FabricateAPI";
import {GameProvider} from "../foundry/GameProvider";
import {FabricatePatreonAPI} from "../patreon/FabricatePatreonAPI";
import {ActorCraftingAppFactory} from "../../applications/actorCraftingApp/ActorCraftingAppFactory";
import {ActorCraftingAppViewType} from "../../applications/actorCraftingApp/ActorCraftingAppViewType";

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

    /**
     * Renders the actor crafting application for the specified actor.
     *
     * @param args - The arguments for rendering the application.
     * @param args.targetActorId - The ID of the actor to add any components to when crafting recipes or salvaging
     *  components.
     * @param args.sourceActorId - The ID of the actor to remove any components from when crafting recipes or salvaging
     *  components. If not specified, the target actor will be used.
     * @param args.selected - The selected recipe or component when opening the app, if any.
     * @param args.selected.type - The type of the selected entity ("recipe" or "component").
     * @param args.selected.id - The ID of the selected entity.
     * @returns A Promise that resolves when the application is rendered.
     */
    renderActorCraftingApp(args: { targetActorId: string; sourceActorId?: string, selected?: { type: "recipe" | "component", id: string } }): Promise<void>;

}

export { FabricateUserInterfaceAPI };

class DefaultFabricateUserInterfaceAPI implements FabricateUserInterfaceAPI {

    private readonly fabricateAPI: FabricateAPI;
    private readonly gameProvider: GameProvider;
    private readonly fabricatePatreonAPI: FabricatePatreonAPI;
    private readonly actorCraftingAppFactory: ActorCraftingAppFactory;
    private readonly recipeCraftingAppCatalog: RecipeCraftingAppCatalog;
    private readonly componentSalvageAppCatalog: ComponentSalvageAppCatalog;
    private readonly craftingSystemManagerAppFactory: CraftingSystemManagerAppFactory

    constructor({
        fabricateAPI,
        gameProvider,
        fabricatePatreonAPI,
        actorCraftingAppFactory,
        recipeCraftingAppCatalog,
        componentSalvageAppCatalog,
        craftingSystemManagerAppFactory,
    }: {
        fabricateAPI: FabricateAPI;
        gameProvider: GameProvider;
        fabricatePatreonAPI: FabricatePatreonAPI;
        actorCraftingAppFactory: ActorCraftingAppFactory;
        recipeCraftingAppCatalog: RecipeCraftingAppCatalog;
        componentSalvageAppCatalog: ComponentSalvageAppCatalog;
        craftingSystemManagerAppFactory: CraftingSystemManagerAppFactory;
    }) {
        this.fabricateAPI = fabricateAPI;
        this.gameProvider = gameProvider;
        this.fabricatePatreonAPI = fabricatePatreonAPI;
        this.actorCraftingAppFactory = actorCraftingAppFactory;
        this.recipeCraftingAppCatalog = recipeCraftingAppCatalog;
        this.componentSalvageAppCatalog = componentSalvageAppCatalog;
        this.craftingSystemManagerAppFactory = craftingSystemManagerAppFactory;
    }

    async renderComponentSalvageApp(actorId: string, componentId: string): Promise<void> {
        const actor = this.gameProvider.get().actors.get(actorId);
        const component = await this.fabricateAPI.components.getById(componentId);
        await component.load();
        const application = await this.componentSalvageAppCatalog.load(actor, component);
        await application.render(true);
    }

    async renderCraftingSystemManagerApp(): Promise<void> {
        const application = this.craftingSystemManagerAppFactory.make();
        await application.render(true);
    }

    async renderRecipeCraftingApp(actorId: string, recipeId: string): Promise<void> {
        const actor = this.gameProvider.get().actors.get(actorId);
        const recipe = await this.fabricateAPI.recipes.getById(recipeId);
        await recipe.load();
        const application = await this.recipeCraftingAppCatalog.load(recipe, actor);
        await application.render(true);
    }

    async renderActorCraftingApp({
        targetActorId,
        sourceActorId = targetActorId,
        selected
    }: {
        targetActorId: string;
        sourceActorId?: string;
        selected?: {
            type: "recipe" | "component";
            id: string;
        }
    }): Promise<void> {
        const featureEnabled = await this.fabricatePatreonAPI.isEnabled("new-ui");
        if (!featureEnabled) {
            return;
        }
        if (!selected) {
            const application = await this.actorCraftingAppFactory.make({
                targetActorId,
                sourceActorId
            });
            await application.render(true);
            return;
        }
        if (selected.type === "recipe") {
            const application = await this.actorCraftingAppFactory.make({
                targetActorId,
                sourceActorId,
                view: ActorCraftingAppViewType.CRAFTING,
                selectedRecipeId: selected.id
            });
            await application.render(true);
            return;
        }
        if (selected.type === "component") {
            const application = await this.actorCraftingAppFactory.make({
                targetActorId,
                sourceActorId,
                view: ActorCraftingAppViewType.SALVAGING,
                selectedComponentId: selected.id
            });
            await application.render(true);
            return;
        }
        throw new Error(`Unknown selected entity type: ${selected.type}`);
    }

}

export { DefaultFabricateUserInterfaceAPI };