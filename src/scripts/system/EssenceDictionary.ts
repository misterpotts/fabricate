import {Dictionary} from "./Dictionary";
import {Essence, EssenceJson} from "../common/Essence";
import {DocumentManager, FabricateItemData, PendingFabricateItemData} from "../foundry/DocumentManager";
import Properties from "../Properties";

export class EssenceDictionary implements Dictionary<EssenceJson, Essence> {

    private _sourceData: Record<string, EssenceJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _entries: Map<string, Essence>;
    private _loaded: boolean;

    constructor({
                    sourceData,
                    documentManager,
                    entries = new Map(),
                    loaded = false
                }: {
        sourceData: Record<string, EssenceJson>;
        documentManager: DocumentManager;
        entries?: Map<string, Essence>;
        loaded?: boolean;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._entries = entries;
        this._loaded = loaded;
    }

    public clone(): EssenceDictionary {
        return new EssenceDictionary({
            sourceData: this._sourceData,
            documentManager: this._documentManager
        })
    }

    get entriesWithErrors(): Essence[] {
        return Array.from(this._entries.values()).filter(entry => entry.hasErrors);
    }

    get hasErrors(): boolean {
        return this.entriesWithErrors.length > 0;
    }

    get isLoaded(): boolean {
        return this._loaded;
    }

    get size(): number {
        return this._entries.size;
    }

    contains(id: string): boolean {
        return this._entries.has(id);
    }

    getAll(): Map<string, Essence> {
        return new Map(this._entries);
    }

    getById(id: string): Essence {
        if (!this._entries.has(id)) {
            throw new Error(`No Essence data was found for the id "${id}". Known Essence IDs for this system are: ${Array.from(this._entries.keys()).join(", ")}`);
        }
        return this._entries.get(id);
    }

    get sourceData(): Record<string, EssenceJson> {
        return this._sourceData;
    }

    set sourceData(value: Record<string, EssenceJson>) {
        this._sourceData = value;
    }

    insert(essence: Essence): void {
        this._entries.set(essence.id, essence);
    }

    deleteById(id: string): void {
        this._entries.delete(id);
    }

    async loadAll(): Promise<Essence[]> {
        if (!this._sourceData) {
            throw new Error("Unable to load Essences. No source data was provided. ");
        }
        const itemUuids = Object.values(this._sourceData)
            .filter(data => !!data.activeEffectSourceItemUuid)
            .map(data => data.activeEffectSourceItemUuid);
        const cachedItemDataByUUid = await this._documentManager.getDocumentsByUuid(itemUuids);
        this._entries.clear();
        const essences = await Promise.all(Object.keys(this._sourceData).map(id => this.loadById(id, cachedItemDataByUUid)));
        essences.forEach(essence => this._entries.set(essence.id, essence));
        this._loaded = true;
        return essences;
    }

    async loadById(id: string, itemDataCache?: Map<string, FabricateItemData>): Promise<Essence> {
        const sourceRecord = this._sourceData[id];
        if (!sourceRecord) {
            throw new Error(`Unable to load Essence with ID ${id}. No definition for the essence was found in source data. 
                This can occur if an Essence is loaded before it is saved or an invalid ID is passed.`);
        }
        const itemData = sourceRecord.activeEffectSourceItemUuid ? new PendingFabricateItemData(sourceRecord.activeEffectSourceItemUuid) : null;
        const essence = this.buildEssence(id, sourceRecord, itemData);
        if (essence.hasActiveEffectSource) {
            let itemData: FabricateItemData;
            if (itemDataCache.has(essence.activeEffectSource.uuid)) {
                itemData = itemDataCache.get(essence.activeEffectSource.uuid);
            } else {
                itemData = await this._documentManager.getDocumentByUuid(essence.activeEffectSource.uuid);
            }
            essence.activeEffectSource = itemData;
        }
        return essence;
    }

    private buildEssence(id: string, sourceRecord:EssenceJson, itemData: FabricateItemData): Essence {
        return new Essence({
            id: id,
            name: sourceRecord.name,
            description: sourceRecord.description,
            iconCode: sourceRecord.iconCode,
            tooltip: sourceRecord.tooltip,
            activeEffectSource: itemData
        })
    }

    toJson(): Record<string, EssenceJson> {
        return Array.from(this._entries.entries())
            .map(entry => {
                return {key: entry[0], value: entry[1].toJson()}
            })
            .reduce((left, right) => {
                left[right.key] = right.value;
                return left;
            }, <Record<string, EssenceJson>>{});
    }

    get isEmpty(): boolean {
        return this._entries.size === 0;
    }

    async create(essenceJson: EssenceJson): Promise<Essence> {
        let essence: Essence;
        const essenceId = randomID();
        if (essenceJson.activeEffectSourceItemUuid) {
            const itemData = await this._documentManager.getDocumentByUuid(essenceJson.activeEffectSourceItemUuid);
            if (itemData.hasErrors) {
                throw new Error(`Could not load document with UUID "${essenceJson.activeEffectSourceItemUuid}". Errors ${itemData.errors.join(", ")} `);
            }
            if (!Properties.module.documents.supportedTypes.includes(itemData.sourceDocument.documentName)) {
                throw new Error(`Document with UUID is a ${itemData.sourceDocument.documentName}. Fabricate only allows the following document types: ${Properties.module.documents.supportedTypes.join(", ")}`);
            }
            essence = await this.buildEssence(essenceId, essenceJson, itemData);
            this.insert(essence);
            return essence;
        }
        essence = await this.buildEssence(essenceId, essenceJson, null);
        this.insert(essence);
        return essence;
    }
}