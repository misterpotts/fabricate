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

}

export { ComponentApi };
class DefaultComponentApi implements ComponentApi {

    getById(id: string): Promise<Component | undefined> {
        return Promise.resolve(undefined);
    }

}

export { DefaultComponentApi };
