import {get, Readable, Subscriber, Updater, writable, Writable} from "svelte/store";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";

class SelectedCraftingComponentStore {

    private readonly _selectedCraftingComponent: Writable<CraftingComponent>;

    constructor({
        craftingComponents,
        selectedComponent
    }: {
        craftingComponents: Readable<CraftingComponent[]>;
        selectedComponent?: CraftingComponent;
    }) {
        this._selectedCraftingComponent = writable(selectedComponent);
        this.deselectOrUpdateWhenAvailableComponentsChange(craftingComponents);
    }

    private deselectOrUpdateWhenAvailableComponentsChange(craftingComponents: Readable<CraftingComponent[]>) {
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

    public subscribe(subscriber: Subscriber<CraftingComponent>) {
        return this._selectedCraftingComponent.subscribe(subscriber);
    }

    public set(value: CraftingComponent) {
        return this._selectedCraftingComponent.set(value);
    }

    public update(updater: Updater<CraftingComponent>) {
        this._selectedCraftingComponent.update(updater);
    }

}

export { SelectedCraftingComponentStore }