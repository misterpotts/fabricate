import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {EssenceApi} from "../../../src/scripts/api/EssenceApi";
import {Essence} from "../../../src/scripts/crafting/essence/Essence";
import {StubIdentityFactory} from "../foundry/StubIdentityFactory";

class StubEssenceApi implements EssenceApi {

    private readonly identityFactory: IdentityFactory;
    private readonly valuesById: Map<string, Essence>;

    constructor({
        identityFactory = new StubIdentityFactory(),
        valuesById = new Map()
    }: {
        identityFactory?: IdentityFactory;
        valuesById?: Map<string, Essence>
    } = {}) {
        this.identityFactory = identityFactory;
        this.valuesById = valuesById;
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>> {
        return new Map(Array.from(this.valuesById.values())
            .filter(essence => essence.craftingSystemId === craftingSystemId)
            .map(essence => [essence.id, essence]));
    }

    async getById(id: string): Promise<Essence | undefined> {
        return this.valuesById.get(id);
    }

    async getAll(): Promise<Map<string, Essence>> {
        return this.valuesById;
    }

}

export { StubEssenceApi }