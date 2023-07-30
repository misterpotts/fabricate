import {Writable} from "svelte/store";
import {CraftingSystem, CraftingSystemJson} from "../../scripts/system/CraftingSystem";
import Properties from "../../scripts/Properties";
import {LocalizationService} from "../common/LocalizationService";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import {FabricateExportModel} from "../../scripts/repository/import/FabricateExportModel";

class CraftingSystemEditor {

    private readonly _craftingSystems: Writable<CraftingSystem[]>;
    private readonly _localization: LocalizationService;
    private readonly _fabricateAPI: FabricateAPI;

    private static readonly _dialogLocalizationPath = `${Properties.module.id}.CraftingSystemManagerApp.dialog`;

    constructor({
        craftingSystems,
        localization,
        fabricateAPI,
    }: {
        craftingSystems: Writable<CraftingSystem[]>;
        localization: LocalizationService;
        fabricateAPI: FabricateAPI;
    }) {
        this._fabricateAPI = fabricateAPI;
        this._craftingSystems = craftingSystems;
        this._localization = localization;
    }

    public async createNewCraftingSystem(): Promise<CraftingSystem> {
        const result = await this._fabricateAPI.systems.create();
        this._craftingSystems.update((craftingSystems) => {
            craftingSystems.push(result);
            return craftingSystems;
        });
        return result;
    }

    async deleteCraftingSystem(craftingSystemToDelete: CraftingSystem) {
        await Dialog.confirm({
            title: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.deleteSystemConfirm.title`),
            content: `<p>${this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.deleteSystemConfirm.content`, {systemName: craftingSystemToDelete.details.name})}</p>`,
            yes: async () => {
                await this._fabricateAPI.deleteAllByCraftingSystemId(craftingSystemToDelete.id);
                const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.deleteCraftingSystem.success`, { systemName: craftingSystemToDelete.details.name});
                this._craftingSystems.update((craftingSystems) => {
                    const filtered = craftingSystems.filter(craftingSystem => craftingSystem.id !== craftingSystemToDelete.id);
                    ui.notifications.info(message);
                    return filtered;
                });
            }
        });
    }

    async importCraftingSystem(onSuccess?: (craftingSystem: CraftingSystem) => void): Promise<void> {
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
                        let craftingSystemData: FabricateExportModel;
                        try {
                            craftingSystemData = JSON.parse(fileData);
                        } catch (e: any) {
                            const message = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.couldNotParseFile`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }
                        await this._fabricateAPI.import(craftingSystemData);
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

    public exportCraftingSystem(craftingSystem: CraftingSystem) {
        const exportData = this._fabricateAPI.export(craftingSystem.id);
        const fileContents = JSON.stringify(exportData, null, 2);
        const fileName = `fabricate-crafting-system-${craftingSystem.details.name.slugify()}.json`;
        saveDataToFile(fileContents, "application/json", fileName);
        const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.success`, { systemName: craftingSystem.details.name, fileName });
        ui.notifications.info(message);
    }

    async duplicateCraftingSystem(sourceCraftingSystem: CraftingSystem): Promise<CraftingSystem> {
        // const clonedCraftingSystem = sourceCraftingSystem.clone({
        //     id: randomID(),
        //     name: `${sourceCraftingSystem.name} (copy)`,
        //     locked: false
        // });
        // const duplicationResult = await FabricateApplication.systemRegistry.saveCraftingSystem(clonedCraftingSystem);
        await this._fabricateAPI.duplicateCraftingSystem(sourceCraftingSystem.id);
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

    async saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const updatedCraftingSystem = await this._systemRegistry.saveCraftingSystem(craftingSystem);
        this._craftingSystems.update((craftingSystems) => {
            const filtered = craftingSystems.filter(craftingSystem => craftingSystem.id !== updatedCraftingSystem.id);
            filtered.push(updatedCraftingSystem);
            return filtered;
        });
        return updatedCraftingSystem;
    }

}

export { CraftingSystemEditor }