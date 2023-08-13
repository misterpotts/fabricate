import {LocalizationService} from "../../common/LocalizationService";
import {Essence} from "../../../scripts/crafting/essence/Essence";
import {CraftingSystem} from "../../../scripts/system/CraftingSystem";
import {DropEventParser} from "../../common/DropEventParser";
import {DefaultDocumentManager} from "../../../scripts/foundry/DocumentManager";
import Properties from "../../../scripts/Properties";
import {FabricateAPI} from "../../../scripts/api/FabricateAPI";
import {EssencesStore} from "../../stores/EssenceStore";

class EssenceEditor {

    private readonly _essences: EssencesStore;
    private readonly _fabricateAPI: FabricateAPI;
    private readonly _localization: LocalizationService;

    private readonly  _localizationPath = `${Properties.module.id}.CraftingSystemManagerApp.tabs.essences`;

    constructor({
        essences,
        fabricateAPI,
        localization,
    }: {
        essences: EssencesStore;
        fabricateAPI: FabricateAPI;
        localization: LocalizationService;
    }) {
        this._essences = essences;
        this._fabricateAPI = fabricateAPI;
        this._localization = localization;
    }

    public async create(selectedCraftingSystem: CraftingSystem) {
        const essence = await this._fabricateAPI.essences.create({
            craftingSystemId: selectedCraftingSystem.id
        });
        this._essences.insert(essence);
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
                        systemName: selectedCraftingSystem.details.name
                    }
                )
            });
        }
        if (!doDelete) {
            return;
        }
        await this._fabricateAPI.essences.deleteById(essence.id);
        this._essences.remove(essence);
    }

    public async setActiveEffectSource(event: any, essence: Essence) {
        const dropEventParser = new DropEventParser({
            localizationService: this._localization,
            documentManager: new DefaultDocumentManager(),
            partType: this._localization.localize(`${Properties.module.id}.typeNames.activeEffectSource.singular`)
        })
        const dropData = await dropEventParser.parse(event);
        essence.activeEffectSource = dropData.itemData;
        await this._fabricateAPI.essences.save(essence);
        this._essences.insert(essence);
        return essence;
    }

    public async removeActiveEffectSource(essence: Essence) {
        essence.activeEffectSource = null;
        await this._fabricateAPI.essences.save(essence);
        this._essences.insert(essence);
        return essence;
    }

    public async setIconCode(essence: Essence, iconCode: string) {
        essence.iconCode = iconCode;
        await this._fabricateAPI.essences.save(essence);
        this._essences.insert(essence);
        return essence;
    }

}

export { EssenceEditor }