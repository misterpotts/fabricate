import {Dictionary} from "./Dictionary";
import {CraftingComponent, CraftingComponentJson, SalvageOption, SalvageOptionJson} from "../common/CraftingComponent";
import {
    DocumentManager,
    FabricateItemData,
    NoFabricateItemData
} from "../foundry/DocumentManager";
import {EssenceDictionary} from "./EssenceDictionary";
import {combinationFromRecord} from "./DictionaryUtils";
import {SelectableOptions} from "../common/SelectableOptions";
import {Essence} from "../common/Essence";
import Properties from "../Properties";

export class ComponentDictionary implements Dictionary<CraftingComponentJson, CraftingComponent> {

    private _sourceData: Record<string, CraftingComponentJson>;
    private readonly _documentManager: DocumentManager;
    private readonly _essenceDictionary: EssenceDictionary;
    private readonly _entriesById: Map<string, CraftingComponent>;
    private readonly _entriesByItemUuid: Map<string, CraftingComponent>;
    private _loaded: boolean;

    constructor({
        sourceData,
        documentManager,
        essenceDictionary,
        entriesById = new Map(),
        entriesByItemUuid = new Map(),
        loaded = false
    }: {
        sourceData: Record<string, CraftingComponentJson>;
        documentManager: DocumentManager;
        essenceDictionary: EssenceDictionary;
        entriesById?: Map<string, CraftingComponent>;
        entriesByItemUuid?: Map<string, CraftingComponent>;
        loaded?: boolean;
    }) {
        this._sourceData = sourceData;
        this._documentManager = documentManager;
        this._essenceDictionary = essenceDictionary;
        this._entriesById = entriesById;
        this._entriesByItemUuid = entriesByItemUuid;
        this._loaded = loaded;
    }

    public clone(): ComponentDictionary {
        return new ComponentDictionary({
            sourceData: this._sourceData,
            documentManager: this._documentManager,
            essenceDictionary: this._essenceDictionary
        })
    }

    get entriesWithErrors(): CraftingComponent[] {
        return Array.from(this._entriesById.values()).filter(entry => entry.hasErrors);
    }

    get hasErrors(): boolean {
        return this.entriesWithErrors.length > 0;
    }

    get isLoaded(): boolean {
        return this._loaded && this._essenceDictionary.isLoaded;
    }

    get size(): number {
        return this._entriesById.size;
    }

    contains(id: string): boolean {
        return this._entriesById.has(id);
    }

    getAll(): Map<string, CraftingComponent> {
        return new Map(this._entriesById);
    }

    getById(id: string): CraftingComponent {
        if (!this._entriesById.has(id)) {
            throw new Error(`No Component data was found for the id "${id}". Known Component IDs for this system are: ${Array.from(this._entriesById.keys()).join(", ")}`);
        }
        return this._entriesById.get(id);
    }

    get allByItemUuid(): Map<string, CraftingComponent> {
        return new Map(this._entriesByItemUuid)
    }

    get sourceData(): Record<string, CraftingComponentJson> {
        return this._sourceData;
    }

    set sourceData(value: Record<string, CraftingComponentJson>) {
        this._sourceData = value;
    }

    insert(craftingComponent: CraftingComponent): void {
        if (craftingComponent.itemUuid !== NoFabricateItemData.UUID()) {
            this._entriesByItemUuid.set(craftingComponent.itemUuid, craftingComponent);
        }
        this._entriesById.set(craftingComponent.id, craftingComponent);
    }

    deleteById(id: string): void {
        if (!this._entriesById.has(id)) {
            return;
        }
        const componentToDelete = this._entriesById.get(id);
        this._entriesById.delete(id);
        this._entriesByItemUuid.delete(id);
        Array.from(this._entriesById.values())
            .forEach(component => {
                if (!component.isSalvageable) {
                    return;
                }
                component.salvageOptions = component.salvageOptions
                    .map(option => {
                        if (!option.salvage.has(componentToDelete)) {
                            return option;
                        }
                        option.salvage = option.salvage.without(componentToDelete);
                        return option;
                    });
            });
    }

    async loadAll(): Promise<CraftingComponent[]> {
        if (!this._sourceData) {
            throw new Error("Unable to load Crafting components. No source data was provided. ");
        }
        await this.loadDependencies();
        const itemUuids = Object.values(this._sourceData)
            .map(data => data.itemUuid);
        const cachedItemDataByUUid = await this._documentManager.getDocumentsByUuid(itemUuids);
        this._entriesById.clear();
        this._entriesByItemUuid.clear();
        // Loads all components _without_ loading salvage data
        Object.keys(this._sourceData)
            .map(id => {
                return {id, json: this._sourceData[id]}
            })
            .map(data => new CraftingComponent({
                id: data.id,
                itemData: cachedItemDataByUUid.get(data.json.itemUuid),
                essences: combinationFromRecord(data.json.essences, this._essenceDictionary.getAll()),
                disabled: data.json.disabled,
                salvageOptions: new SelectableOptions<SalvageOptionJson, SalvageOption>({})
            }))
            .forEach(component => this.insert(component));
        // Iterates over components again to load their salvage data using loaded component references
        const craftingComponents = Array.from(this._entriesById.values());
        craftingComponents
            .forEach(component => {
                const salvageOptionsConfig = this._sourceData[component.id].salvageOptions;
                if (salvageOptionsConfig && Object.keys(salvageOptionsConfig).length > 0) {
                    component.salvageOptions = this.buildSalvageOptions(salvageOptionsConfig, this._entriesById).options;
                }
            });
        this._loaded = true;
        return craftingComponents;
    }

    async loadById(id: string): Promise<CraftingComponent> {
        const sourceRecord = this._sourceData[id];
        if (!sourceRecord) {
            throw new Error(`Unable to load Crafting Component with ID ${id}. No definition for the component was found in source data. 
                This can occur if a component is loaded before it is saved or an invalid ID is passed.`);
        }
        await this.loadDependencies();
        const itemUuid = sourceRecord.itemUuid;
        const itemData = await this._documentManager.getDocumentByUuid(itemUuid);
        return this.buildComponent(id, sourceRecord, itemData);
    }

    private buildComponent(id: string, sourceRecord: CraftingComponentJson, itemData: FabricateItemData): CraftingComponent {
        return new CraftingComponent({
            id,
            itemData,
            disabled: sourceRecord.disabled,
            salvageOptions: this.buildSalvageOptions(sourceRecord.salvageOptions, this._entriesById),
            essences: combinationFromRecord(sourceRecord.essences, this._essenceDictionary.getAll()),
        });
    }

    private buildSalvageOptions(salvageOptionsJson: Record<string, SalvageOptionJson>, allComponents: Map<string, CraftingComponent>): SelectableOptions<SalvageOptionJson, SalvageOption> {
        const options = Object.keys(salvageOptionsJson)
            .map(name => this.buildSalvageOption(name, salvageOptionsJson[name], allComponents));
        return new SelectableOptions<SalvageOptionJson, SalvageOption>({
            options
        });
    }

    private buildSalvageOption(name: string, salvageOptionJson: SalvageOptionJson, allComponents: Map<string, CraftingComponent>): SalvageOption {
        return new SalvageOption({
            name,
            salvage: combinationFromRecord(salvageOptionJson, allComponents)
        });
    }

    private async loadDependencies() {
        if (!this._essenceDictionary.isLoaded) {
            await this._essenceDictionary.loadAll();
        }
    }

    toJson(): Record<string, CraftingComponentJson> {
        return Array.from(this._entriesById.entries())
            .map(entry => {
                return {key: entry[0], value: entry[1].toJson()}
            })
            .reduce((left, right) => {
                left[right.key] = right.value;
                return left;
            }, <Record<string, CraftingComponentJson>>{});
    }

    get isEmpty(): boolean {
        return this._entriesById.size === 0;
    }

    dropEssenceReferences(essenceToDelete: Essence) {
        Array.from(this._entriesById.values())
            .forEach(component => {
                component.essences = component.essences.without(essenceToDelete);
            });
    }

    containsItemByUuid(itemUuid: string) {
        return this._entriesByItemUuid.has(itemUuid);
    }

    getByItemUuid(uuid: string) {
        return this._entriesByItemUuid.get(uuid);
    }

    async create(craftingComponentJson: CraftingComponentJson): Promise<CraftingComponent> {
        const itemData = await this._documentManager.getDocumentByUuid(craftingComponentJson.itemUuid);
        if (itemData.hasErrors) {
            throw new Error(`Could not load document with UUID "${craftingComponentJson.itemUuid}". Errors ${itemData.errors.join(", ")} `);
        }
        if (!Properties.module.documents.supportedTypes.includes(itemData.sourceDocument.documentName)) {
            throw new Error(`Document with UUID is a ${itemData.sourceDocument.documentName}. Fabricate only allows the following document types: ${Properties.module.documents.supportedTypes.join(", ")}`);
        }
        const componentId = randomID();
        const component = await this.buildComponent(componentId, craftingComponentJson, itemData);
        this.insert(component);
        return component;
    }

    async mutate(id: string, mutation: CraftingComponentJson): Promise<CraftingComponent> {
        if (!this._loaded) {
            throw new Error("Fabricate doesn't currently support modifying components before the component dictionary has been loaded. ");
        }
        if (!this._entriesById.has(id)) {
            throw new Error(`Unable to mutate component with ID ${id}. It doesn't exist.`);
        }
        const target = this._entriesById.get(id);
        const itemData = target.itemUuid === mutation.itemUuid ? target.itemData : await this._documentManager.getDocumentByUuid(mutation.itemUuid);
        if (itemData.hasErrors) {
            throw new Error(`Could not load document with UUID "${mutation.itemUuid}". Errors ${itemData.errors.join(", ")} `);
        }
        const result = this.buildComponent(target.id, mutation, itemData);
        this.insert(result);
        return result;
    }

}