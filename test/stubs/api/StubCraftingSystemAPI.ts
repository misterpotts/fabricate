import {CraftingSystemAPI, CraftingSystemImportData} from "../../../src/scripts/api/CraftingSystemAPI";
import {CraftingSystem} from "../../../src/scripts/system/CraftingSystem";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";

class StubCraftingSystemAPI implements CraftingSystemAPI {

    private static readonly _USE_REAL_INSTEAD_MESSAGE = "Complex operations with real behaviour are not implemented by stubs. Should you be using the real thing instead?";

    private readonly _valuesById: Map<string, CraftingSystem>;

    constructor({
        valuesById = new Map()
    }: {
        valuesById?: Map<string, CraftingSystem>;
    } = {}) {
        this._valuesById = valuesById;
    }

    cloneById(_craftingSystemId: string): Promise<CraftingSystem> {
        throw new Error(StubCraftingSystemAPI._USE_REAL_INSTEAD_MESSAGE)
    }

    insert(_craftingSystemData: CraftingSystemImportData): Promise<CraftingSystem> {
        throw new Error(StubCraftingSystemAPI._USE_REAL_INSTEAD_MESSAGE)
    }

    async create(craftingSystemConfig: { name?: string, summary?: string, description?: string, author?: string }): Promise<CraftingSystem> {
        const result = Array.from(this._valuesById.values())
            .find(craftingSystem => craftingSystem.details.name === craftingSystemConfig.name
                && craftingSystem.details.author === craftingSystemConfig.author);
        if (result) {
            return result;
        }
        throw new Error(`No crafting system with name ${craftingSystemConfig.name} and author ${craftingSystemConfig.author} was configured for this stub. Make sure to provide all expected crafting systems in the constructor.`);
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    async deleteById(id: string): Promise<CraftingSystem | undefined> {
        const value = await this.getById(id);
        this._valuesById.delete(id);
        return value;
    }

    async getAllForGameSystem(): Promise<Map<string, CraftingSystem>> {
        return new Map(this._valuesById);
    }

    async getById(id: string): Promise<CraftingSystem | undefined> {
        return this._valuesById.get(id);
    }

    async getAll(): Promise<Map<string, CraftingSystem>> {
        return new Map(this._valuesById);
    }

    async save(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        this._valuesById.set(craftingSystem.id, craftingSystem);
        return craftingSystem;
    }

}

export { StubCraftingSystemAPI }