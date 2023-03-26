import {Essence, EssenceJson} from "../crafting/essence/Essence";
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

}

export { EssenceApi };

class DefaultEssenceApi implements EssenceApi {

    getById(id: string): Promise<Essence | undefined> {
        return Promise.resolve(undefined);
    }

}

export { DefaultEssenceApi };
