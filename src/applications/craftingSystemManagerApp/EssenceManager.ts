import {CraftingSystemEditor} from "./CraftingSystemEditor";
import {LocalizationService} from "../common/LocalizationService";
import {Essence} from "../../scripts/common/Essence";
import {CraftingSystem} from "../../scripts/system/CraftingSystem";
import {DropEventParser} from "../common/DropEventParser";
import {DefaultDocumentManager} from "../../scripts/foundry/DocumentManager";
import Properties from "../../scripts/Properties";

class EssenceManager {

    private readonly _craftingSystemEditor: CraftingSystemEditor;
    private readonly _localization: LocalizationService;
    private readonly  _localizationPath: string;

    constructor({
        craftingSystemEditor,
        localization,
        localizationPath
    }: {
        craftingSystemEditor: CraftingSystemEditor;
        localization: LocalizationService;
        localizationPath: string;
    }) {
        this._craftingSystemEditor = craftingSystemEditor;
        this._localization = localization;
        this._localizationPath = localizationPath;
    }

    public async create(selectedCraftingSystem: CraftingSystem) {
        const createdEssence = new Essence({
            id: randomID(),
            name: "Essence name",
            tooltip: "My new Essence",
            iconCode: "fa-solid fa-mortar-pestle",
            description: `A new Essence added to ${selectedCraftingSystem.name}`
        });
        selectedCraftingSystem.editEssence(createdEssence);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
        const message = this._localization.format(
            `${this._localizationPath}.essence.created`,
            {
                systemName: selectedCraftingSystem.name
            }
        );
        ui.notifications.info(message);
    }

    public async deleteEssence(event: any, essence: Essence, selectedCraftingSystem: CraftingSystem) {
        let doDelete;
        if (event.shiftKey) {
            doDelete = true;
        } else {
            doDelete = await Dialog.confirm({
                title: this._localization.format(
                    `${this._localizationPath}.prompts.delete.title`,
                    {
                        essenceName: essence.name
                    }
                ),
                content: this._localization.format(
                    `${this._localizationPath}.prompts.delete.content`,
                    {
                        essenceName: essence.name,
                        systemName: selectedCraftingSystem.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        selectedCraftingSystem.deleteEssenceById(essence.id);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
        const message = this._localization.format(
            `${this._localizationPath}.essence.deleted`,
            {
                essenceName: essence.name,
                systemName: selectedCraftingSystem.name
            }
        );
        ui.notifications.info(message);
    }

    public async setActiveEffectSource(event: any, essence: Essence, selectedCraftingSystem: CraftingSystem) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.activeEffectSource.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        essence.activeEffectSource = dropData.itemData;
        selectedCraftingSystem.editEssence(essence);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
    }

    public async removeActiveEffectSource(essence: Essence, selectedCraftingSystem: CraftingSystem) {
        essence.activeEffectSource = null;
        selectedCraftingSystem.editEssence(essence);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
    }

    public async setIconCode(essence: Essence, iconCode: string, selectedCraftingSystem: CraftingSystem) {
        essence.iconCode = iconCode;
        selectedCraftingSystem.editEssence(essence);
        await this._craftingSystemEditor.saveCraftingSystem(selectedCraftingSystem);
    }

}

export { EssenceManager }