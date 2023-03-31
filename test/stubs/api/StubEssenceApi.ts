import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {EssenceApi} from "../../../src/scripts/api/EssenceApi";
import {Essence} from "../../../src/scripts/crafting/essence/Essence";

class StubEssenceApi implements EssenceApi {

    private readonly _identityFactory: IdentityFactory;
    private readonly _notifications: NotificationService;

    constructor({ identityFactory, notifications }: { identityFactory: IdentityFactory; notifications: NotificationService }) {
        this._identityFactory = identityFactory;
        this._notifications = notifications;
    }

    get notifications(): NotificationService {
        return this._notifications;
    }

    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>> {
        return Promise.resolve(undefined);
    }

    getById(id: string): Promise<Essence | undefined> {
        return Promise.resolve(undefined);
    }


}

export { StubEssenceApi }