import {Essence, EssenceJson} from "./Essence";
import {DocumentManager} from "../../foundry/DocumentManager";
import {EntityFactory} from "../../repository/EntityFactory";

class EssenceFactory implements EntityFactory<EssenceJson, Essence> {

    private readonly documentManager: DocumentManager;

    constructor(documentManager: DocumentManager) { this.documentManager = documentManager; }

    async make(entityJson: EssenceJson): Promise<Essence> {
        const itemData = this.documentManager.prepareItemDataByDocumentUuid(entityJson.activeEffectSourceItemUuid);

        return new Essence({
            id: entityJson.id,
            craftingSystemId: entityJson.craftingSystemId,
            name: entityJson.name,
            tooltip: entityJson.tooltip,
            description: entityJson.description,
            embedded: entityJson.embedded,
            activeEffectSource: itemData,
            iconCode: entityJson.iconCode
        })
    }

}

export { EssenceFactory }