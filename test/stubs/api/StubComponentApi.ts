import {ComponentApi} from "../../../src/scripts/api/ComponentApi";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";

class StubComponentApi implements ComponentApi {

    private readonly _identityFactory: IdentityFactory;
    private readonly _notifications: NotificationService;

    constructor({ identityFactory, notifications }: { identityFactory: IdentityFactory; notifications: NotificationService }) {
        this._identityFactory = identityFactory;
        this._notifications = notifications;
    }

    get notifications(): NotificationService {
        return this._notifications;
    }

    getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>> {
        return Promise.resolve(undefined);
    }

    getById(id: string): Promise<Component | undefined> {
        return Promise.resolve(undefined);
    }

}

export { StubComponentApi }