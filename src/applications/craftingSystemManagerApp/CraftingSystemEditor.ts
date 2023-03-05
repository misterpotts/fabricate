import {Writable} from "svelte/store";
import {CraftingSystem, CraftingSystemJson} from "../../scripts/system/CraftingSystem";
import {SystemRegistry} from "../../scripts/registries/SystemRegistry";
import Properties from "../../scripts/Properties";
import FabricateApplication from "../../scripts/interface/FabricateApplication";
import {LocalizationService} from "../common/LocalizationService";

class CraftingSystemEditor {

    private readonly _craftingSystems: Writable<CraftingSystem[]>;
    private readonly _systemRegistry: SystemRegistry;
    private readonly _localization: LocalizationService;
    private readonly _game: Game;

    private static readonly _dialogLocalizationPath = `${Properties.module.id}.CraftingSystemManagerApp.dialog`;

    constructor({
        craftingSystems,
        systemRegistry,
        localization,
        game
    }: {
        craftingSystems: Writable<CraftingSystem[]>;
        systemRegistry: SystemRegistry;
        localization: LocalizationService;
        game: Game;
    }) {
        this._craftingSystems = craftingSystems;
        this._systemRegistry = systemRegistry;
        this._localization = localization;
        this._game = game;
    }

    public async createNewCraftingSystem(): Promise<CraftingSystem> {
        const systemJson: CraftingSystemJson = {
            parts: {
                recipes: {},
                components: {},
                essences: {}
            },
            locked: false,
            details: {
                name: "(New!) My New Crafting System",
                author: this._game.user.name,
                summary: "A brand new Crafting System created with Fabricate",
                description: ""
            },
            enabled: true,
            id: randomID()
        };
        const createdSystem = await this._systemRegistry.createCraftingSystem(systemJson);
        this._craftingSystems.update((craftingSystems) => {
            craftingSystems.push(createdSystem);
            return craftingSystems;
        });
        return createdSystem;
    }

    async deleteCraftingSystem(craftingSystemToDelete: CraftingSystem) {
        await Dialog.confirm({
            title: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.deleteSystemConfirm.title`),
            content: `<p>${this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.deleteSystemConfirm.content`, {systemName: craftingSystemToDelete.name})}</p>`,
            yes: async () => {
                await this._systemRegistry.deleteCraftingSystemById(craftingSystemToDelete.id);
                const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.deleteCraftingSystem.success`, { systemName: craftingSystemToDelete.name});
                this._craftingSystems.update((craftingSystems) => {
                    const filtered = craftingSystems.filter(craftingSystem => craftingSystem.id !== craftingSystemToDelete.id);
                    ui.notifications.info(message);
                    return filtered;
                });
            }
        });
    }

    async importCraftingSystem(onSuccess?: (craftingSystem: CraftingSystem) => void, targetSystem?: CraftingSystem): Promise<void> {
        const craftingSystemTypeName = this._localization.localize(`${Properties.module.id}.typeNames.craftingSystem.singular`);
        const importActionHint = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.hint`);
        const content = await renderTemplate("templates/apps/import-data.html", {
            hint1: this._localization.format("DOCUMENT.ImportDataHint1", {document: craftingSystemTypeName}),
            hint2: this._localization.format("DOCUMENT.ImportDataHint2", {name: importActionHint})
        });
        new Dialog({
            title: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.title`),
            content: content,
            default: "import",
            buttons: {
                import: {
                    icon: '<i class="fas fa-file-import"></i>',
                    label: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.buttons.import`),
                    callback: async (html) => {
                        // @ts-ignore
                        const form = html.find("form")[0];
                        if (!form.data.files.length) {
                            const message = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.noFileUploaded`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }
                        const fileData = await readTextFromFile(form.data.files[0]);
                        let craftingSystemJson: CraftingSystemJson;
                        try {
                            craftingSystemJson = JSON.parse(fileData);
                        } catch (e: any) {
                            const message = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.couldNotParseFile`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }
                        if (targetSystem) {
                            const updated = await this.overwriteCraftingSystem(craftingSystemJson, targetSystem);
                            onSuccess(updated);
                        } else {
                            const created = await this.importNewCraftingSystem(craftingSystemJson);
                            onSuccess(created);
                        }
                    }
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.buttons.cancel`)
                }
            }
        }, {
            width: 400
        }).render(true);
    }

    private async importNewCraftingSystem(craftingSystemJson: CraftingSystemJson): Promise<CraftingSystem> {
        if (!craftingSystemJson.id) {
            craftingSystemJson.id = randomID();
        }
        const importedSystem = await FabricateApplication.systemRegistry.createCraftingSystem(craftingSystemJson);
        const message = this._localization.format(
            `${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.success`,
            { systemName: importedSystem.name}
        );
        this._craftingSystems.update((craftingSystems) => {
            craftingSystems.push(importedSystem);
            return craftingSystems;
        });
        ui.notifications.info(message);
        return importedSystem;
    }

    private async overwriteCraftingSystem(craftingSystemJson: CraftingSystemJson, targetSystem: CraftingSystem): Promise<CraftingSystem> {
        const systemFound = await this._systemRegistry.hasCraftingSystem(targetSystem.id);
        if (!systemFound) {
            const message = this._localization.format(
                `${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.targetSystemNotFound`,
                { systemName: targetSystem.name });
            ui.notifications.error(message);
            throw new Error(message);
        }
        if (targetSystem.id !== craftingSystemJson.id) {
            const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.importIdMismatch`, {
                systemName: targetSystem.name,
                expectedId: targetSystem.id,
                actualId: craftingSystemJson.id,
            })
            ui.notifications.error(message);
            throw new Error(message);
        }
        const updatedCraftingSystem = await FabricateApplication.systemRegistry.createCraftingSystem(craftingSystemJson);
        const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.success`, { systemName: updatedCraftingSystem.name});
        this._craftingSystems.update((craftingSystems) => {
            const filtered = craftingSystems.filter(craftingSystem => craftingSystem.id !== updatedCraftingSystem.id);
            filtered.push(updatedCraftingSystem);
            ui.notifications.info(message);
            return filtered;
        });
        return updatedCraftingSystem;
    }

    public exportCraftingSystem(craftingSystem: CraftingSystem) {
        const exportData = JSON.stringify(craftingSystem.toJson(), null, 2);
        const fileName = `fabricate-crafting-system-${craftingSystem.name.slugify()}.json`;
        saveDataToFile(exportData, "application/json", fileName);
        const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.success`, { systemName: craftingSystem.name, fileName });
        ui.notifications.info(message);
    }

    async duplicateCraftingSystem(sourceCraftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const clonedCraftingSystem = sourceCraftingSystem.clone({
            id: randomID(),
            name: `${sourceCraftingSystem.name} (copy)`,
            locked: false
        });
        const duplicationResult = await FabricateApplication.systemRegistry.saveCraftingSystem(clonedCraftingSystem);
        ui.notifications.info(this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.duplicateCraftingSystem.success`, {
            sourceSystemName: sourceCraftingSystem.name,
            duplicatedSystemName: duplicationResult.name
        }));
        this._craftingSystems.update((craftingSystems) => {
            craftingSystems.push(duplicationResult);
            return craftingSystems;
        });
        return duplicationResult;
    }

}

export { CraftingSystemEditor }