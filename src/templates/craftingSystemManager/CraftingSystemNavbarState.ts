import {writable} from "svelte/store";

interface CraftingSystemNavbarItemData {
    id: string;
    name: string;
    summary: string;
    hasErrors: boolean;
    isLocked: boolean;
}

class CraftingSystemNavbarState {

    private readonly _value = writable({
        selectedSystem: null,
        systems: []
    });

    constructor(systems: CraftingSystemNavbarItemData[] = []) {
        const systemToSelect = systems.length > 0 ? systems[0] : null;
        this._value = writable({
            selectedSystem: systemToSelect,
            systems: systems
        });
    }

    get subscribe() {
        return this._value.subscribe;
    }

    get set() {
        return this._value.set;
    }

    get update() {
        return this._value.update;
    }

    public selectSystem(system: CraftingSystemNavbarItemData) {
        this.update((self) => {
            self.selectedSystem = system;
            return self;
        });
    }

    public setSystems(systems: CraftingSystemNavbarItemData[] = []) {
        this.update((self) => {
            self.systems = systems;
            self.selectedSystem = systems.length > 0 ? systems[0] : null;
            return self;
        });
    }

}

const INSTANCE = new CraftingSystemNavbarState([]);

export default INSTANCE;
export { CraftingSystemNavbarState, CraftingSystemNavbarItemData }