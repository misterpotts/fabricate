import {DocumentManager, FabricateItemData} from "../../scripts/foundry/DocumentManager";
import Properties from "../../scripts/Properties";
import {Component} from "../../scripts/crafting/component/Component";
import {LocalizationService} from "./LocalizationService";
import {DefaultGameProvider, GameProvider} from "../../scripts/foundry/GameProvider";

type RawItemDropData = {

    uuid: string;

    type: "Item";

}

type RawCompendiumDropData = {

    id: string;

    type: "Compendium";

}

type RawDropData = RawItemDropData | RawCompendiumDropData;

type KnownComponentData = {

    component: Component;

    isKnownComponent: true;

    item: FabricateItemData;

}

export { KnownComponentData }

type UnknownComponentData = {

    component: undefined;

    isKnownComponent: false;

    item: FabricateItemData;

}

export { UnknownComponentData }

type ComponentData = KnownComponentData | UnknownComponentData;

interface ItemDropEvent {

    type: "Item";

    data: ComponentData;

}

export { ItemDropEvent }

class DefaultItemDropEvent implements ItemDropEvent {

    public readonly type = "Item";

    public readonly data: ComponentData;

    constructor({ data }: { data: ComponentData }) {
        this.data = data;
    }

}

export { DefaultItemDropEvent }

interface CompendiumDropEvent {

    type: "Compendium";

    data: {

        contents: ComponentData[];

        metadata: CompendiumMetadata;

    }

}

export { CompendiumDropEvent }

class DefaultCompendiumDropEvent implements CompendiumDropEvent {

    public readonly type = "Compendium";

    public readonly data: {

        contents: ComponentData[];

        metadata: CompendiumMetadata;

    };

    constructor({ contents, metadata }: { contents: ComponentData[], metadata: CompendiumMetadata }) {
        this.data = { contents, metadata };
    }

}

export { DefaultCompendiumDropEvent }

interface UnknownDropEvent {

    type: "Unknown";

    source: Event;

}

export { UnknownDropEvent }

class DefaultUnknownDropEvent implements UnknownDropEvent {

    public readonly type = "Unknown";

    public readonly source: InputEvent;

    constructor({ source }: { source: InputEvent }) {
        this.source = source;
    }

}

export { DefaultUnknownDropEvent }

type DropEvent = ItemDropEvent | CompendiumDropEvent | UnknownDropEvent;

export { DropEvent }

class DropEventParser {

    private readonly _gameProvider: GameProvider;
    private readonly _documentManager: DocumentManager;
    private readonly _localizationService: LocalizationService;
    private readonly _allowedCraftingComponentsById: Map<string, Component>;
    private readonly _allowedCraftingComponentsByItemUuid: Map<string, Component>;

    constructor({
        gameProvider = new DefaultGameProvider(),
        documentManager,
        localizationService,
        allowedCraftingComponents = [],
    }: {
        gameProvider?: GameProvider;
        documentManager: DocumentManager;
        localizationService: LocalizationService;
        allowedCraftingComponents?: Component[];
    }) {
        this._gameProvider = gameProvider;
        this._documentManager = documentManager;
        this._localizationService = localizationService;
        this._allowedCraftingComponentsById = new Map(allowedCraftingComponents.map(component => [component.id, component]));
        this._allowedCraftingComponentsByItemUuid = new Map(allowedCraftingComponents.map(component => [component.itemUuid, component]));
    }

    private isCompendiumDropData(dropData: RawDropData): dropData is RawCompendiumDropData {
        return dropData.type === "Compendium";
    }

    private isItemDropData(dropData: RawDropData): dropData is RawItemDropData {
        return dropData.type === "Item";
    }
    
    public async parseFoundryDropEvent(elementData: any, event: InputEvent): Promise<DropEvent> {

        if (!elementData) {
            const message = this._localizationService.localize(
                `${Properties.module.id}.DropEventParser.errors.noElementData`,
            );
            ui.notifications.warn(message);
        }

        try {
            const rawDropData: RawDropData = JSON.parse(elementData);

            if (this.isCompendiumDropData(rawDropData)) {
                const compendium = this._gameProvider.get().packs.get(rawDropData.id);
                if (!compendium) {
                    const message = this._localizationService.format(
                        `${Properties.module.id}.DropEventParser.errors.unrecognisedCompendium`,
                        {
                            compendiumId: rawDropData.id
                        }
                    );
                    ui.notifications.warn(message);
                    return new DefaultUnknownDropEvent({ source: event });
                }

                const contents = compendium.index.contents;
                const metadata: CompendiumMetadata = compendium.metadata;
                const itemsData = await this._documentManager.loadItemDataForDocumentsByUuid(contents.map(content => content.uuid));
                const componentData = Array.from(itemsData.values())
                    .map(itemData => {
                        const isKnownComponent = this._allowedCraftingComponentsByItemUuid.has(itemData.uuid);
                        let componentData: ComponentData;
                        if (isKnownComponent) {
                            componentData = {
                                isKnownComponent: true,
                                component: this._allowedCraftingComponentsByItemUuid.get(itemData.uuid),
                                item: itemData
                            }
                        } else {
                            componentData = {
                                isKnownComponent: false,
                                component: undefined,
                                item: itemData
                            }
                        }
                        return componentData;
                    });
                return new DefaultCompendiumDropEvent({ contents: componentData, metadata });
            }

            if (this.isItemDropData(rawDropData)) {
                const itemData = await this._documentManager.loadItemDataByDocumentUuid(rawDropData.uuid);
                const isKnownComponent = this._allowedCraftingComponentsByItemUuid.has(rawDropData.uuid);
                let componentDropData: ComponentData;
                if (isKnownComponent) {
                    componentDropData = {
                        isKnownComponent: true,
                        component: this._allowedCraftingComponentsByItemUuid.get(itemData.uuid),
                        item: itemData
                    }
                } else {
                    componentDropData = {
                        isKnownComponent: false,
                        component: undefined,
                        item: itemData
                    }
                }
                return new DefaultItemDropEvent({
                    data: componentDropData
                });
            }

            const message = this._localizationService.format(
                `${Properties.module.id}.DropEventParser.errors.unsupportedDropEventType`,
                {
                    dropEventType: "Unknown",
                    allowedTypes: "Item, Compendium",
                }
            );
            ui.notifications.warn(message);
            return new DefaultUnknownDropEvent({ source: event });

        } catch (e) {

            const message = this._localizationService.localize(
                `${Properties.module.id}.DropEventParser.errors.invalidJson`
            );
            ui.notifications.error(message);
        }

    }

    public async parseFabricateDropEvent(elementData: any, event: InputEvent): Promise<ItemDropEvent | UnknownDropEvent> {
        try {
            const dropData = JSON.parse(elementData);
            const componentId = dropData.componentId;
            if (!this._allowedCraftingComponentsById.has(componentId)) {
                const message = this._localizationService.format(
                    `${Properties.module.id}.DropEventParser.errors.unrecognisedComponent`,
                    {
                        componentId,
                        componentName: dropData.name
                    }
                );
                ui.notifications.warn(message);
                return new DefaultUnknownDropEvent({ source: event });
            }
            const component = this._allowedCraftingComponentsById.get(componentId);
            return new DefaultItemDropEvent({ data: { component, isKnownComponent: true, item: dropData } });
        } catch (e) {
            const message = this._localizationService.localize(
                `${Properties.module.id}.DropEventParser.errors.invalidJson`
            );
            ui.notifications.error(message);
        }
    }

    public async parse(event: InputEvent): Promise<DropEvent> {

        const rawFoundryData = event
            ?.dataTransfer
            ?.getData("text/plain");
        if (rawFoundryData) {
            return this.parseFoundryDropEvent(rawFoundryData, event);
        }

        const rawComponentData = event
            ?.dataTransfer
            ?.getData("application/json");
        if (rawComponentData) {
            return this.parseFabricateDropEvent(rawComponentData, event);
        }

        const message = this._localizationService.localize(
            `${Properties.module.id}.DropEventParser.errors.noElementData`
        );
        ui.notifications.warn(message);

        return new DefaultUnknownDropEvent({ source: event });

    }

    public static serialiseComponentData(component: Component): string {
        return JSON.stringify({ componentId: component.id });
    }

}

export { DropEventParser }