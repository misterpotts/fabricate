import {Essence} from "../crafting/essence/Essence";
interface EssenceApi {

    /**
     * Retrieves the essence with the specified ID.
     *
     * @async
     * @param {string} id - The ID of the essence to retrieve.
     * @returns {Promise<Essence | undefined>} A Promise that resolves with the essence, or undefined if it does not
     *  exist.
     */
    getById(id: string): Promise<Essence | undefined>;

    /**
     * Returns all essences.
     *
     * @async
     * @returns {Promise<Map<string, Essence>>} A Promise that resolves to a Map of all essences, where the keys are
     *   the essence IDs, or rejects with an Error if the settings cannot be read.
     */
    getAll(): Promise<Map<string, Essence>>;

    /**
     * Returns all essences for a given crafting system ID.
     *
     * @async
     * @param {string} craftingSystemId - The ID of the crafting system.
     * @returns {Promise<Map<string, Recipe>>} A Promise that resolves to a Map of essence instances for the given
     * crafting system, where the keys are the essence IDs, or rejects with an Error if the settings cannot be read.
     */
    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>>;

}

export { EssenceApi };

class DefaultEssenceApi implements EssenceApi {

    getById(id: string): Promise<Essence | undefined> {
        return Promise.resolve(undefined);
    }

}

export { DefaultEssenceApi };
