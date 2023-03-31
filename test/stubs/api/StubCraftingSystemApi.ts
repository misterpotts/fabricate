import {CraftingSystemApi} from "../../../src/scripts/api/CraftingSystemApi";
import {CraftingSystem, UserDefinedCraftingSystem} from "../../../src/scripts/system/CraftingSystem";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {CraftingSystemDetails} from "../../../src/scripts/system/CraftingSystemDetails";

class StubCraftingSystemApi implements CraftingSystemApi {

    private readonly _identityFactory: IdentityFactory;
    private readonly _notifications: NotificationService;

    constructor({ identityFactory, notifications }: { identityFactory: IdentityFactory; notifications: NotificationService }) {
        this._identityFactory = identityFactory;
        this._notifications = notifications;
    }

    async create(): Promise<CraftingSystem> {
        return new UserDefinedCraftingSystem({
            id: this._identityFactory.make(),
            craftingSystemDetails: new CraftingSystemDetails({
                name: "Crafting system name",
                summary: "Crafting system summary",
                description: "Crafting system description",
                author: "No author"
            }),
            enabled: false
        });
    }

    get notifications(): NotificationService {
        return this._notifications;
    }

    deleteById(id: string): Promise<CraftingSystem | undefined> {
        return Promise.resolve(undefined);
    }

    getAll(): Promise<Map<string, CraftingSystem>> {
        return Promise.resolve(undefined);
    }

    getById(id: string): Promise<CraftingSystem | undefined> {
        return Promise.resolve(undefined);
    }

    save(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        return Promise.resolve(undefined);
    }

}

export { StubCraftingSystemApi }