import {Component, ComponentJson} from "../crafting/component/Component";
import Properties from "../Properties";
import {LocalizationService} from "../../applications/common/LocalizationService";
import {EntityDataStore} from "../repository/EntityDataStore";
import {IdentityFactory} from "../foundry/IdentityFactory";
import {EntityValidationResult} from "./EntityValidator";
import {ComponentValidator} from "../crafting/component/ComponentValidator";
import {NotificationService} from "../foundry/NotificationService";
import {SalvageOptionJson} from "../crafting/component/Salvage";
import {ComponentExportModel} from "../repository/import/FabricateExportModel";
import {DefaultGameProvider, GameProvider} from "../foundry/GameProvider";
import {DefaultDocumentManager, DocumentManager} from "../foundry/DocumentManager";

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
 */
interface ComponentCreationOptions {

    /**
     * The UUID of the item associated with the component.
     * */
    itemUuid: string;

    /**
     * The ID of the crafting system that the component belongs to.
     * */
    craftingSystemId: string;

    /**
     * Optional dictionary of the essences contained by the component. The dictionary is keyed on the essence ID and
     * with the values representing the required quantities.
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

export { ComponentCreationOptions };

/**
 * A service for managing components.
 */
interface ComponentAPI {

    /**
     * Creates a new component with the given options.
     *
     * @async
     * @param {ComponentCreationOptions} componentOptions - The options for the component.
     * @returns {Promise<Component>} - A promise that resolves with the newly created component. As document data is loaded
     *  during validation, the created component is returned with item data loaded.
     * @throws {Error} - If there is an error creating the component.
     */
    create(componentOptions: ComponentCreationOptions): Promise<Component>;

    /**
     * Creates multiple components with the given options.
     *
     * @async
     * @param itemUuids - The UUIDs of the items to create components for.
     * @param craftingSystemId - The ID of the crafting system that the components belong to.
     * @param componentOptionsByItemUuid - Optional map of component options keyed on item UUID.
     * @returns {Promise<Component[]>} - A promise that resolves with the newly created components. As document data is loaded
     *   during validation, the created components are returned with item data loaded.
     * @throws {Error} - If there is an error creating the components.
     */
    createMany({
        itemUuids,
        craftingSystemId,
        componentOptionsByItemUuid,
    }: {
        itemUuids: string[];
        craftingSystemId: string;
        componentOptionsByItemUuid?: Map<string, ComponentCreationOptions>
    }): Promise<Component[]>;

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

    /**
     * Creates or overwrites a component with the given details. This operation is intended to be used when importing a
     * crafting system and its components from a JSON file. Most users should use `create` or `save` components instead.
     *
     * @async
     * @param componentData - The component data to insert
     * @returns {Promise<Component>} A Promise that resolves with the saved component, or rejects with an error if
     *   the component is not valid, or cannot be saved.
     */
    insert(componentData: ComponentExportModel): Promise<Component>;

    /**
     * Creates or overwrites multiple components with the given details. This operation is intended to be used when
     *   importing a crafting system and its components from a JSON file. Most users should use `create` or `save`
     *   components instead.
     *
     * @async
     * @param componentData - The component data to insert
     * @returns {Promise<Component[]>} A Promise that resolves with the saved components, or rejects with an error
     *   if any of the components are not valid, or cannot be saved.
     */
    insertMany(componentData: ComponentExportModel[]): Promise<Component[]>;

    /**
     * Clones all provided Components to a target Crafting System, optionally substituting each Component's essences with
     *   new IDs. Components are cloned by value and the copies will be assigned new IDs. The cloned Components will be
     *   assigned to the Crafting System with the given target Crafting System ID. This operation is not idempotent and
     *   will produce duplicate Components with distinct IDs if called multiple times with the same source Components
     *   and target Crafting System ID. As only one Component can be associated with a given game item within a single
     *   Crafting system, Components cloned into the same Crafting system will have their associated items removed.
     *
     * @async
     * @param sourceComponents - The Components to clone
     * @param targetCraftingSystemId - The ID of the Crafting System to clone the Components to. Defaults to the source
     *   component's Crafting System ID.
     * @param substituteEssenceIds - An optional Map of Essence IDs to substitute with new IDs. If a Component
     *   references an Essence ID in this Map, the Component will be cloned with the new Essence ID in place of the
     *   original ID.
     */
    cloneAll(sourceComponents: Component[], targetCraftingSystemId?: string, substituteEssenceIds?: Map<string, string>): Promise<{ components: Component[], idLinks: Map<string, string> }>;

    /**
     * Saves all provided components.
     *
     * @async
     * @param components - The components to save.
     * @returns {Promise<Component[]>} A Promise that resolves with the saved components, or rejects with an error if
     *   any of the components are not valid, or cannot be saved.
     */
    saveAll(components: Component[]): Promise<Component[]>;

    /**
     * Imports all components from the specified compendium into the specified crafting system.
     *
     * @async
     * @param options - The options for the import.
     * @param options.craftingSystemId - The ID of the crafting system to import the components into.
     * @param options.compendiumId - The ID of the compendium to import the components from.
     * @returns {Promise<Component[]>} A Promise that resolves with the imported components, or rejects with an error if
     *  any of the components cannot be saved.
     */
    importCompendium(options: { craftingSystemId: string; compendiumId: string; }): Promise<Component[]>;

}

export { ComponentAPI };

class DefaultComponentAPI implements ComponentAPI {

    private static readonly _LOCALIZATION_PATH: string = `${Properties.module.id}.settings`

    private readonly componentValidator: ComponentValidator;
    private readonly notificationService: NotificationService;
    private readonly localizationService: LocalizationService;
    private readonly componentStore: EntityDataStore<ComponentJson, Component>;
    private readonly identityFactory: IdentityFactory;
    private readonly gameProvider: GameProvider;
    private readonly documentManager: DocumentManager;

    constructor({
        componentValidator,
        notificationService,
        localizationService,
        componentStore,
        identityFactory,
        gameProvider = new DefaultGameProvider(),
        documentManager = new DefaultDocumentManager(),
    }: {
        componentValidator: ComponentValidator;
        notificationService: NotificationService;
        localizationService: LocalizationService;
        componentStore: EntityDataStore<ComponentJson, Component>;
        identityFactory: IdentityFactory;
        gameProvider?: GameProvider;
        documentManager?: DocumentManager;
    }) {
        this.componentValidator = componentValidator;
        this.notificationService = notificationService;
        this.localizationService = localizationService;
        this.componentStore = componentStore;
        this.identityFactory = identityFactory;
        this.gameProvider = gameProvider;
        this.documentManager = documentManager;
    }

    get notifications(): NotificationService {
        return this.notificationService;
    }

    async importCompendium({ craftingSystemId, compendiumId }: { craftingSystemId: string; compendiumId: string; }): Promise<Component[]> {

        const game = this.gameProvider.get();

        const compendium = game.packs.get(compendiumId);

        if (!compendium) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.compendium.notFound`,
                { compendiumId }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }

        if (!Properties.module.compendiums.supportedTypes.includes(compendium.metadata.type)) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.compendium.invalidType`,
                {
                    compendiumId,
                    allowedTypes: Properties.module.compendiums.supportedTypes.join(", "),
                    suppliedType: compendium.metadata.type
                }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }

        const compendiumContentsByItemUUid = await this.documentManager
            .loadItemDataForDocumentsByUuid(compendium.contents.map(item => item.uuid));
        const compendiumContents = Array.from(compendiumContentsByItemUUid.values());

        const contentWithErrors = compendiumContents.filter(itemData => itemData.hasErrors);

        if (contentWithErrors.length > 0) {
            const message = this.localizationService.format(
                `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.compendium.invalidItemData`,
                {
                    itemIdsWithErrors: contentWithErrors.map(itemData => itemData.uuid).join(", "),
                    compendiumId
                }
            );
            this.notificationService.error(message);
            throw new Error(message);
        }

        const existingComponentsById = await this.getAllByCraftingSystemId(craftingSystemId);
        const existingComponentUuids = Array.from(existingComponentsById.values())
            .map(component => component.itemUuid);
        const newComponentUuids = compendium.contents
            .filter(item => !existingComponentUuids.includes(item.uuid))
            .map(item => item.uuid);

        return this.createMany({ craftingSystemId, itemUuids: newComponentUuids });

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
        const assignedIds = await this.componentStore.listAllEntityIds();
        const clone = source.clone({
            id: this.identityFactory.make(assignedIds)
        });
        return this.save(clone);
    }

    async create(componentCreationOptions: ComponentCreationOptions): Promise<Component> {

        const assignedIds = await this.componentStore.listAllEntityIds();
        const id = this.identityFactory.make(assignedIds);
        const componentJson = this.buildComponentJson(id, componentCreationOptions);

        const component = await this.componentStore.buildEntity(componentJson);

        return this.save(component);

    }

    async createMany({
         itemUuids = [],
         craftingSystemId,
         componentOptionsByItemUuid = new Map(),
     }: {
        itemUuids: string[];
        craftingSystemId: string;
        componentOptionsByItemUuid?: Map<string, ComponentCreationOptions>
    }): Promise<Component[]> {

        if (itemUuids.length === 0) {
            return [];
        }

        const assignedIds = await this.componentStore.listAllEntityIds();
        const components = await Promise.all(itemUuids
            .map(itemUuid => {
                const componentOptions = componentOptionsByItemUuid.get(itemUuid) || {};
                return this.buildComponentJson(this.identityFactory.make(assignedIds), {
                    ...componentOptions,
                    itemUuid,
                    craftingSystemId
                });
            })
            .map(componentJson => this.componentStore.buildEntity(componentJson)));

        return this.saveAll(components);

    }

    private buildComponentJson(
        id: string,
        {
            essences = {},
            itemUuid,
            disabled = false,
            salvageOptions = [],
            craftingSystemId
        }: ComponentCreationOptions): ComponentJson {

        const mappedSalvageOptions = salvageOptions.reduce((result, salvageOption) => {
            const optionId = this.identityFactory.make();
            result[optionId] = {
                id: optionId,
                ...salvageOption
            };
            return result;
        }, <Record<string, SalvageOptionJson>>{});

        return {
            id,
            embedded: false,
            craftingSystemId: craftingSystemId,
            itemUuid: itemUuid,
            essences: essences,
            disabled: disabled,
            salvageOptions: mappedSalvageOptions
        };

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

    async insert({
        id,
        disabled = false,
        essences = {},
        craftingSystemId,
        itemUuid,
        salvageOptions = []
     }: ComponentExportModel): Promise<Component> {
        const salvageOptionsRecord = salvageOptions
            .reduce((result, salvageOption) => {
                result[salvageOption.id] = {
                    ...salvageOption
                };
            return result;
        }, <Record<string, SalvageOptionJson>>{});
        const componentJson = {
            id,
            craftingSystemId,
            itemUuid,
            disabled,
            essences,
            embedded: false,
            salvageOptions: salvageOptionsRecord,
        }
        const component = await this.componentStore.buildEntity(componentJson);
        return this.save(component);
    }

    async insertMany(componentImportData: ComponentExportModel[]): Promise<Component[]> {
        return Promise.all(componentImportData.map(component => this.insert(component)));
    }

    async cloneAll(sourceComponents: Component[],
             targetCraftingSystemId?: string,
             substituteEssenceIds: Map<string, string> = new Map()
    ): Promise<{ components: Component[]; idLinks: Map<string, string> }> {

        const assignedComponentIds = await this.componentStore.listAllEntityIds();
        const newComponentIdsBySourceComponentId = sourceComponents
            .map(sourceComponent => {
                const newId = this.identityFactory.make(assignedComponentIds);
                return [sourceComponent.id, newId]
            })
            .reduce((result, [sourceId, newId]) => {
                result.set(sourceId, newId);
                return result;
            }, new Map<string, string>());

        const cloneData = sourceComponents
            .map(sourceComponent => {
                const newId = newComponentIdsBySourceComponentId.get(sourceComponent.id);
                if (!newId) {
                    throw new Error(`Failed to find new id for source component id ${sourceComponent.id}`);
                }
                const clonedComponent = sourceComponent.clone({
                    id: newId,
                    craftingSystemId: targetCraftingSystemId,
                    substituteEssenceIds
                });
                return {
                    component: clonedComponent,
                    sourceId: sourceComponent.id,
                }
            })
            .reduce(
                (result, currentValue) => {
                    result.ids.set(currentValue.sourceId, currentValue.component.id);
                    result.components.push(currentValue.component);
                    return result;
                },
                {
                    ids: new Map<string, string>,
                    components: <Component[]>[],
                }
            );

        const savedClones = await this.saveAll(cloneData.components);

        return {
            components: savedClones,
            idLinks: cloneData.ids,
        };
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
                const firstMatchingSalvage = component.salvageOptions.all
                    .map(salvageOption => salvageOption.value.products)
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
            `${DefaultComponentAPI._LOCALIZATION_PATH}.component.${activityName}`,
            { componentName: component.name }
        );
        this.notificationService.info(message);

        return component;
    }

    private async rejectSavingInvalidComponent(component: Component): Promise<EntityValidationResult<Component>> {
        const existingComponentIds = await this.componentStore.listAllEntityIds();
        const existingComponentsForCraftingSystem = await this.getAllByCraftingSystemId(component.craftingSystemId);
        const existingComponentsIdsForItem = Array.from(existingComponentsForCraftingSystem.values())
            .filter(other => other.itemUuid === component.itemUuid)
            .map(other => other.id);
        const validationResult = await this.componentValidator.validate(component, existingComponentIds, existingComponentsIdsForItem);
        if (validationResult.successful) {
            return validationResult;
        }
        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.invalid`,
            {
                errors: validationResult.errors.join(", "),
                componentId: component.id
            }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    private rejectModifyingEmbeddedComponent(component: Component): void {
        if (!component?.isEmbedded) {
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
        if (!componentToDelete?.isEmbedded) {
            return;
        }
        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.cannotDeleteEmbedded`,
            { componentName: componentToDelete.name }
        );
        this.notificationService.error(message);
        throw new Error(message);
    }

    async saveAll(components: Component[]) {

        const existing = await this.componentStore.getAllById(components.map(component => component.id));
        existing.forEach(existingComponent => this.rejectModifyingEmbeddedComponent(existingComponent));

        const validations = components.map(component => this.rejectSavingInvalidComponent(component));
        await Promise.all(validations)
            .catch(() => {
                const message = this.localizationService.localize(
                    `${DefaultComponentAPI._LOCALIZATION_PATH}.errors.component.noneSaved`
                );
                this.notificationService.error(message);
                throw new Error(message);
            });

        await this.componentStore.insertAll(components);

        const message = this.localizationService.format(
            `${DefaultComponentAPI._LOCALIZATION_PATH}.component.savedAll`,
            {count: components.length}
        );
        this.notificationService.info(message);

        return components;

    }

}

export { DefaultComponentAPI };
