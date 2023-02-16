import {writable, derived, Writable, Readable} from "svelte/store";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {CraftingComponent} from "../../../scripts/common/CraftingComponent";
import {SelectedCraftingSystemStore} from "./SelectedCraftingSystemStore";

class SelectedComponentStore {

    private readonly _selectedComponentId: Writable<string> = writable(null);
    private readonly _selectedSystem: Readable<CraftingSystem>;
    private readonly _selectedComponent: Readable<CraftingComponent>;

    constructor({
        selectedComponentId,
        selectedCraftingSystemStore
    }: {
        selectedComponentId?: string;
        selectedCraftingSystemStore: SelectedCraftingSystemStore;
    }) {
        this._selectedComponentId = writable(selectedComponentId);
        this._selectedSystem = selectedCraftingSystemStore.selectedSystem;

        this._selectedComponent = derived(
            [this._selectedComponentId, this._selectedSystem],
            ([$selectedComponentId, $selectedSystem], set) => {
                if (!$selectedSystem.hasComponent($selectedComponentId)) {
                    set(null);
                } else {
                    Promise.resolve($selectedSystem.getComponentById($selectedComponentId))
                        .then(component => set(component))
                        .catch((e: any) => {
                            console.error(e.stack || e);
                            set(null);
                        });
                }
            });
    }

    get selectedComponentId(): Writable<string> {
        return this._selectedComponentId;
    }

    get selectedComponent(): Readable<CraftingComponent> {
        return this._selectedComponent;
    }

    public selectComponentById(componentId: string) {
        this._selectedComponentId.update(() => componentId);
    }

    deselect() {
        this._selectedComponentId.update(() => null);
    }
}

export { SelectedComponentStore }