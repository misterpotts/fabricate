import {Component} from "../../../src/scripts/crafting/component/Component";
import {ComponentAPI, ComponentOptions} from "../../../src/scripts/api/ComponentAPI";
import {IdentityFactory} from "../../../src/scripts/foundry/IdentityFactory";
import {StubIdentityFactory} from "../foundry/StubIdentityFactory";
import {StubDocumentManager} from "../StubDocumentManager";

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

    async create(componentOptions: ComponentOptions): Promise<Component> {
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

}

export { StubComponentApi }