import {Writable} from "svelte/store";
import {CraftingSystem} from "../../scripts/crafting/system/CraftingSystem";
import Properties from "../../scripts/Properties";
import {LocalizationService} from "../common/LocalizationService";
import {CraftingSystemData, FabricateAPI} from "../../scripts/api/FabricateAPI";
import {FabricateExportModel} from "../../scripts/repository/import/FabricateExportModel";
import {Component} from "../../scripts/crafting/component/Component";
import {ComponentsStore} from "../stores/ComponentsStore";
import {RecipesStore} from "../stores/RecipesStore";
import {RecipeBookMasterCrafted} from "../../scripts/api/CraftingSystemDataExchanger";

class CraftingSystemEditor {

    private readonly _craftingSystems: Writable<CraftingSystem[]>;
    private readonly _components: ComponentsStore;
    private readonly _recipes: RecipesStore;
    private readonly _localization: LocalizationService;
    private readonly _fabricateAPI: FabricateAPI;

    private static readonly _dialogLocalizationPath = `${Properties.module.id}.CraftingSystemManagerApp.dialog`;

    constructor({
        craftingSystems,
        components,
        recipes,
        localization,
        fabricateAPI,
    }: {
        craftingSystems: Writable<CraftingSystem[]>;
        components: ComponentsStore;
        recipes: RecipesStore;
        localization: LocalizationService;
        fabricateAPI: FabricateAPI;
    }) {
        this._fabricateAPI = fabricateAPI;
        this._components = components;
        this._recipes = recipes;
        this._craftingSystems = craftingSystems;
        this._localization = localization;
    }

    private async importMasterCraftedData(fileData: any, targetCraftingSystem?: CraftingSystem): Promise<void> {
        const dataToImport = fileData as RecipeBookMasterCrafted;
        const importResult = await this._fabricateAPI.dataExchangeAPI.masterCrafted.import(dataToImport, targetCraftingSystem);
        this.refresh(importResult);
    }

    private async importFabricateData(dataToImport: any, targetCraftingSystem?: CraftingSystem): Promise<void> {
        dataToImport = dataToImport as FabricateExportModel;
        const importResult = await this._fabricateAPI.dataExchangeAPI.fabricate.import(dataToImport, targetCraftingSystem);
        this.refresh(importResult);
    }

    private refresh(craftingSystemData: CraftingSystemData) {
        this._craftingSystems.update((craftingSystems) => {
            const found = craftingSystems.find(craftingSystem => craftingSystem.id === craftingSystemData.craftingSystem.id);
            if (!found) {
                craftingSystems.push(craftingSystemData.craftingSystem);
                return craftingSystems;
            }
            return craftingSystems
                .filter(craftingSystem => craftingSystem.id !== craftingSystemData.craftingSystem.id)
                .concat(craftingSystemData.craftingSystem);
        });
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
                this._craftingSystems.update((craftingSystems) => {
                    return craftingSystems.filter(craftingSystem => craftingSystem.id !== craftingSystemToDelete.id);
                });
                this._components.update((components => {
                    return components.filter(component => component.craftingSystemId !== craftingSystemToDelete.id);
                }));
                this._recipes.update((recipes => {
                    return recipes.filter(recipe => recipe.craftingSystemId !== craftingSystemToDelete.id);
                }));
            }
        });
    }

    async importCraftingSystem(targetCraftingSystem?: CraftingSystem): Promise<void> {
        const importType = targetCraftingSystem ? "update" : "create";
        const content = await renderTemplate(`modules/${Properties.module.id}/templates/import-crafting-system.html`, {
            details: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.description.${importType}`),
            fileTypeLabel: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.labels.fileType`),
        });
        await new Dialog({
            title: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.title`),
            content: content,
            default: "import",
            buttons: {
                import: {
                    icon: '<i class="fas fa-file-import"></i>',
                    label: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.buttons.import`),
                    callback: async (html) => {

                        const form = html.find("form")[0];
                        if (!form.data.files.length) {
                            const message = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.noFileUploaded`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }
                        const fileData = await readTextFromFile(form.data.files[0]);

                        let dataToImport: any;
                        try {
                            dataToImport = JSON.parse(fileData);
                        } catch (e: any) {
                            const message = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.couldNotParseFile`);
                            ui.notifications.error(message);
                            throw new Error(message);
                        }

                        const dataType: "fabricate" | "mastercrafted" = form.fileType.value;
                        switch (dataType) {
                            case "mastercrafted":
                                return this.importMasterCraftedData(dataToImport, targetCraftingSystem);
                            case "fabricate":
                                return this.importFabricateData(dataToImport, targetCraftingSystem);
                            default:
                                const errorMessage = this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.importCraftingSystem.errors.invalidFileType`);
                                ui.notifications.error(errorMessage);
                                throw new Error(errorMessage);
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

    public async exportCraftingSystem(craftingSystem: CraftingSystem) {
        await new Dialog({
            title: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.title`),
            content: this._localization.localize(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.description`),
            buttons: {
                fabricate: {
                    label: "Fabricate",
                    callback: async () => {
                        const exportData = await this._fabricateAPI.dataExchangeAPI.fabricate.export(craftingSystem.id);
                        const fileContents = JSON.stringify(exportData, null, 2);
                        //@ts-ignore todo: figure out why String doesn't have a slugify method with the current tsconfig
                        const fileName = `fabricate-crafting-system-${craftingSystem.details.name.slugify()}.json`;
                        saveDataToFile(fileContents, "application/json", fileName);
                        const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.success`, { systemName: craftingSystem.details.name, fileName });
                        ui.notifications.info(message);
                    }
                },
                masterCrafted: {
                    label: "MasterCrafted",
                    callback: async () => {
                        const exportData = await this._fabricateAPI.dataExchangeAPI.masterCrafted.export(craftingSystem.id);
                        const fileContents = JSON.stringify(exportData, null, 2);
                        //@ts-ignore todo: figure out why String doesn't have a slugify method with the current tsconfig
                        const fileName = `mastercrafted-recipe-book-${exportData.name.slugify()}.json`;
                        saveDataToFile(fileContents, "application/json", fileName);
                        const message = this._localization.format(`${CraftingSystemEditor._dialogLocalizationPath}.exportCraftingSystem.success`, { systemName: craftingSystem.details.name, fileName });
                        ui.notifications.info(message);
                    }
                },
            },
            default: "fabricate",
        }, {}).render(true);


    }

    async duplicateCraftingSystem(sourceCraftingSystem: CraftingSystem): Promise<CraftingSystem> {

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

    async saveCraftingSystem(craftingSystem: CraftingSystem): Promise<CraftingSystem> {
        const updatedCraftingSystem = await this._fabricateAPI.systems.save(craftingSystem);
        this._craftingSystems.update((craftingSystems) => {
            const filtered = craftingSystems.filter(craftingSystem => craftingSystem.id !== updatedCraftingSystem.id);
            filtered.push(updatedCraftingSystem);
            return filtered;
        });
        return updatedCraftingSystem;
    }

    async saveComponent(craftingComponent: Component): Promise<Component> {
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