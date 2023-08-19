import {Component} from "../../../src/scripts/crafting/component/Component";
import {ComponentAPI, ComponentCreationOptions} from "../../../src/scripts/api/ComponentAPI";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {StubIdentityFactory} from "../foundry/StubIdentityFactory";
import {StubDocumentManager} from "../StubDocumentManager";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";
import {ComponentExportModel} from "../../../src/scripts/repository/import/FabricateExportModel";

class StubComponentApi implements ComponentAPI {

    private readonly identityFactory: IdentityFactory;
    private readonly stubDocumentManager: StubDocumentManager;
    private readonly valuesById: Map<string, Component>;

    constructor({
        identityFactory = new StubIdentityFactory(),
        valuesById = new Map(),
        stubDocumentManager = new StubDocumentManager()
    }: {
        identityFactory?: IdentityFactory;
        valuesById?: Map<string, Component>;
        stubDocumentManager?: StubDocumentManager;
    } = {}) {
        this.identityFactory = identityFactory;
        this.valuesById = valuesById;
        this.stubDocumentManager = stubDocumentManager;
    }

    get notifications(): NotificationService {
        throw new Error("This is a stub. Stubs do not provide user interface notifications. ");
    }

    cloneAll(
        _sourceComponents: Component[],
        _targetCraftingSystemId?: string,
        _substituteEssenceIds?: Map<string, string>
    ): Promise<{
        components: Component[];
        idLinks: Map<string, string>
    }> {
        throw new Error("Not implemented by this stub");
    }

    insert(_componentData: ComponentExportModel): Promise<Component> {
        throw new Error("Not implemented by this stub");
    }

    insertMany(_componentData: ComponentExportModel[]): Promise<Component[]> {
        throw new Error("Not implemented by this stub");
    }

    saveAll(_components: Component[]): Promise<Component[]> {
        throw new Error("Not implemented by this stub");
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>> {
        return new Map(Array.from(this.valuesById.values())
            .filter(component => component.craftingSystemId === craftingSystemId)
            .map(component => [component.id, component]));
    }

    async getById(id: string): Promise<Component | undefined> {
        return this.valuesById.get(id);
    }

    cloneById(_componentId: string): Promise<Component> {
        throw new Error("Not implemented by this stub");
    }

    async create(componentOptions: ComponentCreationOptions): Promise<Component> {
        const itemData = await this.stubDocumentManager.loadItemDataByDocumentUuid(componentOptions.itemUuid);
        return new Component({
            id: this.identityFactory.make(),
            craftingSystemId: componentOptions.craftingSystemId,
            itemData,
            disabled: componentOptions.disabled
        });
    }

    deleteByCraftingSystemId(_craftingSystemId: string): Promise<Component[]> {
        throw new Error("Not implemented by this stub");
    }

    deleteById(_componentId: string): Promise<Component | undefined> {
        throw new Error("Not implemented by this stub");
    }

    deleteByItemUuid(_componentId: string): Promise<Component[]> {
        throw new Error("Not implemented by this stub");
    }

    getAll(): Promise<Map<string, Component>> {
        throw new Error("Not implemented by this stub");
    }

    getAllById(_componentIds: string[]): Promise<Map<string, Component | undefined>> {
        throw new Error("Not implemented by this stub");
    }

    getAllByItemUuid(_itemUuid: string): Promise<Map<string, Component>> {
        throw new Error("Not implemented by this stub");
    }

    removeEssenceReferences(_essenceId: string, _craftingSystemId: string): Promise<Component[]> {
        throw new Error("Not implemented by this stub");
    }

    save(_component: Component): Promise<Component> {
        throw new Error("Not implemented by this stub");
    }

    removeSalvageReferences(_componentId: string, _craftingSystemId: string): Promise<Component[]> {
        return Promise.resolve([]);
    }

}

export { StubComponentApi }