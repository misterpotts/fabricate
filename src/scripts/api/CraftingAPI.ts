import {LocalizationService} from "../../applications/common/LocalizationService";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {RecipeAPI} from "./RecipeAPI";
import {CraftingSystemAPI} from "./CraftingSystemAPI";
import {NoSalvageResult, SalvageResult, SuccessfulSalvageResult} from "../crafting/result/SalvageResult";
import Properties from "../Properties";
import {Combination, DefaultCombination} from "../common/Combination";
import {Component} from "../crafting/component/Component";
import {GameProvider} from "../foundry/GameProvider";
import {InventoryFactory} from "../actor/InventoryFactory";
import {Inventory} from "../actor/Inventory";
import {NotificationService} from "../foundry/NotificationService";
import {SimpleInventoryAction} from "../actor/InventoryAction";
import {Salvage} from "../crafting/component/Salvage";
import {CraftingResult, NoCraftingResult, SuccessfulCraftingResult} from "../crafting/result/CraftingResult";
import {Requirement} from "../crafting/recipe/Requirement";
import {Result} from "../crafting/recipe/Result";
import {
    ComponentSelectionStrategyFactory
} from "../crafting/component/ComponentSelectionStrategy";
import {ComponentSelection, DefaultComponentSelection, EmptyComponentSelection} from "../component/ComponentSelection";
import {TrackedCombination} from "../common/TrackedCombination";
import {DefaultUnit, Unit, Unit} from "../common/Unit";
import {Essence} from "../crafting/essence/Essence";
import {DefaultOption, Option} from "../common/Options";
import {
    DefaultCraftingAssessment,
    DisabledCraftingAssessment,
    CraftingAssessment, SelectableRequirementOptionSummary, ImpossibleCraftingAssessment
} from "../../applications/actorCraftingApp/CraftingAssessment";
import {Recipe} from "../crafting/recipe/Recipe";
import {
    DefaultSalvageAssessment,
    SalvageAssessment
} from "../../applications/actorCraftingApp/SalvageAssessment";
import {
    DefaultSalvageOption,
    DefaultSalvageProcess,
    SalvageOption,
    SalvageProcess
} from "../../applications/actorCraftingApp/SalvageProcess";
import {DefaultSelectableOptions} from "../common/SelectableOptions";

/**
 * Options used when salvaging a component using the Crafting API.
 */
interface ComponentSalvageOptions {

    /**
     * The ID of the component to salvage.
     */
    componentId: string;

    /**
     * The ID of the Actor from which the component should be removed.
     */
    sourceActorId: string;

    /**
     * The optional ID of the Actor to which any produced components should be added. If not specified, the
     * sourceActorId is used. Specify a different targetActorId when salvaging from a container or shared inventory to
     * another character.
     */
    targetActorId?: string;

    /**
     * The optional ID of the Salvage Option to use. Not required if the component has only one Salvage Option. If the
     * component has multiple Salvage Options this must be specified.
     */
    salvageOptionId?: string;

}

/**
 * Options used when explicitly selecting components for crafting recipes
 */
interface UserSelectedComponents {

    /**
     * The IDs and quantities of the catalysts to use when crafting the recipe.
     */
    catalysts: Record<string, number>;

    /**
     * The IDs and quantities of the ingredients to use when crafting the recipe.
     */
    ingredients: Record<string, number>;

    /**
     * The IDs and quantities of the components to use as essence sources when crafting the recipe.
     */
    essenceSources: Record<string, number>;

}

/**
 * Options used when crafting a recipe.
 */
interface RecipeCraftingOptions {

    /**
     * The ID of the recipe to attempt.
     */
    recipeId: string;

    /**
     * The ID of the Actor from which the components should be removed.
     */
    sourceActorId: string;

    /**
     * The optional ID of the Actor to which any produced components should be added. If not specified, the
     * sourceActorId is used. Specify a different targetActorId when crafting from a container or shared inventory to
     * another character.
     */
    targetActorId?: string;

    /**
     * The optional ID of the Requirement Option to use. Not required if the recipe has only one Requirement Option. If
     * the recipe has multiple Requirement Options this must be specified.
     */
    requirementOptionId?: string;

    /**
     * The optional ID of the Result Option to use. Not required if the recipe has only one Result Option. If the recipe
     * has multiple Result Options this must be specified.
     */
    resultOptionId?: string;

    /**
     * The optional IDs and quantities of the components to use when crafting the recipe. If not specified, the
     * components and amounts will be selected automatically for the least wasteful essence sources (if any are
     * required). This is useful when customising component selection for essences. However, if the Recipe also requires
     * catalysts and named ingredients be sure to include them in the component selection. If an insufficient
     * combination is specified crafting will not be attempted.
     */
    userSelectedComponents?: UserSelectedComponents;

}

/**
 * Options used when selecting components from an actor's inventory for use when crafting recipes
 */
interface ComponentSelectionOptions {

    /**
     * The ID of the Actor whose inventory you want to select components from.
     */
    sourceActorId: string;

    /**
     * The optional ID of the Recipe Requirement Option to select components for. Not required if the recipe has only
     * one Result Option. If the recipe has multiple requirement options this must be specified.
     */
    requirementOptionId?: string;

    /**
     * The ID of the Recipe to select components for.
     */
    recipeId: string;
}

/**
 * The Crafting API provides methods for crafting recipes and salvaging components.
 */
interface CraftingAPI {

    /**
     * Counts the number of components of a given type owned by the specified actor.
     *
     * @async
     * @param actorId - The ID of the actor to check.
     * @param componentId - The ID of the component to count.
     * @returns A Promise that resolves with the number of components of this type owned by the actor.
     */
    countOwnedComponentsOfType(actorId: string, componentId: string): Promise<number>;

    /**
     * Gets the components owned by the specified actor for the specified crafting system.
     *
     * @async
     * @param actorId - The ID of the actor whose inventory you want to search.
     * @param craftingSystemId - The ID of the crafting system to limit component matches to.
     * @returns A Promise that resolves with the components owned by the actor for the specified crafting system.
     */
    getOwnedComponentsForCraftingSystem(actorId: string, craftingSystemId: string): Promise<Combination<Component>>;

    /**
     * Attempts to salvage the specified component.
     *
     * @async
     * @param componentSalvageOptions - The options to use when salvaging the component.
     * @returns Promise<SalvageResult> A Promise that resolves with the Salvage Result
     */
    salvageComponent(componentSalvageOptions: ComponentSalvageOptions): Promise<SalvageResult>;

    /**
     * Attempts to craft the specified recipe.
     *
     * @async
     * @param recipeCraftingOptions - The options to use when crafting the recipe.
     * @returns Promise<CraftingResult> A Promise that resolves with the prepared Crafting Result.
     */
    craftRecipe(recipeCraftingOptions: RecipeCraftingOptions): Promise<CraftingResult>;

    /**
     * Selects components from the specified source Actor for the specified recipe requirement option. The Component
     *  Selection will be insufficient if the source Actor's inventory does not contain enough components to satisfy the
     *  requirement option.
     *
     * @async
     * @param componentSelectionOptions - The options to use when selecting components.
     * @returns Promise<ComponentSelection> A Promise that resolves with the selected components.
     */
    selectComponents(componentSelectionOptions: ComponentSelectionOptions): Promise<ComponentSelection>;

    /**
     * Configure Fabricate to read from and write to the JSON property path when considering item quantity in your game
     *   world. You can find the game system ID by printing `game.system.id` to the console. For example, `dnd5e` is the
     *   Dungeons and Dragons 5th Edition game system ID. 5th Edition manages item quantity in the `system.quantity`
     *   property. Fabricate supports the following game systems out of the box:
     *   - Dungeons and Dragons 5th Edition (`dnd5e`)
     *   - Pathfinder 2nd Edition (`pf2e`)
     *   If you are using a different game system, you will need to find the correct property path for your
     *   game system. This value is currently not stored in settings, so you will need to call this method every time
     *   you start Foundry VTT.
     *
     * @param gameSystem - The ID of the game system to configure.
     * @param propertyPath - The JSON property path to use when reading and writing item quantity.
     * @returns {[string, string][]} - An array containing all configured game systems and their item quantity property
     *   paths.
     */
    setGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): [string, string][];

    /**
     * Assesses the recipes that the specified actor owns, describing whether each recipe can be crafted, if at all.
     *
     * @param options - The options to use when summarising recipes.
     * @param options.sourceActorId - The optional ID of the actor to use as a source for components. Defaults to the
     *  targetActorId.
     * @param options.targetActorId - The ID of the actor to use as a source for recipes
     * @param options.craftingSystemId - The ID of the crafting system to limit the summary to. If not specified, all
     *  recipes for all crafting systems will be summarised.
     * @param options.craftableOnly - If true, only recipes that can be crafted will be included in the summary.
     * @returns A Promise that resolves with an array of recipe summaries.
     */
    assessCrafting(options: { sourceActorId?: string, targetActorId: string, craftingSystemId?: string, craftableOnly?: boolean }): Promise<CraftingAssessment[]>;

    /**
     * Assesses the available components that the specified actor owns, describing whether each component can be
     * salvaged, if at all.
     *
     * @param options - The options to use when summarising components.
     * @param options.actorId - The ID of the actor to use as a source for components
     * @param options.craftingSystemId - The ID of the crafting system to limit the summary to. If not specified, all
     *  components for all crafting systems will be summarised.
     * @param options.salvageableOnly - If true, only components that can be salvaged will be included in the summary.
     * @returns A Promise that resolves with an array of component summaries.
     */
    assessSalvage(options: { actorId: string, craftingSystemId?: string, salvageableOnly?: boolean }): Promise<SalvageAssessment[]>;

    /**
     * Gets the Salvage Process for the specified component and actor.
     *
     * @param options - The options to use when getting the Salvage Process.
     * @param options.componentId - The ID of the component to salvage.
     * @param options.actorId - The ID of the actor to use as a source for the component being salvaged.
     * @returns A Promise that resolves with the Salvage Process.
     */
    getSalvageProcess(options: { componentId: string; actorId: string }): Promise<SalvageProcess>;

}

export { CraftingAPI };

class DefaultCraftingAPI implements CraftingAPI {

    private static readonly _LOCALIZATION_PATH = `${Properties.module.id}.crafting`;

    private readonly recipeAPI: RecipeAPI;
    private readonly essenceAPI: EssenceAPI;
    private readonly gameProvider: GameProvider;
    private readonly componentAPI: ComponentAPI;
    private readonly inventoryFactory: InventoryFactory;
    private readonly craftingSystemAPI: CraftingSystemAPI;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;
    private readonly componentSelectionStrategyFactory: ComponentSelectionStrategyFactory;

    constructor({
        recipeAPI,
        essenceAPI,
        gameProvider,
        componentAPI,
        inventoryFactory,
        craftingSystemAPI,
        notificationService,
        localizationService,
        componentSelectionStrategyFactory,
    }: {
        recipeAPI: RecipeAPI;
        essenceAPI: EssenceAPI;
        gameProvider: GameProvider;
        componentAPI: ComponentAPI;
        inventoryFactory: InventoryFactory;
        craftingSystemAPI: CraftingSystemAPI;
        notificationService: NotificationService;
        localizationService: LocalizationService;
        componentSelectionStrategyFactory: ComponentSelectionStrategyFactory;
    }) {
        this.recipeAPI = recipeAPI;
        this.essenceAPI = essenceAPI;
        this.gameProvider = gameProvider;
        this.componentAPI = componentAPI;
        this.inventoryFactory = inventoryFactory;
        this.craftingSystemAPI = craftingSystemAPI;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
        this.componentSelectionStrategyFactory = componentSelectionStrategyFactory;
    }

    async getSalvageProcess({ componentId, actorId }: { componentId: string; actorId: string }): Promise<SalvageProcess> {
        const componentToSalvage = await this.componentAPI.getById(componentId);
        await componentToSalvage.load();
        const actor = await this.gameProvider.loadActor(actorId);
        const gameSystemId = this.gameProvider.getGameSystemId();
        const knownComponentsById = await this.componentAPI.getAllByCraftingSystemId(componentToSalvage.craftingSystemId);
        const knownComponents = Array.from(knownComponentsById.values());
        const knownRecipesById = await this.recipeAPI.getAllByCraftingSystemId(componentToSalvage.craftingSystemId);
        const knownRecipes = Array.from(knownRecipesById.values());
        const inventory = this.inventoryFactory.make(gameSystemId, actor, knownComponents, knownRecipes);
        if (!inventory.getContents().has(componentToSalvage)) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.componentNotOwned`,
                { componentName: componentToSalvage.name }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
        const salvageOptions = componentToSalvage.salvageOptions.all
            .map(salvageOption => {
                return new DefaultSalvageOption({
                    id: salvageOption.id,
                    name: salvageOption.name,
                    catalysts: new TrackedCombination({
                        target: salvageOption.value.catalysts.convertElements(componentReference => knownComponentsById.get(componentReference.id)),
                        actual: salvageOption.value.catalysts.convertUnits(componentReferenceUnit => new DefaultUnit(knownComponentsById.get(componentReferenceUnit.element.id), inventory.getContents().amountFor(componentReferenceUnit.element.id))),
                    }),
                    products: salvageOption.value.products.convertElements(componentReference => knownComponentsById.get(componentReference.id)),
                })
            })
            .map(salvageOption => new DefaultOption({
                id: salvageOption.id,
                name: salvageOption.name,
                value: salvageOption,
            }));
        return new DefaultSalvageProcess({
            options: new DefaultSelectableOptions<SalvageOption>({options: salvageOptions}),
            componentName: componentToSalvage.name,
        });
    }

    async assessCrafting({
        targetActorId,
        sourceActorId = targetActorId,
        craftingSystemId,
        craftableOnly = false
     }: {
        sourceActorId?: string;
        targetActorId: string;
        craftingSystemId?: string;
        craftableOnly?: boolean;
    }): Promise<CraftingAssessment[]> {

        const allRecipes = await this.recipeAPI.getAll();
        const includedCraftingSystemIds = craftingSystemId ? [craftingSystemId] : Array.from(allRecipes.values()).map(recipe => recipe.craftingSystemId);
        const includedRecipes = Array.from(allRecipes.values())
            .filter(recipe => includedCraftingSystemIds.includes(recipe.craftingSystemId));
        const craftingSystems = await this.craftingSystemAPI.getAllById(includedCraftingSystemIds);
        const allComponents = await this.componentAPI.getAll();
        const includedComponents = Array.from(allComponents.values())
            .filter(component => craftingSystems.has(component.craftingSystemId));

        const gameSystemId = this.gameProvider.getGameSystemId();
        const targetActor = await this.gameProvider.loadActor(targetActorId);
        const targetActorOnly = sourceActorId === targetActorId;
        const sourceActor = targetActorOnly ? targetActor : await this.gameProvider.loadActor(sourceActorId);
        const targetInventory = this.inventoryFactory.make(gameSystemId, targetActor, includedComponents, includedRecipes);
        const sourceInventory = targetActorOnly ? targetInventory : this.inventoryFactory.make(gameSystemId, sourceActor, includedComponents, includedRecipes);
        const ownedRecipes = targetInventory.getOwnedRecipes();

        const includedComponentsById = new Map(includedComponents.map(component => [component.id, component]));
        const allEssencesById = await this.essenceAPI.getAll();
        const summarisedRecipes = await Promise.all(includedRecipes
            .filter(recipe => ownedRecipes.has(recipe))
            .map(recipe => {
                return this.summariseRecipe(recipe, sourceInventory, includedComponentsById, allEssencesById);
            }));

        if (craftableOnly) {
            return summarisedRecipes.filter(summary => summary.isCraftable);
        } else {
            return summarisedRecipes;
        }

    }

    async assessSalvage({
        actorId,
        craftingSystemId,
        salvageableOnly,
    }: {
        actorId: string;
        craftingSystemId?: string;
        salvageableOnly?: boolean;
    }): Promise<SalvageAssessment[]> {

        const allComponents = await this.componentAPI.getAll();
        const filteredComponents = craftingSystemId ? Array.from(allComponents.values()).filter(component => component.craftingSystemId === craftingSystemId) : Array.from(allComponents.values());
        const allEssencesIds= filteredComponents
            .flatMap(component => component.essences.members)
            .map(essence => essence.id);
        const allEssencesById = await this.essenceAPI.getAllById(allEssencesIds);

        const gameSystemId = this.gameProvider.getGameSystemId();
        const actor = await this.gameProvider.loadActor(actorId);
        const inventory = this.inventoryFactory.make(gameSystemId, actor, filteredComponents);
        const ownedComponents = inventory.getContents();
        const salvageSummaries = await Promise.all(ownedComponents
            .map(unit => this.summariseComponent(unit.element, unit.quantity, inventory, allEssencesById)));

        if (salvageableOnly) {
            return salvageSummaries.filter(summary => summary.isSalvageable);
        } else {
            return salvageSummaries;
        }

    }

    private async summariseComponent(component: Component, quantity: number, inventory: Inventory, allEssencesById: Map<string, Essence>): Promise<SalvageAssessment> {

        // todo: this can be smarter, or done in the UI
        await component.load();

        const componentEssenceUnits = component.essences
            .convertElements(essenceReference => allEssencesById.get(essenceReference.id))
            .units;

        const ownedComponents = inventory.getContents();
        let needsCatalysts = false;
        // A component with salvage options can be salvaged if its requirements can be met.
        const availableSalvageOptions = component.salvageOptions.all
            .filter(salvageOption => {
                if (!salvageOption.value.requiresCatalysts) {
                    return true;
                }
                needsCatalysts = true;
                if (ownedComponents.isEmpty()) {
                    return false;
                }
                return ownedComponents.contains(salvageOption.value.catalysts);
            });

        // If there are available salvage options, the component can be salvaged.
        const canBeSalvaged = availableSalvageOptions.length > 0;
        return new DefaultSalvageAssessment({
            quantity,
            needsCatalysts,
            id: component.id,
            name: component.name,
            imageUrl: component.imageUrl,
            essences: componentEssenceUnits,
            disabled: component.isDisabled,
            hasSalvage: component.isSalvageable,
            salvageable: canBeSalvaged,
        });

    }

    private async summariseRecipe(recipe: Recipe,
                            inventory: Inventory,
                            includedComponentsById: Map<string, Component>,
                            includedEssencesById: Map<string, Essence>): Promise<CraftingAssessment> {

        // todo: this can be smarter, or done in the UI
        await recipe.load();

        // A disabled recipe cannot be crafted.
        if (recipe.isDisabled) {
            return new DisabledCraftingAssessment({
                id: recipe.id,
                name: recipe.name,
                imageUrl: recipe.imageUrl
            });
        }

        // A recipe with no requirements can be crafted. It needs nothing! Bit strange, but no judgement here.
        if (!recipe.hasRequirements) {
            return new DefaultCraftingAssessment({
                id: recipe.id,
                name: recipe.name,
                imageUrl: recipe.imageUrl,
            });
        }

        const availableOptions: SelectableRequirementOptionSummary[] = recipe.requirementOptions.all
            .map(requirementOption => {
                const selection = this.makeSelections(requirementOption.value,
                    inventory.getContents(),
                    includedComponentsById,
                    includedEssencesById);
                return {
                    id: requirementOption.id,
                    name: requirementOption.name,
                    isCraftable: selection.isSufficient,
                }
            })
            .filter(option => option.isCraftable)
            .map(option => {
                return {
                    id: option.id,
                    name: option.name,
                }
            });

        // If there are selectable options, the recipe can be crafted.
        if (availableOptions.length > 0) {
            return new DefaultCraftingAssessment({
                id: recipe.id,
                name: recipe.name,
                imageUrl: recipe.imageUrl,
                selectableOptions: availableOptions,
            });
        // If there are no selectable options, the recipe cannot be crafted.
        } else {
            return new ImpossibleCraftingAssessment({
                id: recipe.id,
                name: recipe.name,
                imageUrl: recipe.imageUrl,
            });
        }

    }

    setGameSystemItemQuantityPropertyPath(gameSystem: string, propertyPath: string): [string, string][] {
        return this.inventoryFactory.registerGameSystemItemQuantityPropertyPath(gameSystem, propertyPath);
    }

    async countOwnedComponentsOfType(actorId: string, componentId: string): Promise<number> {
        const component = await this.componentAPI.getById(componentId);
        if (!component) {
            const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.inventory.error.componentNotFound`, { componentId });
            this.notificationService.error(message);
            return;
        }
        const ownedComponents = await this.getOwnedComponentsForCraftingSystem(actorId, component.craftingSystemId);
        return ownedComponents.amountFor(component);
    }

    async getOwnedComponentsForCraftingSystem(actorId: string, craftingSystemId: string): Promise<Combination<Component>> {
        const inventory = await this.getInventory(actorId, craftingSystemId);
        return inventory.getContents();
    }

    private async getInventory(actorId: string, craftingSystemId: string): Promise<Inventory> {
        const actor = await this.gameProvider.loadActor(actorId);
        const gameSystemId = this.gameProvider.getGameSystemId();
        const componentsForCraftingSystem = await this.componentAPI.getAllByCraftingSystemId(craftingSystemId);
        const knownComponents = Array.from(componentsForCraftingSystem.values());
        return this.inventoryFactory.make(gameSystemId, actor, knownComponents);
    }

    async salvageComponent({
        componentId,
        sourceActorId,
        targetActorId = sourceActorId,
        salvageOptionId
    }: ComponentSalvageOptions): Promise<SalvageResult> {

        /**
         * =============================================================================================================
         * Check Source and Target Actors are valid
         * =============================================================================================================
         */

        const sourceActor = await this.gameProvider.loadActor(sourceActorId);
        if (!sourceActor) {
            const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.actorNotFound`, { actorId: sourceActorId });
            throw new Error(message);
        }

        if (sourceActorId !== targetActorId) {
            const targetActor = await this.gameProvider.loadActor(targetActorId);
            if (!targetActor) {
                const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.actorNotFound`, { actorId: targetActorId });
                throw new Error(message);
            }
        }

        /**
         * =============================================================================================================
         * Check component exists
         * =============================================================================================================
         */

        const component = await this.componentAPI.getById(componentId);

        if (!component) {
            const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.componentNotFound`, { componentId });
            throw new Error(message);
        }

        /**
         * =============================================================================================================
         * Check component is owned by Source Actor
         * =============================================================================================================
         */

        const sourceInventory = await this.getInventory(targetActorId, component.craftingSystemId);
        const ownedItems = sourceInventory.getContents();

        if (!ownedItems.has(component)) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.componentNotOwned`,
                {
                    componentName: component.name,
                    actorName: sourceActor.name
                }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check component has valid item data
         * =============================================================================================================
         */

        await component.load();

        if (component.itemData.hasErrors) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.invalidItemData`,
                { componentId, cause: component.itemData.errors.join(", ") }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check component is enabled
         * =============================================================================================================
         */

        if (component.isDisabled) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.disabledComponent`,
                { componentName: component.name }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check component is salvageable
         * =============================================================================================================
         */

        if (!component.isSalvageable) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.unsalvageableComponent`,
                { componentName: component.name }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check salvage option ID ws provided if component has multiple salvage options
         * =============================================================================================================
         */

        if (!salvageOptionId && component.salvageOptions.byId.size > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.salvageOptionIdRequired`,
                {
                    componentName: component.name,
                    salvageOptionIds: Array.from(component.salvageOptions.byId.keys()).join(", ") ,
                    salvageOptionCount: component.salvageOptions.byId.size
                }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check component's crafting system is enabled
         * =============================================================================================================
         */

        const craftingSystem = await this.craftingSystemAPI.getById(component.craftingSystemId);

        if (craftingSystem.isDisabled) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.disabledCraftingSystem`,
                {
                    craftingSystemName: craftingSystem.details.name,
                    name: component.name
                }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check all components in the salvage result are valid
         * =============================================================================================================
         */

        const selectedSalvageOption: Option<Salvage> = salvageOptionId ? component.salvageOptions.byId.get(salvageOptionId) : component.salvageOptions.byId.values().next().value;

        const salvageResultComponentReferences = selectedSalvageOption.value.products.combineWith(selectedSalvageOption.value.catalysts);
        const includedComponentsById = await this.componentAPI.getAllById(salvageResultComponentReferences.members.map(component => component.id));

        const includedComponents = Array.from(includedComponentsById.values());
        const craftingSystemIds = includedComponents
            .map(component => component.craftingSystemId)
            .filter((value, index, self) => self.indexOf(value) === index);

        if (craftingSystemIds.length > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageResult.multipleCraftingSystems`,
                { craftingSystemIds: craftingSystemIds.join(", ") }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        await Promise.all(includedComponents.map(component => component.load()));

        const componentsWithErrors = includedComponents.filter(component => component.itemData.hasErrors);
        if (componentsWithErrors.length > 0) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageResult.invalidItemData`,
                {
                    componentIds: componentsWithErrors.map(component => component.id).join(", ")
                }
            );
            this.notificationService.error(message);
            return new NoSalvageResult({
                component,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check that the source actor has enough catalysts to perform the salvage
         * =============================================================================================================
         */

        if (selectedSalvageOption.value.requiresCatalysts) {
            const missingCatalysts = ownedItems.without(component.id, 1)
                .units
                .filter(unit => selectedSalvageOption.value.catalysts.has(unit.element.id))
                .reduce((wantedCatalysts, ownedCatalyst) => {
                    return wantedCatalysts.without(ownedCatalyst.element.id, ownedCatalyst.quantity);
                }, selectedSalvageOption.value.catalysts);

            if (!missingCatalysts.isEmpty()) {
                const message = this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvage.missingCatalysts`,
                    {
                        componentName: component.name,
                        missingCatalystNames: missingCatalysts.map(unit => includedComponentsById.get(unit.element.id)).join(", ")
                    }
                );
                this.notificationService.warn(message);
                return new NoSalvageResult({
                    component,
                    sourceActorId,
                    targetActorId,
                    description: message
                });
            }
        }

        /**
         * =============================================================================================================
         * Perform the salvage
         * =============================================================================================================
         */

        const action = new SimpleInventoryAction({
            additions: selectedSalvageOption.value.products.convertElements(componentReference => includedComponentsById.get(componentReference.id)),
            removals: DefaultCombination.of(component),
        });
        await this.applyInventoryAction(sourceActorId, targetActorId, action, craftingSystem.id);
        const description = this.localizationService.localize(`${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageResult.success`);
        return new SuccessfulSalvageResult({
            component,
            description,
            sourceActorId,
            targetActorId,
            consumed: component,
            produced: action.additions,
        });

    }

    async craftRecipe({
        recipeId,
        sourceActorId,
        targetActorId = sourceActorId,
        requirementOptionId,
        resultOptionId,
        userSelectedComponents = { catalysts: {}, ingredients: {}, essenceSources: {} }
    }: RecipeCraftingOptions): Promise<CraftingResult> {

        /**
         * =============================================================================================================
         * Check Source and Target Actors are valid
         * =============================================================================================================
         */

        const sourceActor = await this.gameProvider.loadActor(sourceActorId);
        if (!sourceActor) {
            const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.actorNotFound`, { actorId: sourceActorId });
            throw new Error(message);
        }

        if (sourceActorId !== targetActorId) {
            const targetActor = await this.gameProvider.loadActor(targetActorId);
            if (!targetActor) {
                const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.actorNotFound`, { actorId: targetActorId });
                throw new Error(message);
            }
        }

        /**
         * =============================================================================================================
         * Check recipe exists
         * =============================================================================================================
         */

        const recipe = await this.recipeAPI.getById(recipeId);

        if (!recipe) {
            const message = this.localizationService.format(`${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.recipeNotFound`, { recipeId });
            throw new Error(message);
        }

        /**
         * =============================================================================================================
         * Check recipe has valid item data
         * =============================================================================================================
         */

        await recipe.load();

        if (recipe.hasErrors) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.invalidItemData`,
                { recipeId: recipe.id, cause: recipe.itemData.errors.join(", ") }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check recipe is enabled
         * =============================================================================================================
         */

        if (recipe.isDisabled) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.disabledRecipe`,
                { recipeName: recipe.name }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check the recipe's crafting system is enabled
         * =============================================================================================================
         */

        const craftingSystem = await this.craftingSystemAPI.getById(recipe.craftingSystemId);

        if (craftingSystem.isDisabled) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.disabledCraftingSystem`,
                {
                    craftingSystemName: craftingSystem.details.name,
                    name: recipe.name
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check requirement option ID ws provided if recipe has multiple requirement options
         * =============================================================================================================
         */

        if (!requirementOptionId && recipe.requirementOptions.byId.size > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.requirementOptionIdRequired`,
                {
                    recipeName: recipe.name,
                    requirementOptionIds: Array.from(recipe.requirementOptions.byId.keys()).join(", ") ,
                    requirementOptionCount: recipe.requirementOptions.byId.size
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check result option ID ws provided if recipe has multiple result options
         * =============================================================================================================
         */

        if (!resultOptionId && recipe.resultOptions.byId.size > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.resultOptionIdRequired`,
                {
                    recipeName: recipe.name,
                    resultOptionIds: Array.from(recipe.resultOptions.byId.keys()).join(", ") ,
                    resultOptionCount: recipe.resultOptions.byId.size
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        /**
         * =============================================================================================================
         * Check all components in the recipe are valid
         * =============================================================================================================
         */

        const selectedRequirementOption: Requirement = requirementOptionId ? recipe.requirementOptions.byId.get(requirementOptionId).value : recipe.requirementOptions.byId.values().next().value;
        const selectedResultOption: Result = resultOptionId ? recipe.resultOptions.byId.get(resultOptionId).value : recipe.resultOptions.byId.values().next().value;
        const allComponentIds = selectedRequirementOption.ingredients
            .combineWith(selectedRequirementOption.catalysts)
            .combineWith(selectedResultOption.products)
            .map(unit => unit.element.id);
        const includedComponentsById = await this.componentAPI.getAllById(allComponentIds);

        const includedComponents = Array.from(includedComponentsById.values());
        const craftingSystemIds = includedComponents
            .map(component => component.craftingSystemId)
            .filter((value, index, self) => self.indexOf(value) === index);

        if (craftingSystemIds.length > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.multipleCraftingSystems`,
                {
                    craftingSystemIds: craftingSystemIds.join(", "),
                    recipeName: recipe.name
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message
            });
        }

        await Promise.all(includedComponents.map(component => component.load()));

        const componentsWithErrors = includedComponents.filter(component => component.itemData.hasErrors);
        if (componentsWithErrors.length > 0) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.invalidComponentItemData`,
                {
                    recipeName: recipe.name,
                    componentIds: componentsWithErrors.map(component => component.id).join(", ")
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message,
            });
        }

        /**
         * =============================================================================================================
         * Check all essences in the recipe are valid
         * =============================================================================================================
         */

        const allEssenceIds = Array.from(includedComponentsById.values())
            .filter(component => component.hasEssences)
            .map(component => component.essences)
            .reduce((essences, componentEssences) => essences.combineWith(componentEssences), DefaultCombination.EMPTY())
            .map(unit => unit.element.id);
        const includedEssencesById = await this.essenceAPI.getAllById(allEssenceIds);

        const includedEssences = Array.from(includedEssencesById.values());
        const essenceCraftingSystemIds = includedEssences
            .map(essence => essence.craftingSystemId)
            .filter((value, index, self) => self.indexOf(value) === index);

        if (essenceCraftingSystemIds.length > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.multipleEssenceCraftingSystems`,
                { craftingSystemIds: essenceCraftingSystemIds.join(", ") }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message,
            });
        }

        const essencesToLoad = await Promise.all(includedEssences
            .filter(essence => essence.hasActiveEffectSource)
            .map(essence => essence.load()));

        const essencesWithErrors = essencesToLoad.filter(essence => essence.activeEffectSource.hasErrors);
        if (essencesWithErrors.length > 0) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.invalidEssenceItemData`,
                {
                    recipeName: recipe.name,
                    essenceIds: essencesWithErrors.map(essence => essence.id).join(", ")
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message,
            });
        }

        /**
         * =============================================================================================================
         * Check that other components in the source actor's inventory are valid
         * =============================================================================================================
         */

        const sourceInventory = await this.getInventory(sourceActorId, craftingSystem.id);
        const ownedComponents = sourceInventory.getContents();

        const otherComponentsInInventory = ownedComponents.members
            .filter(component => !includedComponentsById.has(component.id));
        await Promise.all(otherComponentsInInventory.map(component => component.load()));
        const otherComponentsInInventoryWithErrors = otherComponentsInInventory.filter(component => component.itemData.hasErrors);
        if (otherComponentsInInventoryWithErrors.length > 0) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.invalidComponentItemData`,
                {
                    recipeName: recipe.name,
                    componentIds: otherComponentsInInventoryWithErrors.map(component => component.id).join(", ")
                }
            );
            this.notificationService.error(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message,
            });
        }

        /**
         * =============================================================================================================
         * Select the components to use, if not specified
         * =============================================================================================================
         */

        const allComponentsById = new Map(includedComponentsById);
        otherComponentsInInventory.forEach(component => allComponentsById.set(component.id, component));
        const allEssencesById = await this.essenceAPI.getAllByCraftingSystemId(craftingSystem.id);

        let selectedComponents: ComponentSelection;
        if (!recipe.hasRequirements) {
            selectedComponents = new EmptyComponentSelection();
        } else if (this.isEmptyUserSelection(userSelectedComponents)) {
            selectedComponents  = this.makeSelections(
                selectedRequirementOption,
                ownedComponents,
                allComponentsById,
                allEssencesById
            );
        } else {
            const userProvidedComponents = this.assignUserProvidedComponents(
                selectedRequirementOption,
                userSelectedComponents,
                allComponentsById,
                allEssencesById,
                ownedComponents
            );
            if (!userProvidedComponents.selected.isSufficient) {
                const message = this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.insufficientUserComponents`,
                    {
                        recipeName: recipe.name,
                        actorName: sourceActor.name,
                        missingComponentNames: userProvidedComponents.missing.map(unit => unit.element.name).join(", ")
                    }
                );
                this.notificationService.warn(message);
                return new NoCraftingResult({
                    recipe,
                    sourceActorId,
                    targetActorId,
                    description: message,
                });
            }
            selectedComponents = userProvidedComponents.selected;
        }

        /**
         * =============================================================================================================
         * Check the selection is sufficient to perform the crafting
         * =============================================================================================================
         */

        if (!selectedComponents.isSufficient) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.insufficientComponents`,
                {
                    recipeName: recipe.name,
                    actorName: sourceActor.name,
                }
            );
            this.notificationService.warn(message);
            return new NoCraftingResult({
                recipe,
                sourceActorId,
                targetActorId,
                description: message,
            });
        }

        /**
         * =============================================================================================================
         * Perform the crafting
         * =============================================================================================================
         */

        const action = new SimpleInventoryAction({
            additions: selectedResultOption.products.convertElements(componentReference => includedComponentsById.get(componentReference.id)),
            removals: selectedComponents.essenceSources.combineWith(selectedComponents.ingredients.target)
        });
        await this.applyInventoryAction(sourceActorId, targetActorId, action, craftingSystem.id);

        return new SuccessfulCraftingResult({
            recipe,
            sourceActorId,
            targetActorId,
            consumed: action.removals,
            description: this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.success`,
                {
                    recipeName: recipe.name,
                    craftingSystemName: craftingSystem.details.name,
                }
            ),
            produced: action.additions,
        });

    }

    private async applyInventoryAction(sourceActorId: string, targetActorId: string, action: SimpleInventoryAction, craftingSystemId: string): Promise<void> {
        if (sourceActorId === targetActorId) {
            const inventory = await this.getInventory(targetActorId, craftingSystemId);
            await inventory.perform(action);
        } else {
            const sourceInventory = await this.getInventory(sourceActorId, craftingSystemId);
            const targetInventory = await this.getInventory(targetActorId, craftingSystemId);
            await sourceInventory.perform(action.withoutAdditions());
            await targetInventory.perform(action.withoutRemovals());
        }
    }

    async selectComponents({ recipeId, sourceActorId, requirementOptionId }: ComponentSelectionOptions): Promise<ComponentSelection> {

        const recipe = await this.recipeAPI.getById(recipeId);

        if (!recipe) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.recipeNotFound`,
                { recipeId }
            );
            this.notificationService.error(message);
            return new EmptyComponentSelection();
        }

        const sourceActor = await this.gameProvider.loadActor(sourceActorId);

        if (!sourceActor) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.actorNotFound`,
                { actorId: sourceActorId }
            );
            this.notificationService.error(message);
            return new EmptyComponentSelection();
        }

        if (!requirementOptionId && recipe.requirementOptions.byId.size > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.recipe.requirementOptionIdRequired`,
                {
                    recipeName: recipe.name,
                    requirementOptionIds: Array.from(recipe.requirementOptions.byId.keys()).join(", ") ,
                    requirementOptionCount: recipe.requirementOptions.byId.size
                }
            );
            this.notificationService.error(message);
            return new EmptyComponentSelection();
        }

        const requirementOption: Requirement = requirementOptionId ? recipe.requirementOptions.byId.get(requirementOptionId).value : recipe.requirementOptions.byId.values().next().value;

        const allCraftingSystemComponentsById = await this.componentAPI.getAllByCraftingSystemId(recipe.craftingSystemId);
        const allCraftingSystemEssencesById = await this.essenceAPI.getAllByCraftingSystemId(recipe.craftingSystemId);
        const sourceInventory = await this.getInventory(sourceActorId, recipe.craftingSystemId);
        const ownedComponents = sourceInventory.getContents();

        return this.makeSelections(
            requirementOption,
            ownedComponents,
            allCraftingSystemComponentsById,
            allCraftingSystemEssencesById
        );
    }

    private makeSelections(selectedRequirementOption: Requirement,
                           ownedComponents: Combination<Component>,
                           allComponentsById: Map<string, Component>,
                           allCraftingSystemEssencesById: Map<string, Essence>): ComponentSelection {
        const componentSelectionStrategy = this.componentSelectionStrategyFactory.make(allCraftingSystemEssencesById);
        return componentSelectionStrategy.perform(
            selectedRequirementOption.catalysts.convertElements(componentReference => allComponentsById.get(componentReference.id)),
            selectedRequirementOption.ingredients.convertElements(componentReference => allComponentsById.get(componentReference.id)),
            selectedRequirementOption.essences,
            ownedComponents
        );
    }

    private isEmptyUserSelection(userSelectedComponents: UserSelectedComponents) {
        return Object.keys(userSelectedComponents.catalysts).length === 0
            && Object.keys(userSelectedComponents.ingredients).length === 0
            && Object.keys(userSelectedComponents.essenceSources).length === 0;
    }

    private assignUserProvidedComponents(selectedRequirementOption: Requirement,
                                 userSelectedComponents: UserSelectedComponents,
                                 allComponentsById: Map<string, Component>,
                                 allEssencesById: Map<string, Essence>,
                                 ownedComponents: Combination<Component>): { selected: ComponentSelection, missing: Combination<Component> } {

        let availableComponents = ownedComponents;
        let missingComponents = DefaultCombination.EMPTY<Component>();

        // Select Catalysts from available components up to the required amount in the user selection

        const assignComponentAmounts = (unit: Unit<Component>) => {
            const component = unit.element;
            const availableQuantity = Math.min(unit.quantity, availableComponents.amountFor(component));
            if (availableQuantity < unit.quantity) {
                missingComponents = missingComponents.with(component, unit.quantity - availableQuantity);
            }
            availableComponents = availableComponents.without(component.id, availableQuantity);
            return new DefaultUnit<Component>(component, availableQuantity);
        };

        const actualCatalysts = DefaultCombination.fromRecord(userSelectedComponents.catalysts, componentId => allComponentsById.get(componentId))
            .map(assignComponentAmounts)
            .reduce((combination, unit) => combination.addUnit(unit), DefaultCombination.EMPTY<Component>());

        const catalysts = new TrackedCombination<Component>({
            target: selectedRequirementOption.catalysts.convertElements(componentReference => allComponentsById.get(componentReference.id)),
            actual: actualCatalysts
        });

        // Select Ingredients from available components up to the required amount in the user selection

        const actualIngredients = DefaultCombination.fromRecord(userSelectedComponents.ingredients, componentId => allComponentsById.get(componentId))
            .map(assignComponentAmounts)
            .reduce((combination, unit) => combination.addUnit(unit), DefaultCombination.EMPTY<Component>());

        const ingredients = new TrackedCombination<Component>({
            target: selectedRequirementOption.ingredients.convertElements(componentReference => allComponentsById.get(componentReference.id)),
            actual: actualIngredients
        });

        // Select Essence Sources from available components up to the required amount in the user selection

        const essenceSources = DefaultCombination.fromRecord<Component>(userSelectedComponents.essenceSources, componentId => allComponentsById.get(componentId))
            .map(assignComponentAmounts)
            .reduce((combination, unit) => combination.addUnit(unit), DefaultCombination.EMPTY<Component>());

        const selectedComponents = new DefaultComponentSelection({
            catalysts,
            ingredients,
            essenceSources,
            essences: new TrackedCombination<Essence>({
                actual: essenceSources
                    .explode(component => component.essences)
                    .convertElements(essenceReference => allEssencesById.get(essenceReference.id)),
                target: selectedRequirementOption.essences
                    .convertElements(essenceReference => allEssencesById.get(essenceReference.id))
            })
        });

        return { selected: selectedComponents, missing: missingComponents };

    }
}

export { DefaultCraftingAPI };