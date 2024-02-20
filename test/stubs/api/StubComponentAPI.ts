import {Component} from "../../../src/scripts/crafting/component/Component";
import {ComponentAPI, ComponentCreationOptions} from "../../../src/scripts/api/ComponentAPI";
import {NotificationService} from "../../../src/scripts/foundry/NotificationService";
import {ComponentExportModel} from "../../../src/scripts/repository/import/FabricateExportModel";

class StubComponentAPI implements ComponentAPI {

    private static readonly _USE_REAL_INSTEAD_MESSAGE = "Complex operations with real behaviour are not implemented by stubs. Should you be using the real thing instead?";

    private readonly _valuesById: Map<string, Component>;

    constructor({
        valuesById = new Map(),
    }: {
        valuesById?: Map<string, Component>;
    } = {}) {
        this._valuesById = valuesById;
    }

    createMany(_options: { itemUuids: string[]; craftingSystemId: string; componentOptionsByItemUuid?: Map<string, ComponentCreationOptions>; }): Promise<Component[]> {
        throw new Error("Method not implemented.");
    }
    importCompendium(_options: { craftingSystemId: string; compendiumId: string; }): Promise<Component[]> {
        throw new Error("Method not implemented.");
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
        idLinks: Map<string, string>;
    }> {
        throw new Error(StubComponentAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    insert(_componentData: ComponentExportModel): Promise<Component> {
        throw new Error(StubComponentAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    insertMany(_componentData: ComponentExportModel[]): Promise<Component[]> {
        throw new Error(StubComponentAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async saveAll(components: Component[]): Promise<Component[]> {
        components.forEach(component => this._valuesById.set(component.id, component));
        return components;
    }

    async getAllByCraftingSystemId(craftingSystemId: string): Promise<Map<string, Component>> {
        return new Map(Array.from(this._valuesById.values())
            .filter(component => component.craftingSystemId === craftingSystemId)
            .map(component => [component.id, component]));
    }

    async getById(id: string): Promise<Component | undefined> {
        return this._valuesById.get(id);
    }

    cloneById(_componentId: string): Promise<Component> {
        throw new Error(StubComponentAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async create(componentOptions: ComponentCreationOptions): Promise<Component> {
        const result = Array.from(this._valuesById.values())
            .find(component =>
                component.craftingSystemId === componentOptions.craftingSystemId
                && component.itemUuid === componentOptions.itemUuid
            );
        if (result) {
            return result;
        }
        throw new Error(`No component with crafting system id ${componentOptions.craftingSystemId} and item uuid ${componentOptions.itemUuid} was configured for this stub. Make sure to provide all expected components in the constructor.`);
    }

    async deleteByCraftingSystemId(craftingSystemId: string): Promise<Component[]> {
        const componentsToDelete = Array.from(this._valuesById.values())
            .filter(component => component.craftingSystemId === craftingSystemId)
        componentsToDelete.forEach(component => this._valuesById.delete(component.id));
        return componentsToDelete;
    }

    async deleteById(componentId: string): Promise<Component | undefined> {
        const result = this._valuesById.get(componentId);
        this._valuesById.delete(componentId);
        return result;
    }

    async deleteByItemUuid(componentId: string): Promise<Component[]> {
        const componentsToDelete = Array.from(this._valuesById.values())
            .filter(component => component.itemUuid === componentId)
        componentsToDelete.forEach(component => this._valuesById.delete(component.id));
        return componentsToDelete;
    }

    async getAll(): Promise<Map<string, Component>> {
        return new Map(this._valuesById);
    }

    async getAllById(componentIds: string[]): Promise<Map<string, Component | undefined>> {
        return componentIds.reduce((result, componentId) => {
            result.set(componentId, this._valuesById.get(componentId));
            return result;
        }, new Map<string, Component | undefined>());
    }

    async getAllByItemUuid(itemUuid: string): Promise<Map<string, Component>> {
        return Array.from(this._valuesById.values())
            .filter(component => component.itemUuid === itemUuid)
            .reduce((result, component) => {
                result.set(component.id, component);
                return result;
            }, new Map<string, Component>());
    }

    async removeEssenceReferences(_essenceId: string, _craftingSystemId: string): Promise<Component[]> {
        throw new Error(StubComponentAPI._USE_REAL_INSTEAD_MESSAGE);
    }

    async save(component: Component): Promise<Component> {
        this._valuesById.set(component.id, component);
        return component;
    }

    async removeSalvageReferences(_componentId: string, _craftingSystemId: string): Promise<Component[]> {
        throw new Error(StubComponentAPI._USE_REAL_INSTEAD_MESSAGE);
    }

}

export { StubComponentAPI }