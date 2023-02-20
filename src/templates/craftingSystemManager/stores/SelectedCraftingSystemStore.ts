import {writable, derived, Writable, Readable} from "svelte/store";
import {get} from "svelte/store";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {CraftingSystemsStore} from "./CraftingSystemsStore";

class SelectedCraftingSystemStore {

    private readonly _selectedSystemId: Writable<string> = writable(null);
    private readonly _craftingSystems: Writable<CraftingSystem[]>;
    private readonly _selectedSystem: Readable<CraftingSystem>;

    constructor({
        selectedSystemId,
        craftingSystemStore
    }: {
        selectedSystemId?: string;
        craftingSystemStore: CraftingSystemsStore
    }) {
        this._selectedSystemId = writable(selectedSystemId);
        this._craftingSystems = craftingSystemStore.value;
        this._selectedSystem = derived(
            [this._selectedSystemId, this._craftingSystems],
            ([$selectedSystemId, $craftingSystems], set) => {
                const selectedSystem = $craftingSystems.find(system => system.id === $selectedSystemId);
                if (!selectedSystem && $craftingSystems.length > 0) {
                    set($craftingSystems[0])
                } else {
                    set(selectedSystem);
                }
            });
    }

    get selectedSystemId(): Writable<string> {
        return this._selectedSystemId;
    }

    get selectedSystem(): Readable<CraftingSystem> {
        return this._selectedSystem;
    }

    public selectSystemById(systemId: string) {
        this._selectedSystemId.update(() => systemId);
    }

    deselectById(id: string) {
        const selectedSystemId = get(this._selectedSystemId);
        if (selectedSystemId !== id) {
            return;
        }
        const systemToSelect = get(this._craftingSystems).find(system => system.id !== id);
        this.selectSystemById(systemToSelect.id);
    }
}

export { SelectedCraftingSystemStore }