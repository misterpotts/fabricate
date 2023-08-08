import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {EssenceAPI, EssenceCreationOptions} from "../../../src/scripts/api/EssenceAPI";
import {Essence} from "../../../src/scripts/crafting/essence/Essence";
import {StubIdentityFactory} from "../foundry/StubIdentityFactory";
import {PendingFabricateItemData} from "../../../src/scripts/foundry/DocumentManager";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";
import {EssenceExportModel} from "../../../src/scripts/repository/import/FabricateExportModel";

class StubEssenceApi implements EssenceAPI {

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

    cloneAll(
        _sourceEssences: Essence[],
        _targetCraftingSystemId?: string
    ): Promise<{
        essences: Essence[];
        idLinks: Map<string, string>
    }> {
        throw new Error("Not implemented by this stub");
    }

    insert(_essenceData: EssenceExportModel): Promise<Essence> {
        throw new Error("Not implemented by this stub");
    }

    insertMany(_essenceData: EssenceExportModel[]): Promise<Essence[]> {
        throw new Error("Not implemented by this stub");
    }

    saveAll(_essences: Essence[]): Promise<Essence[]> {
        throw new Error("Not implemented by this stub");
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

    async create({
           name,
           tooltip,
           iconCode,
           description,
           activeEffectSourceItemUuid,
           craftingSystemId,
   }: EssenceCreationOptions): Promise<Essence> {
        return new Essence({
            id: this.identityFactory.make(Array.from(this.valuesById.keys())),
            name,
            tooltip,
            iconCode,
            description,
            craftingSystemId,
            activeEffectSource: new PendingFabricateItemData(activeEffectSourceItemUuid, () => undefined)
        });
    }

    async deleteById(id: string): Promise<Essence | undefined> {
        const deleted = this.valuesById.get(id);
        this.valuesById.delete(id);
        return deleted;
    }

    async deleteByItemUuid(itemUuid: string): Promise<Essence[]> {
        const deleted: Essence[] = [];
        this.valuesById.forEach((essence, id) => {
            if (essence.activeEffectSource?.uuid === itemUuid) {
                this.valuesById.delete(id);
                deleted.push(essence);
            }
        });
        return deleted;
    }

    async getAllById(essenceIds: string[]): Promise<Map<string, Essence | undefined>> {
        const result = new Map<string, Essence | undefined>();
        essenceIds.forEach(id => {
            result.set(id, this.valuesById.get(id));
        });
        return result;
    }

    async save(essence: Essence): Promise<Essence> {
        this.valuesById.set(essence.id, essence);
        return essence;
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Essence[]> {
        const deleted: Essence[] = [];
        this.valuesById.forEach((essence, id) => {
            if (essence.craftingSystemId === craftingSystemId) {
                this.valuesById.delete(id);
                deleted.push(essence);
            }
        });
        return deleted;
    }

}

export { StubEssenceApi }