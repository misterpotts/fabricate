import {Component, ComponentJson, SalvageOption, SalvageOptionJson} from "./Component";
import {EssenceAPI} from "../../api/EssenceAPI";
import {DocumentManager} from "../../foundry/DocumentManager";
import {Combination} from "../../common/Combination";
import {SelectableOptions} from "../recipe/SelectableOptions";
import {EntityFactory} from "../../api/EntityFactory";

class ComponentFactory implements EntityFactory<ComponentJson, Component> {

    private readonly essenceAPI: EssenceAPI;
    private readonly documentManager: DocumentManager;

    constructor({
        essenceAPI,
        documentManager
    }: {
        essenceAPI: EssenceAPI;
        documentManager: DocumentManager;
    }) {
        this.essenceAPI = essenceAPI;
        this.documentManager = documentManager;
    }

    public async make(componentJson: ComponentJson): Promise<Component> {

        const essences = await this.essenceAPI.getAllByCraftingSystemId(componentJson.craftingSystemId);
        const itemData = this.documentManager.prepareItemDataByDocumentUuid(componentJson.itemUuid);

        return new Component({
            itemData,
            id: componentJson.id,
            embedded: componentJson.embedded,
            disabled: componentJson.disabled,
            craftingSystemId: componentJson.craftingSystemId,
            essences: Combination.fromRecord(componentJson.essences, essences),
            salvageOptions: this.buildSalvageOptions(componentJson.salvageOptions, componentJson.craftingSystemId)
        });

    }

    private buildSalvageOptions(salvageOptionsJson: SalvageOptionJson[],
                                craftingSystemId: string): SelectableOptions<SalvageOptionJson, SalvageOption> {
        const options = salvageOptionsJson
            .map(json => SalvageOption.fromJson(json, craftingSystemId));
        return new SelectableOptions<SalvageOptionJson, SalvageOption>({ options });
    }

}

export { ComponentFactory };