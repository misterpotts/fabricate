import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {Readable, Subscriber, Updater, writable, Writable} from "svelte/store";
import {Component} from "../../scripts/crafting/component/Component";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";

class ComponentsStore implements Writable<Component[]> {

    private readonly _craftingComponents: Writable<Component[]>;
    private readonly _fabricateAPI: FabricateAPI;

    constructor({
        fabricateAPI,
        selectedCraftingSystem,
        initialValue,
    }: {
        fabricateAPI: FabricateAPI;
        selectedCraftingSystem: Readable<CraftingSystem>;
        initialValue: Component[];
    }) {
        this._fabricateAPI = fabricateAPI;
        this._craftingComponents = writable(initialValue);
        this.watchSelectedCraftingSystem(selectedCraftingSystem);
    }

    private watchSelectedCraftingSystem(selectedCraftingSystem: Readable<CraftingSystem>) {
        selectedCraftingSystem.subscribe((craftingSystem) => {
            if (!craftingSystem) {
                this._craftingComponents.set([]);
                return;
            }
            this._fabricateAPI.components.getAllByCraftingSystemId(craftingSystem.id)
                .then((components) => {
                    this._craftingComponents.set(Array.from(components.values()));
                });
        });
    }

    public subscribe(subscriber: Subscriber<Component[]>) {
        return this._craftingComponents.subscribe(subscriber);
    }

    set(value: Component[]): void {
        this._craftingComponents.set(value);
    }

    update(updater: Updater<Component[]>): void {
        this._craftingComponents.update(updater);
    }

    insert(component: Component) {
        this._craftingComponents.update((components) => {
            const index = components.findIndex((candidate) => candidate.id === component.id);
            if (index === -1) {
                components.push(component);
                return components;
            }
            components[index] = component;
            return components;
        });
    }

    remove(component: Component) {
        this._craftingComponents.update((components) => {
            const index = components.findIndex((candidate) => candidate.id === component.id);
            if (index === -1) {
                return components;
            }
            components.splice(index, 1);
            return components;
        });
    }

}

export { ComponentsStore }