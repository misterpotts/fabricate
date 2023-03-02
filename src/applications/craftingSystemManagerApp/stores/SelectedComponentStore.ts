import {writable, Writable, Readable, get} from "svelte/store";
import {CraftingComponent} from "../../../scripts/common/CraftingComponent";
import {CraftingSystemStore, CraftingSystemStoreState} from "./CraftingSystemStore";

class SelectedComponentStore {

    private readonly _selectedComponent: Writable<CraftingComponent>;
    private readonly _craftingSystems: Readable<CraftingSystemStoreState>;

    constructor({
        craftingSystemStore,
        selectedComponent
    }: {
        selectedComponent?: CraftingComponent;
        craftingSystemStore: CraftingSystemStore;
    }) {
        this._selectedComponent = writable(selectedComponent);
        this._craftingSystems = craftingSystemStore.value;
        this._craftingSystems.subscribe(craftingSystemStore => {
            const selectedComponent = get(this._selectedComponent);
            if (!selectedComponent) {
                return;
            }
            if (!craftingSystemStore.selectedSystem || !craftingSystemStore.selectedSystem.hasComponent(selectedComponent.id)) {
                this._selectedComponent.update(() => null);
            }
        });
    }

    get selectedComponent(): Writable<CraftingComponent> {
        return this._selectedComponent;
    }

    public selectComponent(component: CraftingComponent) {
        this._selectedComponent.update(() => component);
    }

    deselect() {
        this._selectedComponent.update(() => null);
    }

}

export { SelectedComponentStore }