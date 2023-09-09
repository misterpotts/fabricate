import {EssenceAPI, EssenceCreationOptions} from "../../../src/scripts/api/EssenceAPI";
import {Essence} from "../../../src/scripts/crafting/essence/Essence";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";
import {EssenceExportModel} from "../../../src/scripts/repository/import/FabricateExportModel";

class StubEssenceAPI implements EssenceAPI {

    private static readonly _USE_REAL_INSTEAD_MESSAGE = "Complex operations with real behaviour are not implemented by stubs. Should you be using the real thing instead?";
    
    private readonly _valuesById: Map<string, Essence>;

    constructor({
        valuesById = new Map()
    }: {
        valuesById?: Map<string, Essence>
    } = {}) {
        this._valuesById = valuesById;
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    cloneAll(
        _sourceEssences: Essence[],
        _targetCraftingSystemId?: string
    ): Promise<{
        essences: Essence[];
        idLinks: Map<string, string>
    }> {
        throw new Error(StubEssenceAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    insert(_essenceData: EssenceExportModel): Promise<Essence> {
        throw new Error(StubEssenceAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    insertMany(_essenceData: EssenceExportModel[]): Promise<Essence[]> {
        throw new Error(StubEssenceAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    saveAll(essences: Essence[]): Promise<Essence[]> {
        essences.forEach(essence => this._valuesById.set(essence.id, essence));
        return Promise.resolve(essences);
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Essence>> {
        return Array.from(this._valuesById.values())
            .filter(essence => essence.craftingSystemId === craftingSystemId)
            .reduce((map, essence) => {
                map.set(essence.id, essence);
                return map;
            }, new Map<string, Essence>());
    }

    async getById(id: string): Promise<Essence | undefined> {
        return this._valuesById.get(id);
    }

    async getAll(): Promise<Map<string, Essence>> {
        return new Map(this._valuesById);
    }

    async create(essenceCreationOptions: EssenceCreationOptions): Promise<Essence> {
        const result = Array.from(this._valuesById.values())
            .find(essence =>
                essence.craftingSystemId === essenceCreationOptions.craftingSystemId
                && essence.name === essenceCreationOptions.name
            );
        if (result) {
            return result;
        }
        throw new Error(`No essence with crafting system id ${essenceCreationOptions.craftingSystemId} and name ${essenceCreationOptions.name} was configured for this stub. Make sure to provide all expected essences in the constructor.`);
    }

    async deleteById(id: string): Promise<Essence | undefined> {
        const deleted = this._valuesById.get(id);
        this._valuesById.delete(id);
        return deleted;
    }

    async deleteByItemUuid(itemUuid: string): Promise<Essence[]> {
        const essencesToDelete = Array.from(this._valuesById.values())
            .filter(essence => essence.activeEffectSource.uuid === itemUuid)
        essencesToDelete.forEach(essence => this._valuesById.delete(essence.id));
        return essencesToDelete;
    }

    async getAllById(essenceIds: string[]): Promise<Map<string, Essence | undefined>> {
        return essenceIds.reduce((result, essenceId) => {
            result.set(essenceId, this._valuesById.get(essenceId));
            return result;
        }, new Map<string, Essence | undefined>());
    }

    async save(essence: Essence): Promise<Essence> {
        this._valuesById.set(essence.id, essence);
        return essence;
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Essence[]> {
        const essencesToDelete = Array.from(this._valuesById.values())
            .filter(essence => essence.craftingSystemId === craftingSystemId)
        essencesToDelete.forEach(essence => this._valuesById.delete(essence.id));
        return essencesToDelete;
    }

}

export { StubEssenceAPI }