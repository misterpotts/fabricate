import {SystemRegistry} from "../../../scripts/registries/SystemRegistry";
import {GameProvider} from "../../../scripts/foundry/GameProvider";
import {writable, Writable} from "svelte/store";
import {CraftingSystem, CraftingSystemJson} from "../../../scripts/system/CraftingSystem";
import {get} from "svelte/store";

class CraftingSystemStoreState {

    private _craftingSystems: CraftingSystem[];
    private _selectedSystem: CraftingSystem;

    constructor({
        craftingSystems = [],
        selectedSystem
    }: {
        craftingSystems?: CraftingSystem[],
        selectedSystem?: CraftingSystem
    }) {
        this._craftingSystems = craftingSystems;
        this._selectedSystem = selectedSystem;
    }

    get craftingSystems(): CraftingSystem[] {
        return this._craftingSystems;
    }

    get selectedSystem(): CraftingSystem {
        return this._selectedSystem;
    }

    async init(craftingSystems: CraftingSystem[]): Promise<CraftingSystemStoreState> {
        this._craftingSystems = this.sort(craftingSystems);
        this._selectedSystem = this.selectSystem(this._craftingSystems);
        if (this._selectedSystem) {
            await this._selectedSystem.loadPartDictionary();
        }
        return this;
    }

    public async insert(candidate: CraftingSystem): Promise<CraftingSystemStoreState> {
        const otherSystems = this._craftingSystems.filter(system => system.id !== candidate.id);
        otherSystems.push(candidate);
        await candidate.loadPartDictionary();
        this._craftingSystems = this.sort(otherSystems);
        this._selectedSystem = this.selectSystem(this._craftingSystems, candidate);
        return this;
    }

    public async remove(craftingSystem: CraftingSystem): Promise<CraftingSystemStoreState> {
        const otherSystems = this._craftingSystems.filter(system => system.id !== craftingSystem.id);
        const sortedSystems = this.sort(otherSystems);
        this._craftingSystems = sortedSystems;
        this._selectedSystem = this.selectSystem(sortedSystems, this._selectedSystem);
        return this;
    }

    private sort(craftingSystems: CraftingSystem[]): CraftingSystem[] {
        return craftingSystems.sort((left, right) => {
            if (left.isLocked && !right.isLocked) {
                return -1;
            }
            if (right.isLocked && !left.isLocked) {
                return 1;
            }
            return left.name.localeCompare(right.name);
        });
    }

    public async select(value: CraftingSystem): Promise<CraftingSystemStoreState> {
        if (!this._craftingSystems.includes(value)) {
            throw new Error(`Crafting system ${value?.name} cannot be selected because it is not in the set of selectable systems. `);
        }
        this._selectedSystem = value;
        await this._selectedSystem.loadPartDictionary();
        return this;
    }

    set craftingSystems(value: CraftingSystem[]) {
        value = value ?? [];
        this._craftingSystems = value;
    }

    private selectSystem(craftingSystems: CraftingSystem[], selectedSystem?: CraftingSystem) {
        if (!craftingSystems || craftingSystems.length === 0) {
            return null;
        }
        if (selectedSystem && craftingSystems.includes(selectedSystem)) {
            return selectedSystem;
        }
        return craftingSystems[0];
    }

}

class CraftingSystemStore {

    private _systemRegistry: SystemRegistry
    private _gameProvider: GameProvider
    private readonly _value: Writable<CraftingSystemStoreState> = writable(new CraftingSystemStoreState({}));

    constructor({
        systemRegistry,
        gameProvider
    }: {
        systemRegistry: SystemRegistry,
        gameProvider: GameProvider
    }) {
        this._systemRegistry = systemRegistry;
        this._gameProvider = gameProvider;
    }

    get value(): Writable<CraftingSystemStoreState> {
        return this._value;
    }

    public async create(): Promise<CraftingSystem> {
        const systemJson: CraftingSystemJson = {
            parts: {
                recipes: {},
                components: {},
                essences: {}
            },
            locked: false,
            details: {
                name: "(New!) My New Crafting System",
                author: this._gameProvider.globalGameObject().user.name,
                summary: "A brand new Crafting System created with Fabricate",
                description: ""
            },
            enabled: true,
            id: randomID()
        };
        const system = await this._systemRegistry.createCraftingSystem(systemJson);
        const state = await get(this._value).insert(system);
        this._value.update(() => state);
        return system;
    }

    async saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const updatedCraftingSystem = await this._systemRegistry.saveCraftingSystem(craftingSystem);
        const state = await get(this._value).insert(updatedCraftingSystem);
        this._value.update(() => state);
        return updatedCraftingSystem;
    }

    public async init(): Promise<void> {
        const allSystemsById = await this._systemRegistry.getAllCraftingSystems();
        const allSystems = Array.from(allSystemsById.values());
        const state = await get(this._value).init(allSystems)
        this._value.update(() => state);
    }

    async select(system: CraftingSystem): Promise<void> {
        const state = await get(this._value).select(system);
        this._value.update(() => state);
    }

    async reloadComponents(): Promise<void> {
        const state = get(this._value);
        await state.selectedSystem.loadComponents();
        this._value.update(() => state);
    }

    async handleItemDeleted(uuid: string) {
        const state = get(this._value);
        if (state.selectedSystem.includesComponentByItemUuid(uuid)) {
            await this.reloadComponents();
        }
    }
}

export { CraftingSystemStoreState, CraftingSystemStore }