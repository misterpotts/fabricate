import {SystemRegistry} from "../../../scripts/registries/SystemRegistry";
import {GameProvider} from "../../../scripts/foundry/GameProvider";
import {writable, Writable} from "svelte/types/runtime/store";
import {CraftingSystem, CraftingSystemJson} from "../../../scripts/system/CraftingSystem";
import Properties from "../../../scripts/Properties";
import {get} from "svelte/store";
import FabricateApplication from "../../../scripts/interface/FabricateApplication";

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

class CraftingSystemStoreNew {

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

    async deleteCraftingSystem(craftingSystemToDelete: CraftingSystem) {
        const GAME = this._gameProvider.globalGameObject();
        await Dialog.confirm({
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.deleteSystemConfirm.title`),
            content: `<p>${GAME.i18n.format(Properties.module.id + ".CraftingSystemManagerApp.dialog.deleteSystemConfirm.content", {systemName: craftingSystemToDelete.name})}</p>`,
            yes: async () => {
                await this._systemRegistry.deleteCraftingSystemById(craftingSystemToDelete.id);
                const state = await get(this._value).remove(craftingSystemToDelete);
                this._value.update(() => state);
            }
        });
    }

    async importCraftingSystem(targetSystem?: CraftingSystem) {
        const GAME = this._gameProvider.globalGameObject();
        const craftingSystemTypeName = GAME.i18n.localize(`${Properties.module.id}.typeNames.craftingSystem.singular`);
        const importActionHint = GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.hint`);
        const content = await renderTemplate("templates/apps/import-data.html", {
            hint1: GAME.i18n.format("DOCUMENT.ImportDataHint1", {document: craftingSystemTypeName}),
            hint2: GAME.i18n.format("DOCUMENT.ImportDataHint2", {name: importActionHint})
        });
        new Dialog({
            title: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.title`),
            content: content,
            default: "import",
            buttons: {
                import: {
                    icon: '<i class="fas fa-file-import"></i>',
                    label: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.buttons.import`),
                    callback: async (html) => {
                        // @ts-ignore
                        const form = html.find("form")[0];
                        if (!form.data.files.length) {
                            const message = GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.errors.noFileUploaded`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }
                        const fileData = await readTextFromFile(form.data.files[0]);
                        let craftingSystemJson: CraftingSystemJson;
                        try {
                            craftingSystemJson = JSON.parse(fileData);
                        } catch (e: any) {
                            const message = GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.errors.couldNotParseFile`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }
                        if (targetSystem) {
                            await this.overwriteCraftingSystem(GAME, craftingSystemJson, targetSystem);
                        } else {
                            await this.importNewCraftingSystem(GAME, craftingSystemJson);
                        }
                    }
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: GAME.i18n.localize(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.buttons.cancel`)
                }
            }
        }, {
            width: 400
        }).render(true);
    }

    private async importNewCraftingSystem(GAME: Game, craftingSystemJson: CraftingSystemJson) {
        if (!craftingSystemJson.id) {
            craftingSystemJson.id = randomID();
        }
        const craftingSystem = await FabricateApplication.systemRegistry.createCraftingSystem(craftingSystemJson);
        const message = GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.success`, { systemName: craftingSystem.name});
        const state = await get(this._value).insert(craftingSystem);
        this._value.update(() => state);
        ui.notifications.info(message);
    }

    private async overwriteCraftingSystem(GAME: Game, craftingSystemJson: CraftingSystemJson, targetSystem: CraftingSystem) {
        const systemFound = await this._systemRegistry.hasCraftingSystem(targetSystem.id);
        if (!systemFound) {
            const message = GAME.i18n.format(
                `${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.errors.targetSystemNotFound`,
                { systemName: targetSystem.name });
            ui.notifications.error(message);
            throw new Error(message);
        }
        if (targetSystem.id !== craftingSystemJson.id) {
            const message = GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.errors.importIdMismatch`, {
                systemName: targetSystem.name,
                expectedId: targetSystem.id,
                actualId: craftingSystemJson.id,
            })
            ui.notifications.error(message);
            throw new Error(message);
        }
        const updatedCraftingSystem = await FabricateApplication.systemRegistry.createCraftingSystem(craftingSystemJson);
        const message = GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.dialog.importCraftingSystem.success`, { systemName: updatedCraftingSystem.name});
        const state = await get(this._value).insert(updatedCraftingSystem);
        this._value.update(() => state);
        ui.notifications.info(message);
    }

    public exportCraftingSystem(craftingSystem: CraftingSystem) {
        const exportData = JSON.stringify(craftingSystem.toJson(), null, 2);
        const fileName = `fabricate-crafting-system-${craftingSystem.name.slugify()}.json`;
        saveDataToFile(exportData, "application/json", fileName);
        const GAME = this._gameProvider.globalGameObject();
        ui.notifications.info(GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.dialog.exportCraftingSystem.success`, { systemName: craftingSystem.name, fileName }));
    }

    async duplicateCraftingSystem(sourceCraftingSystem: CraftingSystem) {
        const clonedCraftingSystem = sourceCraftingSystem.clone({
            id: randomID(),
            name: `${sourceCraftingSystem.name} (copy)`,
            locked: false
        });
        const duplicationResult = await FabricateApplication.systemRegistry.saveCraftingSystem(clonedCraftingSystem);
        const GAME = this._gameProvider.globalGameObject();
        ui.notifications.info(GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.dialog.duplicateCraftingSystem.success`, {
            sourceSystemName: sourceCraftingSystem.name,
            duplicatedSystemName: duplicationResult.name
        }));
        const state = await get(this._value).insert(duplicationResult);
        this._value.update(() => state);
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

}

export { CraftingSystemStoreState, CraftingSystemStoreNew }