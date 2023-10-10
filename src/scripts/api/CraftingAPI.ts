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
import {DefaultUnit, Unit} from "../common/Unit";
import {Essence} from "../crafting/essence/Essence";
import {Option} from "../common/Options";

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