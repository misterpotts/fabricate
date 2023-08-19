import {CraftingSystemAPI, CraftingSystemImportData} from "../../../src/scripts/api/CraftingSystemAPI";
import {CraftingSystem} from "../../../src/scripts/system/CraftingSystem";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {CraftingSystemDetails} from "../../../src/scripts/system/CraftingSystemDetails";
import {StubIdentityFactory} from "../foundry/StubIdentityFactory";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";

class StubCraftingSystemApi implements CraftingSystemAPI {

    private readonly identityFactory: IdentityFactory;

    private readonly valuesById: Map<string, CraftingSystem>;

    constructor({
        identityFactory = new StubIdentityFactory(),
        valuesById = new Map()
    }: {
        identityFactory?: IdentityFactory;
        valuesById?: Map<string, CraftingSystem>
    } = {}) {
        this.identityFactory = identityFactory;
        this.valuesById = valuesById;
    }

    cloneById(_craftingSystemId: string): Promise<CraftingSystem> {
        throw new Error("Not implemented by this stub");
    }

    insert(_craftingSystemData: CraftingSystemImportData): Promise<CraftingSystem> {
        throw new Error("Not implemented by this stub");
    }

    async create(): Promise<CraftingSystem> {
        return new CraftingSystem({
            id: this.identityFactory.make(),
            craftingSystemDetails: new CraftingSystemDetails({
                name: "Crafting system name",
                summary: "Crafting system summary",
                description: "Crafting system description",
                author: "No author"
            }),
            disabled: false
        });
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    async deleteById(id: string): Promise<CraftingSystem | undefined> {
        const value = await this.getById(id);;
        this.valuesById.delete(id);
        return value;
    }

    async getAllForGameSystem(): Promise<Map<string, CraftingSystem>> {
        return new Map(this.valuesById);
    }

    async getById(id: string): Promise<CraftingSystem | undefined> {
        return this.valuesById.get(id);
    }

    async getAll(): Promise<Map<string, CraftingSystem>> {
        return new Map(this.valuesById);
    }

    async save(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        this.valuesById.set(craftingSystem.id, craftingSystem);
        return craftingSystem;
    }

}

export { StubCraftingSystemApi }