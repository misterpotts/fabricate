import {Writable} from "svelte/store";
import {DefaultCraftingSystem} from "../../scripts/system/CraftingSystem";
import Properties from "../../scripts/Properties";
import {LocalizationService} from "../common/LocalizationService";
import {FabricateAPI} from "../../scripts/api/FabricateAPI";
import {FabricateExportModel} from "../../scripts/repository/import/FabricateExportModel";
import {Component} from "../../scripts/crafting/component/Component";

class CraftingSystemEditor {

    private readonly _craftingSystems: Writable<DefaultCraftingSystem[]>;
    private readonly _components: Writable<Component[]>;
    private readonly _localization: LocalizationService;
    private readonly _fabricateAPI: FabricateAPI;

    private static readonly _dialogLocalizationPath = `${Properties.module.id}.CraftingSystemManagerApp.dialog`;

    constructor({
        craftingSystems,
        components,
        localization,
        fabricateAPI,
    }: {
        craftingSystems: Writable<DefaultCraftingSystem[]>;
        components: Writable<Component[]>;
        localization: LocalizationService;
        fabricateAPI: FabricateAPI;
    }) {
        this._fabricateAPI = fabricateAPI;
        this._components = components;
        this._craftingSystems = craftingSystems;
        this._localization = localization;
    }

    public async createNewCraftingSystem(): Promise<DefaultCraftingSystem> {
        const result = await this._fabricateAPI.systems.create();
        this._craftingSystems.update((craftingSystems) => {
            craftingSystems.push(result);
            return craftingSystems;
        });
        return result;
    }

    async deleteCraftingSystem(craftingSystemToDelete: DefaultCraftingSystem) {
        await Dialog.confirm({
            title: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.deleteSystemConfirm.title`),
            content: `<p>${this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.deleteSystemConfirm.content`, {systemName: craftingSystemToDelete.details.name})}</p>`,
            yes: async () => {
                await this._fabricateAPI.deleteAllByCraftingSystemId(craftingSystemToDelete.id);
                this._craftingSystems.update((craftingSystems) => {
                    return craftingSystems.filter(craftingSystem => craftingSystem.id !== craftingSystemToDelete.id);
                });
            }
        });
    }

    async importCraftingSystem(targetCraftingSystem?: DefaultCraftingSystem): Promise<void> {
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

                        let dataToImport: FabricateExportModel;
                        try {
                            dataToImport = JSON.parse(fileData);
                        } catch (e: any) {
                            const message = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.couldNotParseFile`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }

                        if (targetCraftingSystem && (targetCraftingSystem.id !== dataToImport.craftingSystem.id)) {
                            const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.importIdMismatch`, {
                                systemName: targetCraftingSystem.details.name,
                                expectedId: targetCraftingSystem.id,
                                actualId: dataToImport.craftingSystem.id,
                            })
                            ui.notifications.error(message);
                            throw new Error(message);
                        }

                        const importResult = await this._fabricateAPI.import(dataToImport);
                        if (!importResult) {
                            return;
                        }
                        this._craftingSystems.update((craftingSystems) => {
                            const found = craftingSystems.find(craftingSystem => craftingSystem.id === importResult.craftingSystem.id);
                            if (!found) {
                                craftingSystems.push(importResult.craftingSystem);
                                return craftingSystems;
                            }
                            return craftingSystems
                                .filter(craftingSystem => craftingSystem.id !== importResult.craftingSystem.id)
                                .concat(importResult.craftingSystem);
                        });

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

    public async exportCraftingSystem(craftingSystem: DefaultCraftingSystem) {
        const exportData = await this._fabricateAPI.export(craftingSystem.id);
        const fileContents = JSON.stringify(exportData, null, 2);
        const fileName = `fabricate-crafting-system-${craftingSystem.details.name.slugify()}.json`;
        saveDataToFile(fileContents, "application/json", fileName);
        const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.success`, { systemName: craftingSystem.details.name, fileName });
        ui.notifications.info(message);
    }

    async duplicateCraftingSystem(sourceCraftingSystem: DefaultCraftingSystem): Promise<DefaultCraftingSystem> {

        let duplicatedCraftingSystemData = await this._fabricateAPI.duplicateCraftingSystem(sourceCraftingSystem.id);

        const message = this._localization.format(
        `${CraftingSystemEditor._dialogLocalizationPath}.duplicateCraftingSystem.complete`,
        {
                sourceSystemName: sourceCraftingSystem.details.name,
                duplicatedSystemName: duplicatedCraftingSystemData?.craftingSystem?.details?.name
            }
        );
        ui.notifications.info(message);

        if (duplicatedCraftingSystemData?.craftingSystem) {
            this._craftingSystems.update((craftingSystems) => {
                craftingSystems.push(duplicatedCraftingSystemData.craftingSystem);
                return craftingSystems;
            });
        }

        return duplicatedCraftingSystemData.craftingSystem;

    }

    async saveCraftingSystem(craftingSystem: DefaultCraftingSystem): Promise<DefaultCraftingSystem> {
        const updatedCraftingSystem = await this._fabricateAPI.systems.save(craftingSystem);
        this._craftingSystems.update((craftingSystems) => {
            const filtered = craftingSystems.filter(craftingSystem => craftingSystem.id !== updatedCraftingSystem.id);
            filtered.push(updatedCraftingSystem);
            return filtered;
        });
        return updatedCraftingSystem;
    }

    async deleteComponent(component: Component): Promise<Component> {
        return this._fabricateAPI.components.deleteById(component.id);
    }

    async saveComponent(craftingComponent: Component) {
        const updatedComponent = await this._fabricateAPI.components.save(craftingComponent);
        this._components.update((components) => {
            const filtered = components.filter(component => component.id !== updatedComponent.id);
            filtered.push(updatedComponent);
            return filtered;
        });
        return updatedComponent;
    }
}

export { CraftingSystemEditor }