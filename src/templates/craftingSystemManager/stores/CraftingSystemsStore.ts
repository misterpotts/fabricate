import {Writable, writable} from 'svelte/store'
import {SystemRegistry} from "../../../scripts/registries/SystemRegistry";
import {CraftingSystem, CraftingSystemJson} from "../../../scripts/system/CraftingSystem";
import {GameProvider} from "../../../scripts/foundry/GameProvider";
import Properties from "../../../scripts/Properties";
import FabricateApplication from "../../../scripts/interface/FabricateApplication";

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
        this._value.update((value) => {
            value.push(craftingSystem);
            return value;
        });
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
        this._value.update((value) => {
            const craftingSystems = value.filter(craftingSystem => craftingSystem.id !== updatedCraftingSystem.id);
            craftingSystems.push(updatedCraftingSystem);
            return craftingSystems;
        });
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
        const result = await FabricateApplication.systemRegistry.saveCraftingSystem(clonedCraftingSystem);
        const GAME = this._gameProvider.globalGameObject();
        ui.notifications.info(GAME.i18n.format(`${Properties.module.id}.CraftingSystemManagerApp.dialog.duplicateCraftingSystem.success`, {
            sourceSystemName: sourceCraftingSystem.name,
            duplicatedSystemName: result.name
        }));
        this._value.update((value) => {
            value.push(result);
            return value;
        });
    }
}

export { CraftingSystemsStore }