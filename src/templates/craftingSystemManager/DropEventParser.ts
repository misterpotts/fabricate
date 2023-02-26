import {DocumentManager, FabricateItemData} from "../../scripts/foundry/DocumentManager";
import Properties from "../../scripts/Properties";

class DropEventParser {
    
    private readonly _event: any;
    private readonly _i18n: any;
    private readonly _partType: string;
    private readonly _documentManager: DocumentManager;

    constructor({
        event,
        i18n,
        partType,
        documentManager
    }: {
        event: any,
        i18n: any,
        partType: string,
        documentManager: DocumentManager
    }) {
        this._event = event;
        this._i18n = i18n;
        this._partType = partType;
        this._documentManager = documentManager
    }
    
    public async parse(): Promise<FabricateItemData> {
        const elementData = this._event
            ?.dataTransfer
            ?.getData("text");
        if (!elementData) {
            const message = this._i18n.format(`${Properties.module.id}.DropEventParser.errors.noElementData`, { partType: this._partType });
            ui.notifications.warn(message);
        }
        try {
            const dropData = JSON.parse(elementData);
            const documentType = dropData.type;
            if (!Properties.module.documents.supportedTypes.includes(documentType)) {
                const message = this._i18n.format(
                    `${Properties.module.id}.DropEventParser.errors.invalidDocumentType`,
                    {
                        suppliedType: documentType,
                        allowedTypes: Properties.module.documents.supportedTypes.join(", "),
                        partType: this._partType
                    }
                );
                ui.notifications.warn(message);
            }
            return await this._documentManager.getDocumentByUuid(dropData.uuid);
        } catch (e) {
            const message = this._i18n.format(`${Properties.module.id}.DropEventParser.errors.invalidJson`, { partType: this._partType });
            ui.notifications.error(message);
        }
    }

}

export { DropEventParser }