import {CraftingSystemAPI, CraftingSystemImportData} from "../../../src/scripts/api/CraftingSystemAPI";
import {CraftingSystem, DefaultCraftingSystem} from "../../../src/scripts/crafting/system/CraftingSystem";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";

class StubCraftingSystemAPI implements CraftingSystemAPI {

    private static readonly _USE_REAL_INSTEAD_MESSAGE = "Complex operations with real behaviour are not implemented by stubs. Should you be using the real thing instead?";

    private readonly _valuesById: Map<string, DefaultCraftingSystem>;

    constructor({
                    valuesById = new Map()
                }: {
        valuesById?: Map<string, DefaultCraftingSystem>;
    } = {}) {
        this._valuesById = valuesById;
    }

    getAllById(_ids: string[]): Promise<Map<string, CraftingSystem>> {
        throw new Error("Method not implemented.");
    }

    cloneById(_craftingSystemId: string): Promise<DefaultCraftingSystem> {
        throw new Error(StubCraftingSystemAPI._USE_REAL_INSTEAD_MESSAGE)
    }

    insert(_craftingSystemData: CraftingSystemImportData): Promise<DefaultCraftingSystem> {
        throw new Error(StubCraftingSystemAPI._USE_REAL_INSTEAD_MESSAGE)
    }

    async create(craftingSystemConfig: { name?: string, summary?: string, description?: string, author?: string }): Promise<DefaultCraftingSystem> {
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

    async deleteById(id: string): Promise<DefaultCraftingSystem | undefined> {
        const value = await this.getById(id);
        this._valuesById.delete(id);
        return value;
    }

    async getAllForGameSystem(): Promise<Map<string, DefaultCraftingSystem>> {
        return new Map(this._valuesById);
    }

    async getById(id: string): Promise<DefaultCraftingSystem | undefined> {
        return this._valuesById.get(id);
    }

    async getAll(): Promise<Map<string, DefaultCraftingSystem>> {
        return new Map(this._valuesById);
    }

    async save(craftingSystem: DefaultCraftingSystem): Promise<DefaultCraftingSystem> {
        this._valuesById.set(craftingSystem.id, craftingSystem);
        return craftingSystem;
    }

}

export { StubCraftingSystemAPI }