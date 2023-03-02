import {DocumentManager, FabricateItemData} from "../../scripts/foundry/DocumentManager";
import Properties from "../../scripts/Properties";
import {CraftingComponent} from "../../scripts/common/CraftingComponent";

class DropData {
    private readonly _itemData: FabricateItemData;
    private readonly _component: CraftingComponent;

    constructor({
        itemData,
        component
    }: {
        itemData?: FabricateItemData;
        component?: CraftingComponent;
    }) {
        this._itemData = itemData;
        this._component = component;
    }

    get itemData(): FabricateItemData {
        return this._itemData;
    }

    get component(): CraftingComponent {
        return this._component;
    }

    get hasItemData(): boolean {
        return !!this._itemData;
    }

    get hasCraftingComponent(): boolean {
        return !!this._component;
    }

}

class DropEventParser {

    private readonly _i18n: any;
    private readonly _partType: string;
    private readonly _documentManager: DocumentManager;
    private _allowedCraftingComponentsById: Map<string, CraftingComponent>;

    constructor({
        i18n,
        partType,
        allowedCraftingComponents = [],
        documentManager
    }: {
        i18n: any;
        partType: string;
        allowedCraftingComponents?: CraftingComponent[];
        documentManager: DocumentManager;
    }) {
        this._i18n = i18n;
        this._partType = partType;
        this._allowedCraftingComponentsById = new Map(allowedCraftingComponents.map(component => [component.id,component]));
        this._documentManager = documentManager
    }
    
    public async parseFoundryItemData(elementData: any): Promise<DropData> {
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
                return new DropData({});
            }
            const itemData = await this._documentManager.getDocumentByUuid(dropData.uuid);
            return new DropData({ itemData });
        } catch (e) {
            const message = this._i18n.format(`${Properties.module.id}.DropEventParser.errors.invalidJson`, { partType: this._partType });
            ui.notifications.error(message);
        }
    }

    public async parseFabricateComponentData(elementData: any): Promise<DropData> {
        try {
            const dropData = JSON.parse(elementData);
            const componentId = dropData.componentId;
            if (!this._allowedCraftingComponentsById.has(componentId)) {
                const message = this._i18n.format(
                    `${Properties.module.id}.DropEventParser.errors.unrecognisedComponent`,
                    {
                        componentName: dropData.name
                    }
                );
                ui.notifications.warn(message);
                return new DropData({});
            }
            const component = this._allowedCraftingComponentsById.get(componentId);
            return new DropData({ component });
        } catch (e) {
            const message = this._i18n.format(`${Properties.module.id}.DropEventParser.errors.invalidJson`, { partType: this._partType });
            ui.notifications.error(message);
        }
    }

    public async parse(event: any): Promise<DropData> {
        const rawFoundryData = event
            ?.dataTransfer
            ?.getData("text/plain");
        if (rawFoundryData) {
            return this.parseFoundryItemData(rawFoundryData);
        }
        const rawComponentData = event
            ?.dataTransfer
            ?.getData("application/json");
        if (rawComponentData) {
            return this.parseFabricateComponentData(rawComponentData);
        }
        const message = this._i18n.format(`${Properties.module.id}.DropEventParser.errors.noElementData`, { partType: this._partType });
        ui.notifications.warn(message);
        return new DropData({});
    }

    public static serialiseComponentData(component: CraftingComponent): string {
        return JSON.stringify({ componentId: component.id });
    }

}

export { DropEventParser, DropData }