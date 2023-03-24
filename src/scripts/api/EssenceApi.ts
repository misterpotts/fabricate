import {Essence, EssenceJson} from "../common/Essence";

interface EssenceApi {
    create(craftingSystemId: string, essenceJson: EssenceJson): Promise<Essence>;
}

export { EssenceApi };

class DefaultEssenceApi implements EssenceApi {
    create(craftingSystemId: string, essenceJson: EssenceJson): Promise<Essence> {
        return Promise.resolve(undefined);
    }
}

export { DefaultEssenceApi };
