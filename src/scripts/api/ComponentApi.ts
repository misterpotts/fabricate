import {Component, ComponentJson} from "../crafting/component/Component";

interface ComponentData {

    componentIdsByItemUuid: Record<string, string[]>;
    componentIdsByCraftingSystemId: Record<string, string[]>;
    componentsById: Record<string, ComponentJson>;

}

export { ComponentData }

/**
 * Dictionary of the salvage amounts for a salvage option. The dictionary is keyed on the component ID and with
 * the values representing the quantities produced.
 * */
type SalvageOptionJson = Record<string, number>;

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
     * Optional dictionary of salvage options for the component, keyed on the option name.
     * */
    salvageOptions?: Record<string, SalvageOptionJson>;

}

export { ComponentOptions }

interface ComponentApi {

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
     *
     * Removes all references to the specified essence from all components within the specified crafting system.
     * @async
     * @param {string} essenceId - The ID of the essence to remove references to.
     * @param {string} craftingSystemId - The ID of the crafting system containing the components to modify.
     * @returns {Promise<Component[]>} A Promise that resolves with an array of all modified components that contain
     *  references to the removed essence, or an empty array if no modifications were made. If the specified
     *  crafting system has no components, the Promise will reject with an Error.
     */
    removeEssenceReferences(essenceId: string, craftingSystemId: string): Promise<Component[]>;

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

export { ComponentApi };
class DefaultComponentApi implements ComponentApi {

    get notifications(): NotificationService {
        return undefined;
    }

    cloneById(componentId: string): Promise<Component> {
        return Promise.resolve(undefined);
    }

    create(componentOptions: ComponentOptions): Promise<Component> {
        return Promise.resolve(undefined);
    }

    deleteByCraftingSystemId(craftingSystemId: string): Promise<Component[]> {
        return Promise.resolve([]);
    }

    deleteById(componentId: string): Promise<Component | undefined> {
        return Promise.resolve(undefined);
    }

    deleteByItemUuid(componentId: string): Promise<Component[]> {
        return Promise.resolve([]);
    }

    getAll(): Promise<Map<string, Component>> {
        return Promise.resolve(undefined);
    }

    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>> {
        return Promise.resolve(undefined);
    }

    getAllById(componentIds: string[]): Promise<Map<string, Component | undefined>> {
        return Promise.resolve(undefined);
    }

    getAllByItemUuid(itemUuid: string): Promise<Map<string, Component>> {
        return Promise.resolve(undefined);
    }

    getById(id: string): Promise<Component | undefined> {
        return Promise.resolve(undefined);
    }

    removeEssenceReferences(essenceId: string, craftingSystemId: string): Promise<Component[]> {
        return Promise.resolve([]);
    }

    save(component: Component): Promise<Component> {
        return Promise.resolve(undefined);
    }

}

export { DefaultComponentApi };
