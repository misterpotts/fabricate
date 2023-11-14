import {Readable, Subscriber, Unsubscriber, writable, Writable} from "svelte/store";
import {Component} from "../../scripts/crafting/component/Component";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";

class ComponentsStore implements Readable<Map<string, Component>> {

    private readonly _components: Writable<Map<string, Component>>;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        components = new Map<string, Component>(),
    }: {
        fabricateAPI: FabricateAPI;
        components?: Map<string, Component>;
    }) {
        this._fabricateAPI = fabricateAPI;
        this._components = writable(components);
    }

    public async loadAll() {
        const allComponentsById = await this._fabricateAPI.components.getAll();
        const allComponentsLoaded = await Promise.all(Array.from(allComponentsById.values()).map(component => component.load()));
        allComponentsLoaded.forEach((component) => {
            allComponentsById.set(component.id, component);
        });
        this._components.set(allComponentsById);
    }

    public async add(component: Component) {
        const loadedComponent = await component.load(true);
        this._components.update((storedComponents) => {
            storedComponents.set(loadedComponent.id, loadedComponent);
            return storedComponents;
        });
    }

    public async addAll(componentsToAdd: Component[]) {
        const loadedComponents = await Promise.all(componentsToAdd.map(component => component.load(true)));
        this._components.update((storedComponents) => {
            loadedComponents.forEach((component) => {
                storedComponents.set(component.id, component);
            });
            return storedComponents;
        });
    }

    public async remove(component: Component) {
        this._components.update((storedComponents) => {
            storedComponents.delete(component.id);
            return storedComponents;
        });
    }

    public async removeAll(componentsToDelete: Component[]) {
        this._components.update((storedComponents) => {
            componentsToDelete.forEach((component) => {
                storedComponents.delete(component.id);
            });
            return storedComponents;
        });
    }

    subscribe(subscriber: Subscriber<Map<string, Component>>): Unsubscriber {
        return this._components.subscribe(subscriber);
    }

}

export { ComponentsStore }