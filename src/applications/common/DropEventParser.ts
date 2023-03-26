import {DocumentManager, FabricateItemData} from "../../scripts/foundry/DocumentManager";
import Properties from "../../scripts/Properties";
import {Component} from "../../scripts/crafting/component/Component";
import {LocalizationService} from "./LocalizationService";

class DropData {
    private readonly _itemData: FabricateItemData;
    private readonly _component: Component;

    constructor({
        itemData,
        component
    }: {
        itemData?: FabricateItemData;
        component?: Component;
    }) {
        this._itemData = itemData;
        this._component = component;
    }

    get itemData(): FabricateItemData {
        return this._itemData;
    }

    get component(): Component {
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

    private readonly _localizationService: LocalizationService;
    private readonly _partType: string;
    private readonly _strict: boolean;
    private readonly _documentManager: DocumentManager;
    private readonly _allowedCraftingComponentsById: Map<string, Component>;
    private readonly _allowedCraftingComponentsByItemUuid: Map<string, Component>;

    constructor({
        localizationService,
        partType,
        allowedCraftingComponents = [],
        documentManager,
        strict = false
    }: {
        localizationService: LocalizationService;
        partType: string;
        allowedCraftingComponents?: Component[];
        documentManager: DocumentManager;
        strict?: boolean;
    }) {
        this._localizationService = localizationService;
        this._partType = partType;
        this._allowedCraftingComponentsById = new Map(allowedCraftingComponents.map(component => [component.id, component]));
        this._allowedCraftingComponentsByItemUuid = new Map(allowedCraftingComponents.map(component => [component.itemUuid, component]));
        this._documentManager = documentManager
        this._strict = strict;
    }
    
    public async parseFoundryItemData(elementData: any): Promise<DropData> {
        if (!elementData) {
            const message = this._localizationService.format(`${Properties.module.id}.DropEventParser.errors.noElementData`, { partType: this._partType });
            ui.notifications.warn(message);
        }
        try {
            const dropData = JSON.parse(elementData);
            const documentType = dropData.type;
            if (!Properties.module.documents.supportedTypes.includes(documentType)) {
                const message = this._localizationService.format(
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
            if (this._strict && ! this._allowedCraftingComponentsByItemUuid.has(itemData.uuid)) {
                const message = this._localizationService.format(
                    `${Properties.module.id}.DropEventParser.errors.unrecognisedComponent`,
                    {
                        componentName: itemData.name
                    }
                );
                ui.notifications.warn(message);
                return new DropData({});
            }
            const component = this._allowedCraftingComponentsByItemUuid.get(dropData.uuid);
            return new DropData({ itemData, component });
        } catch (e) {
            const message = this._localizationService.format(`${Properties.module.id}.DropEventParser.errors.invalidJson`, { partType: this._partType });
            ui.notifications.error(message);
        }
    }

    public async parseFabricateComponentData(elementData: any): Promise<DropData> {
        try {
            const dropData = JSON.parse(elementData);
            const componentId = dropData.componentId;
            if (!this._allowedCraftingComponentsById.has(componentId)) {
                const message = this._localizationService.format(
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
            const message = this._localizationService.format(`${Properties.module.id}.DropEventParser.errors.invalidJson`, { partType: this._partType });
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
        const message = this._localizationService.format(`${Properties.module.id}.DropEventParser.errors.noElementData`, { partType: this._partType });
        ui.notifications.warn(message);
        return new DropData({});
    }

    public static serialiseComponentData(component: Component): string {
        return JSON.stringify({ componentId: component.id });
    }

}

export { DropEventParser, DropData }