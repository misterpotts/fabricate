import {Writable, writable} from 'svelte/store'
import {SystemRegistry} from "../../../scripts/registries/SystemRegistry";
import {CraftingSystem, CraftingSystemJson} from "../../../scripts/system/CraftingSystem";
import {GameProvider} from "../../../scripts/foundry/GameProvider";
import Properties from "../../../scripts/Properties";

class CraftingSystemsStore {
    private _systemRegistry: SystemRegistry
    private _gameProvider: GameProvider

    private readonly _value: Writable<CraftingSystem[]> = writable([]);

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

    get value(): Writable<CraftingSystem[]> {
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
        this._value.update((value) => {
            value.push(system);
            return value;
        });
        return system;
    }

    public async loadAll(): Promise<void> {
        const allSystemsById = await this._systemRegistry.getAllCraftingSystems();
        const allSystems = Array.from(allSystemsById.values());
        this._value.update(() => allSystems);
    }

    async deleteCraftingSystem(craftingSystemToDelete: CraftingSystem) {
        const GAME = this._gameProvider.globalGameObject();
        await Dialog.confirm({
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.deleteSystemConfirm.title`),
            content: `<p>${GAME.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.dialog.deleteSystemConfirm.content", {systemName: craftingSystemToDelete.name})}</p>`,
            yes: async () => {
                await this._systemRegistry.deleteCraftingSystemById(craftingSystemToDelete.id);
                this._value.update((value) => {
                    return value.filter(craftingSystem => craftingSystem.id !== craftingSystemToDelete.id);
                });
            }
        });
    }
}

export { CraftingSystemsStore }