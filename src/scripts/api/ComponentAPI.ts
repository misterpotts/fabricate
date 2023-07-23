import {Component, ComponentJson} from "../crafting/component/Component";
import Properties from "../Properties";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {EntityDataStore} from "../repository/EntityDataStore";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {EntityValidationResult} from "./EntityValidator";
import {ComponentValidator} from "../crafting/component/ComponentValidator";
import {NotificationService} from "../foundry/NotificationService";

/**
 * A value object representing an option for salvaging a component
 *
 * @interface
 * */
interface SalvageOptionValue {

    /**
     * The name of the salvage option.
     */
    name: string;

    /**
     * The salvage that will be produced when the option is used to salvage the component.
     */
    results: Record<string, number>;

    /**
     * The additional components that must be present to salvage this component
     */
    catalysts: Record<string, number>;

}

/**
 * Options for creating a new component.
 *
 * @interface
 */
interface ComponentOptions {

    /**
     * The UUID of the item associated with the component.
     * */
    itemUuid: string;

    /**
     * The ID of the crafting system that the component belongs to.
     * */
    craftingSystemId: string;

    /**
     * Optional dictionary of the essences contained by the component. The dictionary is keyed on the essence ID and with
     * the values representing the required quantities.
     * */
    essences?: Record<string, number>;

    /**
     * Whether the component is disabled. Defaults to false.
     * */
    disabled?: boolean;

    /**
     * Optional array of salvage options for the component.
     * */
    salvageOptions?: SalvageOptionValue[];

}

export { ComponentOptions }

/**
 * A service for managing components.
 *
 * @interface
 */
interface ComponentAPI {

    /**
     * Creates a new component with the given options.
     *
     * @async
     * @param {ComponentOptions} componentOptions - The options for the component.
     * @returns {Promise<Component>} - A promise that resolves with the newly created component. As document data is loaded
     *  during validation, the created component is returned with item data loaded.
     * @throws {Error} - If there is an error creating the component.
     */
    create(componentOptions: ComponentOptions): Promise<Component>;

    /**
     * Returns all components.
     *
     * @async
     * @returns {Promise<Map<string, Component>>} A promise that resolves to a Map of component instances, where the keys are
     *  the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAll(): Promise<Map<string, Component>>;

    /**
     * Retrieves the component with the specified ID.
     *
     * @async
     * @param {string} id - The ID of the component to retrieve.
     * @returns {Promise<Essence | undefined>} A Promise that resolves with the component, or undefined if it does not
     *  exist.
     */
    getById(id: string): Promise<Component | undefined>;

    /**
     * Retrieves all components with the specified IDs.
     *
     * @async
     * @param {string} componentIds - An array of component IDs to retrieve.
     * @returns {Promise<Component | undefined>} A Promise that resolves to a Map of component instances, where the keys are
     * the component IDs. Values are undefined if the component with the corresponding ID does not exist
     */
    getAllById(componentIds: string[]): Promise<Map<string, Component | undefined>>;

    /**
     * Returns all components for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Component>>} A Promise that resolves to a Map of component instances for the given
     * crafting system, where the keys are the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>>;

    /**
     * Returns all components in a map keyed on component ID, for a given item UUID.
     *
     * @async
     * @param {string} itemUuid - The UUID of the item.
     * @returns {Promise<Map<string, Component>>} A Promise that resolves to a Map of component instances, where the keys
     * are the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByItemUuid(itemUuid: string): Promise<Map<string, Component>>;

    /**
     * Saves a component.
     *
     * @async
     * @param {Component} component - The component to save.
     * @returns {Promise<Component>} A Promise that resolves with the saved component, or rejects with an error if the component
     *  is not valid, or cannot be saved. As document data is loaded during validation, the created component is returned
     *  with item data loaded.
     */
    save(component: Component): Promise<Component>;

    /**
     * Deletes a component by ID.
     *
     * @async
     * @param {string} componentId - The ID of the component to delete.
     * @returns {Promise<Component | undefined>} A Promise that resolves to the deleted component or undefined if the component
     *  with the given ID does not exist.
     */
    deleteById(componentId: string): Promise<Component | undefined>;

    /**
     * Deletes all components associated with a given item UUID.
     *
     * @async
     * @param {string} componentId - The UUID of the item to delete components for.
     * @returns {Promise<Component | undefined>} A Promise that resolves to the deleted component(s) or an empty array if no
     *  components were associated with the given item UUID. Rejects with an Error if the components could not be deleted.
     */
    deleteByItemUuid(componentId: string): Promise<Component[]>;

    /**
     * Deletes all components associated with a given crafting system.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system to delete components for.
     * @returns {Promise<Component | undefined>} A Promise that resolves to the deleted component(s) or an empty array if no
     *  components were associated with the given crafting system. Rejects with an Error if the components could not be
     *  deleted.
     */
    deleteByCraftingSystemId(craftingSystemId: string): Promise<Component[]>;

    /**
     * Removes all references to the specified essence from all components within the specified crafting system.
     *
     * @async
     * @param {string} essenceId - The ID of the essence to remove references to.
     * @param {string} craftingSystemId - The ID of the crafting system containing the components to modify.
     * @returns {Promise<Component[]>} A Promise that resolves with an array of all modified components that contain
     *  references to the removed essence, or an empty array if no modifications were made. If the specified
     *  crafting system has no components, the Promise will reject with an Error.
     */
    removeEssenceReferences(essenceId: string, craftingSystemId: string): Promise<Component[]>;

    /**
     * Removes all references to the specified salvage from all components within the specified crafting system.
     *
     * @param {string} componentId
     * @param {string} craftingSystemId
     * @returns {Promise<Component[]>} A Promise that resolves with an array of all modified components that contain
     *   references to the removed salvage, or an empty array if no modifications were made. If the specified
     *   crafting system has no components, the Promise will reject with an Error.
     */
    removeSalvageReferences(componentId: string, craftingSystemId: string): Promise<Component[]>;

    /**
     * Clones a component by ID.
     *
     * @async
     * @param {string} componentId - The ID of the component to clone.
     * @returns {Promise<Component>} A Promise that resolves with the newly cloned component, or rejects with an Error if the
     *  component is not valid or cannot be cloned.
     */
    cloneById(componentId: string): Promise<Component>;

    /**
     * The Notification service used by this API. If `notifications.isSuppressed` is true, all notification messages
     * will print only to the console. If false, notification messages will be displayed in both the console and the UI.
     * */
    notifications: NotificationService;

}

export { ComponentAPI };

class DefaultComponentAPI implements ComponentAPI {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly componentValidator: ComponentValidator;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;
    private readonly componentStore: EntityDataStore<ComponentJson, Component>;
    private readonly identityFactory: IdentityFactory;

    constructor({
        componentValidator,
        notificationService,
        localizationService,
        componentStore,
        identityFactory
    }: {
        componentValidator: ComponentValidator;
        notificationService: NotificationService;
        localizationService: LocalizationService;
        componentStore: EntityDataStore<ComponentJson, Component>;
        identityFactory: IdentityFactory;
    }) {
        this.componentValidator = componentValidator;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
        this.componentStore = componentStore;
        this.identityFactory = identityFactory;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async cloneById(componentId: string): Promise<Component> {
        const source = await this.componentStore.getById(componentId);
        if (!source) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.cloneTargetNotFound`,
                { componentId }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }
        return this.create(source.toJson());
    }

    async create({
        essences = {},
        itemUuid,
        disabled = false,
        craftingSystemId,
        salvageOptions = []
     }: ComponentOptions): Promise<Component> {

        const assignedIds = await this.componentStore.listAllEntityIds();
        const id = this.identityFactory.make(assignedIds);
        const entityJson: ComponentJson = {
            id,
            embedded: false,
            craftingSystemId,
            itemUuid,
            essences,
            disabled,
            salvageOptions
        };

        const component = await this.componentStore.buildEntity(entityJson);
        return this.save(component);

    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Component[]> {
        const components = await this.componentStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        components.forEach(component => this.rejectDeletingEmbeddedComponent(component));
        await this.componentStore.deleteCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        return components;
    }

    async deleteById(componentId: string): Promise<Component | undefined> {
        const deletedComponent = await this.componentStore.getById(componentId);
        this.rejectDeletingEmbeddedComponent(deletedComponent);
        if (!deletedComponent) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.doesNotExist`,
                { componentId }
            );
            this.notificationService.error(message);
            return undefined;
        }
        await this.componentStore.deleteById(componentId);
        return deletedComponent;
    }

    async deleteByItemUuid(itemUuid: string): Promise<Component[]> {
        const components = await this.componentStore.getCollection(itemUuid, Properties.settings.collectionNames.item);
        components.forEach(component => this.rejectDeletingEmbeddedComponent(component));
        await this.componentStore.deleteCollection(itemUuid, Properties.settings.collectionNames.item);
        return components;
    }

    async getAll(): Promise<Map<string, Component>> {
        const components = await this.componentStore.getAllEntities();
        return new Map(components.map(component => [component.id, component]));
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>> {
        const components = await this.componentStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        components.forEach(component => this.rejectDeletingEmbeddedComponent(component));
        return new Map(components.map(component => [component.id, component]));
    }

    async getAllById(componentIds: string[]): Promise<Map<string, Component | undefined>> {
        const components = await this.componentStore.getAllById(componentIds);
        const result = new Map(components.map(component => [ component.id, component ]));
        const missingValues = componentIds.filter(id => !result.has(id));
        if (missingValues.length > 0) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.missingComponents`,
                { componentsIds: missingValues.join(", ") }
            );
            this.notificationService.error(message);
            missingValues.forEach(id => result.set(id, undefined));
        }
        return result;
    }

    async getAllByItemUuid(itemUuid: string): Promise<Map<string, Component>> {
        const components = await this.componentStore.getCollection(itemUuid, Properties.settings.collectionNames.item);
        return new Map<string, Component>(components.map(component => [component.id, component]));
    }

    async getById(id: string): Promise<Component | undefined> {
        const component = await this.componentStore.getById(id);
        if (!component) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.doesNotExist`,
                { componentId: id }
            );

            this.notificationService.error(message);
            return undefined;
        }
        return component;
    }

    async removeEssenceReferences(essenceIdToDelete: string, craftingSystemId: string): Promise<Component[]> {
        const componentsForCraftingSystem = await this.componentStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        const componentsWithEssence = componentsForCraftingSystem.filter(component => component.essences.has(essenceIdToDelete));
        const componentsWithEssenceRemoved = componentsWithEssence.map(component => {
                component.removeEssence(essenceIdToDelete);
                return component;
            });
        await this.componentStore.updateAll(componentsWithEssenceRemoved);
        return componentsWithEssenceRemoved;
    }

    async removeSalvageReferences(componentId: string, craftingSystemId: string): Promise<Component[]> {
        const componentsForCraftingSystem = await this.componentStore.getCollection(craftingSystemId, Properties.settings.collectionNames.craftingSystem);
        const componentsWithSalvage = componentsForCraftingSystem
            .filter(component => {
                if (!component.isSalvageable) {
                    return false;
                }
                const firstMatchingSalvage = component.salvageOptions.options
                    .map(salvageOption => salvageOption.results)
                    .find(salvage => salvage.has(componentId));
                return !!firstMatchingSalvage;
            });
        const componentsWithSalvageRemoved = componentsWithSalvage.map(component => {
                component.removeComponentFromSalvageOptions(componentId);
                return component;
            });
        await this.componentStore.updateAll(componentsWithSalvageRemoved);
        return componentsWithSalvageRemoved;
    }

    async save(component: Component): Promise<Component> {
        const existing = await this.componentStore.getById(component.id);
        this.rejectModifyingEmbeddedComponent(existing);

        await this.rejectSavingInvalidComponent(component);

        await this.componentStore.insert(component);

        const activityName = existing ? "updated" : "created";
        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.messages.component.${activityName}`,
            { componentName: component.name }
        );
        this.notificationService.info(message);

        return component;
    }

    private async rejectSavingInvalidComponent(component: Component): Promise<EntityValidationResult<Component>> {
        const existingComponentIds = await this.componentStore.listAllEntityIds();
        const existingComponentsIdsForItem = await this.componentStore.listCollectionEntityIds(component.itemUuid, Properties.settings.collectionNames.item);
        const validationResult = await this.componentValidator.validate(component, existingComponentIds, existingComponentsIdsForItem);
        if (validationResult.successful) {
            return validationResult;
        }
        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.notValid`,
            { errors: validationResult.errors.join(", ") }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectModifyingEmbeddedComponent(component: Component): void {
        if (!component?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.cannotModifyEmbedded`,
            { componentName: component.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectDeletingEmbeddedComponent(componentToDelete: Component): void {
        if (!componentToDelete?.embedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.cannotDeleteEmbedded`,
            { componentName: componentToDelete.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

}

export { DefaultComponentAPI };
