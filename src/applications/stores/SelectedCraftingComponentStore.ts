import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";
import {Component} from "../../scripts/common/Component";

class SelectedCraftingComponentStore {

    private readonly _selectedCraftingComponent: Writable<Component>;

    constructor({
        craftingComponents,
        selectedComponent
    }: {
        craftingComponents: Readable<Component[]>;
        selectedComponent?: Component;
    }) {
        this._selectedCraftingComponent = writable(selectedComponent);
        this.deselectOrUpdateWhenAvailableComponentsChange(craftingComponents);
    }

    private deselectOrUpdateWhenAvailableComponentsChange(craftingComponents: Readable<Component[]>) {
        craftingComponents.subscribe(value => {
            if (!value) {
                throw new Error("Components may not be null");
            }
            if (value.length === 0) {
                this._selectedCraftingComponent.set(null);
            }
            const selectedComponent = get(this._selectedCraftingComponent);
            if (!selectedComponent) {
                return;
            }
            const found = value.find(component => component.id === selectedComponent.id);
            this._selectedCraftingComponent.set(found);
        });
    }

    public subscribe(subscriber: Subscriber<Component>) {
        return this._selectedCraftingComponent.subscribe(subscriber);
    }

    public set(value: Component) {
        return this._selectedCraftingComponent.set(value);
    }

    public update(updater: Updater<Component>) {
        this._selectedCraftingComponent.update(updater);
    }

}

export { SelectedCraftingComponentStore }