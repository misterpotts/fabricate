import { writable } from 'svelte/store'
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";
import {CraftingSystemJson} from "../../scripts/system/CraftingSystem";
import {GameProvider} from "../../scripts/foundry/GameProvider";

class CraftingSystemStore {
    private _systemRegistry: SystemRegistry
    private _gameProvider: GameProvider

    private readonly _value = writable({
        systems: []
    });

    constructor({
        systemRegistry,
        gameProvider
    }: {
        systemRegistry?: SystemRegistry;
        gameProvider?: GameProvider
    }) {
        this._systemRegistry = systemRegistry;
        this._gameProvider = gameProvider;
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

    set systemRegistry(value: SystemRegistry) {
        this._systemRegistry = value;
    }

    set gameProvider(value: GameProvider) {
        this._gameProvider = value;
    }

    public async create(): Promise<void> {
        const systemJson: CraftingSystemJson = {
            parts: {
                recipes: {},
                components: {},
                essences: {}
            },
            locked: false,
            details: {
                name: "My New Crafting System",
                author: this._gameProvider.globalGameObject().user.name,
                summary: "A brand new Crafting System created with Fabricate",
                description: ""
            },
            enabled: true,
            id: randomID()
        };
        const system = await this._systemRegistry.createCraftingSystem(systemJson);
        this._value.update((value) => {
            value.systems.push(system);
            return value;
        });
    }

}

const INSTANCE = new CraftingSystemStore({});

export default INSTANCE;
export { CraftingSystemStore }