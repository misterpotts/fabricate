import {Component, ComponentJson} from "../crafting/component/Component";

interface ComponentApi {

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
     * Returns all components for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of component instances for the given
     * crafting system, where the keys are the component IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>>;

}

export { ComponentApi };
class DefaultComponentApi implements ComponentApi {

    getById(id: string): Promise<Component | undefined> {
        return Promise.resolve(undefined);
    }

}

export { DefaultComponentApi };
