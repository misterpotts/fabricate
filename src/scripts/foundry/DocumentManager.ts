import Properties from "../Properties";

enum FabricateItemDataErrorCodeType {
    ITEM_NOT_FOUND = "itemNotFound",
    ITEM_NOT_LOADED = "itemNotLoaded",
}

interface FabricateItemData {
    uuid: string;
    name: string;
    imageUrl: string;
    sourceDocument: any;
    errors: ItemLoadingError[];
    hasErrors: boolean;
    loaded: boolean;
}

class NoFabricateItemData implements FabricateItemData {

    private static readonly _INSTANCE = new NoFabricateItemData();
    private static readonly _UUID = "NO_UUID";
    private static readonly _NAME = "NO_NAME";
    private static readonly _IMAGE_URL = Properties.ui.defaults.noItemImageUrl;

    public static INSTANCE(): NoFabricateItemData {
        return NoFabricateItemData._INSTANCE;
    }

    public static UUID() {
        return NoFabricateItemData._UUID;
    }

    get loaded(): boolean {
        return false;
    }

    get errors(): ItemLoadingError[] {
        return []
    }

    get hasErrors(): boolean {
        return false;
    }

    get imageUrl(): string {
        return NoFabricateItemData._IMAGE_URL;
    }

    get name(): string {
        return NoFabricateItemData._NAME;
    }

    get sourceDocument(): any {
        return null;
    }

    get uuid(): string {
        return NoFabricateItemData.UUID();
    }

}

class PendingFabricateItemData implements FabricateItemData {

    private readonly _itemUuid: string;

    constructor(itemUuid?: string) {
        this._itemUuid = itemUuid;
    }

    get errors(): ItemLoadingError[] {
        return [];
    }

    get hasErrors(): boolean {
        return false;
    }

    get imageUrl(): string {
        return null;
    }

    get loaded(): boolean {
        return false;
    }

    get name(): string {
        return null;
    }

    get sourceDocument(): any {
        return null;
    }

    get uuid(): string {
        return this._itemUuid;
    }

}

class LoadedFabricateItemData implements FabricateItemData {
    private readonly _errors: ItemLoadingError[];
    private readonly _itemUuid: string;
    private readonly _name: string;
    private readonly _imageUrl: string;
    private readonly _sourceDocument: any;

    constructor({
        name,
        itemUuid,
        imageUrl,
        errors = [],
        sourceDocument
    }: {
        itemUuid: string;
        name: string;
        imageUrl: string;
        sourceDocument: any;
        errors?: ItemLoadingError[];
    }) {
        this._errors = errors;
        this._itemUuid = itemUuid;
        this._name = name;
        this._imageUrl = imageUrl;
        this._sourceDocument = sourceDocument;
    }

    get loaded(): boolean {
        return !this.hasErrors && !!this.sourceDocument;
    }

    get errors(): ItemLoadingError[] {
        return this._errors;
    }

    get hasErrors(): boolean {
        return this.errors.length > 0;
    }

    get imageUrl(): string {
        return this._imageUrl;
    }

    get name(): string {
        return this._name;
    }

    get sourceDocument(): any {
        return this._sourceDocument;
    }

    get uuid(): string {
        return this._itemUuid;
    }

}

interface DocumentManager {

    getDocumentByUuid(id: string): Promise<FabricateItemData>;

    getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>>;

}

interface ItemLoadingError {
    message: string;
    code: string;
}

class ItemNotFoundError extends Error implements ItemLoadingError {

    private static readonly formatErrorMessage = (id: string) => `Item with id ${id} was not found. `;
    private static readonly _code: string = FabricateItemDataErrorCodeType.ITEM_NOT_FOUND;

    private readonly _itemUuid: string;

    constructor(itemUuid: string) {
        super(ItemNotFoundError.formatErrorMessage(itemUuid));
        this._itemUuid = itemUuid;
    }

    get itemUuid(): string {
        return this._itemUuid;
    }

    get message(): string {
        return super.message;
    }

    get code(): string {
        return ItemNotFoundError._code;
    }

}

class DefaultDocumentManager implements DocumentManager {

    public async getDocumentByUuid(id: string): Promise<FabricateItemData> {
        const document = await fromUuid(id);
        if (document) {
            return this.formatItemData(document);
        }
        return this.formatItemData(document, [new ItemNotFoundError(id)])
    }

    public async getDocumentsByUuid(ids: string[]): Promise<Map<string, FabricateItemData>> {
        const itemData = await Promise.all(ids.map(id => this.getDocumentByUuid(id).catch(e => e)));
        return new Map(itemData.map(item => [item.uuid, item]));
    }

    private formatItemData(document: any, errors: ItemLoadingError[] = []): FabricateItemData {
        return new LoadedFabricateItemData({
            itemUuid: document.uuid,
            name: document.name,
            imageUrl: document.img,
            sourceDocument: document,
            errors: errors,
        });
    }

}

export {
    FabricateItemData,
    DocumentManager,
    DefaultDocumentManager,
    ItemNotFoundError,
    ItemLoadingError,
    NoFabricateItemData,
    LoadedFabricateItemData,
    PendingFabricateItemData
}