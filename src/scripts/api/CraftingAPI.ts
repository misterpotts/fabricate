import {LocalizationService} from "../../applications/common/LocalizationService";
import {EssenceAPI} from "./EssenceAPI";
import {ComponentAPI} from "./ComponentAPI";
import {RecipeAPI} from "./RecipeAPI";
import {CraftingSystemAPI} from "./CraftingSystemAPI";
import {NoSalvageResult, SalvageResult, SuccessfulSalvageResult} from "../crafting/result/SalvageResult";
import {DefaultSalvageAttempt, ImpossibleSalvageAttempt, SalvageAttempt} from "../crafting/attempt/SalvageAttempt";
import Properties from "../Properties";
import {Combination} from "../common/Combination";
import {Component} from "../crafting/component/Component";
import {GameProvider} from "../foundry/GameProvider";
import {InventoryFactory} from "../actor/InventoryFactory";
import {Inventory} from "../actor/Inventory";
import {NotificationService} from "../foundry/NotificationService";
import {SimpleInventoryAction} from "../actor/InventoryAction";

interface CraftingAPI {

    /**
     * Counts the number of components of a given type owned by the specified actor.
     *
     * @async
     * @param actorId - The id of the actor to check.
     * @param componentId - The id of the component to count.
     * @returns A Promise that resolves with the number of components of this type owned by the actor.
     */
    countOwnedComponentsOfType(actorId: string, componentId: string): Promise<number>;

    /**
     * Gets the components owned by the specified actor for the specified crafting system.
     *
     * @async
     * @param actorId - The id of the actor whose inventory you want to search.
     * @param craftingSystemId - The id of the crafting system to limit component matches to.
     * @returns A Promise that resolves with the components owned by the actor for the specified crafting system.
     */
    getOwnedComponentsForCraftingSystem(actorId: string, craftingSystemId: string): Promise<Combination<Component>>;

    /**
     * Prepares a Salvage Attempt for the specified component.
     *
     * @async
     * @param componentId - The id of the component to salvage.
     * @param sourceActorId - The id of the Actor from which the component should be removed. If not specified, the
     *   targetActorId is used. Specify a different sourceActorId when salvaging from a container or shared inventory.
     * @param targetActorId - The id of the Actor to which any produced components should be added.
     * @returns A Promise that resolves with the prepared Salvage Attempt.
     */
    prepareSalvageAttempt({ componentId, sourceActorId, targetActorId }: { componentId: string, sourceActorId: string, targetActorId: string }): Promise<SalvageAttempt>;

    /**
     * Accepts the specified Salvage Result, applying changes to actors and their owned items as necessary.
     *
     * @async
     * @param salvageResult - The Salvage Result to accept.
     * @returns A Promise that resolves with the accepted Salvage Result.
     */
    acceptSalvageResult(salvageResult: SalvageResult): Promise<SalvageResult>;


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


    constructor({
        recipeAPI,
        essenceAPI,
        gameProvider,
        componentAPI,
        inventoryFactory,
        craftingSystemAPI,
        notificationService,
        localizationService,
    }: {
        recipeAPI: RecipeAPI;
        essenceAPI: EssenceAPI;
        gameProvider: GameProvider;
        componentAPI: ComponentAPI;
        inventoryFactory: InventoryFactory;
        craftingSystemAPI: CraftingSystemAPI;
        notificationService: NotificationService;
        localizationService: LocalizationService;
    }) {
        this.recipeAPI = recipeAPI;
        this.essenceAPI = essenceAPI;
        this.gameProvider = gameProvider;
        this.componentAPI = componentAPI;
        this.inventoryFactory = inventoryFactory;
        this.craftingSystemAPI = craftingSystemAPI;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
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
        const knownComponentsBySourceItemUuid = Array.from(componentsForCraftingSystem.values())
            .reduce((map, component) => {
                map.set(component.itemUuid, component);
                return map;
            }, new Map<string, Component>());
        return this.inventoryFactory.make(gameSystemId, actor, knownComponentsBySourceItemUuid);
    }

    async prepareSalvageAttempt({ componentId, sourceActorId, targetActorId }: { componentId: string, sourceActorId: string, targetActorId: string }): Promise<SalvageAttempt> {

        const component = await this.componentAPI.getById(componentId);
        await component.load();

        if (component.itemData.hasErrors) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.invalidItemData`,
                    { componentId, cause: component.itemData.errors.join(", ") }
                )
            });
        }

        if (component.isDisabled) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.disabledComponent`,
                    { componentName: component.name }
                )
            });
        }

        if (!component.isSalvageable) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.unsalvageableComponent`,
                    { componentName: component.name }
                )
            });
        }

        const craftingSystem = await this.craftingSystemAPI.getById(component.craftingSystemId);

        if (craftingSystem.isDisabled) {
            return new ImpossibleSalvageAttempt({
                sourceActorId,
                targetActorId,
                componentId: component.id,
                description: this.localizationService.format(
                    `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.disabledCraftingSystem`,
                    {
                        craftingSystemName: craftingSystem.details.name,
                        componentName: component.name
                    }
                )
            });
        }

        return new DefaultSalvageAttempt({
            sourceActorId,
            targetActorId,
            componentId: component.id,
            options: component.salvageOptions,
            description: this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageAttempt.prepared`,
                {
                    craftingSystemName: craftingSystem.details.name,
                    componentName: component.name
                }
            )
        });

    }

    async acceptSalvageResult(salvageResult: SalvageResult): Promise<SalvageResult> {
        const salvageResultComponentReferences = salvageResult.produced.combineWith(Combination.of(salvageResult.consumed));
        const includedComponentsById = await this.componentAPI.getAllById(salvageResultComponentReferences.members.map(component => component.id));

        const includedComponents = Array.from(includedComponentsById.values());
        const craftingSystemIds = includedComponents
            .map(component => component.craftingSystemId)
            .filter((value, index, self) => self.indexOf(value) === index);

        if (craftingSystemIds.length > 1) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.crafting.salvageResult.multipleCraftingSystems`,
                { craftingSystemIds: craftingSystemIds.join(", ") }
            );
            this.notificationService.error(message);
            return;
        }

        const craftingSystemId = craftingSystemIds[0];
        const craftingSystem = await this.craftingSystemAPI.getById(craftingSystemId);
        if (craftingSystem.isDisabled) {
            const message = this.localizationService.format(
                `${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageResult.disabledCraftingSystem`,
                {
                    craftingSystemName: craftingSystem.details.name
                }
            );
            this.notificationService.error(message);
            return new NoSalvageResult(message);
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
            return new NoSalvageResult(message);
        }

        const action = new SimpleInventoryAction({
            additions: salvageResult.produced.convertElements(componentReference => includedComponentsById.get(componentReference.id)),
            removals: Combination.of(includedComponentsById.get(salvageResult.consumed.id)),
        });
        const inventory = await this.getInventory(salvageResult.sourceActorId, craftingSystemId);
        await inventory.perform(action);
        const description = this.localizationService.localize(`${DefaultCraftingAPI._LOCALIZATION_PATH}.salvageResult.success`);
        return new SuccessfulSalvageResult({
            description,
            consumed: salvageResult.consumed,
            produced: salvageResult.produced,
            sourceActorId: salvageResult.sourceActorId,
            targetActorId: salvageResult.targetActorId,
        });

    }

}

export { DefaultCraftingAPI };